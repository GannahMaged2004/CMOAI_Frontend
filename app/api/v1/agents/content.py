import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.brand import Brand
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.agents.content_agent import (
    ContentAgentStatus,
    ContentRequest,
    TextAgentRequest,
    TextAgentResponse,
)
from app.services.content_agent import get_content_agent_status, run_content_agent

router = APIRouter(prefix="/agents/content", tags=["Content Agent"])

ToneLiteral = Literal["professional", "casual", "humorous", "inspirational"]


def _map_tone(tone_of_voice: str | None) -> ToneLiteral:
    if not tone_of_voice:
        return "professional"
    lower = tone_of_voice.lower()
    if "casual" in lower or "friendly" in lower:
        return "casual"
    if "humor" in lower or "witty" in lower:
        return "humorous"
    if "inspir" in lower or "bold" in lower:
        return "inspirational"
    return "professional"


@router.get("/status", response_model=ContentAgentStatus)
async def content_agent_status():
    return get_content_agent_status()


@router.post("/generate", response_model=TextAgentResponse)
async def generate_content(
    data: TextAgentRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
        select(Campaign).where(Campaign.id == data.campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    brand_result = await db.execute(
        select(Brand).where(Brand.id == campaign.brand_id)
    )
    brand = brand_result.scalar_one_or_none()

    platform = data.platform
    if data.content_type == "email_campaign" and not platform:
        platform = "email"

    agent_request = ContentRequest(
        content_type=data.content_type,
        brand_name=brand.brand_name if brand else "Brand",
        industry=brand.industry if brand and brand.industry else "General",
        target_audience=(
            brand.target_audience if brand and brand.target_audience else "General audience"
        ),
        tone=_map_tone(brand.tone_of_voice if brand else None),
        platform=platform,
        topic_or_offer=data.message,
        cta="Learn more",
        extra_notes=campaign.description,
    )

    try:
        output = await asyncio.to_thread(run_content_agent, agent_request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content agent error: {str(e)}",
        ) from e

    return TextAgentResponse.model_validate(output.model_dump())
