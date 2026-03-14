from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, StrategyStatus
from sqlalchemy.dialects.postgresql import ENUM

class MarketingStrategy(Base):
    __tablename__ = 'marketing_strategies'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    objectives = Column(Text)
    messaging_themes = Column(Text)
    platform_focus = Column(String(200))
    status = Column(ENUM(StrategyStatus, name='strategy_status', create_type=False), nullable=False, default=StrategyStatus.draft)
    brand_id = Column(Integer, ForeignKey('brands.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    brand = relationship('Brand', back_populates='strategies')
