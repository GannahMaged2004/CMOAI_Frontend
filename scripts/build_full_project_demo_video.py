from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from textwrap import wrap

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
CAPTURE_DIR = ROOT / "cmo documentation and unnecessary folder" / "complete-project-screenshots"
DASHBOARD_DIR = ROOT / "complete-project-screenshots"
OUTPUT_DIR = ROOT / "outputs"
OUT_PATH = OUTPUT_DIR / "CMO_AI_Full_Product_Demo.mp4"
SIZE = (1280, 720)
FPS = 24
SCREENSHOT_PACE_MULTIPLIER = 1.35

FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")


@dataclass(frozen=True)
class Shot:
    path: Path
    title: str
    lines: list[str]
    seconds: float = 2.4
    footer: str | None = None


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


TITLE_FONT = load_font(FONT_BOLD, 46)
SUBTITLE_FONT = load_font(FONT_REGULAR, 26)
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


def fit_image_contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = image.size
    scale = min(target_w / src_w, target_h / src_h)
    resized = image.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)

    # Build a soft background so tall screenshots stay fully visible without harsh letterboxing.
    background = fit_image_cover(image, size).filter(ImageFilter.GaussianBlur(radius=18))
    background = Image.blend(background, Image.new("RGB", size, (10, 16, 30)), 0.35)

    left = (target_w - resized.width) // 2
    top = (target_h - resized.height) // 2
    background.paste(resized, (left, top))
    return background


def add_top_badge(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle((52, 38, 486, 110), radius=20, fill=(19, 30, 53, 220))
    draw.text((78, 58), "CMO.ai Full Product Demo", font=SUBTITLE_FONT, fill=(168, 224, 255))


def add_overlay(
    draw: ImageDraw.ImageDraw,
    title: str,
    lines: list[str],
    footer: str | None = None,
) -> None:
    draw.rounded_rectangle((36, 486, 1244, 684), radius=30, fill=(7, 12, 24, 214))
    draw.text((68, 508), title, font=TITLE_FONT, fill="white")
    y = 562
    for line in lines:
        for part in wrap(line, width=66):
            draw.text((72, y), part, font=BODY_FONT, fill=(228, 234, 247))
            y += 31
        y += 4
    if footer:
        draw.text((72, 650), footer, font=SMALL_FONT, fill=(155, 176, 214))


def composite_shot(canvas: Image.Image, shot: Shot) -> Image.Image:
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    add_top_badge(draw)
    add_overlay(draw, shot.title, shot.lines, shot.footer)
    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def render_shot(shot: Shot) -> Image.Image:
    if shot.path.exists():
        base = Image.open(shot.path).convert("RGB")
        canvas = fit_image_contain(base, SIZE)
    else:
        canvas = Image.new("RGB", SIZE, (12, 18, 34))
    return composite_shot(canvas, shot)


def fit_image_pan(image: Image.Image, size: tuple[int, int], progress: float) -> Image.Image:
    target_w, target_h = size
    target_ratio = target_w / target_h
    src_w, src_h = image.size
    src_ratio = src_w / src_h
    clamped = max(0.0, min(1.0, progress))

    if src_ratio < target_ratio:
        crop_w = src_w
        crop_h = max(1, int(src_w / target_ratio))
        max_y = max(0, src_h - crop_h)
        top = int(max_y * clamped)
        cropped = image.crop((0, top, src_w, top + crop_h))
    elif src_ratio > target_ratio:
        crop_h = src_h
        crop_w = max(1, int(src_h * target_ratio))
        max_x = max(0, src_w - crop_w)
        left = int(max_x * clamped)
        cropped = image.crop((left, 0, left + crop_w, src_h))
    else:
        cropped = image

    return cropped.resize(size, Image.Resampling.LANCZOS)


def build_shot_frames(shot: Shot) -> list[np.ndarray]:
    if not shot.path.exists():
        return frame_sequence(render_shot(shot), shot.seconds * SCREENSHOT_PACE_MULTIPLIER)

    base = Image.open(shot.path).convert("RGB")
    overview = composite_shot(fit_image_contain(base, SIZE), shot)
    total_seconds = shot.seconds * SCREENSHOT_PACE_MULTIPLIER

    # Give each page a quick full-page overview, then a slower readable pan.
    overview_seconds = min(1.2, max(0.75, total_seconds * 0.33))
    focus_seconds = max(1.1, total_seconds - overview_seconds)
    overview_frames = frame_sequence(overview, overview_seconds)

    focus_count = max(1, int(focus_seconds * FPS))
    focus_frames: list[np.ndarray] = []
    for idx in range(focus_count):
        progress = 0.5 if focus_count == 1 else idx / (focus_count - 1)
        focused = fit_image_pan(base, SIZE, progress)
        framed = composite_shot(focused, shot)
        focus_frames.append(np.array(framed))

    return overview_frames + focus_frames


def render_intro() -> Image.Image:
    canvas = Image.new("RGB", SIZE, (10, 16, 30))
    draw = ImageDraw.Draw(canvas)
    for row in range(SIZE[1]):
        alpha = row / SIZE[1]
        color = (
            int(8 + 10 * alpha),
            int(20 + 35 * alpha),
            int(48 + 70 * alpha),
        )
        draw.line((0, row, SIZE[0], row), fill=color)
    draw.ellipse((840, -120, 1380, 420), fill=(28, 92, 148))
    draw.ellipse((-200, 420, 420, 1040), fill=(18, 48, 104))
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    o = ImageDraw.Draw(overlay)
    o.rounded_rectangle((84, 160, 1190, 598), radius=40, fill=(8, 12, 24, 190))
    o.text((126, 220), "CMO.ai Project Walkthrough", font=load_font(FONT_BOLD, 54), fill="white")
    o.text((130, 312), "Welcome, landing, authentication, features, dashboard,", font=BODY_FONT, fill=(220, 232, 246))
    o.text((130, 348), "notifications, agent workspaces, and real generated outputs.", font=BODY_FONT, fill=(220, 232, 246))
    o.text((130, 418), "Built from live screenshots and workspace outputs in this repo.", font=SUBTITLE_FONT, fill=(161, 218, 255))
    o.text((130, 500), "Prepared so you can present the whole product without driving it live.", font=SMALL_FONT, fill=(170, 185, 214))
    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def frame_sequence(image: Image.Image, seconds: float) -> list[np.ndarray]:
    count = max(1, int(seconds * FPS))
    frame = np.array(image)
    return [frame] * count


def fade_frames(from_image: Image.Image, to_image: Image.Image, seconds: float = 0.45) -> list[np.ndarray]:
    count = max(2, int(seconds * FPS))
    a = np.array(from_image).astype(np.float32)
    b = np.array(to_image).astype(np.float32)
    frames: list[np.ndarray] = []
    for idx in range(count):
        alpha = idx / (count - 1)
        blended = (a * (1 - alpha) + b * alpha).clip(0, 255).astype(np.uint8)
        frames.append(blended)
    return frames


def append_video_clip(writer, path: Path, label: str, seconds_limit: float = 5.0) -> None:
    reader = imageio.get_reader(str(path))
    meta = reader.get_meta_data()
    source_fps = float(meta.get("fps") or 24)
    max_frames = max(1, int(seconds_limit * source_fps))

    for index, frame in enumerate(reader):
        if index >= max_frames:
            break
        image = Image.fromarray(frame).convert("RGB")
        canvas = fit_image_cover(image, SIZE)
        overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        add_top_badge(draw)
        draw.rounded_rectangle((42, 590, 1238, 680), radius=28, fill=(8, 12, 24, 218))
        draw.text((72, 612), label, font=BODY_FONT, fill="white")
        merged = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
        writer.append_data(np.array(merged))

    reader.close()


def screenshot(name: str) -> Path:
    capture_path = CAPTURE_DIR / name
    if capture_path.exists():
        return capture_path
    return DASHBOARD_DIR / name


def build_sequence() -> list[Shot]:
    return [
        Shot(
            screenshot("01-welcome.png"),
            "Welcome screen",
            [
                "The project opens with a branded hero that positions CMO.ai as an AI-powered marketing command center.",
                "This is the first impression page for demos and stakeholder walkthroughs.",
            ],
            2.8,
            "Entry point",
        ),
        Shot(
            screenshot("02-landing.png"),
            "Landing experience",
            [
                "The public landing page explains the value proposition, navigation, and product story.",
                "It sets up how visitors move from discovery into product exploration.",
            ],
            2.8,
            "Public marketing page",
        ),
        Shot(
            screenshot("03-pricing.png"),
            "Pricing page",
            [
                "Pricing plans translate the product into a SaaS offer and support the sales narrative.",
            ],
            2.2,
            "Plan comparison",
        ),
        Shot(
            screenshot("04-payment-no-plan.png"),
            "Payment state",
            [
                "The payment route gracefully handles the case where no plan has been chosen yet.",
            ],
            1.8,
            "Guardrail state",
        ),
        Shot(
            screenshot("05-payment-free.png"),
            "Free checkout",
            [
                "The free-plan checkout path is ready for low-friction onboarding.",
            ],
            1.8,
            "Onboarding flow",
        ),
        Shot(
            screenshot("06-payment-pro.png"),
            "Pro checkout",
            [
                "The paid-plan version supports the premium conversion path.",
            ],
            1.8,
            "Upgrade flow",
        ),
        Shot(
            screenshot("07-login.png"),
            "Login page",
            [
                "Authentication starts with a dedicated sign-in screen that matches the product visual language.",
            ],
            2.0,
            "Auth flow",
        ),
        Shot(
            screenshot("08-register.png"),
            "Registration page",
            [
                "New users can create a workspace through the registration flow.",
            ],
            2.0,
            "Auth flow",
        ),
        Shot(
            screenshot("09-forgot-password.png"),
            "Password recovery",
            [
                "The forgot-password page covers account recovery and keeps the auth story complete.",
            ],
            2.0,
            "Auth flow",
        ),
        Shot(
            screenshot("10-verify-otp.png"),
            "OTP verification",
            [
                "A one-time passcode step supports secure password reset verification.",
            ],
            2.0,
            "Auth flow",
        ),
        Shot(
            screenshot("11-reset-password.png"),
            "Reset password",
            [
                "The reset screen closes the recovery loop inside the same user journey.",
            ],
            2.0,
            "Auth flow",
        ),
        Shot(
            screenshot("12-feature-brand-coaching.png"),
            "Feature: Brand coaching",
            [
                "Brand guidance provides the context layer that improves downstream agent outputs.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("13-feature-market-planning.png"),
            "Feature: Market planning",
            [
                "Market planning translates goals into strategic campaign structure before content generation begins.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("14-feature-smart-calendar.png"),
            "Feature: Smart calendar",
            [
                "Scheduling support connects strategy to publishing rhythm and execution timing.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("15-feature-content-generation.png"),
            "Feature: Content generation",
            [
                "The product supports copy, image, and video generation as part of a single workspace.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("16-feature-analytics.png"),
            "Feature: Analytics",
            [
                "Analytics gives the platform a measurement loop rather than stopping at creative production.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("17-feature-campaign-management.png"),
            "Feature: Campaign management",
            [
                "Campaign organization keeps goals, assets, and outputs connected in one product surface.",
            ],
            2.0,
            "Feature detail page",
        ),
        Shot(
            screenshot("26-landing-logged-in.png"),
            "Logged-in landing",
            [
                "After authentication, users can continue into the product with account-aware navigation.",
            ],
            2.2,
            "Transition to app use",
        ),
        Shot(
            screenshot("27-dashboard-campaign-workspace.png"),
            "Main dashboard",
            [
                "The dashboard is the operational heart of the product, combining campaign state, actions, and workspace context.",
            ],
            2.6,
            "Unified workspace",
        ),
        Shot(
            screenshot("28-dashboard-notifications-open.png"),
            "Notification center",
            [
                "Notifications surface alerts and workspace status without pushing the user away from the dashboard.",
            ],
            2.4,
            "Status visibility",
        ),
        Shot(
            screenshot("18-dashboard-orchestrator.png"),
            "Orchestrator workspace",
            [
                "The orchestrator acts as the command center for steering campaigns and choosing the next best workflow.",
            ],
            2.4,
            "Agent workspace",
        ),
        Shot(
            screenshot("19-dashboard-market-planner.png"),
            "Market planner",
            [
                "The planner converts campaign inputs into content pillars, positioning, and strategic direction.",
            ],
            2.4,
            "Agent workspace",
        ),
        Shot(
            screenshot("20-dashboard-brand-coaching.png"),
            "Brand coaching panel",
            [
                "Brand setup and coaching keep outputs aligned with tone, positioning, and campaign context.",
            ],
            2.2,
            "Agent workspace",
        ),
        Shot(
            screenshot("21-dashboard-market-calendar.png"),
            "Calendar panel",
            [
                "The calendar view turns strategy into a timeline that supports execution planning.",
            ],
            2.2,
            "Agent workspace",
        ),
        Shot(
            screenshot("22-dashboard-text-generation.png"),
            "Text generation",
            [
                "Text workflows support posts, campaign copy, and iterative messaging generation.",
            ],
            2.2,
            "Agent workspace",
        ),
        Shot(
            screenshot("29-dashboard-text-history.png"),
            "Text history",
            [
                "Conversation history stays attached to the campaign, making the workflow feel persistent and productized.",
            ],
            2.4,
            "Working state",
        ),
        Shot(
            screenshot("23-dashboard-image-generation.png"),
            "Image generation panel",
            [
                "The image agent runs inside the project dashboard, giving the user a dedicated in-app creative workspace.",
            ],
            3.0,
            "Agent workspace",
        ),
        Shot(
            screenshot("32-dashboard-image-agent-working.png"),
            "Image agent working inside the app",
            [
                "This captured state shows the image workflow actively producing campaign material from within the project itself.",
            ],
            3.8,
            "Working output state",
        ),
        Shot(
            screenshot("24-dashboard-video-generation.png"),
            "Video generation panel",
            [
                "Video generation extends the platform from planning and copy into richer media output.",
            ],
            2.2,
            "Agent workspace",
        ),
        Shot(
            screenshot("25-dashboard-performance-analytics.png"),
            "Performance analytics",
            [
                "The analytics panel closes the loop by bringing campaign measurement back into the workspace.",
            ],
            2.2,
            "Agent workspace",
        ),
        Shot(
            screenshot("30-dashboard-new-campaign-modal.png"),
            "New campaign modal",
            [
                "Campaign creation happens in-context, so setup and action stay inside one product flow.",
            ],
            2.2,
            "Management flow",
        ),
        Shot(
            screenshot("31-dashboard-new-brand-modal.png"),
            "New brand modal",
            [
                "Brand creation is built into the workspace and feeds better downstream generation.",
            ],
            2.2,
            "Management flow",
        ),
    ]


def find_output_clips() -> list[Path]:
    return sorted(
        path for path in OUTPUT_DIR.glob("*.mp4") if path.name != OUT_PATH.name
    )[-3:]


def build_video() -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    intro = render_intro()
    shots = build_sequence()
    sequence = [build_shot_frames(shot) for shot in shots]
    clips = find_output_clips()

    writer = imageio.get_writer(
        str(OUT_PATH),
        fps=FPS,
        codec="libx264",
        format="FFMPEG",
        macro_block_size=16,
    )
    try:
        for frame in frame_sequence(intro, 3.6):
            writer.append_data(frame)

        previous = intro
        for frames_for_shot in sequence:
            first_frame = Image.fromarray(frames_for_shot[0])
            for frame in fade_frames(previous, first_frame):
                writer.append_data(frame)
            for frame in frames_for_shot:
                writer.append_data(frame)
            previous = Image.fromarray(frames_for_shot[-1])

        outro = render_shot(
            Shot(
                screenshot("27-dashboard-campaign-workspace.png"),
                "Real generated outputs",
                [
                    "The next clips are real MP4 files generated by the project and stored in the workspace outputs folder.",
                    "This closes the walkthrough with working media rather than static UI only.",
                ],
                2.6,
                "Output verification",
            )
        )
        for frame in fade_frames(previous, outro):
            writer.append_data(frame)
        for frame in frame_sequence(outro, 2.4):
            writer.append_data(frame)

        for clip in clips:
            append_video_clip(
                writer,
                clip,
                f"Generated output clip: {clip.name}",
                seconds_limit=5.0,
            )

        end_card = render_shot(
            Shot(
                screenshot("01-welcome.png"),
                "Presentation-ready walkthrough",
                [
                    "This video now covers the public experience, authentication, feature pages, dashboard workflows, and generated outputs.",
                    "You can present the product end to end without depending on a stable live demo.",
                ],
                3.0,
                "CMO.ai end-to-end demo",
            )
        )
        for frame in fade_frames(outro, end_card):
            writer.append_data(frame)
        for frame in frame_sequence(end_card, 3.0):
            writer.append_data(frame)
    finally:
        writer.close()

    return OUT_PATH


if __name__ == "__main__":
    output = build_video()
    print(output)
