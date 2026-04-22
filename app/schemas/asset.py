from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.db.base import AssetType

class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    url: str
    public_id: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    campaign_id: Optional[int] = None

class AssetUpload(BaseModel):
    name: str
    asset_type: AssetType
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    campaign_id: Optional[int] = None
    # Assuming URL will be populated by the backend after upload or given by client
    url: Optional[str] = None

class AssetOut(AssetBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
