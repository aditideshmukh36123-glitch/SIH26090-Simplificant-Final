"""Google Gemini multimodal engine: audio transcription + image context -> multilingual catalog.

Uses the supported ``google.genai`` SDK (``google.generativeai`` was EOL'd by Google).
"""

from __future__ import annotations

import json
import re
import urllib.request
from typing import Any, cast

from google import genai
from google.genai import types

from app.config import Settings, get_settings
from app.models.schemas import CRAFT_CATEGORIES, LANGUAGES

_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}

CATALOG_SCHEMA: dict[str, object] = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "string"},
        "description": {
            "type": "OBJECT",
            "properties": {code: {"type": "string"} for code in LANGUAGES},
            "required": list(LANGUAGES),
        },
        "suggested_category": {"type": "string"},
        "materials": {"type": "ARRAY", "items": {"type": "string"}},
        "tags": {"type": "ARRAY", "items": {"type": "string"}},
        "authenticity_grade": {"type": "string"},
        "lineage_gi": {"type": "string", "nullable": True},
        "detected_features": {"type": "ARRAY", "items": {"type": "string"}},
    },
    "required": ["title", "description", "suggested_category", "materials", "tags"],
}

CATALOG_PROMPT = """You are the multimodal catalog engine of a fair-trade artisan marketplace.

The user uploads (1) an audio narration recorded by the artisan and (2) the clean studio
image of the crafted product. Transcribe the narration faithfully and combine it with the
visual context of the image to produce a complete product catalog.

Requirements:
- The narration is primarily in the language hint "{language_hint}". Keep original craft
  vocabulary whenever possible.
- "title" must be a short, merchant-friendly product name in English, e.g. "Handcrafted Terracotta Water Vessel".
- "description" must contain entries for EVERY one of these 16 language codes: {languages}.
  Transliterate/directly translate the FULL description into each language, preserving the
  craft story and materials. Do not omit or shorten any language.
- "suggested_category" must be one of exactly these values: {categories}.
- "materials" lists the raw materials from the narration (e.g. ["Natural Clay", "Organic Husk"]).
- "tags" 4-8 SEO tags.
- "authenticity_grade": use "GI_VERIFIED" if a Geographical Indication cluster is mentioned,
  otherwise "VERIFIED_HANDMADE".
- "lineage_gi": normalize the named GI cluster (e.g. "Bankura Terracotta") or emit null.
- "detected_features": visual finishing cues from the image (e.g. "matte_finish", "terracotta").
Return ONLY the JSON object."""


def configure(settings: Settings) -> None:
    genai.Client(api_key=settings.gemini_api_key)


def fetch_media(url: str, timeout: float = 30.0) -> tuple[bytes, str]:
    """Download external media (Cloudinary URL) -> (bytes, mime_type)."""
    request = urllib.request.Request(url, headers={"User-Agent": "sih26090-ai-microservice"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        data = response.read()
    content_type = response.headers.get_content_type()
    mime = content_type if content_type in _IMAGE_CONTENT_TYPES else "image/jpeg"
    return data, mime


def parse_json(text: str) -> dict[str, object]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end > start:
            try:
                result = json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError as exc2:
                raise ValueError(f"Gemini returned non-JSON output: {exc2}") from exc2
        else:
            raise ValueError(f"Gemini returned non-JSON output: {exc}") from exc
    if not isinstance(result, dict):
        raise ValueError("Gemini catalog payload is not an object")
    return result


def normalize_category(candidate: object) -> str:
    if not isinstance(candidate, str):
        return "OTHER"
    cleaned = candidate.strip().upper().replace(" ", "_").replace("-", "_")
    return cleaned if cleaned in CRAFT_CATEGORIES else "OTHER"


def ensure_localized(description: object, fallback: str) -> dict[str, str]:
    if not isinstance(description, dict):
        return {code: fallback for code in LANGUAGES}
    return {
        code: str(description.get(code) or fallback).strip()
        if str(description.get(code) or "").strip()
        else fallback
        for code in LANGUAGES
    }


def string_list(value: object, default: str = "Handmade craft") -> list[str]:
    if isinstance(value, list):
        items = [str(item).strip() for item in value if str(item).strip()]
        return items or [default]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return [default]


def build_catalog(
    audio_bytes: bytes,
    audio_mime: str,
    clean_image_url: str,
    language_hint: str,
) -> dict[str, object]:
    """Transcribe the artisan audio with image context and return a normalized catalog."""
    settings: Settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    image_bytes, image_mime = fetch_media(clean_image_url)
    prompt = CATALOG_PROMPT.format(
        language_hint=language_hint,
        languages=", ".join(LANGUAGES),
        categories=", ".join(CRAFT_CATEGORIES),
    )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=cast(
            Any,
            [
                types.Part.from_bytes(data=image_bytes, mime_type=image_mime),
                types.Part.from_bytes(data=audio_bytes, mime_type=audio_mime),
                prompt,
            ],
        ),
        config=types.GenerateContentConfig(
            temperature=0.2,
            top_p=0.95,
            response_mime_type="application/json",
            response_schema=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    key: _schema_field(key) for key in CATALOG_SCHEMA
                },
                required=list(CATALOG_SCHEMA.keys()),
            ),
        ),
    )

    if response.text is None:
        raise ValueError("Gemini returned an empty response")
    raw = parse_json(response.text)
    description_value = raw.get("description", {})
    description_raw = description_value if isinstance(description_value, dict) else {}
    fallback_text = str(
        description_raw.get(language_hint) or description_raw.get("en") or raw.get("title") or ""
    )
    if not fallback_text.strip():
        fallback_text = str(raw.get("title") or "Handcrafted artisan product")

    normalized: dict[str, object] = {
        "title": str(raw.get("title") or "Handcrafted Artisan Product").strip(),
        "description": ensure_localized(description_raw, fallback_text),
        "suggested_category": normalize_category(raw.get("suggested_category")),
        "materials": string_list(raw.get("materials")),
        "tags": string_list(raw.get("tags"), "Handmade"),
        "authenticity_grade": str(raw.get("authenticity_grade") or "VERIFIED_HANDMADE"),
        "lineage_gi": raw.get("lineage_gi")
        if isinstance(raw.get("lineage_gi"), str) and raw.get("lineage_gi")
        else None,
        "detected_features": string_list(raw.get("detected_features"), "hand_finished"),
    }
    return normalized


def _schema_field(_key: str) -> types.Schema:
    """Build a typed Schema for each catalog property."""
    field_specs: dict[str, types.Schema] = {
        key: types.Schema(type=types.Type.STRING)
        for key in ("title", "suggested_category", "authenticity_grade", "lineage_gi")
    }
    field_specs["materials"] = types.Schema(
        type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)
    )
    field_specs["tags"] = types.Schema(
        type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)
    )
    field_specs["detected_features"] = types.Schema(
        type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)
    )
    field_specs["description"] = types.Schema(
        type=types.Type.OBJECT,
        properties={code: types.Schema(type=types.Type.STRING) for code in LANGUAGES},
        required=list(LANGUAGES),
    )
    return field_specs.get(_key, types.Schema(type=types.Type.STRING))
