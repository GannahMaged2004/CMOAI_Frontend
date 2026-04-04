from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.db.base import MemberRole


class TeamCreate(BaseModel):
    name: str


class TeamUpdate(BaseModel):
    name: str


class MemberOut(BaseModel):
    id: int
    user_id: int
    team_id: int
    role: MemberRole
    joined_at: datetime

    # Nested user info (populated when relationship is loaded)
    name: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TeamOut(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    members: List[MemberOut] = []

    model_config = ConfigDict(from_attributes=True)


class MemberInvite(BaseModel):
    email: EmailStr
    role: MemberRole = MemberRole.editor


class MemberRoleUpdate(BaseModel):
    role: MemberRole
