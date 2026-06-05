"""Video planner that turns strategy reasoning into structured execution plans."""

from __future__ import annotations

import json
from typing import Any, Dict

from utils.env_loader import get_groq_max_tokens, get_groq_model
from utils.groq_client import client
from utils.llm_parser import parse_llm_json

VIDEO_PLANNER_MAX_TOKENS = 4096


def _build_user_prompt(reasoning: Dict[str, Any], campaign_data: Dict[str, Any], concise: bool) -> str:
    length_rules = (
        "5) Keep script.hook, script.body, and script.cta to 1-2 short sentences each (max 35 words per field).\n"
        "6) Keep each scene to one sentence (max 25 words).\n"
        "7) Keep visual_style, audio_style, and expected_impact to one sentence each.\n"
        "8) Always return complete, valid JSON. Never truncate mid-response.\n"
        if concise
        else "5) script.hook/body/cta must be complete written content, not bullet fragments.\n"
    )
    return (
        "Build a complete video content plan as strict JSON.\n\n"
        f"Campaign Data:\n{json.dumps(campaign_data, ensure_ascii=True, indent=2)}\n\n"
        f"Reasoning Data:\n{json.dumps(reasoning, ensure_ascii=True, indent=2)}\n\n"
        "Rules:\n"
        "1) The plan must clearly derive from the reasoning object.\n"
        "2) Include minimum 3 scenes in cinematic format.\n"
        "3) script.hook/body/cta must be usable in a short social video.\n"
        "4) expected_impact must mention this audience and this goal specifically.\n"
        f"{length_rules}\n"
        "Output JSON keys:\n"
        "- concept\n"
        "- script (object with hook/body/cta)\n"
        "- scenes (array with >=3 strings)\n"
        "- visual_style\n"
        "- audio_style\n"
        "- expected_impact"
    )


def _request_video_plan(
    reasoning: Dict[str, Any],
    campaign_data: Dict[str, Any],
    *,
    concise: bool,
    max_tokens: int,
) -> str:
    system_prompt = (
        "You are a creative director and performance marketing lead. "
        "Transform strategic reasoning into a production-ready, platform-native short video plan. "
        "Return only valid JSON with complete script content and at least 3 scenes. "
        "You must respond with ONLY a valid JSON object. Do not include any explanation, markdown, or code fences. Return raw JSON only."
    )
    if concise:
        system_prompt += (
            " Be concise. Prefer shorter copy over long prose so the JSON always fits in one response."
        )

    response = client.chat.completions.create(
        model=get_groq_model(),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_prompt(reasoning, campaign_data, concise)},
        ],
        temperature=0.6 if concise else 0.8,
        max_tokens=max_tokens,
    )

    choice = response.choices[0]
    raw = choice.message.content or ""
    finish_reason = getattr(choice, "finish_reason", None)
    if finish_reason == "length":
        raise ValueError("LLM response truncated before JSON completed (finish_reason=length)")
    if not raw.strip():
        raise ValueError("LLM returned an empty response")
    return raw


def generate_video_plan(reasoning: Dict[str, Any], campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a detailed, strategy-derived video plan using Groq."""
    max_tokens = max(get_groq_max_tokens(), VIDEO_PLANNER_MAX_TOKENS)

    try:
        raw = _request_video_plan(
            reasoning,
            campaign_data,
            concise=False,
            max_tokens=max_tokens,
        )
        return parse_llm_json(raw)
    except Exception as first_error:
        print(f"[video_planner] First attempt failed: {first_error}")
        try:
            raw = _request_video_plan(
                reasoning,
                campaign_data,
                concise=True,
                max_tokens=max_tokens,
            )
            return parse_llm_json(raw)
        except Exception as second_error:
            print(f"[video_planner] ERROR: {second_error}")
            return {
                "concept": f"Error generating plan: {str(second_error)}",
                "script": {"hook": "Unavailable", "body": "Unavailable", "cta": "Unavailable"},
                "scenes": ["Scene generation failed"],
                "visual_style": "Unavailable",
                "audio_style": "Unavailable",
                "expected_impact": "Unavailable",
            }
