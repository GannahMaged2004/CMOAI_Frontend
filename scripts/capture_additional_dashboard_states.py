from __future__ import annotations

import base64
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import requests
from selenium import webdriver
from selenium.webdriver import EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from app.core.security import create_access_token, create_refresh_token

BASE_URL = "http://127.0.0.1:5173"
API_URL = "http://127.0.0.1:8000/api/v1"
OUT_DIR = ROOT / "complete-project-screenshots"

EMAIL = "gannah.eltonsy@gmail.com"
CAMPAIGN_ID = 2


def wait_for_http(url: str, timeout: float = 60.0) -> None:
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            response = requests.get(url, timeout=5)
            if response.ok:
                return
            last_error = f"{url} returned {response.status_code}"
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
        time.sleep(1)
    raise RuntimeError(f"Timed out waiting for {url}: {last_error}")


def build_driver() -> webdriver.Edge:
    options = EdgeOptions()
    options.use_chromium = True
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--window-size=1440,2200")
    options.binary_location = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    return webdriver.Edge(options=options)


def save_full_page(driver: webdriver.Edge, destination: Path) -> None:
    metrics = driver.execute_cdp_cmd("Page.getLayoutMetrics", {})
    width = metrics["contentSize"]["width"]
    height = metrics["contentSize"]["height"]
    screenshot = driver.execute_cdp_cmd(
        "Page.captureScreenshot",
        {
            "format": "png",
            "captureBeyondViewport": True,
            "fromSurface": True,
            "clip": {
                "x": 0,
                "y": 0,
                "width": width,
                "height": height,
                "scale": 1,
            },
        },
    )
    destination.write_bytes(base64.b64decode(screenshot["data"]))


def wait_ready(driver: webdriver.Edge, marker: str | None = None) -> None:
    WebDriverWait(driver, 20).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )
    if marker:
        WebDriverWait(driver, 20).until(
            lambda d: marker.lower() in d.find_element(By.TAG_NAME, "body").text.lower()
        )
    time.sleep(1.0)


def set_session(driver: webdriver.Edge) -> None:
    access = create_access_token({"sub": EMAIL})
    refresh = create_refresh_token({"sub": EMAIL})
    driver.get(f"{BASE_URL}/login")
    wait_ready(driver, "sign in to continue")
    driver.execute_script(
        """
        localStorage.setItem('access_token', arguments[0]);
        localStorage.setItem('refresh_token', arguments[1]);
        localStorage.setItem('cmo-user', JSON.stringify({ email: arguments[2] }));
        localStorage.setItem('cmo_active_campaign_id', arguments[3]);
        """,
        access,
        refresh,
        EMAIL,
        str(CAMPAIGN_ID),
    )


def get_text_history() -> list[dict[str, str]]:
    access = create_access_token({"sub": EMAIL})
    headers = {"Authorization": f"Bearer {access}", "Content-Type": "application/json"}
    payload = {
        "message": "Write a LinkedIn post for Book Summer",
        "campaign_id": CAMPAIGN_ID,
        "content_type": "social_media_post",
        "platform": "linkedin",
    }
    response = requests.post(
        f"{API_URL}/agents/content/generate",
        headers=headers,
        json=payload,
        timeout=90,
    )
    response.raise_for_status()
    data = response.json()
    assistant_text = data.get("generated_content", "")
    hashtags = " ".join(data.get("hashtags") or [])
    if hashtags:
        assistant_text = f"{assistant_text}\n\n{hashtags}"
    return [
        {
            "role": "assistant",
            "text": "I can write campaign copy, compare angles, or expand the approved strategy into drafts.",
        },
        {"role": "user", "text": "Write a LinkedIn post for Book Summer"},
        {"role": "assistant", "text": assistant_text},
        {"role": "user", "text": "Now make it shorter and more promotional."},
        {
            "role": "assistant",
            "text": "Book Summer is here. Get up to 80% off and build your perfect reading list for the season. Great books, better prices, limited-time offer.",
        },
    ]


def set_text_history(driver: webdriver.Edge) -> None:
    history = get_text_history()
    driver.get(f"{BASE_URL}/login")
    wait_ready(driver, "sign in to continue")
    driver.execute_script(
        """
        localStorage.setItem(arguments[0], arguments[1]);
        """,
        f"cmo-text-chat-{CAMPAIGN_ID}",
        json.dumps(history),
    )


def click_text(driver: webdriver.Edge, label: str) -> None:
    buttons = driver.find_elements(By.XPATH, f"//button[contains(., '{label}')]")
    for button in buttons:
        try:
            driver.execute_script("arguments[0].click();", button)
            return
        except Exception:  # noqa: BLE001
            continue
    raise RuntimeError(f"Could not click button with label {label}")


def wait_for_body_text(driver: webdriver.Edge, text: str, timeout: int = 60) -> None:
    WebDriverWait(driver, timeout).until(
        lambda d: text.lower() in d.find_element(By.TAG_NAME, "body").text.lower()
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wait_for_http(f"{BASE_URL}/")
    wait_for_http("http://127.0.0.1:8000/health")

    driver = build_driver()
    driver.set_window_size(1440, 2200)
    try:
        set_session(driver)
        set_text_history(driver)

        driver.get(f"{BASE_URL}/landing")
        wait_ready(driver, "logout")
        save_full_page(driver, OUT_DIR / "26-landing-logged-in.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "notifications")
        save_full_page(driver, OUT_DIR / "27-dashboard-campaign-workspace.png")

        save_full_page(driver, OUT_DIR / "33-dashboard-orchestrator-panel.png")

        click_text(driver, "Notifications")
        wait_ready(driver, "actionable alerts and workspace status")
        save_full_page(driver, OUT_DIR / "28-dashboard-notifications-open.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "campaign workspace")
        click_text(driver, "Market Planner")
        wait_ready(driver, "generate marketing strategy")
        save_full_page(driver, OUT_DIR / "34-dashboard-market-planner.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "campaign workspace")
        click_text(driver, "Text Generation")
        wait_ready(driver, "write a linkedin post for")
        save_full_page(driver, OUT_DIR / "29-dashboard-text-history.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "new campaign")
        click_text(driver, "New Campaign")
        wait_ready(driver, "create new campaign")
        save_full_page(driver, OUT_DIR / "30-dashboard-new-campaign-modal.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "new brand")
        click_text(driver, "New Brand")
        wait_ready(driver, "create new brand")
        save_full_page(driver, OUT_DIR / "31-dashboard-new-brand-modal.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "campaign workspace")
        click_text(driver, "Image Generation")
        wait_ready(driver, "image generation")
        click_text(driver, "Create image prompts")
        wait_for_body_text(driver, "Elevate Eid with Gannah's Vibrant Lip Gloss Collection", timeout=90)
        save_full_page(driver, OUT_DIR / "32-dashboard-image-agent-working.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "campaign workspace")
        click_text(driver, "Video Generation")
        wait_ready(driver, "video generation")
        save_full_page(driver, OUT_DIR / "35-dashboard-video-generation.png")

        driver.get(f"{BASE_URL}/dashboard")
        wait_ready(driver, "campaign workspace")
        click_text(driver, "Performance Analytics")
        wait_ready(driver, "performance analytics")
        save_full_page(driver, OUT_DIR / "36-dashboard-analytics-panel.png")

        print("done")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
