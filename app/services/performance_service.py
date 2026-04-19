from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import List, Optional, Sequence

from sqlalchemy import and_, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.types import Date

from app.models.brand import Brand
from app.models.content_item import ContentItem
from app.models.content_schedule import ContentSchedule
from app.models.marketing_strategy import MarketingStrategy
from app.models.performance_metric import PerformanceMetric
from app.schemas.performance_metric import (
    AnalyticsOverview,
    ChannelBreakdown,
    MetricCreate,
    TimeSeriesPoint,
)
from app.services.content_schedule_service import verify_content_item_access


def _user_metric_filters(user_id: int):
    return and_(
        Brand.user_id == user_id,
    )


async def record_metric(
    data: MetricCreate,
    user_id: int,
    db: AsyncSession,
) -> PerformanceMetric:
    await verify_content_item_access(db, data.content_id, user_id)

    metric = PerformanceMetric(
        content_id=data.content_id,
        impressions=data.impressions,
        engagement=data.engagement,
        clicks=data.clicks,
        conversions=data.conversions,
        reach=data.reach,
        cpc=data.cpc,
        ctr=data.ctr,
        roas=data.roas,
    )
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric


async def get_analytics_overview(
    user_id: int,
    db: AsyncSession,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> AnalyticsOverview:
    filters: List = [
        PerformanceMetric.content_id == ContentItem.id,
        ContentItem.schedule_id == ContentSchedule.id,
        ContentSchedule.strategy_id == MarketingStrategy.id,
        MarketingStrategy.brand_id == Brand.id,
        _user_metric_filters(user_id),
    ]
    if start_date is not None:
        filters.append(
            PerformanceMetric.recorded_at
            >= datetime.combine(start_date, time.min, tzinfo=timezone.utc)
        )
    if end_date is not None:
        end_excl = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=timezone.utc)
        filters.append(PerformanceMetric.recorded_at < end_excl)

    stmt = (
        select(
            func.coalesce(func.sum(PerformanceMetric.impressions), 0),
            func.coalesce(func.sum(PerformanceMetric.engagement), 0),
            func.coalesce(func.sum(PerformanceMetric.clicks), 0),
            func.coalesce(func.sum(PerformanceMetric.conversions), 0),
            func.coalesce(func.sum(PerformanceMetric.reach), 0),
        )
        .select_from(PerformanceMetric)
        .join(ContentItem)
        .join(ContentSchedule)
        .join(MarketingStrategy)
        .join(Brand)
        .where(and_(*filters))
    )

    result = await db.execute(stmt)
    row = result.one()
    total_impressions = int(row[0])
    total_engagement = int(row[1])
    total_clicks = int(row[2])
    total_conversions = int(row[3])
    total_reach = int(row[4])

    avg_engagement_rate = 0.0
    if total_reach > 0:
        avg_engagement_rate = (total_engagement / total_reach) * 100.0

    return AnalyticsOverview(
        total_impressions=total_impressions,
        total_engagement=total_engagement,
        total_clicks=total_clicks,
        total_conversions=total_conversions,
        total_reach=total_reach,
        avg_engagement_rate=avg_engagement_rate,
    )


async def get_channel_breakdown(user_id: int, db: AsyncSession) -> List[ChannelBreakdown]:
    stmt = (
        select(
            ContentItem.platform,
            func.coalesce(func.sum(PerformanceMetric.reach), 0).label("total_reach"),
            func.coalesce(func.sum(PerformanceMetric.engagement), 0).label(
                "total_engagement"
            ),
            func.coalesce(func.sum(PerformanceMetric.clicks), 0).label("total_clicks"),
        )
        .join(ContentItem, PerformanceMetric.content_id == ContentItem.id)
        .join(ContentSchedule, ContentItem.schedule_id == ContentSchedule.id)
        .join(MarketingStrategy, ContentSchedule.strategy_id == MarketingStrategy.id)
        .join(Brand, MarketingStrategy.brand_id == Brand.id)
        .where(_user_metric_filters(user_id))
        .group_by(ContentItem.platform)
    )
    result = await db.execute(stmt)
    rows: Sequence = result.all()
    return [
        ChannelBreakdown(
            platform=r.platform.value if hasattr(r.platform, "value") else str(r.platform),
            total_reach=int(r.total_reach),
            total_engagement=int(r.total_engagement),
            total_clicks=int(r.total_clicks),
        )
        for r in rows
    ]


async def get_time_series(
    user_id: int,
    db: AsyncSession,
    start_date: date,
    end_date: date,
) -> List[TimeSeriesPoint]:
    end_excl = date.fromordinal(end_date.toordinal() + 1)
    day = cast(PerformanceMetric.recorded_at, Date)

    stmt = (
        select(
            day.label("d"),
            func.coalesce(func.sum(PerformanceMetric.reach), 0).label("reach"),
            func.coalesce(func.sum(PerformanceMetric.engagement), 0).label("engagement"),
        )
        .select_from(PerformanceMetric)
        .join(ContentItem)
        .join(ContentSchedule)
        .join(MarketingStrategy)
        .join(Brand)
        .where(
            _user_metric_filters(user_id),
            PerformanceMetric.recorded_at
            >= datetime.combine(start_date, time.min, tzinfo=timezone.utc),
            PerformanceMetric.recorded_at
            < datetime.combine(end_excl, time.min, tzinfo=timezone.utc),
        )
        .group_by(day)
        .order_by(day)
    )

    result = await db.execute(stmt)
    points: List[TimeSeriesPoint] = []
    for r in result.all():
        d: date = r.d
        points.append(
            TimeSeriesPoint(
                date=d.strftime("%Y-%m-%d"),
                reach=int(r.reach),
                engagement=int(r.engagement),
            )
        )
    return points


async def get_detailed_metrics(user_id: int, db: AsyncSession) -> dict:
    stmt = (
        select(
            func.avg(PerformanceMetric.cpc),
            func.avg(PerformanceMetric.ctr),
            func.avg(PerformanceMetric.roas),
            func.coalesce(func.sum(PerformanceMetric.conversions), 0),
            func.coalesce(func.sum(PerformanceMetric.clicks), 0),
        )
        .select_from(PerformanceMetric)
        .join(ContentItem)
        .join(ContentSchedule)
        .join(MarketingStrategy)
        .join(Brand)
        .where(_user_metric_filters(user_id))
    )
    result = await db.execute(stmt)
    row = result.one()
    av_cpc, av_ctr, av_roas, total_conversions, total_clicks = row

    def dec_to_float(v: Optional[Decimal]) -> float:
        if v is None:
            return 0.0
        return float(v)

    return {
        "avg_cpc": dec_to_float(av_cpc),
        "avg_ctr": dec_to_float(av_ctr),
        "avg_roas": dec_to_float(av_roas),
        "total_conversions": int(total_conversions),
        "total_clicks": int(total_clicks),
    }
