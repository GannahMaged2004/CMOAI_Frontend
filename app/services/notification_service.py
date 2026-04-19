from __future__ import annotations

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.schemas.common import MessageResponse
from app.schemas.notification import NotificationOut


async def list_notifications(user_id: int, db: AsyncSession) -> List[NotificationOut]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [NotificationOut.model_validate(n) for n in rows]


async def mark_read(
    notification_id: int,
    user_id: int,
    db: AsyncSession,
) -> NotificationOut:
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return NotificationOut.model_validate(notification)


async def mark_all_read(user_id: int, db: AsyncSession) -> MessageResponse:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id)
        .values(is_read=True)
    )
    await db.commit()
    return MessageResponse(message="All notifications marked as read")


async def create_notification(
    user_id: int,
    message: str,
    notification_type: Optional[str],
    db: AsyncSession,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification
