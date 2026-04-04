from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.db.base import PlanName

class PlanOut(BaseModel):
    id: int
    name: PlanName
    price_monthly: Decimal
    ai_generation_limit: int
    active_campaign_limit: int
    storage_limit_gb: Decimal
    stripe_price_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SubscribeRequest(BaseModel):
    plan_id: int
    payment_method_id: str

class UsageOut(BaseModel):
    ai_generations_used: int
    active_campaigns_count: int
    storage_used_gb: float
    plan_name: str
