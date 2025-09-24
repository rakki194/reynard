"""Caption post-processing pipeline.

Modular, configurable, and safe-by-default post-processing for captions.
"""

from __future__ import annotations

from typing import Any


def post_process_caption(
    caption: str,
    generator_name: str,
    settings: dict[str, Any] | None = None,
) -> str:
    if not caption:
        return caption

    if (
        not settings
        or not isinstance(settings, dict)
        or not settings.get("enabled", True)
    ):
        if generator_name in ["jtp2", "wdv3"]:
            return caption.replace("_", " ")
        return caption

    pipeline: list[str] = settings.get("pipeline") or [
        "replace_underscores",
        "trim_whitespace",
        "remove_duplicate_spaces",
        "normalize_punctuation_spacing",
        "case_conversion",
        "ensure_terminal_punctuation",
    ]

    rules: dict[str, Any] = {
        "replace_underscores": True,
        "case_conversion": "none",
        "trim_whitespace": True,
        "remove_duplicate_spaces": True,
        "ensure_terminal_punctuation": False,
        "normalize_punctuation_spacing": True,
    }

    rules.update(settings.get("rules") or {})
    gen_overrides = (settings.get("overrides") or {}).get(generator_name)
    if isinstance(gen_overrides, dict):
        rules.update(gen_overrides)

    for step in pipeline:
        if step == "replace_underscores" and rules.get("replace_underscores"):
            if generator_name in ["jtp2", "wdv3"]:
                caption = caption.replace("_", " ")
        elif step == "trim_whitespace" and rules.get("trim_whitespace"):
            caption = caption.strip()
        elif step == "remove_duplicate_spaces" and rules.get("remove_duplicate_spaces"):
            import re as _re

            caption = _re.sub(r"\s+", " ", caption)
        elif step == "normalize_punctuation_spacing" and rules.get(
            "normalize_punctuation_spacing",
        ):
            caption = _normalize_spacing(caption)
        elif step == "case_conversion":
            caption = _apply_case(
                caption, (rules.get("case_conversion") or "none").lower(),
            )
        elif step == "ensure_terminal_punctuation" and rules.get(
            "ensure_terminal_punctuation",
        ):
            if caption and caption[-1] not in ".!?":
                caption = caption + "."

    return caption


def _normalize_spacing(text: str) -> str:
    import re

    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"([,.;:!?])(\S)", r"\1 \2", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _apply_case(text: str, mode: str) -> str:
    if mode == "lowercase":
        return text.lower()
    if mode == "uppercase":
        return text.upper()
    if mode == "titlecase":
        try:
            import re

            return re.sub(
                r"\b(\w)(\w*)\b",
                lambda m: m.group(1).upper() + m.group(2).lower(),
                text,
            )
        except Exception:
            return text.title()
    return text
