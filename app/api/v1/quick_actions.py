from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_async_db, get_current_user_async
from app.models.user import User
from app.schemas.quick_actions import (
    BlogPostRequest,
    GenerateImageRequest,
    HashtagRequest,
    QuickActionResponse,
    QuickStrategyRequest,
)
from app.services import quick_actions_service as service

router = APIRouter(prefix="/quick-actions", tags=["Quick Actions"])


@router.post("/blog-post", response_model=QuickActionResponse, status_code=status.HTTP_201_CREATED)
async def blog_post(
    data: BlogPostRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.generate_blog_post(data, current_user.id, db)


@router.post("/hashtags", response_model=QuickActionResponse, status_code=status.HTTP_201_CREATED)
async def hashtags(
    data: HashtagRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.generate_hashtags(data, current_user.id, db)


@router.post("/image-prompt", response_model=QuickActionResponse, status_code=status.HTTP_201_CREATED)
async def image_prompt(
    data: GenerateImageRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.generate_image_prompt(data, current_user.id, db)


@router.post("/strategy", response_model=QuickActionResponse, status_code=status.HTTP_201_CREATED)
async def strategy(
    data: QuickStrategyRequest,
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db),
):
    return await service.quick_generate_strategy(data, current_user.id, db)

