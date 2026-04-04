"""
Authentication service — register, login, and token refresh.

All database access uses synchronous SQLAlchemy (matching the existing
project setup in app/db/session.py).
"""

from sqlalchemy.orm import Session

from app.core.exceptions import AlreadyExists, NotFound, Unauthorized
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)


# ── Helpers ───────────────────────────────────────────────────

def _build_token_response(user: User) -> TokenResponse:
    """Return a TokenResponse with fresh access and refresh tokens for *user*."""
    payload = {"sub": user.email}
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
    )


def _get_user_by_email(email: str, db: Session) -> User | None:
    return db.query(User).filter(User.email == email).first()


# ── Service functions ─────────────────────────────────────────

def register_user(data: RegisterRequest, db: Session) -> TokenResponse:
    """Create a new user account and return a token pair.

    Raises:
        AlreadyExists: if the e-mail address is already registered.
    """
    if _get_user_by_email(data.email, db):
        raise AlreadyExists("Email")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _build_token_response(user)


def login_user(data: LoginRequest, db: Session) -> TokenResponse:
    """Verify credentials and return a token pair.

    Raises:
        Unauthorized: if the e-mail is not found or the password is wrong.
    """
    user = _get_user_by_email(data.email, db)
    if not user or not verify_password(data.password, user.hashed_password):
        raise Unauthorized("Invalid email or password")

    return _build_token_response(user)


def refresh_access_token(data: RefreshTokenRequest, db: Session) -> TokenResponse:
    """Issue a new token pair from a valid refresh token.

    Raises:
        Unauthorized: if the token is invalid, expired, or not a refresh token.
        NotFound:     if the user encoded in the token no longer exists.
    """
    from jose import JWTError

    try:
        payload = decode_token(data.refresh_token)
    except JWTError:
        raise Unauthorized("Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise Unauthorized("Token is not a refresh token")

    email: str | None = payload.get("sub")
    if not email:
        raise Unauthorized("Malformed token")

    user = _get_user_by_email(email, db)
    if not user:
        raise NotFound("User")

    return _build_token_response(user)
