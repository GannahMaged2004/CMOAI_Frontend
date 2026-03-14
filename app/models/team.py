from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base, MemberRole
from sqlalchemy.dialects.postgresql import ENUM

class Team(Base):
    __tablename__ = 'teams'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    owner = relationship('User')
    members = relationship('TeamMember', back_populates='team', cascade='all, delete-orphan')

class TeamMember(Base):
    __tablename__ = 'team_members'

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role = Column(ENUM(MemberRole, name='member_role', create_type=False), nullable=False, default=MemberRole.editor)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    team = relationship('Team', back_populates='members')
    user = relationship('User')

    __table_args__ = (
        UniqueConstraint('team_id', 'user_id', name='uq_team_user'),
    )
