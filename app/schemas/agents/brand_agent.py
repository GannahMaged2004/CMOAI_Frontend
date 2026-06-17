from typing import Literal

from pydantic import BaseModel


class BrandAgentRequest(BaseModel):
    brand_id: int
    action: str
    campaign_id: int | None = None


class BrandAgentResponse(BaseModel):
    brand_id: int
    campaign_id: int | None = None
    action: str
    output: str
    mode: Literal["live", "fallback"]


class BrandAgentStatus(BaseModel):
    provider: str
    model: str
    mode: Literal["live", "fallback"]
    configured: bool
