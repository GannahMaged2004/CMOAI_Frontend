from __future__ import annotations

from math import ceil
from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select


def get_pagination_params(page: int = 1, page_size: int = 20) -> dict:
    """FastAPI dependency to validate and return pagination parameters.

    Args:
        page: 1-indexed page number.
        page_size: number of items per page (capped at 100).

    Returns:
        Dict with validated values: {"page": page, "page_size": capped_page_size}
    """
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be 1 or greater",
        )
    if page_size < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be 1 or greater",
        )
    return {"page": page, "page_size": min(page_size, 100)}


async def paginate(query: Select, page: int, page_size: int, db: AsyncSession) -> Dict[str, Any]:
    """Paginate a SQLAlchemy Select query.

    This helper performs two queries:
    - Count total rows matching the query
    - Fetch the current page of items with offset/limit applied

    Args:
        query: SQLAlchemy Select.
        page: 1-indexed page number.
        page_size: items per page (capped at 100).
        db: async SQLAlchemy session.

    Returns:
        A dictionary with items and pagination metadata.
    """
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be 1 or greater",
        )

    page_size_capped = min(max(int(page_size), 1), 100)
    offset = (page - 1) * page_size_capped

    count_subq = query.order_by(None).subquery()
    count_stmt = select(func.count()).select_from(count_subq)
    total_res = await db.execute(count_stmt)
    total = int(total_res.scalar_one())

    items_stmt = query.offset(offset).limit(page_size_capped)
    items_res = await db.execute(items_stmt)
    items = items_res.scalars().all()

    pages = ceil(total / page_size_capped) if total > 0 else 0
    has_prev = page > 1 and total > 0
    has_next = page < pages

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size_capped,
        "pages": pages,
        "has_next": has_next,
        "has_prev": has_prev,
    }

