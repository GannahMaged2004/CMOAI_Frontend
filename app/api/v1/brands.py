"""
Brand router — protected CRUD endpoints for brand management.
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandOut, BrandUpdate
from app.schemas.common import MessageResponse
from app.services import brand_service

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.post("", response_model=BrandOut, status_code=201)
def create_brand(
    data: BrandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new brand for the authenticated user."""
    return brand_service.create_brand(data, current_user.id, db)


@router.get("", response_model=List[BrandOut])
def list_brands(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all brands owned by the authenticated user."""
    return brand_service.list_brands(current_user.id, db)


@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(
    brand_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a single brand by ID (must belong to the authenticated user)."""
    return brand_service.get_brand(brand_id, current_user.id, db)


@router.put("/{brand_id}", response_model=BrandOut)
def update_brand(
    brand_id: int,
    data: BrandUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a brand's details (must belong to the authenticated user)."""
    return brand_service.update_brand(brand_id, data, current_user.id, db)


@router.delete("/{brand_id}", response_model=MessageResponse)
def delete_brand(
    brand_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete a brand and all its child records."""
    return brand_service.delete_brand(brand_id, current_user.id, db)
