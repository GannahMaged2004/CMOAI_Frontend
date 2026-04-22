# Required .env variables:
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Optional

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/plain", "application/msword"]

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def _cloudinary_is_configured() -> bool:
    """Return True if Cloudinary credentials appear configured."""
    return bool(
        settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET
    )


def validate_file_size(file: UploadFile, max_size_mb: int = 10) -> None:
    """Validate an UploadFile does not exceed *max_size_mb*.

    Tries to determine size from the underlying file object without reading
    the whole stream into memory.
    """
    if max_size_mb <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum size must be greater than 0MB",
        )

    if not file or not getattr(file, "file", None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided",
        )

    size_bytes: Optional[int] = None
    underlying = file.file

    try:
        if hasattr(underlying, "tell") and hasattr(underlying, "seek"):
            pos = underlying.tell()
            underlying.seek(0, 2)
            end = underlying.tell()
            underlying.seek(pos)
            size_bytes = int(end)
    except Exception:
        size_bytes = None

    if size_bytes is None:
        # If we can't determine size here, we'll rely on upload_file() which reads bytes
        # and can enforce size after reading.
        return

    max_bytes = int(max_size_mb) * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {max_size_mb}MB",
        )


async def upload_file(file: UploadFile, folder: str = "cmo-ai/assets") -> Dict[str, Any]:
    """Upload a file to Cloudinary and return metadata for persistence.

    Raises:
        HTTPException: on missing config, invalid file, or upload failure.
    """
    if not _cloudinary_is_configured():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage not configured. Please set Cloudinary credentials.",
        )

    if file is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    content_type = (file.content_type or "").strip()
    if not content_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File content type is missing")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    # Enforce size after read if validate_file_size couldn't determine it.
    size_mb_limit = 100  # broad cap; wrappers should use validate_file_size with appropriate limits
    max_bytes = size_mb_limit * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {size_mb_limit}MB",
        )

    if content_type.startswith("image/"):
        resource_type = "image"
    elif content_type.startswith("video/"):
        resource_type = "video"
    else:
        resource_type = "raw"

    async def _do_upload() -> Dict[str, Any]:
        return await asyncio.to_thread(
            cloudinary.uploader.upload,
            file_bytes,
            resource_type=resource_type,
            folder=folder,
            filename=file.filename,
            use_filename=True,
            unique_filename=True,
        )

    try:
        resp = await _do_upload()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {e}",
        ) from e

    secure_url = resp.get("secure_url")
    public_id = resp.get("public_id")
    original_filename = resp.get("original_filename") or file.filename or ""

    if not secure_url or not public_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary upload failed: missing response fields",
        )

    return {
        "url": str(secure_url),
        "public_id": str(public_id),
        "file_size": int(len(file_bytes)),
        "mime_type": content_type,
        "filename": str(original_filename),
    }


async def delete_file(public_id: str, resource_type: str = "image") -> None:
    """Delete a file from Cloudinary.

    This function is best-effort: it will not raise if deletion fails.
    """
    public_id = (public_id or "").strip()
    if not public_id:
        logger.warning("delete_file called with empty public_id; skipping")
        return

    try:
        await asyncio.to_thread(
            cloudinary.uploader.destroy,
            public_id,
            resource_type=resource_type,
        )
    except Exception as e:
        logger.warning("Failed to delete Cloudinary asset %s: %s", public_id, e)


async def upload_image(file: UploadFile, folder: str = "cmo-ai/images") -> Dict[str, Any]:
    """Upload an image file to Cloudinary."""
    if (file.content_type or "") not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed (JPEG, PNG, WebP, GIF)",
        )
    validate_file_size(file, max_size_mb=10)
    return await upload_file(file, folder=folder)


async def upload_video(file: UploadFile, folder: str = "cmo-ai/videos") -> Dict[str, Any]:
    """Upload a video file to Cloudinary."""
    if (file.content_type or "") not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only video files are allowed (MP4, MOV, WebM)",
        )
    validate_file_size(file, max_size_mb=100)
    return await upload_file(file, folder=folder)


async def upload_document(file: UploadFile, folder: str = "cmo-ai/documents") -> Dict[str, Any]:
    """Upload a document file to Cloudinary."""
    if (file.content_type or "") not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only document files are allowed (PDF, TXT, DOC)",
        )
    validate_file_size(file, max_size_mb=5)
    return await upload_file(file, folder=folder)

