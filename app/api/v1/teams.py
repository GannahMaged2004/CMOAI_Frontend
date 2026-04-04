"""
Team router — protected endpoints for team creation and member management.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.team import MemberInvite, MemberRoleUpdate, TeamCreate, TeamOut, TeamUpdate
from app.services import team_service

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("", response_model=TeamOut, status_code=201)
def create_team(
    data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new team. The authenticated user becomes the owner and first admin."""
    return team_service.create_team(data.name, current_user.id, db)


@router.get("/me", response_model=TeamOut)
def get_my_team(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the team the current user belongs to, with all members."""
    return team_service.get_my_team(current_user.id, db)


@router.put("/me", response_model=TeamOut)
def update_team(
    data: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rename the current user's team."""
    team = team_service.get_my_team(current_user.id, db)
    return team_service.update_team(team.id, data.name, db)


@router.post("/me/invite", response_model=MessageResponse, status_code=201)
def invite_member(
    data: MemberInvite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Invite a user by email to join the current user's team."""
    team = team_service.get_my_team(current_user.id, db)
    return team_service.invite_member(team.id, data, db)


@router.delete("/me/members/{user_id}", response_model=MessageResponse)
def remove_member(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a member from the current user's team."""
    team = team_service.get_my_team(current_user.id, db)
    return team_service.remove_member(team.id, user_id, db)


@router.patch("/me/members/{user_id}/role", response_model=MessageResponse)
def update_member_role(
    user_id: int,
    data: MemberRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the role of a member in the current user's team."""
    team = team_service.get_my_team(current_user.id, db)
    return team_service.update_member_role(team.id, user_id, data, db)


@router.delete("/me/leave", response_model=MessageResponse)
def leave_team(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Leave the team the current user belongs to. Owners cannot leave."""
    team = team_service.get_my_team(current_user.id, db)
    return team_service.leave_team(team.id, current_user.id, db)
