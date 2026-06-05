"""Reasoning engine that generates campaign strategy from input data."""

from __future__ import annotations

import json
from typing import Any, Dict

from utils.env_loader import get_groq_max_tokens, get_groq_model
from utils.groq_client import client
from utils.llm_parser import parse_llm_json


def analyze_input(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze campaign data and produce a strategy-first reasoning object."""
    try:
        system_prompt = (
            "You are a senior marketing strategist with deep expertise in direct response, "
            "brand storytelling, platform-native creative systems, and behavioral psychology. "
            "Your task is to produce precise, non-generic campaign reasoning grounded in the "
            "provided brand, audience, product, platform, budget, and goal constraints. "
            "Return only valid JSON with the exact required schema. "
            "You must respond with ONLY a valid JSON object. Do not include any explanation, markdown, or code fences. Return raw JSON only."
        )
        user_prompt = (
            "Generate campaign reasoning as strict JSON.\n\n"
            f"Campaign Data:\n{json.dumps(campaign_data, ensure_ascii=True, indent=2)}\n\n"
            "Requirements:\n"
            "1) Be specific and concrete; avoid generic marketing language.\n"
            "2) Every field must directly reference this campaign's inputs.\n"
            "3) platform_strategy keys must match the provided platforms exactly.\n"
            "4) scene_rationale must include at least 3 entries.\n"
            "5) why_this_works should be 1-2 concise sentences.\n\n"
            "Output JSON keys:\n"
            "- content_angle\n"
            "- psychological_trigger\n"
            "- platform_strategy (object)\n"
            "- hook_rationale\n"
            "- scene_rationale (array of strings)\n"
            "- visual_style_rationale\n"
            "- why_this_works"
        )

        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=get_groq_max_tokens(2048),
        )

        raw = response.choices[0].message.content
        return parse_llm_json(raw)
    except Exception as e:
        print(f"[reasoning_engine] ERROR: {e}")
        return {
            "content_angle": f"Error generating reasoning: {str(e)}",
            "psychological_trigger": "Unavailable",
            "platform_strategy": {},
            "hook_rationale": "Unavailable",
            "scene_rationale": [],
            "visual_style_rationale": "Unavailable",
            "why_this_works": "Unavailable",
        }
