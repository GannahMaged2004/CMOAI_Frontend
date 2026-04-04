"""
Central API router — registers all v1 sub-routers under /api/v1.

Import this object in app/main.py and mount it with:
    app.include_router(api_router, prefix="/api/v1")
"""

from fastapi import APIRouter

from app.api.v1 import auth, brands, strategies, teams, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(teams.router)
api_router.include_router(brands.router)
api_router.include_router(strategies.router)
