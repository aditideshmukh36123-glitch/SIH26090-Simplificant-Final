"""Image Studio Enhancement endpoint: Rembg + Cloudinary + CV feature analysis."""

from __future__ import annotations

import uuid
from typing import Annotated

import anyio
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import EnhanceImageResponse
from app.services import cloudinary_client, image_processing

router = APIRouter(tags=["image-studio"])

ALLOWED_IMAGE_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp",
    "heic",
    "heif",
    "avif",
    "tiff",
    "bmp",
}


def _extension_of(filename: str | None) -> str:
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower()


@router.post(
    "/enhance-image",
    response_model=EnhanceImageResponse,
    summary="Remove background, analyse craft features, host raw + clean on Cloudinary",
)
async def enhance_image(
    image: Annotated[UploadFile, File(description="Raw workshop image")],
) -> EnhanceImageResponse:
    ext = _extension_of(image.filename)
    if ext and ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type '.{ext}'; allowed: {sorted(ALLOWED_IMAGE_EXTENSIONS)}",
        )

    raw_bytes = await image.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        clean_png = await anyio.to_thread.run_sync(image_processing.remove_background, raw_bytes)
    except Exception as exc:  # noqa: BLE001 — provider/model failure surfaces as 400
        raise HTTPException(status_code=400, detail=f"Rembg background removal failed: {exc}") from exc

    try:
        analysis = await anyio.to_thread.run_sync(image_processing.analyse_image, raw_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    base_id = f"artisan-{uuid.uuid4().hex[:12]}"
    try:
        assets = await anyio.to_thread.run_sync(
            cloudinary_client.upload_enhanced, clean_png, raw_bytes, base_id
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return EnhanceImageResponse(
        status="success",
        clean_image_url=assets.clean_image_url,
        raw_workshop_image_url=assets.raw_workshop_image_url,
        detected_features=analysis["detected_features"],
    )
