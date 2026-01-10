"""Generate plate images from prompt files using OpenAI's Images API."""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import traceback
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

from openai import OpenAI

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")


@dataclass(frozen=True)
class PromptTask:
    prompt_path: Path
    slug: str
    variant: str
    output_path: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate plate images from prompt files using OpenAI's Images API."
    )
    parser.add_argument(
        "--prompts-root",
        default=os.path.join("output", "plates_prompts"),
        help="Root directory containing plate prompt files.",
    )
    parser.add_argument(
        "--output-root",
        default=os.path.join("output", "plates_images"),
        help="Output directory for generated images.",
    )
    parser.add_argument(
        "--style-image",
        default="style ref.png",
        help="Path to the style reference image.",
    )
    parser.add_argument(
        "--images-root",
        default="output",
        help="Root directory to search for fish reference images.",
    )
    parser.add_argument(
        "--model",
        default="gpt-image-1",
        help="OpenAI model name for image generation.",
    )
    parser.add_argument(
        "--size",
        default="1024x1024",
        help="Image size for generation (e.g., 1024x1024).",
    )
    parser.add_argument(
        "--offset",
        type=int,
        default=0,
        help="Skip the first N prompts before generation.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of prompts to process.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay in seconds between API attempts.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=4,
        help="Number of retries for failed generations.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging for prompt processing.",
    )
    return parser.parse_args()


def iter_prompt_files(prompts_root: Path) -> Iterable[Path]:
    for path in prompts_root.rglob("*.txt"):
        name = path.name
        if name.endswith("__page.txt") or name.endswith("__game.txt"):
            yield path


def slug_and_variant(prompt_path: Path) -> tuple[str, str]:
    name = prompt_path.name
    if name.endswith("__page.txt"):
        return name[: -len("__page.txt")], "page"
    return name[: -len("__game.txt")], "game"


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def find_fish_reference(slug: str, images_root: Path) -> Optional[Path]:
    images_all = images_root / "images_all"
    for ext in IMAGE_EXTENSIONS:
        candidate = images_all / f"{slug}{ext}"
        if candidate.exists():
            return candidate

    matches = sorted(
        path
        for path in images_root.rglob(f"{slug}.*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    return matches[0] if matches else None


def image_to_bytes(path: Path) -> bytes:
    return path.read_bytes()


def build_tasks(
    prompts_root: Path,
    output_root: Path,
    offset: int,
    limit: Optional[int],
) -> List[PromptTask]:
    prompt_paths = sorted(iter_prompt_files(prompts_root))
    if offset:
        prompt_paths = prompt_paths[offset:]
    if limit is not None:
        prompt_paths = prompt_paths[:limit]

    tasks: List[PromptTask] = []
    for prompt_path in prompt_paths:
        slug, variant = slug_and_variant(prompt_path)
        output_dir = output_root / variant
        output_path = output_dir / f"{slug}.png"
        tasks.append(
            PromptTask(
                prompt_path=prompt_path,
                slug=slug,
                variant=variant,
                output_path=output_path,
            )
        )
    return tasks


def log_attempt(log_path: Path, record: dict) -> None:
    ensure_parent(log_path)
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def generate_image(
    client: OpenAI,
    prompt_text: str,
    style_bytes: bytes,
    fish_bytes: Optional[bytes],
    model: str,
    size: str,
    debug: bool,
) -> bytes:
    image_inputs = [style_bytes]
    if fish_bytes:
        image_inputs.append(fish_bytes)

    response = client.images.edit(
        model=model,
        prompt=prompt_text,
        image=image_inputs,
        size=size,
    )

    if debug:
        response_payload = None
        if hasattr(response, "model_dump"):
            response_payload = response.model_dump()
        elif hasattr(response, "to_dict"):
            response_payload = response.to_dict()
        elif hasattr(response, "__dict__"):
            response_payload = response.__dict__
        if isinstance(response_payload, dict):
            print(f"OpenAI response keys: {list(response_payload.keys())}")
        else:
            print(f"OpenAI response type: {type(response)}")

    image_base64 = None
    if getattr(response, "data", None):
        image_base64 = response.data[0].b64_json

    if not image_base64:
        raise RuntimeError("No image data returned from image generation response.")
    return base64.b64decode(image_base64)


def main() -> int:
    args = parse_args()
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("OPENAI_API_KEY is required to call the API.", file=sys.stderr)
        return 1

    repo_root = Path(__file__).resolve().parent
    prompts_root = repo_root / args.prompts_root
    output_root = repo_root / args.output_root
    images_root = repo_root / args.images_root
    style_image_path = repo_root / args.style_image
    log_path = output_root / "render_log.jsonl"

    if not style_image_path.exists():
        print(f"Style reference image not found: {style_image_path}", file=sys.stderr)
        return 1

    tasks = build_tasks(prompts_root, output_root, args.offset, args.limit)
    total = len(tasks)
    generated = 0
    skipped = 0
    failed = 0

    client = OpenAI(api_key=api_key)
    style_bytes = image_to_bytes(style_image_path)
    style_image_size = style_image_path.stat().st_size
    if args.debug:
        print(f"Resolved style ref path: {style_image_path}")
        print(f"Style ref image size (bytes): {style_image_size}")

    for task in tasks:
        if args.debug:
            print(f"Processing prompt file: {task.prompt_path}")
        if task.output_path.exists():
            log_attempt(
                log_path,
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "slug": task.slug,
                    "variant": task.variant,
                    "fish_ref_found": False,
                    "status": "skipped",
                    "error": None,
                },
            )
            skipped += 1
            continue

        prompt_text = read_text(task.prompt_path)
        fish_ref_path = find_fish_reference(task.slug, images_root)
        fish_bytes = image_to_bytes(fish_ref_path) if fish_ref_path else None
        fish_ref_found = fish_ref_path is not None
        fish_ref_path_value = str(fish_ref_path.resolve()) if fish_ref_path else None

        if args.debug:
            print(f"Resolved fish ref path: {fish_ref_path_value}")
            if fish_ref_path:
                fish_ref_size = fish_ref_path.stat().st_size
                print(f"Fish ref image size (bytes): {fish_ref_size}")

        for attempt in range(1, args.retries + 1):
            try:
                image_bytes = generate_image(
                    client=client,
                    prompt_text=prompt_text,
                    style_bytes=style_bytes,
                    fish_bytes=fish_bytes,
                    model=args.model,
                    size=args.size,
                    debug=args.debug,
                )
                ensure_parent(task.output_path)
                task.output_path.write_bytes(image_bytes)
                log_attempt(
                    log_path,
                    {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "slug": task.slug,
                        "variant": task.variant,
                        "fish_ref_found": fish_ref_found,
                        "status": "generated",
                        "error": None,
                    },
                )
                generated += 1
                time.sleep(args.delay)
                break
            except Exception as exc:  # noqa: BLE001 - keep retries flexible
                traceback_text = traceback.format_exc()
                error_record = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "slug": task.slug,
                    "variant": task.variant,
                    "fish_ref_path": fish_ref_path_value,
                    "fish_ref_found": fish_ref_found,
                    "status": "failed",
                    "error": str(exc),
                    "traceback": traceback_text,
                }
                log_attempt(log_path, error_record)
                print(json.dumps(error_record, ensure_ascii=False))
                print(f"Error generating image for {task.slug} ({task.variant}): {exc}")
                print(traceback_text)
                if args.limit == 1:
                    raise SystemExit(1)
                if attempt == args.retries:
                    failed += 1
                    break
                time.sleep(args.delay)

    print("Summary:")
    print(f"  total prompts: {total}")
    print(f"  generated: {generated}")
    print(f"  skipped: {skipped}")
    print(f"  failed: {failed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
