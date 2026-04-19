from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_async_db, get_current_user_async
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignStatusUpdate, CampaignOut, CampaignPerformance
from app.schemas.common import MessageResponse
from app.db.base import CampaignStatus
from app.services import campaign_service as service

router = APIRouter()

@router.post("", response_model=CampaignOut, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    data: CampaignCreate,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.create_campaign(data, current_user.id, db)

@router.get("", response_model=List[CampaignOut])
async def list_campaigns(
    campaign_status: Optional[CampaignStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.list_campaigns(current_user.id, db, campaign_status, search)

@router.get("/{id}", response_model=CampaignOut)
async def get_campaign(
    id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.get_campaign(id, current_user.id, db)

@router.put("/{id}", response_model=CampaignOut)
async def update_campaign(
    id: int,
    data: CampaignUpdate,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.update_campaign(id, data, current_user.id, db)

@router.delete("/{id}", response_model=MessageResponse)
async def delete_campaign(
    id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.delete_campaign(id, current_user.id, db)

@router.patch("/{id}/status", response_model=CampaignOut)
async def update_campaign_status(
    id: int,
    data: CampaignStatusUpdate,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.update_campaign_status(id, data, current_user.id, db)

@router.get("/{id}/performance", response_model=CampaignPerformance)
async def get_campaign_performance(
    id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.get_campaign_performance(id, current_user.id, db)

@router.post("/{id}/members/{user_id}", response_model=MessageResponse)
async def add_member(
    id: int,
    user_id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.add_member(id, user_id, current_user.id, db)

@router.delete("/{id}/members/{user_id}", response_model=MessageResponse)
async def remove_member(
    id: int,
    user_id: int,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    return await service.remove_member(id, user_id, current_user.id, db)
