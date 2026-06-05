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


def _build_local_video_fallback(
    prompt: str,
    *,
    brand: dict[str, Any] | None = None,
    campaign: dict[str, Any] | None = None,
    user_message: str | None = None,
    error_hint: str | None = None,
) -> dict[str, Any]:
    brand = brand or {}
    campaign = campaign or {}
    brand_name = brand.get("brand_name") or "the brand"
    audience = brand.get("target_audience") or "the target audience"
    tone = brand.get("tone_of_voice") or "professional"
    campaign_name = campaign.get("name") or "this campaign"
    description = campaign.get("description") or "No description provided."
    ask = user_message or "Create a short social video"

    return {
        "status": "success",
        "video_plan": {
            "concept": f"{campaign_name}: a short-form video that turns the core promise into one clear viewer takeaway.",
            "script": {
                "hook": f"{audience.capitalize()} do not need more noise. They need a reason to trust {brand_name}.",
                "body": f"Show the real before-and-after moment behind {campaign_name}. Anchor it in {description}",
                "cta": f"Invite viewers to take the next step with {brand_name} today.",
            },
            "scenes": [
                f"Open with the audience problem in a fast, visual first three seconds tied to {ask}.",
                f"Reveal {brand_name} as the simple answer with clean product or service context.",
                f"Show one proof moment or transformation that makes the promise believable.",
                "Close with a direct CTA frame and on-screen text.",
            ],
            "visual_style": f"{tone} visual direction with platform-native pacing and strong first-frame clarity.",
            "audio_style": "Upbeat, modern background audio with space for clear voiceover or captions.",
        },
        "reasoning": {
            "psychological_trigger": "Clarity and trust",
            "content_angle": f"Turn {campaign_name} into a concrete promise for {audience}.",
            "hook_rationale": "Lead with the pain point first so the viewer immediately recognizes themselves.",
            "why_this_works": "This keeps the message simple, proof-led, and easy to adapt into a vertical short even when live video generation is unavailable.",
        },
        "video_prompt": prompt,
        "video_url": "",
        "error_message": error_hint,
    }


def run_video_agent(
    prompt: str,
    *,
    brand: dict[str, Any] | None = None,
    campaign: dict[str, Any] | None = None,
    user_message: str | None = None,
) -> dict[str, Any]:
    """Called via asyncio.to_thread from the endpoint."""
    try:
        agent = _get_content_agent()
        return agent.run_from_prompt(prompt)
    except ModuleNotFoundError as exc:
        return _build_local_video_fallback(
            prompt,
            brand=brand,
            campaign=campaign,
            user_message=user_message,
            error_hint=f"Video provider dependency unavailable: {exc}",
        )
    except Exception as exc:
        message = str(exc)
        if "RUNWAY_API_KEY" in message or "openai" in message.lower():
            return _build_local_video_fallback(
                prompt,
                brand=brand,
                campaign=campaign,
                user_message=user_message,
                error_hint=message,
            )
        raise
