#!/usr/bin/env python3
"""
Florida Museum – Florida Fishes Gallery scraper
Downloads: image + key info for every fish, and organizes images into habitat folders
using the same habitat categories as the gallery filter dropdown.

What you get:
  output/
    fish_index.csv
    fish_index.json
    images_all/               (one image per fish, downloaded once)
    Anadromous/
    Coastal/
    Diadromous/
    Flowing freshwater/
    Non-flowing freshwater/

Notes:
- Uses Playwright because the gallery is JS/AJAX-driven.
- Handles pagination by navigating to the Next link's href (more reliable than clicking).
- Rate-limited and retry-safe.

Install:
  pip install playwright requests
  playwright install

Run:
  python scrape_florida_fish.py
"""

from __future__ import annotations

import csv
import json
import re
import shutil
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import requests
from playwright.sync_api import sync_playwright


GALLERY_URL = "https://www.floridamuseum.ufl.edu/discover-fish/florida-fishes-gallery/"
BASE_URL = "https://www.floridamuseum.ufl.edu"

HABITATS = [
    "Anadromous",
    "Coastal",
    "Diadromous",
    "Flowing freshwater",
    "Non-flowing freshwater",
]

OUTPUT_DIR = Path("output")
IMAGES_ALL_DIR = OUTPUT_DIR / "images_all"

PAGE_DELAY_SEC = 0.6
IMAGE_DELAY_SEC = 0.4
MAX_RETRIES = 4


@dataclass
class FishRecord:
    url: str
    slug: str
    common_name: str
    scientific_name: str
    habitats: List[str]
    image_url: str
    image_file: str
    page_text: str


def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def safe_mkdir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def robust_goto(page, url: str, wait: str = "domcontentloaded") -> None:
    last_err: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            page.goto(url, wait_until=wait, timeout=60000)
            content = page.content()
            if "502 Bad Gateway" in content:
                raise RuntimeError("502 Bad Gateway")
            return
        except Exception as e:
            last_err = e
            backoff = 1.5 * attempt
            print(f"[WARN] goto failed (attempt {attempt}/{MAX_RETRIES}): {e}. Retrying in {backoff:.1f}s")
            time.sleep(backoff)
    raise RuntimeError(f"Failed to load {url}: {last_err}")


def normalize_href(href: str) -> str:
    if href.startswith("/"):
        return BASE_URL + href
    return href


def _select_option_by_text_prefix(select_loc, desired_prefix: str) -> bool:
    """
    Select an option whose visible text starts with desired_prefix (case-insensitive),
    even if the option label contains counts like 'Coastal (123)'.
    """
    try:
        options = select_loc.locator("option")
        n = options.count()
        desired_prefix_norm = desired_prefix.strip().lower()

        for i in range(n):
            opt = options.nth(i)
            label = (opt.text_content() or "").strip()
            label_norm = re.sub(r"\s+", " ", label).lower()

            if label_norm.startswith(desired_prefix_norm):
                value = opt.get_attribute("value")
                if value is not None:
                    select_loc.select_option(value=value)
                    return True
                # rare fallback
                select_loc.select_option(label=label)
                return True
    except Exception:
        return False

    return False


def try_select_habitat(page, habitat_label: str) -> None:
    page.wait_for_timeout(800)

    candidates = [
        "select[name*='habitat' i]",
        "select[id*='habitat' i]",
        "select[class*='habitat' i]",
        "select.sf-input-select",
        "select",
    ]

    for sel in candidates:
        try:
            selects = page.locator(sel)
            if selects.count() == 0:
                continue

            for i in range(selects.count()):
                s = selects.nth(i)
                if s.locator("option").count() == 0:
                    continue
                if _select_option_by_text_prefix(s, habitat_label):
                    return
        except Exception:
            continue

    raise RuntimeError(
        f"Could not select habitat '{habitat_label}'. "
        "The filter UI may have changed, or the habitat option text differs."
    )


def wait_for_results_stable(page) -> None:
    """
    Best-effort wait for result cards to exist and stop changing.
    Avoids racing the AJAX refresh after selecting filters / paging.
    """
    # Wait for at least one result link to exist (or a bit)
    page.wait_for_timeout(500)
    # Try to detect results area
    for _ in range(20):
        count = page.locator("a[href*='/discover-fish/florida-fishes-gallery/']").count()
        if count > 5:
            break
        page.wait_for_timeout(300)

    # Short stability wait (count unchanged twice)
    last = -1
    stable = 0
    for _ in range(20):
        c = page.locator("a[href*='/discover-fish/florida-fishes-gallery/']").count()
        if c == last and c > 0:
            stable += 1
        else:
            stable = 0
            last = c
        if stable >= 2:
            break
        page.wait_for_timeout(250)


def extract_fish_links_from_gallery(page) -> List[str]:
    link_selectors = [
        ".search-filter-results a[href*='florida-fishes-gallery']",
        ".search-filter-results a[href*='/discover-fish/florida-fishes-gallery/']",
        ".c-search-filter__title a",
        "a[href*='/discover-fish/florida-fishes-gallery/']",
    ]

    urls: Set[str] = set()
    for sel in link_selectors:
        try:
            for a in page.locator(sel).all():
                href = a.get_attribute("href")
                if not href:
                    continue
                if "/discover-fish/florida-fishes-gallery/" not in href:
                    continue
                href = normalize_href(href).split("#")[0]
                if href.rstrip("/") == GALLERY_URL.rstrip("/"):
                    continue
                urls.add(href)
        except Exception:
            continue

    return sorted(urls)


def get_next_page_href(page) -> Optional[str]:
    """
    Return absolute href for the 'Next' pagination link, or None if not present.
    """
    loc = page.locator("a.next.page-numbers, a:has-text('Next')").first
    if loc.count() == 0:
        return None
    href = (loc.get_attribute("href") or "").strip()
    if not href:
        return None
    return normalize_href(href)


def extract_all_gallery_links_paginated(page) -> List[str]:
    """
    Paginate by following the 'Next' link href (do not click).
    This avoids visibility / scroll issues.
    """
    urls: Set[str] = set()
    seen_pages: Set[str] = set()

    wait_for_results_stable(page)
    current = page.url.split("#")[0]

    for _ in range(400):  # safety cap
        if current in seen_pages:
            break
        seen_pages.add(current)

        for u in extract_fish_links_from_gallery(page):
            urls.add(u)

        nxt = get_next_page_href(page)
        if not nxt:
            break

        # Go to next page URL
        robust_goto(page, nxt)
        wait_for_results_stable(page)
        current = page.url.split("#")[0]

    return sorted(urls)


def best_image_url_from_img(img_loc) -> str:
    src = (img_loc.get_attribute("src") or "").strip()
    data_src = (img_loc.get_attribute("data-src") or "").strip()
    srcset = (img_loc.get_attribute("srcset") or "").strip()

    if srcset:
        parts = [p.strip() for p in srcset.split(",") if p.strip()]
        urls = []
        for p in parts:
            token = p.split(" ")[0].strip()
            if token.startswith("http"):
                urls.append(token)
        if urls:
            return urls[-1]

    if src.startswith("http"):
        return src
    if data_src.startswith("http"):
        return data_src
    return ""


def extract_fish_info(page) -> Tuple[str, str, str, str]:
    common = ""
    for sel in ["h1", "header h1", "article h1"]:
        try:
            t = page.locator(sel).first.text_content(timeout=2000)
            if t and len(t.strip()) >= 2:
                common = t.strip()
                break
        except Exception:
            continue

    sci = ""
    sci_candidates = [
        ".scientific-name",
        ".c-scientific-name",
        "header em",
        "header i",
        "article em",
        "article i",
        "em",
        "i",
    ]
    for sel in sci_candidates:
        try:
            loc = page.locator(sel)
            if loc.count() == 0:
                continue
            for i in range(min(loc.count(), 30)):
                t = (loc.nth(i).text_content() or "").strip()
                if re.match(r"^[A-Z][a-z]+ [a-z-]+", t):
                    sci = t
                    break
            if sci:
                break
        except Exception:
            continue

    img_url = ""
    img_selectors = [
        "article img",
        "figure img",
        ".wp-post-image",
        "img.attachment-full",
        "img[src*='wp-content/uploads']",
    ]
    for sel in img_selectors:
        try:
            loc = page.locator(sel)
            if loc.count() == 0:
                continue
            for i in range(min(loc.count(), 15)):
                candidate = best_image_url_from_img(loc.nth(i))
                if candidate:
                    img_url = candidate
                    break
            if img_url:
                break
        except Exception:
            continue

    page_text = ""
    for sel in ["article", ".entry-content", "main", "body"]:
        try:
            t = page.locator(sel).first.inner_text(timeout=3000)
            if t and len(t.strip()) > 200:
                page_text = re.sub(r"\n{3,}", "\n\n", t.strip())
                break
        except Exception:
            continue

    if not common:
        common = "Unknown"
    if not sci:
        sci = ""
    if not img_url:
        img_url = ""

    return common, sci, img_url, page_text


def download_file(url: str, dst: Path) -> None:
    last_err: Optional[Exception] = None
    headers = {"User-Agent": "Mozilla/5.0 (compatible; research scraper)"}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = requests.get(url, headers=headers, timeout=60)
            if r.status_code >= 400:
                raise RuntimeError(f"HTTP {r.status_code}")
            dst.write_bytes(r.content)
            return
        except Exception as e:
            last_err = e
            backoff = 1.3 * attempt
            print(f"[WARN] download failed (attempt {attempt}/{MAX_RETRIES}) {url}: {e}. Retrying in {backoff:.1f}s")
            time.sleep(backoff)

    raise RuntimeError(f"Failed to download {url}: {last_err}")


def ensure_habitat_copy(master_image: Path, habitat_dir: Path, filename: str) -> str:
    safe_mkdir(habitat_dir)
    dst = habitat_dir / filename
    if not dst.exists():
        shutil.copy2(master_image, dst)
    return str(dst)


def main() -> None:
    safe_mkdir(OUTPUT_DIR)
    safe_mkdir(IMAGES_ALL_DIR)

    all_fish: Dict[str, FishRecord] = {}
    habitat_to_urls: Dict[str, List[str]] = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"[INFO] Loading gallery: {GALLERY_URL}")
        robust_goto(page, GALLERY_URL)

        for habitat in HABITATS:
            print(f"\n[INFO] Selecting habitat: {habitat}")
            robust_goto(page, GALLERY_URL)

            try_select_habitat(page, habitat)
            wait_for_results_stable(page)

            urls = extract_all_gallery_links_paginated(page)
            habitat_to_urls[habitat] = urls
            print(f"[INFO] Found {len(urls)} fish links for habitat '{habitat}'")

        all_urls: List[str] = sorted({u for urls in habitat_to_urls.values() for u in urls})
        print(f"\n[INFO] Total unique fish pages across all habitats: {len(all_urls)}")

        for idx, url in enumerate(all_urls, start=1):
            print(f"[INFO] ({idx}/{len(all_urls)}) Fish page: {url}")
            robust_goto(page, url)

            common, sci, img_url, page_text = extract_fish_info(page)
            slug = slugify(common) or slugify(url.rstrip("/").split("/")[-1])

            fish_habitats = [h for h, urls in habitat_to_urls.items() if url in urls]

            image_file = ""
            if img_url:
                ext = Path(img_url.split("?")[0]).suffix.lower()
                if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
                    ext = ".jpg"
                master_name = f"{slug}{ext}"
                master_path = IMAGES_ALL_DIR / master_name
                if not master_path.exists():
                    time.sleep(IMAGE_DELAY_SEC)
                    download_file(img_url, master_path)
                image_file = str(master_path)

            all_fish[url] = FishRecord(
                url=url,
                slug=slug,
                common_name=common,
                scientific_name=sci,
                habitats=fish_habitats,
                image_url=img_url,
                image_file=image_file,
                page_text=page_text,
            )

            time.sleep(PAGE_DELAY_SEC)

        browser.close()

    for habitat, urls in habitat_to_urls.items():
        habitat_dir = OUTPUT_DIR / habitat
        safe_mkdir(habitat_dir)
        for url in urls:
            rec = all_fish.get(url)
            if not rec or not rec.image_file:
                continue
            master_path = Path(rec.image_file)
            filename = f"{rec.slug}{master_path.suffix}"
            ensure_habitat_copy(master_path, habitat_dir, filename)

    csv_path = OUTPUT_DIR / "fish_index.csv"
    json_path = OUTPUT_DIR / "fish_index.json"

    rows = [asdict(r) for r in all_fish.values()]
    rows = sorted(rows, key=lambda d: (d.get("common_name") or "", d.get("scientific_name") or ""))

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "common_name",
                "scientific_name",
                "url",
                "habitats",
                "image_url",
                "image_file",
                "slug",
                "page_text",
            ],
        )
        w.writeheader()
        for d in rows:
            d2 = dict(d)
            d2["habitats"] = "; ".join(d2.get("habitats") or [])
            w.writerow(d2)

    json_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n[DONE] Output written to:")
    print(f"  - {csv_path}")
    print(f"  - {json_path}")
    print(f"  - images: {OUTPUT_DIR}/ (habitat folders) and {IMAGES_ALL_DIR}/ (master images)")


if __name__ == "__main__":
    main()
