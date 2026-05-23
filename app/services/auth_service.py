"""
Authentication service for register, login, token refresh, and password reset OTP.

All database access uses synchronous SQLAlchemy to match the existing auth routes.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import random

from jose import JWTError
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
    ResetPasswordRequest,
    TokenResponse,
    VerifyOTPResponse,
)
from app.schemas.common import MessageResponse
from app.services.email_service import send_reset_otp_email

OTP_EXPIRY_MINUTES = 10
RESET_TOKEN_EXPIRY_MINUTES = 15


def _build_token_response(user: User) -> TokenResponse:
    payload = {"sub": user.email}
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
    )


def _get_user_by_email(email: str, db: Session) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _generate_otp() -> str:
    return f"{random.SystemRandom().randint(0, 999999):06d}"


def register_user(data: RegisterRequest, db: Session) -> TokenResponse:
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
    user = _get_user_by_email(data.email, db)
    if not user or not verify_password(data.password, user.hashed_password):
        raise Unauthorized("Invalid email or password")

    return _build_token_response(user)


def refresh_access_token(data: RefreshTokenRequest, db: Session) -> TokenResponse:
    try:
        payload = decode_token(data.refresh_token)
    except JWTError as exc:
        raise Unauthorized("Invalid or expired refresh token") from exc

    if payload.get("type") != "refresh":
        raise Unauthorized("Token is not a refresh token")

    email: str | None = payload.get("sub")
    if not email:
        raise Unauthorized("Malformed token")

    user = _get_user_by_email(email, db)
    if not user:
        raise NotFound("User")

    return _build_token_response(user)


def request_password_reset(email: str, db: Session) -> MessageResponse:
    user = _get_user_by_email(email, db)
    generic_message = MessageResponse(
        message="If an account with that email exists, a reset code has been sent."
    )
    if not user:
        return generic_message

    otp = _generate_otp()
    user.password_reset_otp_hash = hash_password(otp)
    user.password_reset_otp_expiry = datetime.now(timezone.utc) + timedelta(
        minutes=OTP_EXPIRY_MINUTES
    )
    user.password_reset_verified = None
    db.commit()

    try:
        send_reset_otp_email(user.email, otp)
    except Exception as exc:
        user.password_reset_otp_hash = None
        user.password_reset_otp_expiry = None
        user.password_reset_verified = None
        db.commit()
        raise RuntimeError(f"Failed to send reset OTP email: {exc}") from exc

    return generic_message


def verify_reset_otp(email: str, otp: str, db: Session) -> VerifyOTPResponse:
    user = _get_user_by_email(email, db)
    if (
        user is None
        or not user.password_reset_otp_hash
        or user.password_reset_otp_expiry is None
    ):
        raise Unauthorized("Invalid or expired OTP")

    if user.password_reset_otp_expiry < datetime.now(timezone.utc):
        user.password_reset_otp_hash = None
        user.password_reset_otp_expiry = None
        user.password_reset_verified = None
        db.commit()
        raise Unauthorized("Invalid or expired OTP")

    if not verify_password(otp, user.password_reset_otp_hash):
        raise Unauthorized("Invalid or expired OTP")

    user.password_reset_verified = datetime.utcnow()
    db.commit()

    reset_token = create_access_token(
        {"sub": user.email, "purpose": "password_reset"},
        expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES),
    )
    return VerifyOTPResponse(
        message="OTP verified successfully.",
        reset_token=reset_token,
    )


def reset_password(data: ResetPasswordRequest, db: Session) -> MessageResponse:
    try:
        payload = decode_token(data.token)
    except JWTError as exc:
        raise Unauthorized("Invalid or expired reset token") from exc

    email = payload.get("sub")
    if payload.get("purpose") != "password_reset" or email != data.email:
        raise Unauthorized("Invalid reset token")

    user = _get_user_by_email(data.email, db)
    if not user:
        raise NotFound("User")

    if user.password_reset_verified is None:
        raise Unauthorized("OTP verification required")

    user.hashed_password = hash_password(data.new_password)
    user.password_reset_otp_hash = None
    user.password_reset_otp_expiry = None
    user.password_reset_verified = None
    db.commit()

    return MessageResponse(message="Password reset successful.")
