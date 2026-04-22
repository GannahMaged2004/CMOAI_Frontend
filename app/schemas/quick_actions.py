from pydantic import BaseModel


class BlogPostRequest(BaseModel):
    brand_id: int
    topic: str


class HashtagRequest(BaseModel):
    content: str
    platform: str


class GenerateImageRequest(BaseModel):
    brand_id: int
    prompt: str


class QuickStrategyRequest(BaseModel):
    brand_id: int
    goal: str


class QuickActionResponse(BaseModel):
    result: str

