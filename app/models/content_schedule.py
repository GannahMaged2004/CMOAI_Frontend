from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, PlanType
from sqlalchemy.dialects.postgresql import ENUM

class ContentSchedule(Base):
    __tablename__ = 'content_schedules'

    id = Column(Integer, primary_key=True, index=True)
    plan_type = Column(ENUM(PlanType, name='plan_type', create_type=False), nullable=False, default=PlanType.weekly)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    strategy_id = Column(Integer, ForeignKey('marketing_strategies.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    strategy = relationship('MarketingStrategy')
    items = relationship('ContentItem', back_populates='schedule', cascade='all, delete-orphan')
