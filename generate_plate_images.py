"""Generate images from field-guide plate prompt files using OpenAI's Images API."""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Tuple

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

PROMPT_IMAGE_PATTERN = re.compile(r"^- Image (A|B) .*?:\\s*(.+)$")


@dataclass
class PromptEntry:
    prompt_path: Path
    output_path: Path
    label: str


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
            label = f"{kind}: {prompt_rel}"
            entries.append(
                PromptEntry(
                    prompt_path=prompt_path,
                    output_path=output_path,
                    label=label,
                )
            )
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
    parser.add_argument(
        "--gui",
        action="store_true",
        help="Launch a GUI to select prompts to generate.",
    )
    return parser.parse_args()


class PromptSelectorApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Plate Prompt Image Generator")
        self.prompt_index_path = tk.StringVar(
            value=os.path.join(
                "florida_fish_scraper",
                "output",
                "plates_prompts",
                "prompt_index.json",
            )
        )
        self.output_dir = tk.StringVar(
            value=os.path.join(
                "florida_fish_scraper", "output", "plates_images"
            )
        )
        self.model = tk.StringVar(value="gpt-image-1")
        self.size = tk.StringVar(value="1024x1024")
        self.kind = tk.StringVar(value="page")
        self.overwrite = tk.BooleanVar(value=False)
        self.entries: List[PromptEntry] = []
        self.api_key = tk.StringVar(value="")

        self._build_ui()

    def _build_ui(self) -> None:
        frame = ttk.Frame(self.root, padding=12)
        frame.grid(row=0, column=0, sticky="nsew")
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

        ttk.Label(frame, text="Prompt index:").grid(row=0, column=0, sticky="w")
        prompt_entry = ttk.Entry(frame, textvariable=self.prompt_index_path, width=60)
        prompt_entry.grid(row=0, column=1, sticky="ew")
        ttk.Button(frame, text="Browse", command=self._browse_prompt_index).grid(
            row=0, column=2, padx=4
        )

        ttk.Label(frame, text="Output directory:").grid(row=1, column=0, sticky="w")
        output_entry = ttk.Entry(frame, textvariable=self.output_dir, width=60)
        output_entry.grid(row=1, column=1, sticky="ew")
        ttk.Button(frame, text="Browse", command=self._browse_output_dir).grid(
            row=1, column=2, padx=4
        )

        ttk.Label(frame, text="API key:").grid(row=2, column=0, sticky="w")
        ttk.Entry(
            frame, textvariable=self.api_key, width=60, show="•"
        ).grid(row=2, column=1, sticky="ew")

        ttk.Label(frame, text="Kind:").grid(row=3, column=0, sticky="w")
        kind_combo = ttk.Combobox(
            frame,
            textvariable=self.kind,
            values=["page", "game", "both"],
            state="readonly",
            width=12,
        )
        kind_combo.grid(row=3, column=1, sticky="w")

        ttk.Label(frame, text="Model:").grid(row=4, column=0, sticky="w")
        ttk.Entry(frame, textvariable=self.model, width=20).grid(
            row=4, column=1, sticky="w"
        )

        ttk.Label(frame, text="Size:").grid(row=5, column=0, sticky="w")
        ttk.Entry(frame, textvariable=self.size, width=20).grid(
            row=5, column=1, sticky="w"
        )

        ttk.Checkbutton(frame, text="Overwrite existing", variable=self.overwrite).grid(
            row=6, column=1, sticky="w"
        )

        ttk.Button(frame, text="Load prompts", command=self._load_prompts).grid(
            row=7, column=0, pady=8
        )

        self.listbox = tk.Listbox(frame, selectmode=tk.EXTENDED, height=15)
        self.listbox.grid(row=8, column=0, columnspan=3, sticky="nsew")
        frame.rowconfigure(8, weight=1)

        controls = ttk.Frame(frame)
        controls.grid(row=9, column=0, columnspan=3, sticky="ew", pady=6)
        ttk.Button(controls, text="Select all", command=self._select_all).pack(
            side="left", padx=4
        )
        ttk.Button(controls, text="Clear selection", command=self._clear_selection).pack(
            side="left", padx=4
        )
        ttk.Button(controls, text="Generate selected", command=self._generate).pack(
            side="right", padx=4
        )

        frame.columnconfigure(1, weight=1)

    def _browse_prompt_index(self) -> None:
        path = filedialog.askopenfilename(
            title="Select prompt_index.json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
        )
        if path:
            self.prompt_index_path.set(path)

    def _browse_output_dir(self) -> None:
        path = filedialog.askdirectory(title="Select output directory")
        if path:
            self.output_dir.set(path)

    def _load_prompts(self) -> None:
        prompt_index = Path(self.prompt_index_path.get())
        if not prompt_index.exists():
            messagebox.showerror("Missing file", "prompt_index.json not found.")
            return
        kind = self.kind.get()
        kinds = ["page", "game"] if kind == "both" else [kind]
        self.entries = load_prompt_entries(
            prompt_index, Path(self.output_dir.get()), kinds
        )
        self.listbox.delete(0, tk.END)
        for entry in self.entries:
            self.listbox.insert(tk.END, entry.label)

    def _select_all(self) -> None:
        self.listbox.select_set(0, tk.END)

    def _clear_selection(self) -> None:
        self.listbox.select_clear(0, tk.END)

    def _generate(self) -> None:
        selected_indices = list(self.listbox.curselection())
        if not selected_indices:
            messagebox.showinfo("No selection", "Select at least one prompt to run.")
            return
        api_key = self.api_key.get().strip()
        if not api_key:
            messagebox.showerror(
                "Missing API key", "Enter your OpenAI API key to continue."
            )
            return
        entries = [self.entries[i] for i in selected_indices]
        try:
            generate_images(
                entries=entries,
                repo_root=Path(__file__).resolve().parent,
                api_key=api_key,
                model=self.model.get(),
                size=self.size.get(),
                overwrite=self.overwrite.get(),
                dry_run=False,
            )
        except RuntimeError as error:
            messagebox.showerror("Generation failed", str(error))
            return
        messagebox.showinfo("Done", "Selected prompts generated successfully.")


def main() -> int:
    args = parse_args()
    if args.gui:
        root = tk.Tk()
        app = PromptSelectorApp(root)
        root.mainloop()
        return 0

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key and not args.dry_run:
        print("OPENAI_API_KEY is required to call the API.", file=sys.stderr)
        return 1

    repo_root = Path(__file__).resolve().parent
    output_root = Path(args.output_dir)
    prompt_entries: List[PromptEntry] = []

    if args.prompt_file:
        for prompt_file in args.prompt_file:
            prompt_path = Path(prompt_file)
            output_path = output_root / prompt_path.with_suffix(".png").name
            prompt_entries.append(
                PromptEntry(
                    prompt_path=prompt_path,
                    output_path=output_path,
                    label=prompt_path.name,
                )
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
