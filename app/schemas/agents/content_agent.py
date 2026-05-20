from pydantic import BaseModel
from typing import Literal, Optional

class ContentRequest(BaseModel):
    content_type: Literal["social_media_post", "email_campaign", "promotional_message"]
    brand_name: str
    industry: str
    target_audience: str
    tone: Literal["professional", "casual", "humorous", "inspirational"] = "professional"
    platform: Optional[Literal["instagram", "twitter", "linkedin", "facebook", "email"]] = None
    topic_or_offer: str
    cta: Optional[str] = None
    extra_notes: Optional[str] = None

class SEOData(BaseModel):
    keywords: list[str]
    meta_description: str
    suggested_title: str

class ContentVariation(BaseModel):
    variation_id: int
    content: str
    platform_note: str

class ContentOutput(BaseModel):
    content_type: str
    platform: Optional[str]
    generated_content: str
    variations: Optional[list[ContentVariation]] = None
    hashtags: Optional[list[str]] = None
    subject_line: Optional[str] = None
    seo: Optional[SEOData] = None
    platform_rules: Optional[dict] = None
    char_count: Optional[int] = None
    within_limit: Optional[bool] = None


class TextAgentRequest(BaseModel):
    """HTTP body for POST /agents/content/generate."""

    message: str
    campaign_id: int
    content_type: Literal["social_media_post", "email_campaign", "promotional_message"]
    platform: Optional[
        Literal["instagram", "twitter", "linkedin", "facebook", "email"]
    ] = None


class TextAgentResponse(ContentOutput):
    """API response — same fields as ContentOutput."""

    pass