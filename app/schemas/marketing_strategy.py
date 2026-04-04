from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.db.base import StrategyStatus


class StrategyBase(BaseModel):
    title: str
    objectives: Optional[str] = None
    messaging_themes: Optional[str] = None
    platform_focus: Optional[str] = None
    brand_id: int


class StrategyCreate(StrategyBase):
    pass


class StrategyUpdate(BaseModel):
    title: Optional[str] = None
    objectives: Optional[str] = None
    messaging_themes: Optional[str] = None
    platform_focus: Optional[str] = None


class StrategyStatusUpdate(BaseModel):
    status: StrategyStatus


class StrategyOut(StrategyBase):
    id: int
    status: StrategyStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
