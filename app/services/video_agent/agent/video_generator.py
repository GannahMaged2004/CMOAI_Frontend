"""Video prompt generator for Runway from structured plan data."""

from __future__ import annotations

from typing import Any, Dict, List


def _derive_mood(campaign_data: Dict[str, Any]) -> str:
    """Derive mood from campaign trigger or goal context."""
    trigger_text = str(campaign_data.get("psychological_trigger", "")).lower()
    goal_text = str(campaign_data.get("goal", "")).lower()
    merged = f"{trigger_text} {goal_text}"
    if "urgency" in merged or "fomo" in merged:
        return "urgent, kinetic, and high-stakes"
    if "social proof" in merged or "community" in merged:
        return "trusted, socially validated, and uplifting"
    if "aspiration" in merged or "brand awareness" in merged:
        return "aspirational, polished, and emotionally resonant"
    if "retarget" in merged or "conversion" in merged or "lead" in merged:
        return "focused, persuasive, and confidence-building"
    return "confident, modern, and emotionally compelling"


def _derive_tone(campaign_data: Dict[str, Any]) -> str:
    """Derive overall tone from platforms and objective."""
    platforms = [p.lower() for p in campaign_data.get("platforms", [])]
    goal = str(campaign_data.get("goal", "")).lower()
    if "tiktok" in platforms:
        return "energetic, culturally current, and fast-paced"
    if "instagram" in platforms:
        return "stylish, premium, and emotionally visual"
    if "linkedin" in platforms:
        return "credible, authoritative, and outcome-oriented"
    if "youtube" in platforms:
        return "narrative-driven, immersive, and cinematic"
    if "lead generation" in goal:
        return "clear, persuasive, and action-oriented"
    return "warm, cinematic, and conversion-aware"


def _expand_scene(scene: str, movement: str, lighting: str, duration: str) -> str:
    """Expand one scene line into a rich cinematic instruction."""
    return (
        f"{scene} — Camera movement: {movement}. Lighting: {lighting}. Duration: {duration}. "
        "Focus on tactile product detail, human expression, and emotionally meaningful micro-actions."
    )


def build_cinematic_prompt(plan: Dict[str, Any], campaign_data: Dict[str, Any]) -> str:
    """Build a multi-scene, 150+ word cinematic marketing prompt from campaign plan data."""
    scenes: List[str] = plan.get("scenes", []) if isinstance(plan.get("scenes"), list) else []
    if len(scenes) < 3:
        scenes = scenes + [
            "Scene 1: Hero product reveal in a lifestyle setting",
            "Scene 2: Audience pain point transformed into visible relief",
            "Scene 3: Strong outcome moment with product in use",
        ]
        scenes = scenes[:3]

    movements = ["slow zoom-in", "smooth lateral pan", "aerial drift", "macro close-up dolly", "handheld follow"]
    lightings = ["golden hour backlight", "soft studio key light", "dramatic side light", "neon practical highlights", "clean high-key fill"]
    durations = ["2s", "2s", "2s", "2s", "2s"]

    expanded_scenes = []
    for i, scene in enumerate(scenes):
        expanded_scenes.append(
            _expand_scene(
                scene=scene,
                movement=movements[i % len(movements)],
                lighting=lightings[i % len(lightings)],
                duration=durations[i % len(durations)],
            )
        )

    brand = campaign_data.get("brand", "Unknown Brand")
    audience = campaign_data.get("audience", "General Audience")
    goal = campaign_data.get("goal", "Marketing Growth")
    mood = _derive_mood(campaign_data)
    tone = _derive_tone(campaign_data)
    visual_style = plan.get("visual_style", "Cinematic, premium, high-contrast visual storytelling.")
    audio_style = plan.get("audio_style", "Contemporary rhythmic score with persuasive voiceover cadence.")
    script = plan.get("script", {})
    hook = script.get("hook", "")
    body = script.get("body", "")
    cta = script.get("cta", "")

    prompt = (
        f"Cinematic advertisement. Brand: {brand}. Audience: {audience}. Goal: {goal}.\n\n"
        + "\n".join(expanded_scenes)
        + "\n\n"
        f"Visual style: {visual_style}.\n"
        f"Audio: {audio_style}.\n"
        f"Mood: {mood}.\n"
        f"Overall tone: {tone}.\n"
        f"Hook behavior: {hook}\n"
        f"Body behavior: {body}\n"
        f"CTA behavior: {cta}\n"
        "Ensure every shot escalates narrative intent from intrigue to proof to action, with clean motion continuity, "
        "intentional depth of field, and product-first composition optimized for modern social feeds. "
        "Output: 4–6 second ultra-HD cinematic marketing video. No text overlays. No subtitles."
    )

    if len(prompt.split()) < 150:
        prompt = (
            prompt
            + " Add nuanced environmental texture, realistic skin tones, subtle lens breathing, atmospheric particulates, "
            "and tightly timed editorial rhythm so each second advances persuasion and brand memory in a measurable way."
        )

    if len(prompt) > 1000:
        prompt = prompt[:997] + "..."
    return prompt
