"""Pinecone RAG layer for the content agent (lazy-loaded)."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

from dotenv import load_dotenv

from app.core.config import settings

load_dotenv()

INDEX_NAME = settings.PINECONE_INDEX_NAME or os.getenv(
    "PINECONE_INDEX_NAME", "cmo-content-kb"
)

_vector_store = None


def _get_vector_store():
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    from pinecone import Pinecone, ServerlessSpec
    from langchain_cohere import CohereEmbeddings
    from langchain_pinecone import PineconeVectorStore

    cohere_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    pinecone_key = settings.PINECONE_API_KEY or os.getenv("PINECONE_API_KEY")
    if not cohere_key or not pinecone_key:
        return None

    embeddings = CohereEmbeddings(
        model="embed-english-v3.0",
        cohere_api_key=cohere_key,
    )

    pc = Pinecone(api_key=pinecone_key)
    existing_indexes = [i.name for i in pc.list_indexes()]
    if INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=INDEX_NAME,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    _vector_store = PineconeVectorStore(
        index_name=INDEX_NAME,
        embedding=embeddings,
    )
    return _vector_store


def store_brand_knowledge(brand_name: str, documents: list[dict]) -> None:
    """Store brand-specific knowledge in Pinecone."""
    from langchain_core.documents import Document

    vs = _get_vector_store()
    if vs is None:
        raise RuntimeError(
            "Pinecone/Cohere not configured. Set COHERE_API_KEY and PINECONE_API_KEY."
        )

    docs = [
        Document(
            page_content=d["text"],
            metadata={
                "brand": brand_name,
                "type": d.get("type", "general"),
            },
        )
        for d in documents
    ]
    vs.add_documents(docs)


def retrieve_brand_knowledge(brand_name: str, query: str, k: int = 3) -> str:
    """Retrieve relevant brand knowledge to inject into prompts."""
    try:
        vs = _get_vector_store()
        if vs is None:
            return "No specific brand knowledge available."

        results = vs.similarity_search(
            query=query,
            k=k,
            filter={"brand": brand_name},
        )
        if not results:
            return "No specific brand knowledge available."

        return "\n".join(
            [
                f"- [{doc.metadata.get('type', 'info')}]: {doc.page_content}"
                for doc in results
            ]
        )
    except Exception as e:
        print(f"RAG warning: {e}")
        return "No specific brand knowledge available."
