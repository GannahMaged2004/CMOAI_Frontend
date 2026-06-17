import os

from dotenv import load_dotenv

from app.core.config import settings
from app.models.brand import Brand
from app.models.campaign import Campaign

load_dotenv()

try:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_groq import ChatGroq
except ImportError:
    ChatPromptTemplate = None
    ChatGroq = None


def _build_llm():
    groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if ChatGroq is None or not groq_api_key:
        return None
    return ChatGroq(
        model=settings.GROQ_MODEL,
        temperature=0.5,
        groq_api_key=groq_api_key,
    )


llm = _build_llm()


def get_brand_agent_status() -> dict[str, object]:
    provider = settings.LLM_PROVIDER or "groq"
    model = settings.GROQ_MODEL if provider == "groq" else "configured-model"
    return {
        "provider": provider,
        "model": model,
        "mode": "live" if llm is not None else "fallback",
        "configured": llm is not None,
    }


def _clean(value: str | None, fallback: str) -> str:
    text = (value or "").strip()
    return text if text else fallback


def _fallback_brand_response(
    brand: Brand, campaign: Campaign | None, action: str
) -> str:
    audience = _clean(brand.target_audience, "the core audience")
    tone = _clean(brand.tone_of_voice, "clear and proof-led")
    value = _clean(brand.value_proposition, "a concrete business outcome")
    positioning = _clean(brand.positioning, "a differentiated promise")
    campaign_name = campaign.name if campaign else brand.brand_name
    action_lower = action.lower()

    if "voice" in action_lower:
        return "\n".join(
            [
                f"Voice guide for {brand.brand_name}",
                "",
                f"Tone anchor: {tone}.",
                f"Audience: {audience}.",
                "",
                "Use:",
                "- Short, direct sentences.",
                "- Proof, outcomes, and practical language.",
                "- Specific customer pains before feature claims.",
                "",
                "Avoid:",
                "- Generic hype.",
                "- Abstract AI wording with no proof.",
                "- Long feature lists without a clear benefit.",
            ]
        )

    if "objection" in action_lower:
        return "\n".join(
            [
                f"Audience objections for {campaign_name}",
                "",
                f"- Will this really help {audience} fast enough to matter?",
                "- Is switching worth the effort?",
                "- Can the team trust the output quality?",
                "- What proof shows this is better than the current approach?",
                "",
                "Response angle:",
                f"Lead with {value}, back it with one concrete proof point, and remove one perceived risk.",
            ]
        )

    return "\n".join(
        [
            f"Positioning guidance for {campaign_name}",
            "",
            f"Current positioning signal: {positioning}.",
            f"Audience: {audience}.",
            f"Primary value: {value}.",
            "",
            "Refined positioning:",
            f"{brand.brand_name} helps {audience} reach {value} with a message that feels clear, practical, and easier to act on.",
        ]
    )


def run_brand_agent(brand: Brand, campaign: Campaign | None, action: str) -> tuple[str, str]:
    if llm is None or ChatPromptTemplate is None:
        return _fallback_brand_response(brand, campaign, action), "fallback"

    audience = _clean(brand.target_audience, "the core audience")
    tone = _clean(brand.tone_of_voice, "clear and proof-led")
    value = _clean(brand.value_proposition, "a concrete business outcome")
    positioning = _clean(brand.positioning, "a differentiated promise")
    industry = _clean(brand.industry, "the market")
    campaign_name = campaign.name if campaign else brand.brand_name
    campaign_description = _clean(
        campaign.description if campaign else None,
        "No extra campaign context provided.",
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are the Brand Coaching agent for CMO.ai. "
                "Give strategic brand guidance, not generic ad copy. "
                "Be concrete, specific, and useful to a marketing team. "
                "Use short sections and bullet points when helpful.",
            ),
            (
                "human",
                "Brand: {brand_name}\n"
                "Industry: {industry}\n"
                "Audience: {audience}\n"
                "Tone of voice: {tone}\n"
                "Value proposition: {value}\n"
                "Current positioning: {positioning}\n"
                "Campaign: {campaign_name}\n"
                "Campaign context: {campaign_description}\n"
                "Requested task: {action}\n\n"
                "If the task is about positioning, return a refined positioning statement plus 3 short supporting notes.\n"
                "If the task is about voice, return a practical voice guide with do and avoid bullets.\n"
                "If the task is about objections, return the top objections and response angles.\n"
                "If the request is open-ended, answer it as a brand strategist using the brand context above.",
            ),
        ]
    )

    try:
        chain = prompt | llm
        response = chain.invoke(
            {
                "brand_name": brand.brand_name,
                "industry": industry,
                "audience": audience,
                "tone": tone,
                "value": value,
                "positioning": positioning,
                "campaign_name": campaign_name,
                "campaign_description": campaign_description,
                "action": action,
            }
        )
        return response.content.strip(), "live"
    except Exception:
        return _fallback_brand_response(brand, campaign, action), "fallback"
