from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship , DeclarativeBase
from sqlalchemy.sql import func
from app.db.base import Base, AssetType
from sqlalchemy.dialects.postgresql import ENUM 
import datetime

class Asset(Base):
    __tablename__ = 'assets'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    asset_type = Column(ENUM(AssetType, name='asset_type', create_type=False), nullable=False, index=True)
    url = Column(String(1000), nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    campaign_id = Column(Integer, ForeignKey('campaigns.id', ondelete='SET NULL'), index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    campaign = relationship('Campaign')
