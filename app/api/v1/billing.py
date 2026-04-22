from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.user import User
from app.schemas.billing import PlanOut, SubscribeRequest, SubscriptionOut, UsageOut
from app.schemas.common import MessageResponse
from app.services import billing_service as service

router = APIRouter(prefix="/billing", tags=["Billing"])


class UpgradePlanRequest(BaseModel):
    plan_id: int


@router.get("/plans", response_model=List[PlanOut])
async def list_plans(db: AsyncSession = Depends(get_async_db)):
    return await service.list_plans(db)


@router.get("/subscription", response_model=Optional[SubscriptionOut])
async def get_my_subscription(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.get_my_subscription(current_user.id, db)


@router.post("/subscribe", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
async def subscribe(
    data: SubscribeRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.subscribe(current_user.id, data, db)


@router.post("/upgrade", response_model=SubscriptionOut)
async def upgrade(
    data: UpgradePlanRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.upgrade_plan(current_user.id, data.plan_id, db)


@router.get("/usage", response_model=UsageOut)
async def usage(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.get_usage(current_user.id, db)


@router.post("/webhook", response_model=MessageResponse)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    return await service.stripe_webhook(request, db)

