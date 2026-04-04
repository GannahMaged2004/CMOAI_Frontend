from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardSummary(BaseModel):
    active_campaigns: int
    total_brands: int
    upcoming_posts: int
    total_reach: int

class RecentActivityItem(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_name: str
    timestamp: datetime

class RecentActivity(BaseModel):
    items: List[RecentActivityItem]
