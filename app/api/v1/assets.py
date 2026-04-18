from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.asset import AssetOut
from app.schemas.common import MessageResponse
from app.db.base import AssetType
from app.services import asset_service as service

router = APIRouter()

@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: AssetType = Form(...),
    campaign_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.upload_asset(file, asset_type, campaign_id, current_user.id, db)

@router.get("", response_model=List[AssetOut])
async def list_assets(
    asset_type: Optional[AssetType] = Query(None),
    campaign_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_assets(current_user.id, db, asset_type, campaign_id)

@router.get("/{id}", response_model=AssetOut)
async def get_asset(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_asset(id, current_user.id, db)

@router.delete("/{id}", response_model=MessageResponse)
async def delete_asset(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.delete_asset(id, current_user.id, db)
