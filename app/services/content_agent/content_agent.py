import os
import re

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from app.core.config import settings
from app.schemas.agents.content_agent import (
    ContentOutput,
    ContentRequest,
    ContentVariation,
    SEOData,
)
from app.services.content_agent.prompts import (
    EMAIL_CAMPAIGN_PROMPT,
    PROMOTIONAL_MESSAGE_PROMPT,
    SOCIAL_MEDIA_PROMPT,
)
from app.services.content_agent.tools import PLATFORM_RULES
from app.utils.knowledge_base_content.content_kb import retrieve_brand_knowledge

load_dotenv()

llm = ChatGroq(
    model=settings.GROQ_MODEL,
    temperature=0.8,
    groq_api_key=settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY"),
)


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

    response = chain.invoke(input_data)
    generated_text = response.content

    hashtags = None
    subject_line = None
    variations = None
    seo = None
    char_count = len(generated_text)
    char_limit = platform_rules.get("char_limit", 2000)
    within_limit = char_count <= char_limit

    if request.content_type == "social_media_post":
        hashtags = [
            w.strip('.,!?"\'')
            for w in generated_text.split()
            if w.startswith("#")
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
