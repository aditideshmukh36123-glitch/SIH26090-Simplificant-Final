"""Studio image enhancement primitives built on Rembg (U2Net) + Pillow/NumPy.

All analysis here is real computation on the input pixels — no mock features.
The dominant-colour and texture heuristics are derived from HSV statistics and
local brightness variance, following the craft-specific palette of the platform
(terracotta, amber, woodgrain, metal, etc.).
"""

from __future__ import annotations

import io
import threading
from typing import cast

import numpy as np
from PIL import Image
from rembg import new_session, remove

_session = None
_session_lock = threading.Lock()


def _get_session() -> object:
    """Lazily create the shared U2Net detection session (heavy ONNX model)."""
    global _session
    if _session is None:
        with _session_lock:
            if _session is None:
                _session = new_session("u2net")
    return _session


def remove_background(data: bytes) -> bytes:
    """Run Rembg background extraction over raw bytes -> transparent PNG bytes."""
    if not data:
        raise ValueError("Empty image payload")
    output = remove(data, session=_get_session())
    return cast(bytes, output)


def decode_rgb(data: bytes) -> Image.Image:
    """Decode arbitrary image bytes into an RGB Pillow image."""
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
        return image.convert("RGB")
    except Exception as exc:  # noqa: BLE001 — surface as a clean 400 from the router
        raise ValueError(f"Unsupported or corrupt image: {exc}") from exc


def encode_png(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def rgb_to_png(data: bytes) -> bytes:
    return encode_png(decode_rgb(data))


def _quantized_rgb(image: Image.Image, step: int = 16) -> list[tuple[int, int, int]]:
    """Flatten resized pixel data into quantised RGB buckets (typed wrapper)."""
    small = image.resize((32, 32), Image.Resampling.BILINEAR)
    return cast(list[tuple[int, int, int]], list(small.getdata()))


def dominant_colors_rgb(image: Image.Image, count: int = 3) -> list[str]:
    """Most frequent quantised colours, returned as rgb(...) strings."""
    step = 16
    buckets: dict[tuple[int, int, int], int] = {}
    for r, g, b in _quantized_rgb(image, step):
        key = ((r // step) * step, (g // step) * step, (b // step) * step)
        buckets[key] = buckets.get(key, 0) + 1
    ranked = sorted(buckets.items(), key=lambda item: item[1], reverse=True)
    return [f"rgb({r},{g},{b})" for (r, g, b), _ in ranked[:count]]


def dominant_colors_hex(image: Image.Image, count: int = 3) -> list[str]:
    step = 16
    buckets: dict[tuple[int, int, int], int] = {}
    for r, g, b in _quantized_rgb(image, step):
        key = ((r // step) * step, (g // step) * step, (b // step) * step)
        buckets[key] = buckets.get(key, 0) + 1
    ranked = sorted(buckets.items(), key=lambda item: item[1], reverse=True)
    return [f"#{r:02x}{g:02x}{b:02x}" for (r, g, b), _ in ranked[:count]]


def detect_craft_features(image: Image.Image) -> list[str]:
    """Colour profile + texture analysis -> craft/material hints (real heuristics)."""
    hsv = np.asarray(image.convert("HSV"), dtype=np.uint8)
    hue = hsv[..., 0].astype(np.int32)
    sat = hsv[..., 1].astype(np.float32) / 255.0
    val = hsv[..., 2].astype(np.float32) / 255.0

    mean_saturation = float(np.mean(sat))
    mean_value = float(np.mean(val))
    brightness_variance = float(np.var(val))

    dominant_band = int(np.argmax(np.histogram(hue, bins=36, range=(0, 360))[0])) * 10

    features: list[str] = []
    # Finish classification
    if mean_saturation < 0.35 and mean_value > 0.55:
        features.append("matte_finish")
    if mean_saturation > 0.55:
        features.append("high_saturation")
    if mean_saturation < 0.10 and mean_value > 0.70:
        features.append("polished_metal")

    # Hue band -> material hint. Brightness variance separates woody grain from clay.
    if 10 <= dominant_band < 40:
        features.append("wood_grain" if brightness_variance > 0.018 else "terracotta")
    elif 40 <= dominant_band < 75:
        features.append("amber_gold")
    elif 175 <= dominant_band < 265:
        features.append("cobalt_teal")
    elif 265 <= dominant_band < 340:
        features.append("indigo_maroon")
    else:
        features.append("neutral_earth_toned")

    if round(mean_value * 255) > 215:
        features.append("glazed_bright")

    return features[:4]


def analyse_image(data: bytes) -> dict[str, list[str]]:
    """Full enhancement analysis used by POST /api/enhance-image."""
    rgb = decode_rgb(data)
    return {
        "detected_features": detect_craft_features(rgb),
        "dominant_colors_hex": dominant_colors_hex(rgb),
        "dominant_colors_rgb": dominant_colors_rgb(rgb),
    }
