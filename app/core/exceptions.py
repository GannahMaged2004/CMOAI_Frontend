"""
Reusable HTTP exceptions for the CMO.ai API.
"""

from fastapi import HTTPException, status

# ── Pre-built exception instance (used by dependencies.py) ────

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# ── Exception factory helpers ─────────────────────────────────

def NotFound(resource: str = "Resource") -> HTTPException:
    """Return a 404 HTTPException for *resource*."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )


def AlreadyExists(resource: str = "Resource") -> HTTPException:
    """Return a 400 HTTPException when *resource* already exists."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"{resource} already exists",
    )


def Unauthorized(detail: str = "Not authenticated") -> HTTPException:
    """Return a 401 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def Forbidden(detail: str = "Not enough permissions") -> HTTPException:
    """Return a 403 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


# ── Legacy aliases (kept for backwards compatibility) ─────────

def not_found(resource: str = "Resource") -> HTTPException:
    return NotFound(resource)


def forbidden(detail: str = "Not enough permissions") -> HTTPException:
    return Forbidden(detail)


def bad_request(detail: str = "Bad request") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )


def conflict(detail: str = "Conflict") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail,
    )
