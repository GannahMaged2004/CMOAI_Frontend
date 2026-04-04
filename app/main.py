import uvicorn
from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="CMO.ai API",
    description="AI-powered marketing platform API",
    version="1.0.0",
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
