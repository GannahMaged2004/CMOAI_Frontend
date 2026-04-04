from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    notification_type: Optional[str] = None
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
