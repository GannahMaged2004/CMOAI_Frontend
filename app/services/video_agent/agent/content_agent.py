"""Campaign orchestration layer connecting strategy, planning, generation, and saving."""

from __future__ import annotations

import os
from typing import Any, Dict, List

from agent.brief_parser import parse_campaign_brief
from agent.reasoning_engine import analyze_input
from agent.video_generator import build_cinematic_prompt
from agent.video_planner import generate_video_plan
from services.runway_service import RunwayService
from utils.video_saver import save_video


def run_campaign(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run the end-to-end campaign pipeline for a single campaign."""
    reasoning = analyze_input(campaign_data)
    plan = generate_video_plan(reasoning, campaign_data)

    prompt_payload = dict(campaign_data)
    prompt_payload["psychological_trigger"] = reasoning.get("psychological_trigger", "")
    prompt = build_cinematic_prompt(plan, prompt_payload)

    runway = RunwayService()
    job_id = runway.generate_video(prompt)
    video_url = runway.poll_until_ready(job_id)
    video_path = save_video(video_url, prefix=campaign_data.get("brand", "campaign"))

    return {
        "campaign_name": campaign_data.get("goal", "Campaign"),
        "strategy_summary": (
            f"Platform: {campaign_data.get('platforms', [])} | "
            f"Goal: {campaign_data.get('goal', 'N/A')} | "
            f"Audience: {campaign_data.get('audience', 'N/A')}"
        ),
        "reasoning": reasoning,
        "video_plan": plan,
        "video_prompt": prompt,
        "video_url": video_url,
        "video_path": video_path,
        "status": "success",
    }


def run_all_campaigns(campaigns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Run multiple campaigns while isolating failures per campaign."""
    results: List[Dict[str, Any]] = []
    for campaign in campaigns:
        try:
            results.append(run_campaign(campaign))
        except Exception as exc:
            print(f"Campaign failed for goal '{campaign.get('goal', 'Campaign')}': {exc}")
            results.append(
                {
                    "campaign_name": campaign.get("goal", "Campaign"),
                    "strategy_summary": (
                        f"Platform: {campaign.get('platforms', [])} | "
                        f"Goal: {campaign.get('goal', 'N/A')} | "
                        f"Audience: {campaign.get('audience', 'N/A')}"
                    ),
                    "reasoning": {},
                    "video_plan": {},
                    "video_prompt": "",
                    "video_url": "",
                    "video_path": "",
                    "status": "error",
                    "error_message": str(exc),
                }
            )
    return results


def run_from_prompt(user_prompt: str) -> Dict[str, Any]:
    """
    Single entry point for multi-agent integration.
    Input: one natural-language campaign brief.
    Output: full pipeline result.
    """
    campaign_data = {}
    reasoning = {}
    video_plan = {}
    video_prompt = ""
    video_url = ""
    video_path = ""
    strategy_summary = ""

    try:
        # 1. Parse campaign brief into structured campaign_data
        campaign_data = parse_campaign_brief(user_prompt)

        # Build one-line strategy summary
        platforms_str = ", ".join(campaign_data.get("platforms", []))
        strategy_summary = (
            f"Brand: {campaign_data.get('brand', 'N/A')} | "
            f"Goal: {campaign_data.get('goal', 'N/A')} | "
            f"Platforms: {platforms_str}"
        )

        # 2. Strategic reasoning
        reasoning = analyze_input(campaign_data)

        # 3. Video plan
        video_plan = generate_video_plan(reasoning, campaign_data)

        # 4. Cinematic prompt
        prompt_payload = dict(campaign_data)
        prompt_payload["psychological_trigger"] = reasoning.get("psychological_trigger", "")
        video_prompt = build_cinematic_prompt(video_plan, prompt_payload)

        # 5. Runway generate + poll + save_video
        try:
            runway = RunwayService()
            job_id = runway.generate_video(video_prompt)
            video_url = runway.poll_until_ready(job_id)
            video_path = save_video(video_url, prefix=campaign_data.get("brand", "campaign"))
        except Exception as runway_exc:
            print(f"[content_agent] Runway/Video generation failed: {runway_exc}")
            return {
                "status": "error",
                "input_prompt": user_prompt,
                "campaign_data": campaign_data,
                "strategy_summary": strategy_summary,
                "reasoning": reasoning,
                "video_plan": video_plan,
                "video_prompt": video_prompt,
                "video_url": "",
                "video_path": "",
                "error_message": f"Video generation failed: {str(runway_exc)}",
            }

        return {
            "status": "success",
            "input_prompt": user_prompt,
            "campaign_data": campaign_data,
            "strategy_summary": strategy_summary,
            "reasoning": reasoning,
            "video_plan": video_plan,
            "video_prompt": video_prompt,
            "video_url": video_url,
            "video_path": video_path,
            "error_message": None,
        }

    except Exception as exc:
        print(f"[content_agent] Orchestration pipeline failed: {exc}")
        return {
            "status": "error",
            "input_prompt": user_prompt,
            "campaign_data": campaign_data,
            "strategy_summary": strategy_summary,
            "reasoning": reasoning,
            "video_plan": video_plan,
            "video_prompt": video_prompt,
            "video_url": video_url,
            "video_path": video_path,
            "error_message": f"Pipeline failed: {str(exc)}",
        }

