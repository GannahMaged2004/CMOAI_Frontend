"""Brief parser that extracts structured campaign data from a single user prompt using Groq."""

from __future__ import annotations

import re
from typing import Any, Dict

from utils.env_loader import get_groq_max_tokens, get_groq_model
from utils.groq_client import client
from utils.llm_parser import parse_llm_json


def parse_campaign_brief(user_prompt: str) -> Dict[str, Any]:
    """
    Parse a free-text marketing brief into structured campaign_data.
    Always returns the required schema keys.
    """
    try:
        system_prompt = (
            "You are a marketing strategist assistant. Extract structured campaign parameters from the user's campaign brief.\n"
            "Return only valid JSON matching the schema below. Do not include markdown fences, backticks, or extra explanation.\n\n"
            "Required Output JSON Schema:\n"
            "{\n"
            "  \"brand\": \"extracted brand name or 'Unknown'\",\n"
            "  \"industry\": \"extracted industry or 'Unknown'\",\n"
            "  \"audience\": \"target audience description or 'General Audience'\",\n"
            "  \"product\": \"product description, key selling points, and/or brief summary\",\n"
            "  \"platforms\": [\"list of social/video platforms mentioned, e.g. TikTok, Instagram, YouTube, LinkedIn\"],\n"
            "  \"goal\": \"extracted goal, e.g. Product Launch, Brand Awareness, Lead Generation, Retargeting\",\n"
            "  \"budget\": \"extracted budget value, e.g. $1K–$5K, or 'unknown'\"\n"
            "}"
        )

        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=get_groq_max_tokens(1024),
        )

        raw = response.choices[0].message.content
        parsed = parse_llm_json(raw)

        # Standardize and validate keys
        result = {
            "brand": str(parsed.get("brand", "Unknown")).strip() or "Unknown",
            "industry": str(parsed.get("industry", "Unknown")).strip() or "Unknown",
            "audience": str(parsed.get("audience", "General Audience")).strip() or "General Audience",
            "product": str(parsed.get("product", user_prompt)).strip() or user_prompt,
            "platforms": parsed.get("platforms", []),
            "goal": str(parsed.get("goal", "Product Launch")).strip() or "Product Launch",
            "budget": str(parsed.get("budget", "unknown")).strip() or "unknown",
            "raw_prompt": user_prompt,
        }

        if not isinstance(result["platforms"], list):
            result["platforms"] = [str(result["platforms"])] if result["platforms"] else []
        if not result["platforms"]:
            result["platforms"] = ["TikTok", "Instagram"]

        return result

    except Exception as exc:
        print(f"[brief_parser] Error during LLM brief parsing: {exc}")
        
        # Keyword and heuristic-based robust fallback
        platforms = []
        for platform in ["TikTok", "Instagram", "YouTube", "LinkedIn"]:
            if platform.lower() in user_prompt.lower():
                platforms.append(platform)
        if not platforms:
            platforms = ["TikTok", "Instagram"]

        # Basic budget heuristic
        budget = "unknown"
        budget_match = re.search(r"(\$\d+k?(?:\s*–\s*\$\d+k?)?|\d+\s*dollars|\d+\s*USD)", user_prompt, re.IGNORECASE)
        if budget_match:
            budget = budget_match.group(1)

        # Basic brand heuristic
        brand = "Unknown"
        brand_match = re.search(r'for\s+([A-Z][a-zA-Z0-9\s\.\&]+?)(?:\s+(?:on|to|is|at|with|budget|goal|campaign|platforms)\b|\,|\:|$)', user_prompt)
        if brand_match:
            brand = brand_match.group(1).strip()
            
        # Basic goal heuristic
        goal = "Product Launch"
        for potential_goal in ["Brand Awareness", "Lead Generation", "Retargeting", "Community Building"]:
            if potential_goal.lower() in user_prompt.lower():
                goal = potential_goal
                break

        return {
            "brand": brand,
            "industry": "Unknown",
            "audience": "General Audience",
            "product": user_prompt,
            "platforms": platforms,
            "goal": goal,
            "budget": budget,
            "raw_prompt": user_prompt,
        }
