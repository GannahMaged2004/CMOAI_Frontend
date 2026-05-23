import os
import re

from dotenv import load_dotenv

from app.core.config import settings
from app.schemas.agents.content_agent import (
    ContentOutput,
    ContentRequest,
    ContentVariation,
    SEOData,
)
from app.services.content_agent.tools import PLATFORM_RULES
from app.utils.knowledge_base_content.content_kb import retrieve_brand_knowledge

load_dotenv()

try:
    from langchain_groq import ChatGroq
except ImportError:
    ChatGroq = None


def _build_llm():
    groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if ChatGroq is None or not groq_api_key:
        return None
    return ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0.8,
        groq_api_key=groq_api_key,
    )


llm = _build_llm()


def get_content_agent_status() -> dict[str, object]:
    provider = settings.LLM_PROVIDER or "groq"
    model = settings.GROQ_MODEL if provider == "groq" else "configured-model"
    return {
        "provider": provider,
        "model": model,
        "mode": "live" if llm is not None else "fallback",
        "configured": llm is not None,
    }


def parse_variations(text: str) -> list[ContentVariation] | None:
    variations = []
    pattern = r"VARIATION\s*(\d+)\s*:\s*(.*?)(?=VARIATION\s*\d+\s*:|$)"
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    for num, content in matches:
        variations.append(
            ContentVariation(
                variation_id=int(num),
                content=content.strip(),
                platform_note=f"Variation {num} optimized for engagement",
            )
        )
    return variations if variations else None


def parse_seo(text: str) -> tuple[str, SEOData | None]:
    seo = None
    keywords_match = re.search(r"SEO_KEYWORDS:\s*(.+)", text)
    meta_match = re.search(r"SEO_META:\s*(.+)", text)
    title_match = re.search(r"SEO_TITLE:\s*(.+)", text)
    if keywords_match and meta_match and title_match:
        seo = SEOData(
            keywords=[k.strip() for k in keywords_match.group(1).split(",")],
            meta_description=meta_match.group(1).strip(),
            suggested_title=title_match.group(1).strip(),
        )
    clean_text = re.sub(r"SEO_KEYWORDS:.*", "", text, flags=re.DOTALL).strip()
    return clean_text, seo


def _clean_line(text: str | None, fallback: str) -> str:
    value = (text or "").strip()
    return value if value else fallback


def _fallback_social_media(
    request: ContentRequest, platform_rules: dict
) -> ContentOutput:
    audience = _clean_line(request.target_audience, "growth-focused buyers")
    value = _clean_line(request.extra_notes, "a clear customer outcome")
    topic = _clean_line(request.topic_or_offer, "the next campaign update")
    hashtags = [
        f"#{request.brand_name.replace(' ', '')}",
        f"#{request.industry.replace(' ', '')}",
        "#Marketing",
        "#CampaignStrategy",
    ]
    body = "\n".join(
        [
            "Marketing should move fast without losing the plot.",
            "",
            f"{request.brand_name} helps {audience} turn campaign ideas into launch-ready work with less friction and more clarity.",
            "",
            f"For {topic}, lead with the business outcome: {value}",
            "Then show one proof point, make the next step obvious, and keep the CTA low-friction.",
            "",
            "CTA: Learn more",
        ]
    )

    return ContentOutput(
        content_type=request.content_type,
        platform=request.platform,
        generated_content=body,
        variations=[
            ContentVariation(
                variation_id=1,
                content=(
                    "Too many campaigns stall between idea and execution.\n\n"
                    f"{request.brand_name} gives {audience} a clearer path from brief to launch.\n\n"
                    "CTA: Learn more"
                ),
                platform_note="Variation 1 optimized for narrative opening",
            ),
            ContentVariation(
                variation_id=2,
                content=(
                    "Launching faster is not the goal by itself.\n\n"
                    f"The win is faster execution with message clarity that actually converts for {audience}.\n\n"
                    "CTA: Learn more"
                ),
                platform_note="Variation 2 optimized for proof-led positioning",
            ),
        ],
        hashtags=hashtags,
        platform_rules=platform_rules,
        char_count=len(body),
        within_limit=len(body) <= platform_rules.get("char_limit", 2000),
    )


def _fallback_email(request: ContentRequest, platform_rules: dict) -> ContentOutput:
    audience = _clean_line(request.target_audience, "your audience")
    topic = _clean_line(request.topic_or_offer, "your latest offer")
    value = _clean_line(request.extra_notes, "a measurable business outcome")
    subject = f"{request.brand_name}: a clearer next step for {audience}"
    body = "\n".join(
        [
            f"Subject: {subject}",
            "",
            f"Hi {audience},",
            "",
            f"{topic} is built to help you reach {value}.",
            f"Here is the angle: keep the message {request.tone}, lead with one concrete proof point, and make the CTA easy to act on.",
            "",
            "CTA: Learn more",
            "",
            "SEO_TITLE: Campaign email angle for better conversions",
            f"SEO_META: {request.brand_name} email copy focused on {audience} with a direct CTA.",
            "SEO_KEYWORDS: email campaign, conversion copy, campaign messaging",
        ]
    )
    cleaned_body, seo = parse_seo(body)
    return ContentOutput(
        content_type=request.content_type,
        platform=request.platform,
        generated_content=cleaned_body,
        subject_line=subject,
        seo=seo,
        platform_rules=platform_rules,
        char_count=len(cleaned_body),
        within_limit=len(cleaned_body) <= platform_rules.get("char_limit", 5000),
    )


def _fallback_promotional(
    request: ContentRequest, platform_rules: dict
) -> ContentOutput:
    topic = _clean_line(request.topic_or_offer, "your offer")
    audience = _clean_line(request.target_audience, "your audience")
    text = "\n".join(
        [
            f"Variation 1: {topic}. Show {audience} the fastest path to value. Learn more.",
            f"Variation 2: Make {topic} feel immediate, useful, and low-risk. Learn more.",
            "Variation 3: Lead with the benefit, then the proof, then the CTA. Learn more.",
        ]
    )
    return ContentOutput(
        content_type=request.content_type,
        platform=request.platform,
        generated_content=text,
        variations=parse_variations(text),
        platform_rules=platform_rules,
        char_count=len(text),
        within_limit=len(text) <= platform_rules.get("char_limit", 2000),
    )


def _run_fallback_agent(request: ContentRequest, platform_rules: dict) -> ContentOutput:
    if request.content_type == "social_media_post":
        return _fallback_social_media(request, platform_rules)
    if request.content_type == "email_campaign":
        return _fallback_email(request, platform_rules)
    return _fallback_promotional(request, platform_rules)


def run_content_agent(request: ContentRequest) -> ContentOutput:
    platform = request.platform or "general"
    platform_rules = PLATFORM_RULES.get(platform.lower(), {})
    platform_rules_str = (
        "\n".join([f"- {k}: {v}" for k, v in platform_rules.items()])
        if platform_rules
        else "No specific platform rules."
    )

    brand_knowledge = retrieve_brand_knowledge(
        brand_name=request.brand_name,
        query=f"{request.content_type} {request.topic_or_offer} {request.target_audience}",
    )

    if llm is None:
        return _run_fallback_agent(request, platform_rules)

    from app.services.content_agent.prompts import (
        EMAIL_CAMPAIGN_PROMPT,
        PROMOTIONAL_MESSAGE_PROMPT,
        SOCIAL_MEDIA_PROMPT,
    )

    if request.content_type == "social_media_post":
        chain = SOCIAL_MEDIA_PROMPT | llm
    elif request.content_type == "email_campaign":
        chain = EMAIL_CAMPAIGN_PROMPT | llm
    else:
        chain = PROMOTIONAL_MESSAGE_PROMPT | llm

    input_data = {
        "brand_name": request.brand_name,
        "industry": request.industry,
        "target_audience": request.target_audience,
        "tone": request.tone,
        "platform": platform,
        "topic_or_offer": request.topic_or_offer,
        "cta": request.cta or "Learn more",
        "extra_notes": request.extra_notes or "None",
        "brand_knowledge": brand_knowledge,
        "platform_rules": platform_rules_str,
    }

    try:
        response = chain.invoke(input_data)
        generated_text = response.content
    except Exception:
        return _run_fallback_agent(request, platform_rules)

    hashtags = None
    subject_line = None
    variations = None
    seo = None
    char_count = len(generated_text)
    char_limit = platform_rules.get("char_limit", 2000)
    within_limit = char_count <= char_limit

    if request.content_type == "social_media_post":
        hashtags = [
            w.strip('.,!?"\'') for w in generated_text.split() if w.startswith("#")
        ]
        variations = parse_variations(generated_text)

    if request.content_type == "email_campaign":
        for line in generated_text.split("\n"):
            if line.lower().startswith("subject:"):
                subject_line = (
                    line.replace("Subject:", "").replace("subject:", "").strip()
                )
                break
        generated_text, seo = parse_seo(generated_text)

    if request.content_type == "promotional_message":
        variations = parse_variations(generated_text)

    return ContentOutput(
        content_type=request.content_type,
        platform=request.platform,
        generated_content=generated_text,
        variations=variations,
        hashtags=hashtags,
        subject_line=subject_line,
        seo=seo,
        platform_rules=platform_rules,
        char_count=char_count,
        within_limit=within_limit,
    )
