"""
Authentication router — public endpoints for register, login, and token refresh.
"""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account and return a token pair."""
    return auth_service.register_user(data, db)


@router.post("/login", response_model=TokenResponse)
def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate with email (as username) + password and return a token pair."""
    login_req = LoginRequest(email=data.username, password=data.password)
    return auth_service.login_user(login_req, db)


@router.post("/refresh-token", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    return auth_service.refresh_access_token(data, db)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest):
    """Initiate a password reset flow.

    Not yet implemented — email delivery will be added in a future release.
    """
    return MessageResponse(
        message="If an account with that email exists, a reset link has been sent."
    )


@router.post("/logout", response_model=MessageResponse)
def logout():
    """Invalidate the client's session.

    JWT tokens are stateless; the client is responsible for discarding the token.
    Server-side token blacklisting can be added here in a future release.
    """
    return MessageResponse(message="Logged out successfully. Please discard your tokens.")
