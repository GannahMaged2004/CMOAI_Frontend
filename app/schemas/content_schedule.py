from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from app.db.base import PlanType

class ScheduleBase(BaseModel):
    plan_type: PlanType = PlanType.weekly
    start_date: date
    end_date: date
    strategy_id: int

class ScheduleCreate(ScheduleBase):
    pass

class CalendarViewItem(BaseModel):
    id: int
    title: str
    date: date
    # Add any other fields necessary for rendering the calendar
    model_config = ConfigDict(from_attributes=True)

class CalendarView(ScheduleBase):
    id: int
    created_at: datetime
    items: List[CalendarViewItem] = []

    model_config = ConfigDict(from_attributes=True)

class ScheduleUpdate(BaseModel):
    plan_type: Optional[PlanType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ScheduleOut(ScheduleBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
