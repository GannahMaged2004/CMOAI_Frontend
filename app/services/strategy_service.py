"""
Marketing strategy service — CRUD, duplication, and status management.
"""

from typing import List

from sqlalchemy.orm import Session

from app.core.exceptions import Forbidden, NotFound
from app.db.base import StrategyStatus
from app.models.brand import Brand
from app.models.marketing_strategy import MarketingStrategy
from app.schemas.common import MessageResponse
from app.schemas.marketing_strategy import (
    StrategyCreate,
    StrategyStatusUpdate,
    StrategyUpdate,
)


# ── Helpers ───────────────────────────────────────────────────

def _verify_brand_ownership(brand_id: int, user_id: int, db: Session) -> Brand:
    """Ensure *brand_id* exists and belongs to *user_id*.

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


def _get_strategy_for_user(
    strategy_id: int, user_id: int, db: Session
) -> MarketingStrategy:
    """Return the strategy after verifying that its brand belongs to *user_id*.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    strategy = (
        db.query(MarketingStrategy)
        .filter(MarketingStrategy.id == strategy_id)
        .first()
    )
    if not strategy:
        raise NotFound("Strategy")

    _verify_brand_ownership(strategy.brand_id, user_id, db)
    return strategy


# ── Service functions ─────────────────────────────────────────

def create_strategy(
    data: StrategyCreate, user_id: int, db: Session
) -> MarketingStrategy:
    """Create a new marketing strategy after verifying brand ownership.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if the brand belongs to a different user.
    """
    _verify_brand_ownership(data.brand_id, user_id, db)

    strategy = MarketingStrategy(
        title=data.title,
        objectives=data.objectives,
        messaging_themes=data.messaging_themes,
        platform_focus=data.platform_focus,
        brand_id=data.brand_id,
        status=StrategyStatus.draft,
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy


def get_strategy(strategy_id: int, user_id: int, db: Session) -> MarketingStrategy:
    """Return a single strategy after verifying brand ownership.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    return _get_strategy_for_user(strategy_id, user_id, db)


def list_strategies(
    brand_id: int, user_id: int, db: Session
) -> List[MarketingStrategy]:
    """Return all strategies for *brand_id* after verifying brand ownership.

    Raises:
        NotFound:  if the brand does not exist.
        Forbidden: if the brand belongs to a different user.
    """
    _verify_brand_ownership(brand_id, user_id, db)

    return (
        db.query(MarketingStrategy)
        .filter(MarketingStrategy.brand_id == brand_id)
        .all()
    )


def update_strategy(
    strategy_id: int, data: StrategyUpdate, user_id: int, db: Session
) -> MarketingStrategy:
    """Partially update a strategy's editable fields.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    strategy = _get_strategy_for_user(strategy_id, user_id, db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(strategy, field, value)

    db.commit()
    db.refresh(strategy)
    return strategy


def delete_strategy(
    strategy_id: int, user_id: int, db: Session
) -> MessageResponse:
    """Permanently delete a strategy.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    strategy = _get_strategy_for_user(strategy_id, user_id, db)
    db.delete(strategy)
    db.commit()
    return MessageResponse(message="Strategy deleted successfully")


def duplicate_strategy(
    strategy_id: int, user_id: int, db: Session
) -> MarketingStrategy:
    """Copy all fields from an existing strategy, reset status to draft, and save as new row.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    original = _get_strategy_for_user(strategy_id, user_id, db)

    duplicate = MarketingStrategy(
        title=f"{original.title} (Copy)",
        objectives=original.objectives,
        messaging_themes=original.messaging_themes,
        platform_focus=original.platform_focus,
        brand_id=original.brand_id,
        status=StrategyStatus.draft,
    )
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return duplicate


def update_strategy_status(
    strategy_id: int, data: StrategyStatusUpdate, user_id: int, db: Session
) -> MarketingStrategy:
    """Update the lifecycle status of a strategy.

    Raises:
        NotFound:  if the strategy does not exist.
        Forbidden: if the parent brand belongs to a different user.
    """
    strategy = _get_strategy_for_user(strategy_id, user_id, db)
    strategy.status = data.status
    db.commit()
    db.refresh(strategy)
    return strategy
