from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.campaign import Campaign, CampaignMember
from app.models.brand import Brand
from app.models.user import User
from app.models.marketing_strategy import MarketingStrategy
from app.models.performance_metric import PerformanceMetric
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignStatusUpdate, CampaignPerformance
from app.schemas.common import MessageResponse
from app.db.base import CampaignStatus

async def verify_brand_access(db: AsyncSession, brand_id: int, user_id: int) -> Brand:
    stmt = select(Brand).where(Brand.id == brand_id, Brand.user_id == user_id)
    result = await db.execute(stmt)
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found or access denied")
    return brand

async def verify_campaign_access(db: AsyncSession, campaign_id: int, user_id: int) -> Campaign:
    stmt = select(Campaign).options(selectinload(Campaign.members)).join(Brand).where(
        Campaign.id == campaign_id,
        Brand.user_id == user_id
    )
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or access denied")
    return campaign

async def create_campaign(data: CampaignCreate, user_id: int, db: AsyncSession) -> Campaign:
    await verify_brand_access(db, data.brand_id, user_id)
    
    if data.strategy_id:
        stmt = select(MarketingStrategy).where(MarketingStrategy.id == data.strategy_id, MarketingStrategy.brand_id == data.brand_id)
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Strategy does not belong to the brand")

    new_campaign = Campaign(**data.model_dump())
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    
    stmt = select(Campaign).options(selectinload(Campaign.members)).where(Campaign.id == new_campaign.id)
    result = await db.execute(stmt)
    return result.scalar_one()

async def get_campaign(campaign_id: int, user_id: int, db: AsyncSession) -> Campaign:
    return await verify_campaign_access(db, campaign_id, user_id)

async def list_campaigns(user_id: int, db: AsyncSession, campaign_status: Optional[CampaignStatus] = None, search: Optional[str] = None) -> List[Campaign]:
    conditions = [Brand.user_id == user_id]
    if campaign_status:
        conditions.append(Campaign.status == campaign_status)
    if search:
        conditions.append(Campaign.name.ilike(f"%{search}%"))
        
    stmt = select(Campaign).options(selectinload(Campaign.members)).join(Brand).where(and_(*conditions))
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_campaign(campaign_id: int, data: CampaignUpdate, user_id: int, db: AsyncSession) -> Campaign:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)
        
    await db.commit()
    await db.refresh(campaign)
    return campaign

async def delete_campaign(campaign_id: int, user_id: int, db: AsyncSession) -> MessageResponse:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    await db.delete(campaign)
    await db.commit()
    return MessageResponse(message="Campaign deleted successfully")

async def update_campaign_status(campaign_id: int, data: CampaignStatusUpdate, user_id: int, db: AsyncSession) -> Campaign:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    campaign.status = data.status
    await db.commit()
    await db.refresh(campaign)
    return campaign

async def get_campaign_performance(campaign_id: int, user_id: int, db: AsyncSession) -> CampaignPerformance:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    
    if not campaign.strategy_id:
        return CampaignPerformance()
        
    stmt = select(
        func.sum(PerformanceMetric.reach).label('total_reach'),
        func.sum(PerformanceMetric.clicks).label('total_clicks'),
        func.sum(PerformanceMetric.conversions).label('total_conversions'),
        func.avg(PerformanceMetric.engagement_rate).label('avg_engagement_rate')
    ).where(PerformanceMetric.strategy_id == campaign.strategy_id)
    
    result = await db.execute(stmt)
    row = result.first()
    
    if row:
        return CampaignPerformance(
            total_reach=row.total_reach or 0,
            total_clicks=row.total_clicks or 0,
            total_conversions=row.total_conversions or 0,
            avg_engagement_rate=float(row.avg_engagement_rate or 0.0)
        )
    return CampaignPerformance()

async def add_member(campaign_id: int, user_id_to_add: int, user_id: int, db: AsyncSession) -> MessageResponse:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    
    # Verify user exists
    stmt = select(User).where(User.id == user_id_to_add)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User to add not found")
        
    # Check if already a member
    stmt = select(CampaignMember).where(
        CampaignMember.campaign_id == campaign_id,
        CampaignMember.user_id == user_id_to_add
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a member of this campaign")
        
    new_member = CampaignMember(campaign_id=campaign_id, user_id=user_id_to_add)
    db.add(new_member)
    await db.commit()
    return MessageResponse(message="Member added to campaign successfully")

async def remove_member(campaign_id: int, user_id_to_remove: int, user_id: int, db: AsyncSession) -> MessageResponse:
    campaign = await verify_campaign_access(db, campaign_id, user_id)
    
    stmt = select(CampaignMember).where(
        CampaignMember.campaign_id == campaign_id,
        CampaignMember.user_id == user_id_to_remove
    )
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in campaign")
        
    await db.delete(member)
    await db.commit()
    return MessageResponse(message="Member removed from campaign successfully")
