"""Runway API service integration for video generation and polling."""

from __future__ import annotations

import os
import time
from typing import Any, Dict

import requests

from utils.env_loader import load_project_env

load_project_env()

RUNWAY_API_KEY = (os.getenv("RUNWAY_API_KEY") or "").strip()
RUNWAY_BASE_URL = "https://api.dev.runwayml.com/v1"
RUNWAY_MODEL = (os.getenv("RUNWAY_MODEL") or "gen4.5").strip()
RUNWAY_RATIO = (os.getenv("RUNWAY_RATIO") or "1280:720").strip()
RUNWAY_DURATION = int(os.getenv("RUNWAY_DURATION", "5"))
RUNWAY_PROMPT_MAX_CHARS = 1000


class RunwayError(Exception):
    """Custom exception for Runway API failures."""


class RunwayService:
    """Service object encapsulating Runway generation and polling operations."""

    VERSION = "2024-11-06"

    def __init__(self) -> None:
        """Initialize Runway service with API key from environment."""
        self.api_key = RUNWAY_API_KEY or ""
        if not self.api_key:
            raise RunwayError("RUNWAY_API_KEY is missing. Set it in your environment or .env file.")

    def _headers(self) -> Dict[str, str]:
        """Build shared request headers for Runway API calls."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Runway-Version": self.VERSION,
        }

    def _prepare_prompt(self, prompt: str) -> str:
        """Normalize and trim prompt to Runway's text-to-video character limit."""
        cleaned = " ".join((prompt or "").split())
        if not cleaned:
            raise RunwayError("Runway promptText cannot be empty.")
        if len(cleaned) <= RUNWAY_PROMPT_MAX_CHARS:
            return cleaned
        trimmed = cleaned[: RUNWAY_PROMPT_MAX_CHARS - 3].rstrip()
        print(
            f"[Runway] Prompt truncated from {len(cleaned)} to {len(trimmed)} chars "
            f"(Runway limit: {RUNWAY_PROMPT_MAX_CHARS})."
        )
        return f"{trimmed}..."

    def generate_video(self, prompt: str) -> str:
        """Create a Runway text-to-video job and return the resulting job id."""
        prompt_text = self._prepare_prompt(prompt)
        payload = {
            "model": RUNWAY_MODEL,
            "promptText": prompt_text,
            "duration": RUNWAY_DURATION,
            "ratio": RUNWAY_RATIO,
        }
        endpoint = f"{RUNWAY_BASE_URL}/text_to_video"
        try:
            response = requests.post(endpoint, headers=self._headers(), json=payload, timeout=60)
            if response.status_code != 200:
                raise RunwayError(
                    f"Runway generation request failed ({response.status_code}): {response.text}"
                )
            data: Dict[str, Any] = response.json()
            job_id = data.get("id")
            if not job_id:
                raise RunwayError(f"Runway response missing job id: {data}")
            return str(job_id)
        except requests.RequestException as exc:
            print(f"Runway HTTP error during generate_video: {exc}")
            raise RunwayError(f"Runway HTTP error during generate_video: {exc}") from exc
        except ValueError as exc:
            print(f"Failed to decode Runway generation response: {exc}")
            raise RunwayError(f"Failed to decode Runway generation response: {exc}") from exc

    def poll_until_ready(self, job_id: str, timeout: int = 300) -> str:
        """Poll Runway task status until complete, failed, or timeout."""
        endpoint = f"{RUNWAY_BASE_URL}/tasks/{job_id}"
        started = time.time()
        waiting_statuses = {"PENDING", "RUNNING", "THROTTLED"}
        while True:
            if time.time() - started > timeout:
                raise TimeoutError(f"Runway generation timed out after {timeout} seconds.")
            try:
                response = requests.get(endpoint, headers=self._headers(), timeout=60)
                if response.status_code != 200:
                    raise RunwayError(
                        f"Runway polling request failed ({response.status_code}): {response.text}"
                    )
                data: Dict[str, Any] = response.json()
                status = str(data.get("status", "")).upper()
                print(f"[Runway] Job {job_id} status: {status}")

                if status == "SUCCEEDED":
                    output = data.get("output", [])
                    if isinstance(output, list) and output:
                        return str(output[0])
                    raise RunwayError(f"Runway job succeeded but output URL missing: {data}")
                if status == "FAILED":
                    raise RunwayError("Generation failed")
                if status in waiting_statuses:
                    time.sleep(3)
                    continue
                raise RunwayError(f"Unexpected Runway status '{status}' for job {job_id}: {data}")
            except requests.RequestException as exc:
                print(f"Runway HTTP error while polling job {job_id}: {exc}")
                raise RunwayError(f"Runway HTTP error while polling job {job_id}: {exc}") from exc
            except ValueError as exc:
                print(f"Failed to decode Runway polling response for job {job_id}: {exc}")
                raise RunwayError(f"Failed to decode Runway polling response for job {job_id}: {exc}") from exc
