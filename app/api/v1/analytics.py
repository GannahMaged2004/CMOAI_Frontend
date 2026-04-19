from __future__ import annotations

from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.user import User
from app.schemas.performance_metric import (
    AnalyticsOverview,
    ChannelBreakdown,
    MetricCreate,
    MetricOut,
    TimeSeriesPoint,
)
from app.services import performance_service as service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/metrics", response_model=MetricOut, status_code=status.HTTP_201_CREATED)
async def record_performance_metric(
    data: MetricCreate,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    metric = await service.record_metric(data, current_user.id, db)
    return MetricOut.model_validate(metric)


@router.get("/overview", response_model=AnalyticsOverview)
async def analytics_overview(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    return await service.get_analytics_overview(
        current_user.id, db, start_date=start_date, end_date=end_date
    )


@router.get("/channels", response_model=List[ChannelBreakdown])
async def analytics_channels(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.get_channel_breakdown(current_user.id, db)


@router.get("/chart", response_model=List[TimeSeriesPoint])
async def analytics_chart(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
    start_date: date = Query(...),
    end_date: date = Query(...),
):
    return await service.get_time_series(current_user.id, db, start_date, end_date)


@router.get("/detailed")
async def analytics_detailed(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    return await service.get_detailed_metrics(current_user.id, db)
