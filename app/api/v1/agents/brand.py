import asyncio

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.brand import Brand
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.agents.brand_agent import (
    BrandAgentRequest,
    BrandAgentResponse,
    BrandAgentStatus,
)
from app.services.brand_agent import get_brand_agent_status, run_brand_agent

router = APIRouter(prefix="/agents/brand", tags=["Brand Agent"])


@router.get("/status", response_model=BrandAgentStatus)
async def brand_agent_status():
    return get_brand_agent_status()


@router.post("/generate", response_model=BrandAgentResponse)
async def generate_brand_guidance(
    data: BrandAgentRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    brand_result = await db.execute(select(Brand).where(Brand.id == data.brand_id))
    brand = brand_result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this brand")

    campaign = None
    if data.campaign_id is not None:
        campaign_result = await db.execute(
            select(Campaign).where(Campaign.id == data.campaign_id)
        )
        campaign = campaign_result.scalar_one_or_none()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        if campaign.brand_id != brand.id:
            raise HTTPException(
                status_code=400,
                detail="Campaign does not belong to the selected brand",
            )

    try:
        output, mode = await asyncio.to_thread(
            run_brand_agent, brand, campaign, data.action
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Brand agent error: {str(e)}",
        ) from e

    return BrandAgentResponse(
        brand_id=brand.id,
        campaign_id=campaign.id if campaign else None,
        action=data.action,
        output=output,
        mode=mode,
    )
