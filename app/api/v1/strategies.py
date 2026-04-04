"""
Marketing strategy router — protected endpoints for strategy CRUD,
duplication, and status management.
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.marketing_strategy import (
    StrategyCreate,
    StrategyOut,
    StrategyStatusUpdate,
    StrategyUpdate,
)
from app.services import strategy_service

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.post("", response_model=StrategyOut, status_code=201)
def create_strategy(
    data: StrategyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new marketing strategy under a brand owned by the authenticated user."""
    return strategy_service.create_strategy(data, current_user.id, db)


@router.get("", response_model=List[StrategyOut])
def list_strategies(
    brand_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all strategies for a given brand (must be owned by the authenticated user)."""
    return strategy_service.list_strategies(brand_id, current_user.id, db)


@router.get("/{strategy_id}", response_model=StrategyOut)
def get_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a single strategy by ID."""
    return strategy_service.get_strategy(strategy_id, current_user.id, db)


@router.put("/{strategy_id}", response_model=StrategyOut)
def update_strategy(
    strategy_id: int,
    data: StrategyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Partially update a strategy's editable fields."""
    return strategy_service.update_strategy(strategy_id, data, current_user.id, db)


@router.delete("/{strategy_id}", response_model=MessageResponse)
def delete_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete a strategy."""
    return strategy_service.delete_strategy(strategy_id, current_user.id, db)


@router.post("/{strategy_id}/duplicate", response_model=StrategyOut, status_code=201)
def duplicate_strategy(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a copy of a strategy with status reset to draft."""
    return strategy_service.duplicate_strategy(strategy_id, current_user.id, db)


@router.patch("/{strategy_id}/status", response_model=StrategyOut)
def update_strategy_status(
    strategy_id: int,
    data: StrategyStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the lifecycle status (draft / active / archived) of a strategy."""
    return strategy_service.update_strategy_status(strategy_id, data, current_user.id, db)
