#!/usr/bin/env python3
"""Generate field-guide plate prompts for Florida fish."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
from dataclasses import dataclass
from typing import Iterable, List, Optional
from urllib.parse import urlparse


ANATOMY_ALLOWLIST = {
    "adipose",
    "anal",
    "back",
    "band",
    "bands",
    "barbel",
    "barbels",
    "belly",
    "blotch",
    "blotches",
    "body",
    "brown",
    "caudal",
    "color",
    "coloration",
    "crest",
    "dorsal",
    "eye",
    "eyes",
    "fin",
    "fins",
    "flank",
    "forked",
    "gill",
    "gills",
    "gray",
    "grey",
    "green",
    "head",
    "hooked",
    "iridescent",
    "jaw",
    "keel",
    "lateral",
    "line",
    "lines",
    "lunate",
    "maxilla",
    "mouth",
    "nostril",
    "orange",
    "opercular",
    "operculum",
    "pectoral",
    "pelvic",
    "pointed",
    "pores",
    "premaxilla",
    "ray",
    "rays",
    "red",
    "ridge",
    "rounded",
    "scale",
    "scales",
    "scute",
    "scutes",
    "silvery",
    "silver",
    "snout",
    "spine",
    "spines",
    "spot",
    "spots",
    "stripe",
    "stripes",
    "tail",
    "teeth",
    "tooth",
    "white",
    "yellow",
}

MONTHS_ALLOWLIST = {
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
}

UNITS_ALLOWLIST = {
    "cm",
    "mm",
    "m",
    "ft",
    "in",
    "kg",
    "g",
    "lb",
    "lbs",
    "oz",
}

KEYWORD_HINTS = {
    "spot",
    "spots",
    "stripe",
    "stripes",
    "band",
    "bands",
    "blotch",
    "blotches",
    "fin",
    "fins",
    "tail",
    "caudal",
    "dorsal",
    "anal",
    "pectoral",
    "pelvic",
    "mouth",
    "teeth",
    "snout",
    "color",
    "coloration",
    "body",
    "head",
    "scales",
    "scale",
    "lateral",
    "line",
    "barbel",
    "barbels",
    "operculum",
    "forked",
    "rounded",
}

SCIENTIFIC_REGEX = re.compile(r"^[A-Z][a-z]+\s[a-z]+$")


@dataclass
class FigureDecision:
    count: int
    mode: str
    labels: List[str]


@dataclass
class WordIssue:
    token: str
    source: str


def find_input_file(repo_root: str) -> str:
    candidates = [
        os.path.join(repo_root, "output", "fish_index.json"),
        os.path.join(repo_root, "fish_index.json"),
        os.path.join(repo_root, "florida_fish_scraper", "output", "fish_index.json"),
        os.path.join(repo_root, "florida_fish_scraper", "fish_index.json"),
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    raise FileNotFoundError("Could not locate fish_index.json in expected locations.")


def last_url_segment(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    segments = [segment for segment in path.split("/") if segment]
    return segments[-1] if segments else "unknown"


def display_common_name(url: str) -> str:
    segment = last_url_segment(url)
    return segment.replace("-", " ").title()


def fish_id_from_url(url: str) -> str:
    segment = last_url_segment(url)
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return f"{segment}-{digest}"


def decide_figures(page_text: str) -> FigureDecision:
    text = page_text.lower()
    has_juvenile = re.search(r"\bjuvenile\b", text) is not None
    has_adult = re.search(r"\badult\b", text) is not None
    if has_juvenile and has_adult:
        return FigureDecision(count=2, mode="adult_juvenile", labels=["Adult", "Juvenile"])
    has_male = re.search(r"\bmales?\b", text) is not None
    has_female = re.search(r"\bfemales?\b", text) is not None
    if has_male and has_female:
        return FigureDecision(count=2, mode="male_female", labels=["Male", "Female"])
    return FigureDecision(count=1, mode="single", labels=[])


def sentence_split(text: str) -> List[str]:
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    cleaned = []
    for part in parts:
        stripped = part.strip()
        if stripped:
            cleaned.append(stripped)
    return cleaned


def normalize_sentence(sentence: str) -> str:
    sentence = re.sub(r"\s+", " ", sentence)
    sentence = re.sub(r"^["'“”]+", "", sentence)
    sentence = re.sub(r"^[Tt]he\s+", "", sentence)
    sentence = sentence.strip(" \t\n\r\f\v\"'“”")
    return sentence


def extract_callouts(
    page_text: str,
    display_name: str,
    scientific_name: str,
    limit: int = 5,
) -> List[str]:
    if not page_text:
        return []
    callouts: List[str] = []
    sentences = sentence_split(page_text)
    display_lower = display_name.lower()
    scientific_lower = scientific_name.lower()
    for sentence in sentences:
        lowered = sentence.lower()
        if display_lower and display_lower in lowered:
            continue
        if scientific_lower and scientific_lower in lowered:
            continue
        if not any(keyword in lowered for keyword in KEYWORD_HINTS):
            continue
        cleaned = normalize_sentence(sentence)
        tokens = re.findall(r"[A-Za-z0-9']+", cleaned)
        if not tokens:
            continue
        short_tokens = tokens[:10]
        callout = " ".join(short_tokens)
        if callout and callout not in callouts:
            callouts.append(callout)
        if len(callouts) >= limit:
            break
    return callouts


def extract_footer(page_text: str) -> Optional[str]:
    sentences = sentence_split(page_text)
    for sentence in sentences:
        cleaned = normalize_sentence(sentence)
        tokens = re.findall(r"[A-Za-z0-9']+", cleaned)
        if 4 <= len(tokens) <= 18:
            return " ".join(tokens)
    return None


def get_wordfreq():
    if importlib.util.find_spec("wordfreq") is None:
        return None
    import wordfreq

    return wordfreq


def get_spellchecker():
    if importlib.util.find_spec("spellchecker") is None:
        return None
    from spellchecker import SpellChecker

    return SpellChecker()


def is_token_allowed(token: str) -> bool:
    if token in ANATOMY_ALLOWLIST:
        return True
    if token in MONTHS_ALLOWLIST:
        return True
    if token in UNITS_ALLOWLIST:
        return True
    if token.isdigit():
        return True
    if any(char.isdigit() for char in token):
        return True
    return False


def token_has_vowel(token: str) -> bool:
    return re.search(r"[aeiouy]", token) is not None


def find_suspicious_tokens(
    phrases: Iterable[str],
    wordfreq_module,
    spellchecker,
) -> List[WordIssue]:
    issues: List[WordIssue] = []
    for phrase in phrases:
        for raw_token in re.findall(r"[A-Za-z0-9']+", phrase):
            token = raw_token.lower()
            if not token:
                continue
            if is_token_allowed(token):
                continue
            if SCIENTIFIC_REGEX.match(raw_token):
                continue
            if wordfreq_module is not None:
                if wordfreq_module.zipf_frequency(token, "en") >= 2.5:
                    continue
            if spellchecker is not None:
                if token in spellchecker:
                    continue
            if wordfreq_module is None and spellchecker is None:
                if len(token) < 5:
                    continue
                if token_has_vowel(token):
                    continue
            issues.append(WordIssue(token=raw_token, source=phrase))
    return issues


def sanitize_habitats(habitats: Optional[Iterable[str]]) -> List[str]:
    if not habitats:
        return []
    return [str(habitat).strip() for habitat in habitats if str(habitat).strip()]


def format_text_rules(allowed_strings: List[str]) -> str:
    if not allowed_strings:
        return "TEXT RULES:\n- Render no text."
    lines = ["TEXT RULES:", "- Render only the exact strings listed below."]
    for item in allowed_strings:
        lines.append(f"- {item}")
    lines.append("- If rendering cleanly fails, omit that label.")
    return "\n".join(lines)


def build_page_prompt(
    display_name: str,
    scientific_name: str,
    habitats: List[str],
    figure: FigureDecision,
    callouts: List[str],
    footer: Optional[str],
    reference_image_url: Optional[str],
) -> str:
    habitat_badge = ", ".join(habitats) if habitats else ""
    allowed_strings: List[str] = [display_name]
    if scientific_name:
        allowed_strings.append(scientific_name)
    if habitat_badge:
        allowed_strings.append(habitat_badge)
    allowed_strings.extend(callouts)
    if footer:
        allowed_strings.append(footer)
    if figure.labels:
        allowed_strings.extend(figure.labels)

    layout_lines = [
        "Create a bird field-guide callout card style illustration plate.",
        "Clean parchment background, thin ink border, subtle watercolor texture.",
        f"Title centered at top: {display_name}.",
        "Italic subtitle under the title with the scientific name.",
    ]
    if habitat_badge:
        layout_lines.append(f"Habitat badge/tag: {habitat_badge}.")
    if figure.count == 2:
        layout_lines.append(
            f"Two fish figures stacked vertically: {figure.labels[0]} (top), {figure.labels[1]} (bottom)."
        )
    else:
        layout_lines.append("Single fish figure centered.")
    if callouts:
        layout_lines.append(
            "Add up to five callout labels with thin leader lines: "
            + "; ".join(callouts)
            + "."
        )
    else:
        layout_lines.append("No callout labels.")
    if footer:
        layout_lines.append(f"Short footer note at bottom: {footer}.")

    if reference_image_url:
        layout_lines.append("")
        layout_lines.extend(
            [
                "Reference image:",
                "A reference image is provided alongside this prompt.",
                "Use it ONLY for anatomical accuracy (body proportions, fin placement, markings).",
                "Do NOT copy pose, camera angle, lighting, background, framing, or composition.",
                "Create a new, original field-guide illustration.",
            ]
        )

    rules = format_text_rules(allowed_strings)
    return "\n".join(layout_lines + ["", rules])


def footer_is_revealing(footer: str, display_name: str, scientific_name: str) -> bool:
    footer_lower = footer.lower()
    if display_name and display_name.lower() in footer_lower:
        return True
    if scientific_name and scientific_name.lower() in footer_lower:
        return True
    return False


def build_game_prompt(
    figure: FigureDecision,
    callouts: List[str],
    footer: Optional[str],
    reference_image_url: Optional[str],
) -> str:
    allowed_strings: List[str] = []
    allowed_strings.extend(callouts)
    if footer:
        allowed_strings.append(footer)
    if figure.labels:
        allowed_strings.extend(figure.labels)

    layout_lines = [
        "Create a bird field-guide callout card style illustration plate.",
        "Clean parchment background, thin ink border, subtle watercolor texture.",
        "Do NOT include the common name, scientific name, or habitat badge.",
    ]
    if figure.count == 2:
        layout_lines.append(
            f"Two fish figures stacked vertically: {figure.labels[0]} (top), {figure.labels[1]} (bottom)."
        )
    else:
        layout_lines.append("Single fish figure centered.")
    if callouts:
        layout_lines.append(
            "Add up to five callout labels with thin leader lines: "
            + "; ".join(callouts)
            + "."
        )
    else:
        layout_lines.append("No callout labels.")
    if footer:
        layout_lines.append(f"Short footer note at bottom: {footer}.")

    if reference_image_url:
        layout_lines.append("")
        layout_lines.extend(
            [
                "Reference image:",
                "A reference image is provided alongside this prompt.",
                "Use it ONLY for anatomical accuracy (body proportions, fin placement, markings).",
                "Do NOT copy pose, camera angle, lighting, background, framing, or composition.",
                "Create a new, original field-guide illustration.",
            ]
        )

    rules = format_text_rules(allowed_strings)
    return "\n".join(layout_lines + ["", rules])


def main() -> None:
    parser = argparse.ArgumentParser(description="Build field-guide plate prompts.")
    parser.add_argument("--offset", type=int, default=0, help="Start offset in fish list")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of fish")
    args = parser.parse_args()

    repo_root = os.path.dirname(os.path.abspath(__file__))
    input_file = find_input_file(repo_root)

    with open(input_file, "r", encoding="utf-8") as handle:
        records = json.load(handle)

    start = max(args.offset, 0)
    end = start + args.limit if args.limit is not None else len(records)
    subset = records[start:end]

    output_root = os.path.join(repo_root, "output", "plates_prompts")
    prompts_dir = os.path.join(output_root, "prompts")
    os.makedirs(prompts_dir, exist_ok=True)

    word_issues_path = os.path.join(output_root, "word_issues.log")
    wordfreq_module = get_wordfreq()
    spellchecker = get_spellchecker()

    prompt_index = []
    needs_review_count = 0

    with open(word_issues_path, "w", encoding="utf-8") as issues_handle:
        for record in subset:
            url = record.get("url", "")
            scientific_name = record.get("scientific_name", "")
            habitats = sanitize_habitats(record.get("habitats"))
            page_text = record.get("page_text", "") or ""
            reference_image_url = record.get("image_url") or None

            display_name = display_common_name(url)
            fish_id = fish_id_from_url(url)

            figure = decide_figures(page_text)

            callouts = extract_callouts(page_text, display_name, scientific_name)
            footer = extract_footer(page_text)

            safe_footer = footer
            if footer and footer_is_revealing(footer, display_name, scientific_name):
                safe_footer = None

            page_prompt = build_page_prompt(
                display_name,
                scientific_name,
                habitats,
                figure,
                callouts,
                footer,
                reference_image_url,
            )
            game_prompt = build_game_prompt(
                figure,
                callouts,
                safe_footer,
                reference_image_url,
            )

            page_path = os.path.join(prompts_dir, f"{fish_id}__page.txt")
            game_path = os.path.join(prompts_dir, f"{fish_id}__game.txt")

            with open(page_path, "w", encoding="utf-8") as handle:
                handle.write(page_prompt)
            with open(game_path, "w", encoding="utf-8") as handle:
                handle.write(game_prompt)

            phrases_to_check = list(callouts)
            if footer:
                phrases_to_check.append(footer)
            issues = find_suspicious_tokens(phrases_to_check, wordfreq_module, spellchecker)
            issues_payload = []
            if issues:
                needs_review_count += 1
                issues_handle.write(f"{fish_id} ({display_name})\n")
                for issue in issues:
                    issues_handle.write(f"  - {issue.token} :: {issue.source}\n")
                    issues_payload.append({"token": issue.token, "source": issue.source})
                issues_handle.write("\n")

            prompt_index.append(
                {
                    "fish_id": fish_id,
                    "url": url,
                    "display_common_name": display_name,
                    "scientific_name": scientific_name,
                    "habitats": habitats,
                    "figure": {
                        "count": figure.count,
                        "mode": figure.mode,
                        "labels": figure.labels,
                    },
                    "callouts": callouts,
                    "footer": footer,
                    "reference_image_url": reference_image_url,
                    "prompt_files": {
                        "page": os.path.relpath(page_path, output_root),
                        "game": os.path.relpath(game_path, output_root),
                    },
                    "needs_review": bool(issues),
                    "issues": issues_payload,
                }
            )

    stats = {
        "processed": len(subset),
        "offset": start,
        "limit": args.limit,
        "needs_review": needs_review_count,
        "input_file": os.path.relpath(input_file, repo_root),
    }

    with open(os.path.join(output_root, "prompt_index.json"), "w", encoding="utf-8") as handle:
        json.dump(prompt_index, handle, indent=2, ensure_ascii=False)
    with open(os.path.join(output_root, "stats.json"), "w", encoding="utf-8") as handle:
        json.dump(stats, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
