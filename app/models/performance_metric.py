from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class PerformanceMetric(Base):
    __tablename__ = 'performance_metrics'

    id = Column(Integer, primary_key=True, index=True)
    impressions = Column(Integer, nullable=False, default=0)
    engagement = Column(Integer, nullable=False, default=0)
    clicks = Column(Integer, nullable=False, default=0)
    conversions = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    cpc = Column(Numeric(10, 4))
    ctr = Column(Numeric(5, 4))
    roas = Column(Numeric(10, 4))
    recorded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    content_id = Column(Integer, ForeignKey('content_items.id', ondelete='CASCADE'), nullable=False, index=True)

    content_item = relationship('ContentItem', back_populates='metrics')
