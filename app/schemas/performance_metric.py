from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal

class MetricCreate(BaseModel):
    content_id: int
    impressions: int = 0
    engagement: int = 0
    clicks: int = 0
    conversions: int = 0
    reach: int = 0
    cpc: Optional[Decimal] = None
    ctr: Optional[Decimal] = None
    roas: Optional[Decimal] = None

class MetricOut(MetricCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AnalyticsOverview(BaseModel):
    total_impressions: int
    total_engagement: int
    total_clicks: int
    total_conversions: int
    total_reach: int
    average_ctr: float
