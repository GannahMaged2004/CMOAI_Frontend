from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.db.base import CampaignStatus

# CampaignStatus is already in app.db.base, so we can export it from here if needed,
# or just let users import it from here for convenience as requested.

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    brand_id: int
    strategy_id: Optional[int] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignOut(CampaignBase):
    id: int
    status: CampaignStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
