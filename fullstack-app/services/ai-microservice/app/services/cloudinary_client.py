"""Cloudinary asset hosting for studio-clean and raw workshop media."""

from __future__ import annotations

import io
import time
from dataclasses import dataclass

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from cloudinary.exceptions import Error as CloudinaryError

from app.config import Settings, get_settings


@dataclass(frozen=True)
class UploadedAssets:
    clean_image_url: str
    raw_workshop_image_url: str


def configure(settings: Settings) -> None:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _upload(data: bytes, *, resource_type: str, public_id: str, image_format: str | None = None) -> str:
    settings = get_settings()
    options: dict[str, object] = {
        "public_id": public_id,
        "folder": settings.cloudinary_folder,
        "resource_type": resource_type,
        "overwrite": True,
        "use_filename": False,
        "unique_filename": False,
    }
    if image_format is not None:
        options["format"] = image_format
    try:
        result = cloudinary.uploader.upload(io.BytesIO(data), **options)
    except CloudinaryError as exc:
        raise RuntimeError(f"Cloudinary upload failed: {exc}") from exc
    url = str(result["secure_url"])
    if not url:
        raise RuntimeError("Cloudinary returned an empty secure_url")
    return url


def upload_enhanced(clean_png: bytes, raw_image: bytes, base_id: str) -> UploadedAssets:
    """Upload both the transparent clean PNG and the original raw image."""
    stamp = int(time.time() * 1000)
    clean_url = _upload(
        clean_png,
        resource_type="image",
        public_id=f"{base_id}-{stamp}-clean",
        image_format="png",
    )
    raw_url = _upload(
        raw_image,
        resource_type="image",
        public_id=f"{base_id}-{stamp}-raw",
    )
    return UploadedAssets(clean_image_url=clean_url, raw_workshop_image_url=raw_url)


def upload_audio(data: bytes, base_id: str, mime_type: str) -> str:
    """Host the artisan voice recording; returns its Cloudinary URL."""
    stamp = int(time.time() * 1000)
    resource_type = "video" if mime_type == "audio/mp4" else "raw"
    return _upload(
        data,
        resource_type=resource_type,
        public_id=f"{base_id}-{stamp}-audio",
    )
