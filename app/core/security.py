"""
Password hashing (bcrypt) and JWT token utilities.
"""

from datetime import datetime, timedelta, timezone

import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password hashing ─────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BCRYPT_MAX_PASSWORD_BYTES = 72


def _normalize_bcrypt_password(plain_password: str) -> str:
    """Normalize passwords for bcrypt.

    bcrypt only uses the first 72 bytes of the input. To safely support longer
    passwords without silent truncation, we pre-hash any password whose UTF-8
    byte length exceeds 72 bytes.
    """
    pw_bytes = plain_password.encode("utf-8")
    if len(pw_bytes) <= BCRYPT_MAX_PASSWORD_BYTES:
        return plain_password

    digest_hex = hashlib.sha256(pw_bytes).hexdigest()
    # 7 + 64 = 71 chars, always within bcrypt's 72 byte limit (ASCII).
    return f"sha256${digest_hex}"


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of *plain_password*."""
    return pwd_context.hash(_normalize_bcrypt_password(plain_password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` if *plain_password* matches *hashed_password*."""
    return pwd_context.verify(_normalize_bcrypt_password(plain_password), hashed_password)


# ── JWT tokens ────────────────────────────────────────────────

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token containing *data*.

    If *expires_delta* is ``None`` the token expires after
    ``ACCESS_TOKEN_EXPIRE_MINUTES`` (from settings).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT refresh token containing *data*.

    Refresh tokens are long-lived (default 7 days) and carry ``type=refresh``
    so they can be distinguished from access tokens on the decode side.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(days=7)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT (access *or* refresh).

    Returns the payload dict on success.
    Raises ``JWTError`` on any failure (expired, tampered, etc.).
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ── Legacy alias ──────────────────────────────────────────────

def decode_access_token(token: str) -> dict:
    """Alias kept for backwards compatibility with dependencies.py."""
    return decode_token(token)
