from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, PlanName
from sqlalchemy.dialects.postgresql import ENUM

class Plan(Base):
    __tablename__ = 'plans'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(ENUM(PlanName, name='plan_name', create_type=False), nullable=False, unique=True)
    price_monthly = Column(Numeric(8, 2), nullable=False)
    ai_generation_limit = Column(Integer, nullable=False, default=50)
    active_campaign_limit = Column(Integer, nullable=False, default=1)
    storage_limit_gb = Column(Numeric(6, 2), nullable=False, default=5.0)
    stripe_price_id = Column(String(100))

class Subscription(Base):
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey('plans.id'), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    stripe_subscription_id = Column(String(100))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship('User')
    plan = relationship('Plan')
