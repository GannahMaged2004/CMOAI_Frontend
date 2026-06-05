"""Utility for streaming and saving generated videos locally."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(override=True)


def save_video(url: str, prefix: str = "video") -> str:
    """Download a video URL via streaming and save it under outputs directory."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_prefix = (prefix or "video").replace(" ", "_")
    output_dir = Path("outputs")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{safe_prefix}_{timestamp}.mp4"

    response = requests.get(url, stream=True, timeout=120)
    if response.status_code != 200:
        raise RuntimeError(f"Failed to download video. HTTP {response.status_code}: {response.text}")

    with output_path.open("wb") as file_obj:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file_obj.write(chunk)
    return str(output_path.resolve())
