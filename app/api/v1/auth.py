"""
Authentication router, public endpoints for register, login, token refresh,
OTP password reset, and logout.
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
    ResetPasswordRequest,
    TokenResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
)
from app.schemas.common import MessageResponse
from app.services import auth_service


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register_user(data, db)


@router.post("/login", response_model=TokenResponse)
def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    login_req = LoginRequest(email=data.username, password=data.password)
    return auth_service.login_user(login_req, db)


@router.post("/refresh-token", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(data, db)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return auth_service.request_password_reset(data.email, db)


@router.post("/verify-reset-otp", response_model=VerifyOTPResponse)
def verify_reset_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    return auth_service.verify_reset_otp(data.email, data.otp, db)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    return auth_service.reset_password(data, db)


@router.post("/logout", response_model=MessageResponse)
def logout():
    return MessageResponse(message="Logged out successfully. Please discard your tokens.")
