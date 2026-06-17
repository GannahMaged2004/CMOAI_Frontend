from __future__ import annotations

import base64
import json
import time
from pathlib import Path

import requests
from selenium import webdriver
from selenium.webdriver import EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:5173"
API_URL = "http://127.0.0.1:8000/api/v1"
OUT_DIR = ROOT / "cmo documentation and unnecessary folder" / "complete-project-screenshots"

DEMO_EMAIL = "ahmedsaber@example.com"
DEMO_PASSWORD = "SecurePassword123!"

FEATURE_IDS = [
    "brand-coaching",
    "market-planning",
    "smart-calendar",
    "content-generation",
    "analytics",
    "campaign-management",
]

AGENT_VIEWS = [
    ("orchestrator", "18-dashboard-orchestrator.png"),
    ("market", "19-dashboard-market-planner.png"),
    ("brand", "20-dashboard-brand-coaching.png"),
    ("calendar", "21-dashboard-market-calendar.png"),
    ("text", "22-dashboard-text-generation.png"),
    ("image", "23-dashboard-image-generation.png"),
    ("video", "24-dashboard-video-generation.png"),
    ("analytics", "25-dashboard-performance-analytics.png"),
]


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


def api_login() -> dict[str, str]:
    response = requests.post(
        f"{API_URL}/auth/login",
        data={"username": DEMO_EMAIL, "password": DEMO_PASSWORD},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


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


def wait_for_page(driver: webdriver.Edge, marker_text: str | None = None) -> None:
    WebDriverWait(driver, 20).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )
    if marker_text:
        WebDriverWait(driver, 20).until(
            lambda d: marker_text.lower() in d.find_element(By.TAG_NAME, "body").text.lower()
        )
    time.sleep(1.2)


def shot(driver: webdriver.Edge, path: str, filename: str, marker_text: str | None = None) -> None:
    driver.get(f"{BASE_URL}{path}")
    wait_for_page(driver, marker_text)
    save_full_page(driver, OUT_DIR / filename)
    print(f"saved {filename}")


def set_auth_session(driver: webdriver.Edge, tokens: dict[str, str]) -> None:
    driver.get(f"{BASE_URL}/login")
    wait_for_page(driver, "Sign in to continue")
    driver.execute_script(
        """
        localStorage.setItem('access_token', arguments[0]);
        localStorage.setItem('refresh_token', arguments[1]);
        """,
        tokens["access_token"],
        tokens["refresh_token"],
    )


def set_reset_session(driver: webdriver.Edge) -> None:
    driver.get(f"{BASE_URL}/login")
    wait_for_page(driver, "Sign in to continue")
    driver.execute_script(
        """
        sessionStorage.setItem('reset_email', 'gannah.eltonsy@gmail.com');
        sessionStorage.setItem('reset_token', 'demo-reset-token');
        sessionStorage.setItem('old_password', 'OldPassword123!');
        """
    )


def open_dashboard_view(driver: webdriver.Edge, view_id: str) -> None:
    if "/dashboard" not in driver.current_url:
        driver.get(f"{BASE_URL}/dashboard")
        WebDriverWait(driver, 20).until(
            lambda d: "/dashboard" in d.current_url
        )
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "main"))
        )

    driver.execute_script(
        """
        const value = arguments[0];
        const select = document.querySelector('select[aria-label="Active agent workspace"]');
        if (select) {
          select.value = value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
        """,
        view_id,
    )
    if view_id != "orchestrator":
        try:
            button = driver.find_element(
                By.XPATH,
                f"//button[contains(., '{label_for_view(view_id)}')]",
            )
            driver.execute_script("arguments[0].click();", button)
        except Exception:  # noqa: BLE001
            pass

    expected_text = label_for_view(view_id).lower()
    WebDriverWait(driver, 20).until(
        lambda d: expected_text in d.find_element(By.TAG_NAME, "body").text.lower()
    )
    time.sleep(1.2)


def label_for_view(view_id: str) -> str:
    mapping = {
        "orchestrator": "Orchestrator",
        "market": "Market Planner",
        "brand": "Brand Coaching",
        "calendar": "Market Calendar",
        "text": "Text Generation",
        "image": "Image Generation",
        "video": "Video Generation",
        "analytics": "Performance Analytics",
    }
    return mapping[view_id]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    wait_for_http(f"{BASE_URL}/")
    wait_for_http("http://127.0.0.1:8000/health")

    tokens = api_login()
    driver = build_driver()
    driver.set_window_size(1440, 2200)

    try:
        shot(driver, "/", "01-welcome.png", "Welcome to your AI-powered marketing platform")
        shot(driver, "/landing", "02-landing.png", "Everything you need to")
        shot(driver, "/pricing", "03-pricing.png", "pricing")
        shot(driver, "/payment", "04-payment-no-plan.png", "No plan selected")
        shot(driver, "/payment?plan=free", "05-payment-free.png", "Checkout")
        shot(driver, "/payment?plan=pro", "06-payment-pro.png", "Checkout")
        shot(driver, "/login", "07-login.png", "Sign in to continue")
        shot(driver, "/register", "08-register.png", "Start your workspace")
        shot(driver, "/forgot-password", "09-forgot-password.png", "Request a reset code")

        set_reset_session(driver)
        shot(driver, "/verify-otp", "10-verify-otp.png", "Enter your 6-digit OTP")
        shot(driver, "/reset-password", "11-reset-password.png", "Reset your password")

        for index, feature_id in enumerate(FEATURE_IDS, start=12):
            shot(
                driver,
                f"/features/{feature_id}",
                f"{index:02d}-feature-{feature_id}.png",
                "Ready to get started?",
            )

        set_auth_session(driver, tokens)
        for view_id, filename in AGENT_VIEWS:
            open_dashboard_view(driver, view_id)
            save_full_page(driver, OUT_DIR / filename)
            print(f"saved {filename}")

        manifest = {
            "base_url": BASE_URL,
            "count": len(list(OUT_DIR.glob("*.png"))),
            "files": sorted(path.name for path in OUT_DIR.glob("*.png")),
        }
        (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        print(json.dumps(manifest, indent=2))
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
