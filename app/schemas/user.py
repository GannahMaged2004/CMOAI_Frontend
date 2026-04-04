from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.db.base import UserRole

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str 
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
