from __future__ import annotations

from pathlib import Path
from textwrap import wrap

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCREEN_DIR = ROOT / "complete-project-screenshots"
VIDEO_DIR = ROOT / "outputs"
OUT_PATH = VIDEO_DIR / "CMO_AI_Project_Walkthrough.mp4"
SIZE = (1280, 720)
FPS = 24

FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


TITLE_FONT = load_font(FONT_BOLD, 50)
SUBTITLE_FONT = load_font(FONT_REGULAR, 28)
BODY_FONT = load_font(FONT_REGULAR, 24)
SMALL_FONT = load_font(FONT_REGULAR, 18)


def fit_image_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = image.size
    scale = max(target_w / src_w, target_h / src_h)
    resized = image.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def add_overlay(draw: ImageDraw.ImageDraw, title: str, lines: list[str], footer: str | None = None) -> None:
    draw.rounded_rectangle((40, 430, 1240, 680), radius=28, fill=(8, 12, 24, 210))
    draw.text((70, 455), title, font=TITLE_FONT, fill="white")
    y = 520
    for line in lines:
        wrapped = wrap(line, width=65)
        for part in wrapped:
            draw.text((75, y), part, font=BODY_FONT, fill=(228, 235, 247))
            y += 34
        y += 6
    if footer:
        draw.text((75, 645), footer, font=SMALL_FONT, fill=(157, 178, 214))


def render_slide(title: str, lines: list[str], image_path: Path | None = None, footer: str | None = None) -> Image.Image:
    if image_path and image_path.exists():
        base = Image.open(image_path).convert("RGB")
        canvas = fit_image_cover(base, SIZE)
    else:
        canvas = Image.new("RGB", SIZE, (14, 18, 34))
        bg = ImageDraw.Draw(canvas)
        for i in range(0, SIZE[1], 6):
            shade = 20 + int(50 * (i / SIZE[1]))
            bg.line((0, i, SIZE[0], i), fill=(shade // 2, shade, min(120, shade + 30)))

    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle((48, 36, 450, 116), radius=20, fill=(24, 40, 72, 210))
    draw.text((72, 56), "CMO.ai Walkthrough", font=SUBTITLE_FONT, fill=(155, 216, 255))
    add_overlay(draw, title, lines, footer)
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


def append_video_clip(writer, path: Path, seconds_limit: float = 6.0) -> None:
    reader = imageio.get_reader(str(path))
    meta = reader.get_meta_data()
    source_fps = float(meta.get("fps") or 24)
    max_frames = int(seconds_limit * source_fps)

    for index, frame in enumerate(reader):
        if index >= max_frames:
            break
        image = Image.fromarray(frame).convert("RGB")
        canvas = fit_image_cover(image, SIZE)
        overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        draw.rounded_rectangle((40, 580, 1240, 680), radius=28, fill=(8, 12, 24, 215))
        draw.text((70, 604), "Real video output from the dashboard's Video Generation workflow", font=BODY_FONT, fill="white")
        merged = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
        writer.append_data(np.array(merged))
    reader.close()


def find_latest_demo_clip() -> Path | None:
    candidates = sorted(
        path
        for path in VIDEO_DIR.rglob("*.mp4")
        if path.name != OUT_PATH.name
    )
    return candidates[-1] if candidates else None


def build_video() -> Path:
    slides = [
        render_slide(
            "Frontend-first walkthrough",
            [
                "CMO.ai is an AI-powered marketing workspace, but this walkthrough puts the implemented frontend experience at the center.",
                "The story moves from interface design and dashboard flow into the orchestrator, every agent workspace, and future expansion.",
            ],
            footer="Highlighting the product experience you built",
        ),
        render_slide(
            "Frontend entry experience",
            [
                "The public-facing landing flow establishes the product identity, explains the value clearly, and leads users into the app.",
                "This matters because the frontend is not just decoration; it guides onboarding, trust, and first-use clarity.",
            ],
            SCREEN_DIR / "26-landing-logged-in.png",
            "Landing, navigation, and access flow",
        ),
        render_slide(
            "Dashboard architecture",
            [
                "The dashboard is the main frontend achievement: one workspace that keeps campaigns, brand context, metrics, and actions together.",
                "Instead of many disconnected pages, the UI supports fast switching between orchestrator decisions and specialized agent panels.",
            ],
            SCREEN_DIR / "27-dashboard-campaign-workspace.png",
            "Unified campaign workspace",
        ),
        render_slide(
            "Frontend interaction depth",
            [
                "Notifications, quick actions, campaign selection, and status surfaces make the product feel like a real SaaS workspace.",
                "This is a strong frontend point because the interface communicates state, readiness, and next steps without leaving the page.",
            ],
            SCREEN_DIR / "28-dashboard-notifications-open.png",
            "State-aware UI behavior",
        ),
        render_slide(
            "Orchestrator demo",
            [
                "The orchestrator acts as the command center that routes the user toward the right workflow for launch planning, blockers, and readiness.",
                "For the demo, start here to explain how the frontend organizes complex behavior into one clear campaign cockpit.",
            ],
            SCREEN_DIR / "27-dashboard-campaign-workspace.png",
            "Start the demo from the orchestrator",
        ),
        render_slide(
            "Market planner demo",
            [
                "The market planner turns campaign inputs into content pillars, posting cadence, and strategic next steps before generation starts.",
                "This is important future work too: the planner can evolve into a smarter orchestrated strategy engine with deeper memory.",
            ],
            footer="Strategy workspace inside the dashboard",
        ),
        render_slide(
            "Brand coaching demo",
            [
                "Brand setup and coaching help the rest of the system generate outputs that are more consistent, more relevant, and more on-voice.",
                "In the presentation, frame this as the context layer that improves every downstream agent result.",
            ],
            SCREEN_DIR / "31-dashboard-new-brand-modal.png",
            "Brand context improves every agent",
        ),
        render_slide(
            "Text agent demo",
            [
                "The text agent supports marketing copy workflows such as posts, ads, and email sequences.",
                "Conversation history stays tied to the campaign, which makes the experience feel iterative and productized rather than one-off.",
            ],
            SCREEN_DIR / "29-dashboard-text-history.png",
            "Persistent copy workflow",
        ),
        render_slide(
            "Image agent demo",
            [
                "The image workflow supports prompt creation, visual direction, and asset-oriented campaign thinking.",
                "It is also a strong frontend showcase because the visual result area, actions, and asset flow are presented clearly inside the workspace.",
            ],
            SCREEN_DIR / "32-dashboard-image-agent-working.png",
            "Creative visual support",
        ),
        render_slide(
            "Calendar and analytics demo",
            [
                "The calendar and analytics panels close the loop by translating plans into execution rhythm and performance review.",
                "In future work, both can become more intelligent with forecasting, publishing integrations, and automated optimization suggestions.",
            ],
            footer="Execution and measurement modules",
        ),
        render_slide(
            "Campaign and brand setup",
            [
                "Users can create campaigns and brands directly from the workspace without leaving the dashboard.",
                "That continuity is one of the clearest frontend strengths because setup, action, and review all happen in the same product surface.",
            ],
            SCREEN_DIR / "30-dashboard-new-campaign-modal.png",
            "In-dashboard setup flow",
        ),
        render_slide(
            "Video agent demo",
            [
                "The project also includes a video pipeline that combines strategic reasoning, script generation, storyboard logic, and media output.",
                "The next segment shows a real generated clip produced from the application workflow, so the demo covers the full media stack.",
            ],
            footer="Generated agent result",
        ),
        render_slide(
            "Frontend contribution",
            [
                "Frontend stack: React, TypeScript, Vite, Tailwind CSS, reusable dashboard panels, protected flows, and modular service integration.",
                "This is the part to emphasize verbally: the visible product, navigation logic, and multi-agent workspace are real implemented frontend work.",
            ],
            footer="Make the frontend your speaking focus",
        ),
        render_slide(
            "Technical value",
            [
                "Backend: FastAPI, SQLAlchemy, Alembic, modular services, and agent endpoints.",
                "AI services: Groq-based reasoning plus provider-backed image and video workflows.",
                "Together, the stack supports a frontend-led product demo with real service integration behind it.",
            ],
            footer="Full-stack graduation project foundation",
        ),
        render_slide(
            "Future work across all agents",
            [
                "Orchestrator: smarter routing, campaign memory, and cross-agent coordination.",
                "Planner, brand, calendar, text, image, video, and analytics: deeper personalization, real channel integrations, and predictive recommendations.",
            ],
            footer="Demo today, roadmap tomorrow",
        ),
        render_slide(
            "CMO.ai conclusion",
            [
                "The project demonstrates a practical full-stack product that connects strategy, creativity, and analytics in one system.",
                "It is a strong graduation-project result, and the frontend experience is a major reason the whole platform feels coherent and presentation-ready.",
            ],
            footer="End of walkthrough",
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
        for slide in slides[:11]:
            if previous is not None:
                for frame in fade_frames(previous, slide):
                    writer.append_data(frame)
            for frame in frame_sequence(slide, 3.5):
                writer.append_data(frame)
            previous = slide

        video_intro = slides[11]
        for frame in fade_frames(previous, video_intro):
            writer.append_data(frame)
        for frame in frame_sequence(video_intro, 2.0):
            writer.append_data(frame)

        latest_clip = find_latest_demo_clip()
        if latest_clip is not None:
            append_video_clip(writer, latest_clip, seconds_limit=6.0)

        previous = slides[12]
        for frame in fade_frames(video_intro, previous):
            writer.append_data(frame)
        for frame in frame_sequence(previous, 3.0):
            writer.append_data(frame)

        for slide in slides[13:]:
            for frame in fade_frames(previous, slide):
                writer.append_data(frame)
            for frame in frame_sequence(slide, 3.2):
                writer.append_data(frame)
            previous = slide
    finally:
        writer.close()

    return OUT_PATH


if __name__ == "__main__":
    output = build_video()
    print(output)
