#!/usr/bin/env python3

from pathlib import Path
import re

# === CONFIG ===
ROOT_DIR = Path("output")   # this contains habitat folders
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
DRY_RUN = False              # set to False to actually rename

# Matches: florida-museum-gulf-sturgeon-4e202fc0.jpg
FILENAME_RE = re.compile(
    r"^florida-museum-(.+?)-[a-f0-9]{6,}\.(jpg|jpeg|png|webp)$",
    re.IGNORECASE,
)

def rename_folder(folder: Path):
    print(f"\n📁 Processing: {folder.name}")
    seen_names = {}

    for img in folder.iterdir():
        if img.suffix.lower() not in IMAGE_EXTS or not img.is_file():
            continue

        m = FILENAME_RE.match(img.name)
        if not m:
            print(f"  ⚠️  Skipped (pattern mismatch): {img.name}")
            continue

        fish_slug = m.group(1)
        fish_name = fish_slug.replace("-", " ").strip()

        new_name = f"{fish_name}{img.suffix.lower()}"
        target = folder / new_name

        # Handle duplicates in same folder
        if target.exists():
            count = seen_names.get(new_name, 1) + 1
            seen_names[new_name] = count
            target = folder / f"{fish_name}-{count}{img.suffix.lower()}"
        else:
            seen_names[new_name] = 1

        if DRY_RUN:
            print(f"  DRY  {img.name}  →  {target.name}")
        else:
            img.rename(target)
            print(f"  OK   {img.name}  →  {target.name}")

def main():
    for sub in ROOT_DIR.iterdir():
        if sub.is_dir() and sub.name not in {"images_all"}:
            rename_folder(sub)

    print("\n✅ Done.")
    if DRY_RUN:
        print("⚠️  DRY_RUN=True — no files were renamed")

if __name__ == "__main__":
    main()

