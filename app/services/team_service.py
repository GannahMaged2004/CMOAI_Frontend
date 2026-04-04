"""
Team management service — create, query, and member operations.
"""

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import AlreadyExists, Forbidden, NotFound
from app.db.base import MemberRole
from app.models.team import Team, TeamMember
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.team import MemberInvite, MemberRoleUpdate


# ── Helpers ───────────────────────────────────────────────────

def _get_team(team_id: int, db: Session) -> Team:
    team = (
        db.query(Team)
        .options(joinedload(Team.members).joinedload(TeamMember.user))
        .filter(Team.id == team_id)
        .first()
    )
    if not team:
        raise NotFound("Team")
    return team


def _get_membership(team_id: int, user_id: int, db: Session) -> TeamMember | None:
    return (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )


# ── Service functions ─────────────────────────────────────────

def create_team(name: str, owner_id: int, db: Session) -> Team:
    """Create a new team and automatically add the owner as an admin member.

    Returns the freshly created Team with members loaded.
    """
    team = Team(name=name, owner_id=owner_id)
    db.add(team)
    db.flush()  # get team.id without committing

    owner_membership = TeamMember(
        team_id=team.id,
        user_id=owner_id,
        role=MemberRole.admin,
    )
    db.add(owner_membership)
    db.commit()
    db.refresh(team)

    return _get_team(team.id, db)


def get_my_team(user_id: int, db: Session) -> Team:
    """Return the team that *user_id* belongs to, with all members and user data.

    Raises:
        NotFound: if the user is not a member of any team.
    """
    membership = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == user_id)
        .first()
    )
    if not membership:
        raise NotFound("Team membership")

    return _get_team(membership.team_id, db)


def update_team(team_id: int, name: str, db: Session) -> Team:
    """Rename a team.

    Raises:
        NotFound: if the team does not exist.
    """
    team = _get_team(team_id, db)
    team.name = name
    db.commit()

    return _get_team(team_id, db)


def invite_member(team_id: int, data: MemberInvite, db: Session) -> MessageResponse:
    """Find the user by email and add them to the team.

    Raises:
        NotFound:      if the team or the invited user does not exist.
        AlreadyExists: if the user is already a team member.
    """
    _get_team(team_id, db)  # validates team exists

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise NotFound("User")

    existing = _get_membership(team_id, user.id, db)
    if existing:
        raise AlreadyExists("Team member")

    member = TeamMember(team_id=team_id, user_id=user.id, role=data.role)
    db.add(member)
    db.commit()

    return MessageResponse(message=f"{user.email} has been added to the team")


def remove_member(team_id: int, user_id: int, db: Session) -> MessageResponse:
    """Remove a user from the team.

    Raises:
        NotFound: if the team or the membership does not exist.
        Forbidden: if the caller tries to remove the team owner.
    """
    team = _get_team(team_id, db)
    if team.owner_id == user_id:
        raise Forbidden("Cannot remove the team owner")

    membership = _get_membership(team_id, user_id, db)
    if not membership:
        raise NotFound("Team member")

    db.delete(membership)
    db.commit()

    return MessageResponse(message="Member removed from the team")


def update_member_role(
    team_id: int, user_id: int, data: MemberRoleUpdate, db: Session
) -> MessageResponse:
    """Change the role of an existing team member.

    Raises:
        NotFound: if the team or the membership does not exist.
    """
    _get_team(team_id, db)  # validates team exists

    membership = _get_membership(team_id, user_id, db)
    if not membership:
        raise NotFound("Team member")

    membership.role = data.role
    db.commit()

    return MessageResponse(message="Member role updated")


def leave_team(team_id: int, user_id: int, db: Session) -> MessageResponse:
    """Remove the requesting user from the team.

    Raises:
        NotFound:  if the team or membership does not exist.
        Forbidden: if the requesting user is the team owner.
    """
    team = _get_team(team_id, db)
    if team.owner_id == user_id:
        raise Forbidden("The team owner cannot leave their own team. Transfer ownership first.")

    membership = _get_membership(team_id, user_id, db)
    if not membership:
        raise NotFound("Team membership")

    db.delete(membership)
    db.commit()

    return MessageResponse(message="You have left the team")
