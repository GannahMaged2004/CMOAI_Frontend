PLATFORM_RULES = {
    "instagram": {
        "char_limit": 2200,
        "best_practices": "Use storytelling, 5-10 hashtags, and a strong visual hook in the first line",
        "best_post_time": "Tuesday-Friday 9AM-11AM or 7PM-9PM",
        "tone_tip": "Casual, visual, community-driven",
    },
    "twitter": {
        "char_limit": 280,
        "best_practices": "Be concise, use at most 2 hashtags, and create curiosity fast",
        "best_post_time": "Monday-Thursday 8AM-10AM or 6PM-9PM",
        "tone_tip": "Witty, punchy, conversational",
    },
    "linkedin": {
        "char_limit": 3000,
        "best_practices": "Start with a hook, use line breaks, and lead with a useful insight",
        "best_post_time": "Tuesday-Thursday 7AM-9AM or 12PM-1PM",
        "tone_tip": "Professional, value-driven, thought leadership",
    },
    "facebook": {
        "char_limit": 63206,
        "best_practices": "Use questions to boost comments and keep the message easy to scan",
        "best_post_time": "Wednesday-Friday 1PM-4PM",
        "tone_tip": "Friendly, community-focused, story-driven",
    },
    "email": {
        "char_limit": 5000,
        "best_practices": "Use a strong subject line, single CTA, and mobile-friendly structure",
        "best_post_time": "Tuesday or Thursday 10AM-11AM",
        "tone_tip": "Personal, direct, value-first",
    },
}


def get_platform_rules(platform: str) -> dict:
    return PLATFORM_RULES.get(
        platform.lower(),
        {
            "char_limit": 2000,
            "best_practices": "Keep content clear, concise, and engaging",
            "best_post_time": "Weekdays between 9AM-12PM",
            "tone_tip": "Professional and friendly",
        },
    )


def check_char_limit(content: str, platform: str) -> dict:
    rules = PLATFORM_RULES.get(platform.lower(), {"char_limit": 2000})
    count = len(content)
    limit = rules["char_limit"]
    return {
        "char_count": count,
        "char_limit": limit,
        "within_limit": count <= limit,
        "chars_remaining": limit - count,
    }


def extract_hashtags(content: str) -> list[str]:
    return [w.strip('.,!?"\'') for w in content.split() if w.startswith("#")]


def suggest_posting_time(platform: str) -> str:
    rules = PLATFORM_RULES.get(platform.lower(), {})
    return rules.get("best_post_time", "Weekdays between 9AM-12PM")
