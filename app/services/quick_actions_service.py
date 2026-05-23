from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import not_found
from app.models.brand import Brand
from app.schemas.quick_actions import (
    BlogPostRequest,
    GenerateImageRequest,
    HashtagRequest,
    QuickActionResponse,
    QuickStrategyRequest,
)

from groq import AsyncGroq


def _groq_client() -> AsyncGroq:
    return AsyncGroq(api_key=settings.GROQ_API_KEY)


async def _get_brand_for_user(brand_id: int, user_id: int, db: AsyncSession) -> Brand:
    stmt = select(Brand).where(Brand.id == brand_id, Brand.user_id == user_id).limit(1)
    result = await db.execute(stmt)
    brand = result.scalar_one_or_none()
    if brand is None:
        raise not_found("Brand")
    return brand


async def _chat_completion(prompt: str) -> str:
    provider = (settings.LLM_PROVIDER or "groq").strip().lower()
    if provider == "openai":
        if not settings.OPENAI_API_KEY:
            return "OpenAI key not configured."
        from openai import AsyncOpenAI  # local import; optional dependency

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        content = response.choices[0].message.content
        return content or ""

    if not settings.GROQ_API_KEY:
        return "Groq key not configured."

    client = _groq_client()
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.choices[0].message.content
    return content or ""


def _fallback_blog_post(topic: str, brand: Brand) -> str:
    audience = brand.target_audience or "your audience"
    tone = brand.tone_of_voice or "clear"
    industry = brand.industry or "your market"
    return (
        f"{topic}\n\n"
        f"{brand.brand_name} serves {audience} in {industry} with a {tone} tone.\n\n"
        "Start with the customer problem, show one concrete benefit, add proof, and end with one clear CTA.\n\n"
        "Suggested structure:\n"
        "1. Hook with the campaign promise.\n"
        "2. Explain the pain point in plain language.\n"
        "3. Show how the offer helps.\n"
        "4. Close with a short action step."
    )


def _fallback_image_prompt(prompt: str, brand: Brand) -> str:
    industry = brand.industry or "modern business"
    tone = brand.tone_of_voice or "clean and premium"
    return (
        f"Create a polished campaign visual for {brand.brand_name}. "
        f"Subject: {prompt}. "
        f"Industry context: {industry}. "
        f"Art direction: {tone}, high detail, strong focal subject, premium lighting, "
        "brand-safe composition, realistic textures, marketing-ready framing, no clutter."
    )


async def generate_blog_post(
    data: BlogPostRequest, user_id: int, db: AsyncSession
) -> QuickActionResponse:
    brand = await _get_brand_for_user(data.brand_id, user_id, db)
    prompt = (
        f"Write a blog post about {data.topic} for a brand called {brand.brand_name} "
        f"with tone of voice: {brand.tone_of_voice} targeting {brand.target_audience}. "
        "Keep it under 500 words."
    )
    try:
        text = await _chat_completion(prompt)
    except Exception:
        text = _fallback_blog_post(data.topic, brand)
    return QuickActionResponse(result=text)


async def generate_hashtags(
    data: HashtagRequest, user_id: int, db: AsyncSession
) -> QuickActionResponse:
    prompt = (
        f"Generate 10 relevant hashtags for this content: {data.content}. "
        f"Platform: {data.platform}. Return only the hashtags separated by spaces."
    )
    try:
        hashtags = await _chat_completion(prompt)
    except Exception:
        hashtags = "#Marketing #Campaign #BrandGrowth #AudienceStrategy #Content"
    return QuickActionResponse(result=hashtags)


async def generate_image_prompt(
    data: GenerateImageRequest, user_id: int, db: AsyncSession
) -> QuickActionResponse:
    brand = await _get_brand_for_user(data.brand_id, user_id, db)
    prompt = (
        f"Create a detailed DALL-E image generation prompt for {data.prompt} "
        f"that matches this brand: {brand.brand_name}, industry: {brand.industry}, "
        f"tone: {brand.tone_of_voice}. Make it vivid and specific."
    )
    try:
        enhanced = await _chat_completion(prompt)
    except Exception:
        enhanced = _fallback_image_prompt(data.prompt, brand)
    return QuickActionResponse(result=enhanced)


async def quick_generate_strategy(
    data: QuickStrategyRequest, user_id: int, db: AsyncSession
) -> QuickActionResponse:
    brand = await _get_brand_for_user(data.brand_id, user_id, db)
    prompt = (
        f"Create a brief marketing strategy for {brand.brand_name} with goal: {data.goal}. "
        f"Industry: {brand.industry}. Target audience: {brand.target_audience}. "
        "Include objectives, messaging themes, recommended platforms. Keep it concise."
    )
    try:
        strategy = await _chat_completion(prompt)
    except Exception:
        strategy = (
            f"Goal: {data.goal}\n"
            f"Brand: {brand.brand_name}\n"
            "Objectives: improve awareness, sharpen positioning, and convert interest into action.\n"
            "Messaging themes: one customer pain, one clear value point, one proof point.\n"
            "Recommended platforms: LinkedIn, Instagram, email.\n"
            "Next move: launch one focused campaign and measure response before expanding."
        )
    return QuickActionResponse(result=strategy)

