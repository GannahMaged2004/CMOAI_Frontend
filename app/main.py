import uvicorn
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router

app = FastAPI(
    title="CMO.ai API",
    description="AI-powered marketing platform API",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# Generated images (image agent writes to uploads/images/)
_uploads = Path("uploads")
_uploads.mkdir(parents=True, exist_ok=True)
(_uploads / "images").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads)), name="uploads")


'''
Easy Auth 
username: ahmedsaber@example.com
password: SecurePassword123!
ahmedsaber@test.com

'''


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
