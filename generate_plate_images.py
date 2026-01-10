"""Generate images from field-guide plate prompt files using OpenAI's Images API."""

from __future__ import annotations

import argparse
import base64
import getpass
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

PROMPT_IMAGE_PATTERN = re.compile(r"^- Image (A|B) .*?:\\s*(.+)$")


@dataclass
class PromptEntry:
    prompt_path: Path
    output_path: Path


def read_prompt(prompt_path: Path) -> str:
    return prompt_path.read_text(encoding="utf-8").strip()


def find_reference_images(prompt_text: str, repo_root: Path) -> List[Path]:
    images: List[Path] = []
    for line in prompt_text.splitlines():
        match = PROMPT_IMAGE_PATTERN.match(line.strip())
        if not match:
            continue
        image_path = (repo_root / match.group(2)).resolve()
        if image_path.exists():
            images.append(image_path)
    return images


def load_prompt_entries(
    prompt_index_path: Path,
    output_root: Path,
    kinds: Iterable[str],
) -> List[PromptEntry]:
    data = json.loads(prompt_index_path.read_text(encoding="utf-8"))
    entries: List[PromptEntry] = []
    for record in data:
        prompt_files = record.get("prompt_files", {})
        for kind in kinds:
            prompt_rel = prompt_files.get(kind)
            if not prompt_rel:
                continue
            prompt_path = prompt_index_path.parent / prompt_rel
            output_path = output_root / Path(prompt_rel).with_suffix(".png")
            entries.append(PromptEntry(prompt_path=prompt_path, output_path=output_path))
    return entries


def build_multipart_payload(
    fields: List[Tuple[str, str]],
    image_paths: List[Path],
    boundary: str,
) -> bytes:
    body: List[bytes] = []

    def add_line(line: str) -> None:
        body.append(line.encode("utf-8"))

    for name, value in fields:
        add_line(f"--{boundary}")
        add_line(f'Content-Disposition: form-data; name="{name}"')
        add_line("")
        add_line(value)

    for image_path in image_paths:
        mime_type, _ = mimetypes.guess_type(str(image_path))
        mime_type = mime_type or "application/octet-stream"
        add_line(f"--{boundary}")
        add_line(
            'Content-Disposition: form-data; name="image[]"; filename="{}"'.format(
                image_path.name
            )
        )
        add_line(f"Content-Type: {mime_type}")
        add_line("")
        body.append(image_path.read_bytes())

    add_line(f"--{boundary}--")
    add_line("")
    return b"\r\n".join(body)


def request_image(
    api_key: str,
    prompt_text: str,
    image_paths: List[Path],
    model: str,
    size: str,
) -> bytes:
    if image_paths:
        boundary = "openai-boundary"
        fields = [
            ("model", model),
            ("prompt", prompt_text),
            ("size", size),
            ("n", "1"),
            ("response_format", "b64_json"),
        ]
        payload = build_multipart_payload(fields, image_paths, boundary)
        request = urllib.request.Request(
            "https://api.openai.com/v1/images/edits",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
        )
    else:
        payload = json.dumps(
            {
                "model": model,
                "prompt": prompt_text,
                "size": size,
                "n": 1,
                "response_format": "b64_json",
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            "https://api.openai.com/v1/images",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
    with urllib.request.urlopen(request) as response:
        data = json.loads(response.read().decode("utf-8"))
    return base64.b64decode(data["data"][0]["b64_json"])


def validate_api_key(api_key: str) -> None:
    request = urllib.request.Request(
        "https://api.openai.com/v1/models",
        method="GET",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    try:
        with urllib.request.urlopen(request) as response:
            response.read()
    except urllib.error.HTTPError as err:
        error_body = err.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"OpenAI API key validation failed: {error_body}"
        ) from err


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def generate_images(
    entries: List[PromptEntry],
    repo_root: Path,
    api_key: str,
    model: str,
    size: str,
    overwrite: bool,
    dry_run: bool,
) -> None:
    for entry in entries:
        if entry.output_path.exists() and not overwrite:
            print(f"Skipping existing image: {entry.output_path}")
            continue
        prompt_text = read_prompt(entry.prompt_path)
        image_paths = find_reference_images(prompt_text, repo_root)
        if dry_run:
            print(f"[DRY RUN] {entry.prompt_path} -> {entry.output_path}")
            print(f"  references: {[str(p) for p in image_paths]}")
            continue
        ensure_parent(entry.output_path)
        try:
            image_bytes = request_image(api_key, prompt_text, image_paths, model, size)
        except urllib.error.HTTPError as err:
            error_body = err.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"OpenAI API request failed for {entry.prompt_path}: {error_body}"
            ) from err
        entry.output_path.write_bytes(image_bytes)
        print(f"Wrote image: {entry.output_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate images from field-guide prompt files."
    )
    parser.add_argument(
        "--prompt-index",
        default=os.path.join(
            "florida_fish_scraper", "output", "plates_prompts", "prompt_index.json"
        ),
        help="Path to prompt_index.json generated by build_plate_prompts.py",
    )
    parser.add_argument(
        "--prompt-file",
        action="append",
        default=[],
        help="Generate a single image from a prompt file (repeatable).",
    )
    parser.add_argument(
        "--output-dir",
        default=os.path.join(
            "florida_fish_scraper", "output", "plates_images"
        ),
        help="Output directory for generated images.",
    )
    parser.add_argument(
        "--kind",
        choices=["page", "game", "both"],
        default="page",
        help="Which prompt variants to render from prompt_index.json.",
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
        "--overwrite",
        action="store_true",
        help="Overwrite existing image outputs.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned work without calling the API.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key and not args.dry_run:
        api_key = getpass.getpass("Enter OPENAI_API_KEY: ").strip()
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY is required to call the API.", file=sys.stderr)
        return 1
    if api_key and not args.dry_run:
        try:
            validate_api_key(api_key)
        except RuntimeError as err:
            print(str(err), file=sys.stderr)
            return 1

    repo_root = Path(__file__).resolve().parent
    output_root = Path(args.output_dir)
    prompt_entries: List[PromptEntry] = []

    if args.prompt_file:
        for prompt_file in args.prompt_file:
            prompt_path = Path(prompt_file)
            output_path = output_root / prompt_path.with_suffix(".png").name
            prompt_entries.append(
                PromptEntry(prompt_path=prompt_path, output_path=output_path)
            )
    else:
        kinds = ["page", "game"] if args.kind == "both" else [args.kind]
        prompt_index_path = Path(args.prompt_index)
        prompt_entries = load_prompt_entries(prompt_index_path, output_root, kinds)

    generate_images(
        entries=prompt_entries,
        repo_root=repo_root,
        api_key=api_key,
        model=args.model,
        size=args.size,
        overwrite=args.overwrite,
        dry_run=args.dry_run,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
