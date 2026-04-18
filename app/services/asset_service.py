import os
import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, UploadFile
import aiofiles
from app.models.asset import Asset
from app.models.campaign import Campaign
from app.models.brand import Brand
from app.schemas.common import MessageResponse
from app.db.base import AssetType

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def verify_campaign_access(db: AsyncSession, campaign_id: int, user_id: int) -> Campaign:
    stmt = select(Campaign).join(Brand).where(
        Campaign.id == campaign_id,
        Brand.user_id == user_id
    )
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=403, detail="Campaign access denied or not found")
    return campaign

async def verify_asset_access(db: AsyncSession, asset_id: int, user_id: int) -> Asset:
    stmt = select(Asset).where(Asset.id == asset_id)
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    if asset.campaign_id:
        await verify_campaign_access(db, asset.campaign_id, user_id)
            
    return asset

async def upload_asset(file: UploadFile, asset_type: AssetType, campaign_id: int, user_id: int, db: AsyncSession) -> Asset:
    await verify_campaign_access(db, campaign_id, user_id)
        
    # Generate unique filename to prevent collisions
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Read and save file
    content = await file.read()
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(content)
        
    new_asset = Asset(
        name=file.filename or "uploaded_file",
        asset_type=asset_type,
        url=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        campaign_id=campaign_id
    )
    
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset

async def list_assets(user_id: int, db: AsyncSession, asset_type: Optional[AssetType] = None, campaign_id: Optional[int] = None) -> List[Asset]:
    conditions = [Brand.user_id == user_id]
    
    if asset_type:
        conditions.append(Asset.asset_type == asset_type)
    if campaign_id:
        conditions.append(Asset.campaign_id == campaign_id)
        
    stmt = select(Asset).join(Campaign, Asset.campaign_id == Campaign.id).join(Brand, Campaign.brand_id == Brand.id).where(
        and_(*conditions)
    )
    
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_asset(asset_id: int, user_id: int, db: AsyncSession) -> Asset:
    return await verify_asset_access(db, asset_id, user_id)

async def delete_asset(asset_id: int, user_id: int, db: AsyncSession) -> MessageResponse:
    asset = await verify_asset_access(db, asset_id, user_id)
    
    # Delete physical file
    if asset.url and os.path.exists(asset.url):
        os.remove(asset.url)
        
    await db.delete(asset)
    await db.commit()
    return MessageResponse(message="Asset deleted successfully")