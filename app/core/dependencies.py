"""
FastAPI dependency callables shared across routes.
"""

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import credentials_exception
from app.core.security import decode_access_token
from app.db.session import AsyncSessionLocal, SessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Database session ──────────────────────────────────────────

def get_db():
    """Yield a SQLAlchemy session and close it when the request ends."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db():
    """Yield an async SQLAlchemy session for routes that use async services."""
    async with AsyncSessionLocal() as session:
        yield session


# ── Current user extraction ──────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode the Bearer token, look up the user, and return the ORM instance.

    Raises HTTP 401 if the token is invalid or the user does not exist.
    """
    try:
        payload = decode_access_token(token)
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_async(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    """Async variant of ``get_current_user`` for async database sessions."""
    try:
        payload = decode_access_token(token)
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Thin wrapper for dependency-chaining.

    In the future you can add an ``is_active`` check here.
    """
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
