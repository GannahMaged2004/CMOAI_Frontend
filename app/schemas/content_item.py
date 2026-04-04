from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.db.base import ContentType, PlatformType, ContentStatus

class ContentItemBase(BaseModel):
    title: str
    content_type: ContentType
    platform: PlatformType
    objective: Optional[str] = None
    body_text: Optional[str] = None
    scheduled_date: date
    scheduled_time: Optional[str] = None
    status: ContentStatus = ContentStatus.Draft
    schedule_id: int

class ContentItemCreate(ContentItemBase):
    pass

class PostStatusUpdate(BaseModel):
    status: ContentStatus

class ContentItemOut(ContentItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
