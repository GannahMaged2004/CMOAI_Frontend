from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, CampaignStatus
from sqlalchemy.dialects.postgresql import ENUM

class Campaign(Base):
    __tablename__ = 'campaigns'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(ENUM(CampaignStatus, name='campaign_status', create_type=False), nullable=False, default=CampaignStatus.Draft, index=True)
    start_date = Column(DateTime(timezone=True))
    brand_id = Column(Integer, ForeignKey('brands.id', ondelete='CASCADE'), nullable=False, index=True)
    strategy_id = Column(Integer, ForeignKey('marketing_strategies.id', ondelete='SET NULL'))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    brand = relationship('Brand')
    strategy = relationship('MarketingStrategy')
    members = relationship('CampaignMember', back_populates='campaign', cascade='all, delete-orphan')

class CampaignMember(Base):
    __tablename__ = 'campaign_members'

    campaign_id = Column(Integer, ForeignKey('campaigns.id', ondelete='CASCADE'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)

    campaign = relationship('Campaign', back_populates='members')
    user = relationship('User')
