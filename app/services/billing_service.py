from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import bad_request, not_found
from app.db.base import PlanName
from app.models.billing import Plan, Subscription, UsageRecord
from app.schemas.billing import SubscribeRequest, UsageOut
from app.schemas.common import MessageResponse


async def list_plans(db: AsyncSession) -> List[Plan]:
    stmt = select(Plan).order_by(Plan.id.asc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_my_subscription(user_id: int, db: AsyncSession) -> Optional[Subscription]:
    stmt = (
        select(Subscription)
        .options(selectinload(Subscription.plan))
        .where(
            Subscription.user_id == user_id,
            Subscription.is_active.is_(True),
        )
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def subscribe(user_id: int, data: SubscribeRequest, db: AsyncSession) -> Subscription:
    existing = await get_my_subscription(user_id, db)
    if existing is not None:
        raise bad_request("You already have an active subscription")

    plan_stmt = select(Plan).where(Plan.id == data.plan_id).limit(1)
    plan_res = await db.execute(plan_stmt)
    plan = plan_res.scalar_one_or_none()
    if plan is None:
        raise not_found("Plan")

    subscription = Subscription(
        user_id=user_id,
        plan_id=plan.id,
        is_active=True,
    )
    db.add(subscription)

    now = datetime.now(timezone.utc)
    usage_stmt = select(UsageRecord).where(
        UsageRecord.user_id == user_id,
        UsageRecord.period_month == now.month,
        UsageRecord.period_year == now.year,
    )
    usage_res = await db.execute(usage_stmt)
    usage = usage_res.scalar_one_or_none()
    if usage is None:
        db.add(
            UsageRecord(
                user_id=user_id,
                ai_generations_used=0,
                active_campaigns_count=0,
                storage_used_gb=0,
                period_month=now.month,
                period_year=now.year,
            )
        )

    await db.commit()
    await db.refresh(subscription)
    return subscription


async def upgrade_plan(user_id: int, plan_id: int, db: AsyncSession) -> Subscription:
    plan_stmt = select(Plan).where(Plan.id == plan_id).limit(1)
    plan_res = await db.execute(plan_stmt)
    plan = plan_res.scalar_one_or_none()
    if plan is None:
        raise not_found("Plan")

    current = await get_my_subscription(user_id, db)
    if current is None:
        raise bad_request("No active subscription to upgrade")

    current.is_active = False
    db.add(current)

    new_sub = Subscription(
        user_id=user_id,
        plan_id=plan.id,
        is_active=True,
    )
    db.add(new_sub)

    now = datetime.now(timezone.utc)
    usage_stmt = select(UsageRecord).where(
        UsageRecord.user_id == user_id,
        UsageRecord.period_month == now.month,
        UsageRecord.period_year == now.year,
    )
    usage_res = await db.execute(usage_stmt)
    usage = usage_res.scalar_one_or_none()
    if usage is None:
        db.add(
            UsageRecord(
                user_id=user_id,
                ai_generations_used=0,
                active_campaigns_count=0,
                storage_used_gb=0,
                period_month=now.month,
                period_year=now.year,
            )
        )

    await db.commit()
    await db.refresh(new_sub)
    return new_sub


async def get_usage(user_id: int, db: AsyncSession) -> UsageOut:
    subscription = await get_my_subscription(user_id, db)

    if subscription and subscription.plan:
        plan_name = (
            subscription.plan.name.value
            if hasattr(subscription.plan.name, "value")
            else str(subscription.plan.name)
        )
    else:
        starter_stmt = select(Plan).where(Plan.name == PlanName.Starter).limit(1)
        starter_res = await db.execute(starter_stmt)
        starter_plan = starter_res.scalar_one_or_none()
        plan_name = (
            starter_plan.name.value
            if starter_plan and hasattr(starter_plan.name, "value")
            else PlanName.Starter.value
        )

    now = datetime.now(timezone.utc)
    usage_stmt = select(UsageRecord).where(
        UsageRecord.user_id == user_id,
        UsageRecord.period_month == now.month,
        UsageRecord.period_year == now.year,
    )
    usage_res = await db.execute(usage_stmt)
    usage = usage_res.scalar_one_or_none()

    if usage is None:
        ai_used = 0
        active_campaigns = 0
        storage_used = 0.0
    else:
        ai_used = int(usage.ai_generations_used)
        active_campaigns = int(usage.active_campaigns_count)
        storage_used = float(usage.storage_used_gb)

    return UsageOut(
        ai_generations_used=ai_used,
        active_campaigns_count=active_campaigns,
        storage_used_gb=storage_used,
        plan_name=plan_name,
    )


async def stripe_webhook(request: Request, db: AsyncSession) -> MessageResponse:
    _signature = request.headers.get("stripe-signature")
    # TODO: implement real Stripe event handling
    return MessageResponse(message="Webhook received")

