from __future__ import annotations

from pathlib import Path
from textwrap import wrap

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCREEN_DIR = ROOT / "complete-project-screenshots"
VIDEO_DIR = ROOT / "outputs"
OUT_PATH = VIDEO_DIR / "CMO_AI_Onboarding_Demo.mp4"
SIZE = (1280, 720)
FPS = 24

FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


TITLE_FONT = load_font(FONT_BOLD, 44)
SUBTITLE_FONT = load_font(FONT_REGULAR, 28)
BODY_FONT = load_font(FONT_REGULAR, 26)
SMALL_FONT = load_font(FONT_REGULAR, 21)


def fit_image_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = image.size
    scale = max(target_w / src_w, target_h / src_h)
    resized = image.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def make_gradient_background() -> Image.Image:
    canvas = Image.new("RGB", SIZE, (10, 14, 26))
    draw = ImageDraw.Draw(canvas)
    for i in range(0, SIZE[1], 4):
        ratio = i / SIZE[1]
        color = (
            int(12 + ratio * 30),
            int(20 + ratio * 40),
            int(35 + ratio * 55),
        )
        draw.line((0, i, SIZE[0], i), fill=color)
    return canvas


def draw_header(draw: ImageDraw.ImageDraw, label: str = "CMO.ai User Demo") -> None:
    draw.rounded_rectangle((44, 32, 420, 104), radius=20, fill=(22, 38, 72, 215))
    draw.text((68, 52), label, font=SUBTITLE_FONT, fill=(180, 228, 255))


def draw_instruction_panel(
    draw: ImageDraw.ImageDraw,
    title: str,
    lines: list[str],
    footer: str | None = None,
    top: int = 390,
) -> None:
    draw.rounded_rectangle((42, top, 1238, 680), radius=28, fill=(8, 12, 24, 222))
    draw.text((72, top + 24), title, font=TITLE_FONT, fill="white")
    y = top + 96
    for line in lines:
        for part in wrap(line, width=66):
            draw.text((80, y), part, font=BODY_FONT, fill=(232, 238, 248))
            y += 36
        y += 8
    if footer:
        draw.text((80, 640), footer, font=SMALL_FONT, fill=(170, 188, 220))


def render_slide(
    title: str,
    lines: list[str],
    image_path: Path | None = None,
    footer: str | None = None,
) -> Image.Image:
    if image_path and image_path.exists():
        base = Image.open(image_path).convert("RGB")
        canvas = fit_image_cover(base, SIZE)
    else:
        canvas = make_gradient_background()

    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_header(draw)
    draw_instruction_panel(draw, title, lines, footer)
    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def render_auth_slide() -> Image.Image:
    canvas = make_gradient_background()
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_header(draw, "CMO.ai Sign-In Guide")

    draw.rounded_rectangle((90, 120, 610, 620), radius=30, fill=(14, 20, 36, 228))
    draw.text((128, 160), "How to sign in", font=TITLE_FONT, fill="white")

    left_lines = [
        "1. Open the login page.",
        "2. Type your email address.",
        "3. Type your password.",
        "4. Press Sign In.",
        "5. If you forgot the password, press Forgot password?",
    ]
    y = 230
    for line in left_lines:
        draw.text((130, y), line, font=BODY_FONT, fill=(232, 238, 248))
        y += 52

    draw.rounded_rectangle((675, 150, 1160, 560), radius=28, fill=(245, 247, 252, 245))
    draw.text((725, 190), "Sign in to continue", font=TITLE_FONT, fill=(18, 24, 44))

    field_specs = [
        ("Email address", "name@example.com"),
        ("Password", "Enter your password"),
    ]
    top = 280
    for label, placeholder in field_specs:
        draw.text((735, top), label, font=SMALL_FONT, fill=(50, 60, 85))
        draw.rounded_rectangle((730, top + 32, 1105, top + 88), radius=18, fill=(225, 232, 242))
        draw.text((750, top + 48), placeholder, font=SMALL_FONT, fill=(108, 120, 146))
        top += 120

    draw.rounded_rectangle((730, 470, 1105, 528), radius=20, fill=(78, 188, 255))
    draw.text((866, 486), "Sign In", font=SMALL_FONT, fill=(12, 24, 44))
    draw.text((730, 575), "Clear labels and large fields help first-time users.", font=SMALL_FONT, fill=(180, 196, 224))

    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def frame_sequence(image: Image.Image, seconds: float) -> list[np.ndarray]:
    count = max(1, int(seconds * FPS))
    frame = np.array(image)
    return [frame] * count


def fade_frames(from_image: Image.Image, to_image: Image.Image, seconds: float = 0.6) -> list[np.ndarray]:
    count = max(2, int(seconds * FPS))
    a = np.array(from_image).astype(np.float32)
    b = np.array(to_image).astype(np.float32)
    frames: list[np.ndarray] = []
    for idx in range(count):
        alpha = idx / (count - 1)
        blended = (a * (1 - alpha) + b * alpha).clip(0, 255).astype(np.uint8)
        frames.append(blended)
    return frames


def find_latest_demo_clip() -> Path | None:
    candidates = sorted(
        path
        for path in VIDEO_DIR.rglob("*.mp4")
        if path.name not in {OUT_PATH.name, "CMO_AI_Project_Walkthrough.mp4"}
    )
    return candidates[-1] if candidates else None


def append_video_clip(writer, path: Path, seconds_limit: float = 5.0) -> None:
    reader = imageio.get_reader(str(path))
    source_fps = float(reader.get_meta_data().get("fps") or 24)
    max_frames = int(seconds_limit * source_fps)

    for index, frame in enumerate(reader):
        if index >= max_frames:
            break
        image = Image.fromarray(frame).convert("RGB")
        canvas = fit_image_cover(image, SIZE)
        overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        draw.rounded_rectangle((48, 566, 1234, 676), radius=28, fill=(8, 12, 24, 218))
        draw.text((80, 598), "Example video result created by the Video Generation workspace", font=BODY_FONT, fill="white")
        writer.append_data(np.array(Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")))
    reader.close()


def build_video() -> Path:
    slides = [
        render_slide(
            "Welcome to CMO.ai",
            [
                "This short video shows new users how to enter the platform, sign in, and use the main dashboard tools step by step.",
                "The language is simple on purpose so first-time users and older users can follow it comfortably.",
            ],
            footer="Beginner-friendly onboarding demo",
        ),
        render_slide(
            "Start from the landing page",
            [
                "Open the website and read the main options slowly.",
                "From here, users can learn about the product, move to login, or continue into the workspace.",
            ],
            SCREEN_DIR / "26-landing-logged-in.png",
            "Landing page and first impression",
        ),
        render_auth_slide(),
        render_slide(
            "If you are new here",
            [
                "Press Create Account and fill in your name, email address, and password.",
                "If you forget your password later, use Forgot password and follow the OTP reset steps.",
            ],
            footer="Register, sign in, or recover access",
        ),
        render_slide(
            "After sign in: the dashboard",
            [
                "The dashboard is the main screen. It keeps the campaign, the brand, the agents, and the next actions together in one place.",
                "New users should begin by looking at the campaign name, the notifications, and the side navigation.",
            ],
            SCREEN_DIR / "27-dashboard-campaign-workspace.png",
            "Main workspace",
        ),
        render_slide(
            "Read alerts and status messages",
            [
                "Open Notifications to see what needs attention.",
                "This is useful for new users because the system explains what is ready, what is missing, and what to open next.",
            ],
            SCREEN_DIR / "28-dashboard-notifications-open.png",
            "Helpful guidance inside the UI",
        ),
        render_slide(
            "Step 1: Use the Orchestrator",
            [
                "Start with the Orchestrator when you are not sure where to begin.",
                "It helps summarize readiness, highlight blockers, and point you toward the right workspace.",
            ],
            SCREEN_DIR / "27-dashboard-campaign-workspace.png",
            "Best first stop for beginners",
        ),
        render_slide(
            "Step 2: Set up campaign and brand",
            [
                "Use New Campaign to create the campaign you want to work on.",
                "Use New Brand to store the brand name, audience, and identity so the agents can give better results.",
            ],
            SCREEN_DIR / "30-dashboard-new-campaign-modal.png",
            "Create campaign details first",
        ),
        render_slide(
            "Brand coaching",
            [
                "Brand Coaching helps the user think about voice, positioning, and audience fit.",
                "This step is helpful before asking the text, image, or video tools to generate content.",
            ],
            SCREEN_DIR / "31-dashboard-new-brand-modal.png",
            "Give the system better context",
        ),
        render_slide(
            "Market planner",
            [
                "The Market Planner is used to organize goals, budget, platforms, and posting direction.",
                "It is useful for beginners because it turns a simple campaign idea into a clearer strategy.",
            ],
            footer="Plan before generating",
        ),
        render_slide(
            "Text Generation agent",
            [
                "Open Text Generation when you need captions, posts, ads, or emails.",
                "The quick actions already suggest common tasks, so new users do not need to guess what to type first.",
            ],
            SCREEN_DIR / "29-dashboard-text-history.png",
            "Good for social posts and written content",
        ),
        render_slide(
            "Image Generation agent",
            [
                "Open Image Generation to create visual prompts, image variations, or asset briefs.",
                "This is useful for users who want campaign visuals without starting from a blank page.",
            ],
            SCREEN_DIR / "32-dashboard-image-agent-working.png",
            "Useful for campaign images and creative direction",
        ),
        render_slide(
            "Video Generation agent",
            [
                "Open Video Generation when you need a short script, a storyboard, or a creator brief.",
                "This helps users turn an idea into a simple video plan without needing advanced editing knowledge.",
            ],
            footer="Short-form video support",
        ),
        render_slide(
            "Calendar and Analytics",
            [
                "Use Market Calendar to organize what should be posted and when.",
                "Use Analytics to review reach, clicks, and conversions so the next campaign decisions are easier.",
            ],
            footer="Plan, then measure",
        ),
        render_slide(
            "Simple routine for new users",
            [
                "1. Sign in.",
                "2. Check the dashboard.",
                "3. Open the Orchestrator.",
                "4. Confirm campaign and brand.",
                "5. Use text, image, or video agents.",
                "6. Review the calendar and analytics.",
            ],
            footer="A calm step-by-step path",
        ),
        render_slide(
            "CMO.ai can be learned step by step",
            [
                "New users do not need to use every tool at once.",
                "Start with one campaign, follow the on-screen actions, and move slowly from planning to content to review.",
            ],
            footer="End of onboarding demo",
        ),
    ]

    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    writer = imageio.get_writer(
        str(OUT_PATH),
        fps=FPS,
        codec="libx264",
        format="FFMPEG",
        macro_block_size=16,
    )

    try:
        previous = None
        for idx, slide in enumerate(slides):
            if previous is not None:
                for frame in fade_frames(previous, slide, 0.7):
                    writer.append_data(frame)
            hold = 4.8 if idx in {0, 2, 14, 15} else 4.2
            for frame in frame_sequence(slide, hold):
                writer.append_data(frame)
            previous = slide

            if idx == 12:
                clip = find_latest_demo_clip()
                if clip is not None:
                    for frame in fade_frames(previous, slide, 0.4):
                        writer.append_data(frame)
                    append_video_clip(writer, clip, seconds_limit=5.0)
    finally:
        writer.close()

    return OUT_PATH


if __name__ == "__main__":
    output = build_video()
    print(output)
