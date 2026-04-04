"""
User profile service — read, update, and password management.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFound, Unauthorized
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import PasswordChange, UserUpdate


# ── Helpers ───────────────────────────────────────────────────

def _get_user(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFound("User")
    return user


# ── Service functions ─────────────────────────────────────────

def get_profile(user_id: int, db: Session) -> User:
    """Return the User ORM instance for *user_id*.

    Raises:
        NotFound: if the user does not exist.
    """
    return _get_user(user_id, db)


def update_profile(user_id: int, data: UserUpdate, db: Session) -> User:
    """Partially update name, email, and/or avatar_url.

    Raises:
        NotFound: if the user does not exist.
    """
    user = _get_user(user_id, db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def change_password(user_id: int, data: PasswordChange, db: Session) -> MessageResponse:
    """Verify the current password, then save the new hashed password.

    Raises:
        NotFound:     if the user does not exist.
        Unauthorized: if *current_password* does not match the stored hash.
    """
    user = _get_user(user_id, db)

    if not verify_password(data.current_password, user.hashed_password):
        raise Unauthorized("Current password is incorrect")

    user.hashed_password = hash_password(data.new_password)
    db.commit()

    return MessageResponse(message="Password changed successfully")
