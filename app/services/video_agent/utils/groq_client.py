"""Shared Groq OpenAI-compatible client for all LLM modules."""

from __future__ import annotations

from openai import OpenAI

from utils.env_loader import get_groq_api_key

client = OpenAI(
    api_key=get_groq_api_key(),
    base_url="https://api.groq.com/openai/v1",
)
