from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, ContentType, PlatformType, ContentStatus
from sqlalchemy.dialects.postgresql import ENUM

class ContentItem(Base):
    __tablename__ = 'content_items'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    content_type = Column(ENUM(ContentType, name='content_type', create_type=False), nullable=False)
    platform = Column(ENUM(PlatformType, name='platform_type', create_type=False), nullable=False)
    objective = Column(String(300))
    body_text = Column(Text)
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(String(10))
    status = Column(ENUM(ContentStatus, name='content_status', create_type=False), nullable=False, default=ContentStatus.Draft, index=True)
    schedule_id = Column(Integer, ForeignKey('content_schedules.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    schedule = relationship('ContentSchedule', back_populates='items')
    metrics = relationship('PerformanceMetric', back_populates='content_item', cascade='all, delete-orphan')
