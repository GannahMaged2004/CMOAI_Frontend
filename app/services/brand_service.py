"""
Brand management service — CRUD and full-context load for AI agents.
"""

from typing import List

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import Forbidden, NotFound
from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandUpdate
from app.schemas.common import MessageResponse


# ── Helpers ───────────────────────────────────────────────────

def _get_brand_for_user(brand_id: int, user_id: int, db: Session) -> Brand:
    """Return the Brand if it exists and belongs to *user_id*.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if it belongs to a different user.
    """
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise NotFound("Brand")
    if brand.user_id != user_id:
        raise Forbidden("You do not have access to this brand")
    return brand


# ── Service functions ─────────────────────────────────────────

def create_brand(data: BrandCreate, user_id: int, db: Session) -> Brand:
    """Create a new brand owned by *user_id*."""
    brand = Brand(**data.model_dump(), user_id=user_id)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


def get_brand(brand_id: int, user_id: int, db: Session) -> Brand:
    """Return a single brand that belongs to *user_id*.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if it belongs to a different user.
    """
    return _get_brand_for_user(brand_id, user_id, db)


def list_brands(user_id: int, db: Session) -> List[Brand]:
    """Return all brands owned by *user_id*."""
    return db.query(Brand).filter(Brand.user_id == user_id).all()


def update_brand(brand_id: int, data: BrandUpdate, user_id: int, db: Session) -> Brand:
    """Partially update a brand's fields.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if it belongs to a different user.
    """
    brand = _get_brand_for_user(brand_id, user_id, db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(brand, field, value)

    db.commit()
    db.refresh(brand)
    return brand


def delete_brand(brand_id: int, user_id: int, db: Session) -> MessageResponse:
    """Permanently delete a brand and all its child records (cascade).

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if it belongs to a different user.
    """
    brand = _get_brand_for_user(brand_id, user_id, db)
    db.delete(brand)
    db.commit()
    return MessageResponse(message="Brand deleted successfully")


def get_brand_with_full_context(brand_id: int, user_id: int, db: Session) -> Brand:
    """Return a brand with all its associated strategies eagerly loaded.

    This is the entry point for AI agents that need the full brand context.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if it belongs to a different user.
    """
    brand = (
        db.query(Brand)
        .options(joinedload(Brand.strategies))
        .filter(Brand.id == brand_id)
        .first()
    )
    if not brand:
        raise NotFound("Brand")
    if brand.user_id != user_id:
        raise Forbidden("You do not have access to this brand")
    return brand
