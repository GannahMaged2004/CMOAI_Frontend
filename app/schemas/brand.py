from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class BrandBase(BaseModel):
    brand_name: str
    industry: Optional[str] = None
    tone_of_voice: Optional[str] = None
    target_audience: Optional[str] = None
    value_proposition: Optional[str] = None
    positioning: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    brand_name: Optional[str] = None
    industry: Optional[str] = None
    tone_of_voice: Optional[str] = None
    target_audience: Optional[str] = None
    value_proposition: Optional[str] = None
    positioning: Optional[str] = None

class BrandOut(BrandBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
