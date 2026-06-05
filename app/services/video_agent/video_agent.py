"""Bridge CMO.ai settings to the cloned video-generation agent package."""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from app.core.config import settings

_VIDEO_ROOT = Path(__file__).resolve().parent
_content_agent_module = None


def _ensure_video_agent_path() -> None:
    root = str(_VIDEO_ROOT)
    if root not in sys.path:
        sys.path.insert(0, root)


def _bootstrap_env() -> None:
    """Sync project settings into os.environ before the cloned agent loads."""
    if settings.GROQ_API_KEY:
        os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
    if settings.GROQ_MODEL:
        os.environ["GROQ_MODEL"] = settings.GROQ_MODEL
    if settings.OPENAI_API_KEY:
        os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
    if settings.RUNWAY_API_KEY:
        os.environ["RUNWAY_API_KEY"] = settings.RUNWAY_API_KEY


def _get_content_agent():
    global _content_agent_module
    if _content_agent_module is None:
        _bootstrap_env()
        _ensure_video_agent_path()
        from agent import content_agent

        _content_agent_module = content_agent
    return _content_agent_module


def build_prompt(brand: dict, campaign: dict, user_message: str) -> str:
    """Build the free-text prompt the agent expects."""
    return (
        f"{user_message} for {brand.get('brand_name', 'the brand')}, "
        f"a {brand.get('industry', 'business')} brand targeting "
        f"{brand.get('target_audience', 'general audience')}. "
        f"Goal: {campaign.get('name', '')}. "
        f"{campaign.get('description', '')}. "
        f"Tone: {brand.get('tone_of_voice', 'professional')}."
    )


def run_video_agent(prompt: str) -> dict[str, Any]:
    """Called via asyncio.to_thread from the endpoint."""
    agent = _get_content_agent()
    return agent.run_from_prompt(prompt)
