# populate KB
from app.utils.knowledge_base_content.content_kb import store_brand_knowledge

freshbrew_knowledge = [
    {
        "text": "FreshBrew uses a warm, friendly, and energetic tone. We speak like a knowledgeable coffee friend, not a corporate brand.",
        "type": "tone_guideline"
    },
    {
        "text": "Our target audience is young professionals aged 22-35 who value quality, sustainability, and unique coffee experiences.",
        "type": "audience"
    },
    {
        "text": "FreshBrew top products: Oat Milk Latte, Cold Brew, Single Origin Pour Over, and seasonal specials.",
        "type": "product"
    },
    {
        "text": "Brand values: sustainability, quality sourcing, community, and innovation in coffee culture.",
        "type": "brand_values"
    },
    {
        "text": "Successful post: 'Your Monday just got an upgrade. Our Cold Brew hits different. Link in bio.' — got 3x average engagement.",
        "type": "successful_post"
    },
    {
        "text": "Always use inclusive language. Highlight dairy-free and vegan options. Avoid overly salesy language.",
        "type": "tone_guideline"
    },
]

if __name__ == "__main__":
    print("Seeding FreshBrew knowledge base...")
    store_brand_knowledge("FreshBrew", freshbrew_knowledge)
    print("Done! Knowledge base is ready 🎉")