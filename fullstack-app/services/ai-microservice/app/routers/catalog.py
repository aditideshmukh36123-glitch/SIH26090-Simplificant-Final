"""Multimodal Voice-to-Catalog Engine endpoint (Gemini + Cloudinary)."""

from __future__ import annotations

import re
import uuid
from typing import Annotated, Any, cast

import anyio
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import LANGUAGES, CatalogResponse, CatalogSpec
from app.services import cloudinary_client, gemini_client

router = APIRouter(tags=["catalog"])

AUDIO_MIME_BY_EXTENSION: dict[str, str] = {
    "m4a": "audio/mp4",
    "mp4": "audio/mp4",
    "wav": "audio/wav",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "oga": "audio/ogg",
    "aac": "audio/aac",
    "flac": "audio/flac",
}

AUDIO_URL_PATTERN = re.compile(r"^https?://.+")


def _audio_mime(filename: str | None) -> str | None:
    if not filename or "." not in filename:
        return None
    ext = filename.rsplit(".", 1)[-1].lower()
    return AUDIO_MIME_BY_EXTENSION.get(ext)


@router.post(
    "/catalog-audio",
    response_model=CatalogResponse,
    summary="Transcribe artisan voice + image context into a 16-language catalog",
)
async def catalog_audio(
    audio: Annotated[UploadFile, File(description="Native audio recording (.m4a/.wav/etc.)")],
    clean_image_url: Annotated[str, Form(description="Cloudinary studio-clean image URL")],
    artisan_language_hint: Annotated[str, Form(description="Narration language code, e.g. 'hi', 'mr', 'en'")],
) -> CatalogResponse:
    if artisan_language_hint not in LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"artisan_language_hint must be one of: {', '.join(LANGUAGES)}",
        )
    if not clean_image_url or not AUDIO_URL_PATTERN.match(clean_image_url):
        raise HTTPException(status_code=400, detail="clean_image_url must be a valid http(s) URL")

    audio_mime = _audio_mime(audio.filename)
    if audio_mime is None:
        raise HTTPException(
            status_code=415,
            detail="Unsupported audio format; use .m4a, .wav, .mp3, .ogg, .aac or .flac",
        )

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")
    if len(audio_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file exceeds the 20 MB inline limit")

    try:
        raw_catalog = await anyio.to_thread.run_sync(
            gemini_client.build_catalog,
            audio_bytes,
            audio_mime,
            clean_image_url,
            artisan_language_hint,
        )
    except Exception as exc:  # noqa: BLE001 — provider failure surfaces as 502
        raise HTTPException(status_code=502, detail=f"Gemini catalog generation failed: {exc}") from exc

    base_id = f"catalog-{uuid.uuid4().hex[:12]}"
    try:
        audio_url = await anyio.to_thread.run_sync(
            cloudinary_client.upload_audio, audio_bytes, base_id, audio_mime
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return CatalogResponse(
        status="success",
        catalog=CatalogSpec(**cast(dict[str, Any], raw_catalog)),
        original_audio_url=audio_url,
    )
