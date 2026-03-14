from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Brand(Base):
    __tablename__ = 'brands'

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(150), nullable=False)
    industry = Column(String(100))
    tone_of_voice = Column(String(200))
    target_audience = Column(Text)
    value_proposition = Column(Text)
    positioning = Column(Text)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship('User')
    strategies = relationship('MarketingStrategy', back_populates='brand', cascade='all, delete-orphan')
