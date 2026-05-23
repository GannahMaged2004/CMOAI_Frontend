from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base, UserRole
from sqlalchemy.dialects.postgresql import ENUM

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(ENUM(UserRole, name='user_role', create_type=False), nullable=False, default=UserRole.owner)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    password_reset_otp_hash = Column(String(255), nullable=True)
    password_reset_otp_expiry = Column(DateTime(timezone=True), nullable=True)
    password_reset_verified = Column(DateTime, nullable=True)
