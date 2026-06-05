from pydantic import BaseModel
from typing import Optional, List


class VideoAgentRequest(BaseModel):
    message: str
    campaign_id: int
    platforms: Optional[List[str]] = ["Instagram", "TikTok"]
    budget: Optional[str] = ""


class ScriptOut(BaseModel):
    hook: Optional[str] = None
    body: Optional[str] = None
    cta: Optional[str] = None


class VideoPlanOut(BaseModel):
    concept: Optional[str] = None
    script: Optional[ScriptOut] = None
    scenes: Optional[List[str]] = []
    visual_style: Optional[str] = None
    audio_style: Optional[str] = None


class ReasoningOut(BaseModel):
    psychological_trigger: Optional[str] = None
    content_angle: Optional[str] = None
    hook_rationale: Optional[str] = None
    why_this_works: Optional[str] = None


class VideoAgentResponse(BaseModel):
    status: str
    video_plan: Optional[VideoPlanOut] = None
    reasoning: Optional[ReasoningOut] = None
    video_prompt: Optional[str] = None
    video_url: Optional[str] = None
    error_message: Optional[str] = None
