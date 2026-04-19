from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.notification import NotificationOut
from app.services import notification_service as service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.list_notifications(current_user.id, db)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.mark_read(notification_id, current_user.id, db)


@router.patch("/read-all", response_model=MessageResponse)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.mark_all_read(current_user.id, db)
