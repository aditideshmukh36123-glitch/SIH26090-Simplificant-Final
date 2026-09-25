"""Unit tests for the image-processing helpers in main.py (Orders A/B/C + clarity)."""

import numpy as np
import cv2
import inspect
import pytest
from PIL import Image

import main


def _rand(n, low, high, seed):
    return np.uint8(
        np.clip(
            np.random.default_rng(seed).integers(low, high, size=n), 0, 255
        )
    )


# --------------------------------------------------------------------------
# Order A — letterbox/border crop
# --------------------------------------------------------------------------
def test_auto_crop_letterbox_removes_uniform_border():
    # Black border all around, 20px top/bottom and 15px left/right, over a
    # grey content area — a realistic pillarbox/letterbox composite.
    canvas = np.zeros((400, 300, 3), np.uint8)
    canvas[20:380, 15:285] = 120
    cropped = main.auto_crop_letterbox(canvas)
    assert cropped.shape == (360, 270, 3)
    assert (cropped == 120).all()


def test_auto_crop_letterbox_no_op_on_clean_frame():
    img = _rand((50, 60, 3), 30, 240, seed=3)
    out = main.auto_crop_letterbox(img)
    assert out.shape == img.shape
    assert (out == img).all()


def test_auto_crop_letterbox_does_not_touch_mid_grey_edge():
    # A grey product touching the edge (mean ~120) must never be cropped.
    img = np.full((40, 40, 3), 120, np.uint8)
    out = main.auto_crop_letterbox(img)
    assert out.shape == img.shape


def test_auto_crop_letterbox_respects_15_percent_cap():
    # A fully-black frame: each edge caps at 15% so the frame is never gutted.
    img = np.zeros((100, 100, 3), np.uint8)
    out = main.auto_crop_letterbox(img)
    assert out.shape[0] >= 70
    assert out.shape[1] >= 70


# --------------------------------------------------------------------------
# Order B — adaptive lighting
# --------------------------------------------------------------------------
def test_adaptive_lighting_clamped_for_very_dark_subject():
    bgr = np.full((100, 100, 3), 10, np.uint8)
    mask = np.full((100, 100), 255, np.uint8)
    alpha, beta = main.compute_adaptive_brightness_contrast(bgr, mask)
    assert 0.8 <= alpha <= 1.6
    assert -20 <= beta <= 40


def test_adaptive_lighting_tiny_subject_falls_back_to_fixed():
    bgr = np.zeros((100, 100, 3), np.uint8)
    mask = np.zeros((100, 100), np.uint8)
    alpha, beta = main.compute_adaptive_brightness_contrast(bgr, mask)
    assert (alpha, beta) == (
        main.DEFAULT_CONTRAST_ALPHA,
        main.DEFAULT_BRIGHTNESS_BETA,
    )


def test_adaptive_lighting_flat_histogram_falls_back_to_fixed():
    bgr = np.full((100, 100, 3), 128, np.uint8)
    mask = np.full((100, 100), 255, np.uint8)
    alpha, beta = main.compute_adaptive_brightness_contrast(bgr, mask)
    assert (alpha, beta) == (
        main.DEFAULT_CONTRAST_ALPHA,
        main.DEFAULT_BRIGHTNESS_BETA,
    )


# --------------------------------------------------------------------------
# Matting cleanup (fog + speckle) and halo defringe
# --------------------------------------------------------------------------
def _rgba(rgb, alpha):
    return Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")


def test_clean_segmentation_mask_kills_fog_and_speckles_keeps_subject():
    h, w = 120, 160
    rgb = np.full((h, w, 3), 200, np.uint8)
    alpha = np.zeros((h, w), np.uint8)
    alpha[20:100, 20:140] = 255          # solid subject (grey, high alpha)
    alpha[100:110, 20:140] = 120         # gradated matte band — DARK grey (not
    rgb[100:110, 20:140] = 100           #   near-white, so must be preserved)
    alpha[5:40, 5:12] = 90               # translucent white fog (kill)
    alpha[5:8, 150:153] = 255            # tiny detached speck (kill)

    cleaned = np.array(main.clean_segmentation_mask(_rgba(rgb, alpha)))[:, :, 3]
    assert cleaned[10, 8] == 0            # fog alpha -> 0
    assert cleaned[6, 151] == 0           # speck alpha -> 0
    assert cleaned[105, 80] == 120        # dark matte band preserved
    assert cleaned[60, 80] == 255         # solid subject preserved


def test_defringe_halo_edges_repaints_band_from_subject_color():
    h, w = 40, 40
    rgb = np.full((h, w, 3), 200, np.uint8)
    rgb[10:30, 10:30] = [20, 20, 200]    # opaque blue subject
    alpha = np.zeros((h, w), np.uint8)
    alpha[10:30, 10:30] = 255
    alpha[30:33, 10:30] = 128            # halo band below the subject
    alpha[10:30, 30:33] = 128            # halo band right of the subject

    img = _rgba(rgb, alpha)
    repaired = np.array(main.defringe_halo_edges(img))

    # Band pixels should be repainted toward the blue subject, not stay grey.
    assert repaired[31, 20, 0] < 100     # blue-ness recovered (R pulled down)
    assert repaired[31, 20, 2] > 150     # blue channel restored
    assert repaired[20, 31, 2] > 150     # vertical band too
    # Alpha is untouched — silhouette preserved.
    assert repaired[31, 20, 3] == 128


def test_defringe_halo_edges_no_band_is_noop():
    h, w = 30, 30
    rgb = np.full((h, w, 3), 60, np.uint8)
    alpha = np.full((h, w), 255, np.uint8)
    before = _rgba(rgb, alpha)
    out = np.array(main.defringe_halo_edges(before))
    assert (out == np.array(before)).all()


# --------------------------------------------------------------------------
# Foreground fraction
# --------------------------------------------------------------------------
def test_foreground_fraction():
    img = _rgba(np.full((50, 50, 3), 0, np.uint8), np.full((50, 50), 255, np.uint8))
    assert main.foreground_fraction(img) == 1.0
    img2 = _rgba(np.full((50, 50, 3), 0, np.uint8), np.zeros((50, 50), np.uint8))
    assert main.foreground_fraction(img2) == 0.0


# --------------------------------------------------------------------------
# Low-res upscale
# --------------------------------------------------------------------------
def test_auto_upscale_small_image_using_lanczos():
    small = np.zeros((435, 296, 3), np.uint8)
    up = main.auto_upscale_low_resolution(small)
    assert (up.shape[1], up.shape[0]) == (592, 870)  # exactly 2x Lanczos


def test_auto_upscale_leaves_large_image_untouched():
    big = np.zeros((1000, 900, 3), np.uint8)
    assert main.auto_upscale_low_resolution(big).shape == (1000, 900, 3)


# --------------------------------------------------------------------------
# Order P1 — pre-segmentation downscale
# --------------------------------------------------------------------------
def test_downscale_caps_longer_dimension_to_max_dimension():
    huge = np.zeros((2600, 1200, 4), np.uint8)
    out = main.downscale_for_processing(huge)
    h, w = out.shape[:2]
    assert max(h, w) == main.DOWNSCALE_MAX_PROCESSING_DIMENSION


def test_downscale_preserves_aspect_ratio():
    huge = np.zeros((2700, 900, 4), np.uint8)
    out = main.downscale_for_processing(huge)
    assert round(out.shape[0] / out.shape[1], 6) == round(2700 / 900, 6)


def test_downscale_never_upscales_small_images():
    small = np.zeros((300, 400, 3), np.uint8)
    assert main.downscale_for_processing(small).shape == (300, 400, 3)
    exact = np.zeros((1800, 1800, 3), np.uint8)
    assert main.downscale_for_processing(exact).shape == (1800, 1800, 3)


# --------------------------------------------------------------------------
# Order D — standardized canvas framing
# --------------------------------------------------------------------------
def test_standardize_canvas_centers_output_on_square_canvas():
    h, w = 40, 24
    subject = np.zeros((h, w, 4), np.uint8)
    subject[5:35, 2:22, :3] = (120, 90, 60)
    subject[5:35, 2:22, 3] = 255

    out = main.standardize_canvas(subject, canvas_size=200)
    assert out.shape == (200, 200, 4)

    ys, xs = np.nonzero(out[:, :, 3] > 10)
    # Content is centered +/- a couple of pixels on the 200x200 canvas.
    cx = (xs.min() + xs.max()) / 2
    cy = (ys.min() + ys.max()) / 2
    assert abs(cx - 99.5) <= 3
    assert abs(cy - 99.5) <= 3


def test_standardize_canvas_fills_84_percent_width():
    # Subject spanning the full crop width: resize makes its long dimension
    # fill 200*0.84 = 168 canvas px.
    subject = np.zeros((12, 50, 4), np.uint8)
    subject[1:11, :, :3] = 100
    subject[1:11, :, 3] = 255

    out = main.standardize_canvas(subject, canvas_size=200)
    ys, xs = np.nonzero(out[:, :, 3] > 10)
    assert (xs.max() - xs.min() + 1) >= 160
    assert (xs.max() - xs.min() + 1) <= 172


def test_standardize_canvas_empty_subject_yields_blank_canvas():
    blank = np.zeros((30, 30, 4), np.uint8)
    out = main.standardize_canvas(blank, canvas_size=100)
    assert out.shape == (100, 100, 4)
    assert (out == 0).all()


# --------------------------------------------------------------------------
# Order E — alpha-edge defringe
# --------------------------------------------------------------------------
def test_defringe_alpha_edge_before_canvas_uses_matting_geometry():
    # Opaque block plus a semi-transparent contaminated band along its bottom.
    h, w = 80, 80
    subject = np.zeros((h, w, 4), np.uint8)
    subject[20:50, 20:60, 3] = 255
    subject[50:55, 20:60, 3] = 128  # contaminated fringe band

    out = main.defringe_alpha_edge(subject.copy())
    # Deep interior (>=5px off every edge) keeps full opacity.
    assert (out[25:44, 25:54, 3] == 255).all()
    # Erosion consumes the outer fringe line, so the outermost spill row drops
    # well below its original 128 (blur smooths the remainder, never raises it
    # into full opacity).
    assert out[54, 40, 3] < 128


def test_defringe_alpha_edge_erodes_single_pixel_spill_ring():
    h, w = 30, 30
    subject = np.zeros((h, w, 4), np.uint8)
    subject[5:25, 5:25, 3] = 255
    subject[25:26, 5:25, 3] = 255  # 1px "spill" hugging the bottom edge
    subject[26:30, 5:25, 3] = 0

    out = main.defringe_alpha_edge(subject.copy(), edge_erode_px=1)
    # The outermost single-pixel line is consumed by the erosion step.
    assert out[25, 10, 3] < 255


def test_defringe_alpha_edge_preserves_deep_interior_of_clean_mask():
    subject = np.zeros((40, 40, 4), np.uint8)
    subject[5:35, 5:35, :3] = 90
    subject[5:35, 5:35, 3] = 255
    out = main.defringe_alpha_edge(subject.copy())
    assert out.shape == subject.shape
    assert out.dtype == subject.dtype
    # Only the outermost ring is touched; the deep interior stays fully opaque.
    assert (out[12:28, 12:28, 3] == 255).all()


# --------------------------------------------------------------------------
# Order F — ground-contact shadow layer
# --------------------------------------------------------------------------
def _alpha_block(h, w, rows, cols):
    alpha = np.zeros((h, w), np.uint8)
    alpha[rows[0]:rows[1], cols[0]:cols[1]] = 255
    return alpha


def test_build_shadow_layer_darkens_under_contact_row_only():
    h, w = 200, 200
    alpha = _alpha_block(h, w, (40, 140), (60, 160))  # contact row = 139
    shadow = main.build_shadow_layer(alpha, (h, w), shadow_opacity=50, blur_radius=20)
    assert shadow.shape == (h, w)
    assert shadow.dtype == np.uint8
    assert 0 < int(shadow.max()) <= 50  # peak never exceeds requested opacity
    # Peak sits near the subject's contact row, not at the top of the canvas.
    ys = np.nonzero(shadow > 20)[0]
    assert ys.min() >= 120  # shadows don't appear above the product
    assert shadow[0, 0] == 0  # far corners stay clean white
    assert shadow[199, 199] == 0


def test_build_shadow_layer_empty_alpha_gives_empty_mask():
    shadow = main.build_shadow_layer(np.zeros((50, 50), np.uint8), (50, 50))
    assert (shadow == 0).all()


# --------------------------------------------------------------------------
# Strike 3 — corner sanitization
# --------------------------------------------------------------------------
def test_sanitize_corners_to_white_repaints_near_white_corners():
    # Realistic composite: pure-white canvas + faint near-white corner haze +
    # a centred grey body far outside the corner tolerance band.
    img = np.full((100, 100, 3), 255, np.uint8)
    img[0:20, 0:20] = 250  # faint near-white corner haze
    img[45:55, 45:55] = 100
    out = main.sanitize_corners_to_white(img, near_white_tolerance=8)
    assert (out[0:10, 0:10] == 255).all()
    # The mid-grey body is untouched by the corner floods.
    assert (out[47:53, 47:53] == 100).all()


def test_sanitize_corners_to_white_leaves_true_shadow_grey():
    # A centered "shadow" grey (200, outside the 255-8..255 FIXED_RANGE) must
    # survive the corner flood fill; only corner-connected near-white is eaten.
    img = np.full((100, 100, 3), 255, np.uint8)
    img[60:90, 30:70] = 200  # cast shadow, comfortably below tolerance
    out = main.sanitize_corners_to_white(img, near_white_tolerance=8)
    assert (out[60:90, 30:70] == 200).all()  # shadow preserved
    assert out[0, 0].tolist() == [255, 255, 255]     # corners repainted/clean
    assert out[99, 99].tolist() == [255, 255, 255]


def test_sanitize_corners_to_white_is_noop_on_clean_white():
    img = np.full((60, 60, 3), 255, np.uint8)
    assert (main.sanitize_corners_to_white(img) == 255).all()


# --------------------------------------------------------------------------
# Order G — texture detail sharpening
# --------------------------------------------------------------------------
def test_sharpen_product_detail_keeps_white_canvas_pure():
    white = np.full((80, 80, 3), 255, np.uint8)
    assert (main.sharpen_product_detail(white) == 255).all()


def test_sharpen_product_detail_increases_local_edge_energy():
    rng = np.random.default_rng(11)
    base = np.uint8(
        np.clip(90 + 0.55 * rng.integers(0, 40, size=(300, 400)).astype(np.float32), 0, 255)
    )
    sub = cv2.cvtColor(cv2.merge([base, base, base]), cv2.COLOR_RGB2BGR)

    def local_energy(img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (0, 0), sigmaX=1.5)
        return float(cv2.absdiff(gray, blurred).mean())

    out = main.sharpen_product_detail(sub, sharpen_strength=0.3)
    assert local_energy(out) > local_energy(sub) * 1.1  # ~1.3x expected


def test_sharpen_product_detail_clips_to_uint8_range():
    img = np.zeros((40, 40, 3), np.uint8)
    img[:, :] = (5, 250, 250)
    out = main.sharpen_product_detail(img, sharpen_strength=0.9)
    assert out.dtype == np.uint8
    assert int(out.min()) >= 0 and int(out.max()) <= 255


# --------------------------------------------------------------------------
# Order Q1 — mask resolution decoupled from composite resolution
# --------------------------------------------------------------------------
def _semi_transparent_png_bytes():
    rgba = np.zeros((120, 90, 4), np.uint8)
    rgba[:, :, :3] = (0, 255, 0)
    rgba[:, :, 3] = 128
    ok, enc = cv2.imencode(".png", rgba)
    assert ok
    return enc.tobytes()


def test_strip_background_segments_at_bounded_resolution(monkeypatch):
    monkeypatch.setattr(main, "_REMBG_SESSION", object())
    monkeypatch.setattr(main, "_REMBG_FALLBACK_SESSION", None)
    captured = {}

    def fake_remove(image_bytes, **kwargs):
        captured["bytes"] = image_bytes
        return _semi_transparent_png_bytes()

    monkeypatch.setattr(main, "remove", fake_remove)

    working = np.zeros((2000, 1000, 3), np.uint8)
    out = main.strip_background(working)

    # rembg was fed a frame bounded by the segmentation budget, NOT the full
    # working image — the whole point of Q1.
    seg_np = cv2.imdecode(
        np.frombuffer(captured["bytes"], dtype=np.uint8), cv2.IMREAD_COLOR
    )
    seg_h, seg_w = seg_np.shape[:2]
    assert max(seg_h, seg_w) <= main.SEGMENTATION_MAX_DIMENSION
    # ...but the returned composite is back at FULL working resolution.
    assert out.mode == "RGBA"
    assert out.size == (1000, 2000)


def test_strip_background_reuses_working_rgb_after_mask_upscale(monkeypatch):
    monkeypatch.setattr(main, "_REMBG_SESSION", object())
    monkeypatch.setattr(main, "_REMBG_FALLBACK_SESSION", None)

    def fake_remove(image_bytes, **kwargs):
        return _semi_transparent_png_bytes()

    monkeypatch.setattr(main, "remove", fake_remove)

    # Working image is uniform gray; the (irrelevant) mask source is green.
    working = np.full((60, 80, 3), 100, np.uint8)
    out = main.strip_background(working)
    rgba = np.asarray(out, dtype=np.uint8)

    # RGB must come from the WORKING image (gray ~100), not from the mask
    # source's green channels — and the mask alpha must survive the roundtrip.
    assert rgba.shape == (60, 80, 4)
    assert rgba[:, :, 3].min() == 128 and rgba[:, :, 3].max() == 128
    center_rgb = rgba[30, 40, :3].astype(int)
    assert abs(int(center_rgb[0]) - 100) < 60
    assert abs(int(center_rgb[1]) - 100) < 60


# --------------------------------------------------------------------------
# CLAHE — apply_clahe (local luminance contrast enhancement)
# --------------------------------------------------------------------------
def _low_contrast_rgb(seed: int = 7) -> np.ndarray:
    """128x96 (non-square) low-contrast, textured, colored RGB fixture."""
    h, w = 128, 96
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Smooth low-contrast luminance ramp (90..150) with a colored block and
    # subtle texture, so CLAHE has realistic local detail to act on.
    luminance = 90.0 + ((yy + xx) / (h + w)) * 60.0
    rgb = np.zeros((h, w, 3), np.uint8)
    rgb[:, :, 0] = np.clip(luminance, 0, 255).astype(np.uint8)
    rgb[:, :, 1] = np.clip(luminance * 0.8, 0, 255).astype(np.uint8)
    rgb[:, :, 2] = np.clip(255.0 - luminance * 0.6, 0, 255).astype(np.uint8)
    rng = np.random.default_rng(seed)
    rgb[30:80, 20:70] = np.clip(
        rgb[30:80, 20:70].astype(np.int16)
        + rng.integers(-12, 12, size=(50, 50, 1)).astype(np.int16),
        0,
        255,
    ).astype(np.uint8)
    return rgb


def _nontrivial_alpha() -> np.ndarray:
    """Alpha mixing fully opaque, semi-transparent, and transparent pixels."""
    alpha = np.full((128, 96), 255, np.uint8)
    alpha[10:50, 10:40] = 128      # semi-transparent band
    alpha[70:110, 20:60] = 0       # fully transparent region
    return alpha


def _lab_l(rgb: np.ndarray) -> np.ndarray:
    """Luminance (L) channel of an RGB array, per the helper's LAB view."""
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)[:, :, 0]


def test_apply_clahe_rgb_shape_preserved():
    img = _low_contrast_rgb()
    out = main.apply_clahe(img)
    assert out.shape == img.shape
    assert out.shape == (128, 96, 3)


def test_apply_clahe_rgba_shape_preserved():
    img = np.dstack([_low_contrast_rgb(), _nontrivial_alpha()])
    out = main.apply_clahe(img)
    assert out.shape == img.shape
    assert out.shape == (128, 96, 4)


def test_apply_clahe_preserves_dtype():
    rgb = _low_contrast_rgb()
    rgba = np.dstack([rgb, _nontrivial_alpha()])
    assert main.apply_clahe(rgb).dtype == np.uint8
    assert main.apply_clahe(rgba).dtype == np.uint8


def test_apply_clahe_preserves_alpha_exactly():
    rgba = np.dstack([_low_contrast_rgb(), _nontrivial_alpha()])
    out = main.apply_clahe(rgba)
    # Alpha is matting/transparency, never luminance — must pass through
    # pixel-for-pixel, including fully opaque, semi-transparent, and
    # fully transparent pixels.
    assert np.array_equal(out[..., 3], rgba[..., 3])


def test_apply_clahe_does_not_mutate_input():
    rgb = _low_contrast_rgb()
    rgba = np.dstack([rgb.copy(), _nontrivial_alpha()])
    original_rgb = rgb.copy()
    original_rgba = rgba.copy()
    main.apply_clahe(rgb)
    main.apply_clahe(rgba)
    assert np.array_equal(rgb, original_rgb)
    assert np.array_equal(rgba, original_rgba)


def test_apply_clahe_changes_low_contrast_luminance():
    img = _low_contrast_rgb()
    out = main.apply_clahe(img)
    # Must not be a no-op...
    assert not np.array_equal(out, img)
    # ...and the L channel must actually gain local contrast.
    assert float(_lab_l(out).std()) > float(_lab_l(img).std())


def test_apply_clahe_preserves_dimensions_non_square():
    img = _low_contrast_rgb()  # 128x96 — H != W on purpose
    assert img.shape[0] != img.shape[1]
    out = main.apply_clahe(img)
    assert out.shape[:2] == img.shape[:2]


def test_apply_clahe_is_deterministic():
    img = _low_contrast_rgb()
    first = main.apply_clahe(img)
    second = main.apply_clahe(img)
    assert np.array_equal(first, second)


def test_apply_clahe_preserves_chroma_channels():
    img = _low_contrast_rgb()
    lab_in = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    out = main.apply_clahe(img)
    lab_out = cv2.cvtColor(out, cv2.COLOR_RGB2LAB)
    # A/B chroma must be preserved. With untouched A/B, the LAB->RGB->LAB
    # round trip is exact for most pixels (p50/p90 |dA|,|dB| = 0), but the
    # uint8 RGB intermediate drifts a few units on exactly the pixels CLAHE
    # stretched hardest (corr(dB, dL) ~ 0.75; max |dL| ~ 77 on this fixture).
    # The guarantee is still tight: >= 95th percentile stays within the
    # documented few-unit tolerance, and the worst pixel never approaches
    # colour corruption (a real A/B swap or loss would read tens-hundreds).
    a_delta = np.abs(lab_out[..., 1].astype(int) - lab_in[..., 1].astype(int))
    b_delta = np.abs(lab_out[..., 2].astype(int) - lab_in[..., 2].astype(int))
    assert np.percentile(a_delta, 95) <= 5
    assert np.percentile(b_delta, 95) <= 5
    assert int(a_delta.max()) <= 16
    assert int(b_delta.max()) <= 16


def test_apply_clahe_white_image_stable():
    img = np.full((80, 80, 3), 255, np.uint8)
    out = main.apply_clahe(img)
    assert out.shape == img.shape
    assert out.dtype == np.uint8
    assert int(out.min()) >= 0 and int(out.max()) <= 255
    # A constant frame produces identical tiles/histograms -> output stays
    # uniform (never banded or numerically corrupted).
    assert np.unique(out).size == 1


def test_apply_clahe_rgb_matches_rgba_rgb_portion():
    rgb = _low_contrast_rgb()
    rgba = np.dstack([rgb.copy(), _nontrivial_alpha()])
    out_rgb = main.apply_clahe(rgb)
    out_rgba = main.apply_clahe(rgba)
    # Alpha handling must never influence the RGB transformation.
    assert np.array_equal(out_rgb, out_rgba[..., :3])


def test_apply_clahe_default_parameters():
    """Defaults must stay wired to the tuned production constants: the clip
    limit selected by the Phase 4 parameter study lives in CLAHE_CLIP_LIMIT
    and is never duplicated as a literal in tests or the pipeline."""
    img = _low_contrast_rgb()
    params = inspect.signature(main.apply_clahe).parameters
    assert params["clip_limit"].default == main.CLAHE_CLIP_LIMIT
    assert params["tile_grid_size"].default == main.CLAHE_TILE_GRID_SIZE
    default_out = main.apply_clahe(img)
    explicit_out = main.apply_clahe(
        img, clip_limit=main.CLAHE_CLIP_LIMIT, tile_grid_size=main.CLAHE_TILE_GRID_SIZE
    )
    assert np.array_equal(default_out, explicit_out)


def test_apply_clahe_rejects_unsupported_inputs():
    gray = np.zeros((16, 16), np.uint8)
    two_channel = np.zeros((16, 16, 2), np.uint8)
    five_channel = np.zeros((16, 16, 5), np.uint8)
    float_rgb = np.zeros((16, 16, 3), np.float32)
    for bad in (gray, two_channel, five_channel, float_rgb):
        with pytest.raises(ValueError):
            main.apply_clahe(bad)
    with pytest.raises(ValueError):
        main.apply_clahe("not-an-array")


def test_apply_clahe_rejects_invalid_parameters():
    img = _low_contrast_rgb()
    for bad_clip in (0.0, -1.0):
        with pytest.raises(ValueError):
            main.apply_clahe(img, clip_limit=bad_clip)
    for bad_grid in ((0, 8), (8, 0), (8,)):
        with pytest.raises(ValueError):
            main.apply_clahe(img, tile_grid_size=bad_grid)


def test_apply_clahe_realistic_alpha_gradient_rgba():
    rgb = _low_contrast_rgb()
    yy, _ = np.mgrid[0:128, 0:96]
    alpha_gradient = np.clip((yy * 2).astype(np.uint8), 0, 255)  # 0..254 ramp
    rgba = np.dstack([rgb, alpha_gradient])
    out = main.apply_clahe(rgba)
    assert out.shape == rgba.shape
    assert np.array_equal(out[..., 3], alpha_gradient)
    assert not np.array_equal(out[..., :3], rgb)


# --------------------------------------------------------------------------
# CLAHE — Phase 2 pipeline integration
# --------------------------------------------------------------------------


def _phase2_rgba() -> np.ndarray:
    """Small RGBA: centered opaque low-contrast subject on a transparent
    canvas, so the whole lighting pipeline (adaptive -> CLAHE -> shadow ->
    compose) runs fast without any model/segmentation work."""
    h, w = 320, 256
    subject = np.zeros((200, 176, 3), np.uint8)
    yy, xx = np.mgrid[0:200, 0:176].astype(np.float32)
    ramp = np.clip(90.0 + ((yy + xx) / (200 + 176)) * 60.0, 0, 255).astype(np.uint8)
    subject[..., 0] = ramp
    subject[..., 1] = np.clip(ramp.astype(np.int16) * 0.8, 0, 255).astype(np.uint8)
    subject[..., 2] = np.clip(
        255 - ramp.astype(np.int16) * 0.6, 0, 255
    ).astype(np.uint8)
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[60:260, 40:216, :3] = subject
    rgba[60:260, 40:216, 3] = 255
    return rgba


def test_normalize_lighting_invokes_clahe_in_order(monkeypatch):
    """Phase 2: the production pipeline calls apply_clahe() exactly once —
    AFTER adaptive lighting (Order-B) and BEFORE shadow compositing — and
    only ever hands it the 3-channel RGB view, never the alpha channel."""
    rgba = _phase2_rgba()
    order = []
    clahe_seen = {}

    real_adaptive = main.compute_adaptive_brightness_contrast
    real_clahe = main.apply_clahe
    real_shadow = main.build_shadow_layer

    def spy_adaptive(bgr, alpha):
        order.append("adaptive")
        return real_adaptive(bgr, alpha)

    def spy_clahe(image, **kwargs):
        order.append("clahe")
        clahe_seen["channels"] = image.shape[2]
        clahe_seen["spatial"] = image.shape[:2]
        clahe_seen["kwargs"] = dict(kwargs)
        return real_clahe(image, **kwargs)

    def spy_shadow(alpha, canvas_shape):
        order.append("shadow")
        return real_shadow(alpha, canvas_shape)

    monkeypatch.setattr(main, "compute_adaptive_brightness_contrast", spy_adaptive)
    monkeypatch.setattr(main, "apply_clahe", spy_clahe)
    monkeypatch.setattr(main, "build_shadow_layer", spy_shadow)

    timings = {}
    out = main.normalize_lighting_and_flatten(rgba, timings=timings)

    assert order == ["adaptive", "clahe", "shadow"]
    assert clahe_seen["channels"] == 3
    assert clahe_seen["spatial"] == rgba.shape[:2]
    assert out.shape == rgba.shape[:2] + (3,)
    assert out.dtype == np.uint8
    # Phase 4 regression: apply_clahe() defaults are wired to the production
    # constants (see test_apply_clahe_default_parameters), so the pipeline
    # must either rely on those defaults or pass the constants explicitly —
    # never a divergent hard-coded value.
    assert clahe_seen["kwargs"] in (
        {},
        {"clip_limit": main.CLAHE_CLIP_LIMIT, "tile_grid_size": main.CLAHE_TILE_GRID_SIZE},
    )
    # Timing follows the monotonic-seconds convention; numeric, non-negative.
    assert "clahe" in timings
    assert isinstance(timings["clahe"], float)
    assert timings["clahe"] >= 0.0


def test_normalize_lighting_with_clahe_output_contract():
    """Phase 2: with the real helper wired in, the pipeline still returns a
    valid BGR (H,W,3) uint8 composite; transparency still gates the
    composite (subject region processed, transparent area stays clean white),
    dims/channels/dtype unchanged."""
    rgba = _phase2_rgba()
    timings = {}
    out = main.normalize_lighting_and_flatten(rgba, timings=timings)

    assert out.shape[:2] == rgba.shape[:2]
    assert out.shape[2] == 3
    assert out.dtype == np.uint8
    assert "clahe" in timings
    # Transparent corner must remain pristine white: alpha still gates the
    # alpha-blend (if alpha had leaked into CLAHE this could not hold).
    assert np.array_equal(out[0, 0], (255, 255, 255))
    # Subject area was actually processed (adaptive stretch + CLAHE + shadow).
    assert not np.array_equal(out[60:260, 40:216], rgba[60:260, 40:216, :3])


# --------------------------------------------------------------------------
# Order B — product tonal-range protection (overexposure/washout fix)
# --------------------------------------------------------------------------

def _bgr_from_lab(l, a_val=128, b_val=128):
    """BGR (H,W,3) uint8 from an L channel + flat A/B chroma (OpenCV LAB)."""
    lab = np.stack(
        [np.asarray(l, np.float32), np.full(np.asarray(l).shape, a_val, np.float32),
         np.full(np.asarray(l).shape, b_val, np.float32)], axis=-1)
    return cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)


def _product_eval_pair(n=112):
    """Synthetic pale-structured product (source) and the stretch-crushed
    version of it (adjusted) on a transparent canvas, plus the alpha mask.

    Source: pale vase-like gradient L 195..248 (structure preserved).
    Adjusted: same geometry but the upper band collapsed toward the top of the
    representable range, i.e. the Order-B stretch damage the fix must undo.
    Neutral chroma so L=255 is reachable through the LAB round trip.
    """
    yy, xx = np.mgrid[:n, :n]
    sel = (24 <= yy) & (yy < n - 24) & (24 <= xx) & (xx < n - 24)

    src_l = np.full((n, n), 30.0, np.float32)
    t = (yy - 24) / (n - 1 - 48)  # 0..1 across the product band
    src_l[sel] = 195.0 + t[sel] * (248.0 - 195.0)
    src = _bgr_from_lab(src_l)

    adj_l = np.full((n, n), 30.0, np.float32)
    adj_l[sel] = np.clip(215.0 + t[sel] * 40.0, 0.0, 255.0)  # crushed upper band
    adj = _bgr_from_lab(adj_l)

    alpha = np.zeros((n, n), np.uint8)
    alpha[sel] = 255
    return src, adj, alpha


def _product_L(bgr, alpha):
    mask = alpha > 128
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)[..., 0].astype(np.float32)[mask]


def test_tonal_protect_identity_when_no_damage():
    src, _, alpha = _product_eval_pair()
    out = main.protect_product_tonal_range(src, src, alpha)
    assert np.array_equal(out, src)


def test_tonal_protect_dark_product_keeps_improvement_byte_exact():
    # Dark source (24..58), healthy brightened adjusted (40..110): no clipping,
    # no band collapse -> strength 0 -> the adjusted frame must pass through
    # byte-for-byte (the "don't darken healthy/dark products" contract).
    n = 112
    yy, xx = np.mgrid[:n, :n]
    sel = (24 <= yy) & (yy < n - 24) & (24 <= xx) & (xx < n - 24)
    t = (yy - 24) / (n - 1 - 48)

    src_l = np.full((n, n), 20.0, np.float32); src_l[sel] = 24 + t[sel] * 34
    adj_l = np.full((n, n), 30.0, np.float32); adj_l[sel] = 40 + t[sel] * 70
    src = _bgr_from_lab(src_l, a_val=128, b_val=128)
    adj = _bgr_from_lab(adj_l, a_val=128, b_val=128)
    alpha = np.zeros((n, n), np.uint8); alpha[sel] = 255

    out = main.protect_product_tonal_range(src, adj, alpha)
    assert np.array_equal(out, adj)
    # and nothing was darkened relative to the source product
    assert _product_L(out, alpha).mean() >= _product_L(src, alpha).mean()


def test_tonal_protect_restores_crushed_pale_product():
    src, adj, alpha = _product_eval_pair()
    sL = _product_L(src, alpha)
    aL = _product_L(adj, alpha)
    out = main.protect_product_tonal_range(src, adj, alpha)
    oL = _product_L(out, alpha)

    # The corrective signal: median pulled toward the source product's median.
    assert abs(float(np.median(oL)) - float(np.median(sL))) < abs(float(np.median(aL)) - float(np.median(sL)))
    # Crushed-to-white fraction massively reduced.
    assert float((oL >= 254).mean()) < float((aL >= 254).mean())
    # Upper band restored toward the source's own upper structure.
    assert float(np.percentile(oL, 98) - np.percentile(oL, 50)) > float(np.percentile(aL, 98) - np.percentile(aL, 50))
    # Never darkened below what the source product had.
    assert oL.mean() >= sL.mean() - 1.0


def test_tonal_protect_chroma_preserved():
    # Correction is LAB-L only: A/B chroma of the output must equal the
    # adjusted product's chroma (through the same LAB conversion), even for a
    # strongly colored product.
    n = 112
    yy, xx = np.mgrid[:n, :n]
    sel = (24 <= yy) & (yy < n - 24) & (24 <= xx) & (xx < n - 24)
    t = (yy - 24) / (n - 1 - 48)
    alpha = np.zeros((n, n), np.uint8)
    alpha[sel] = 255
    src_l = np.full((n, n), 30.0, np.float32); src_l[sel] = 195 + t[sel] * 53
    adj_l = np.full((n, n), 30.0, np.float32); adj_l[sel] = np.clip(215 + t[sel] * 40, 0, 255)
    src = _bgr_from_lab(src_l, a_val=182, b_val=108)  # strong red/yellow chroma
    adj = _bgr_from_lab(adj_l, a_val=182, b_val=108)
    out = main.protect_product_tonal_range(src, adj, alpha)
    mask = alpha > 128
    aL = cv2.cvtColor(adj, cv2.COLOR_BGR2LAB)[..., 1:3].astype(np.int16)[mask]
    oL = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)[..., 1:3].astype(np.int16)[mask]
    assert np.abs(oL - aL).max() <= 3


def test_tonal_protect_background_untouched_byte_exact():
    src, adj, alpha = _product_eval_pair()
    out = main.protect_product_tonal_range(src, adj, alpha)
    bg = alpha == 0
    assert np.array_equal(out[bg], adj[bg])


def test_tonal_protect_deterministic():
    src, adj, alpha = _product_eval_pair()
    a = main.protect_product_tonal_range(src, adj, alpha)
    b = main.protect_product_tonal_range(src, adj, alpha)
    assert np.array_equal(a, b)


def test_tonal_protect_does_not_mutate_inputs():
    src, adj, alpha = _product_eval_pair()
    src_c, adj_c, alpha_c = src.copy(), adj.copy(), alpha.copy()
    main.protect_product_tonal_range(src, adj, alpha)
    assert np.array_equal(src, src_c)
    assert np.array_equal(adj, adj_c)
    assert np.array_equal(alpha, alpha_c)


def test_tonal_protect_degenerate_mask_is_noop():
    src, adj, _ = _product_eval_pair()
    tiny = np.zeros((112, 112), np.uint8)
    tiny[50:55, 50:55] = 255  # 25 product pixels < 100 guard
    assert np.array_equal(main.protect_product_tonal_range(src, adj, tiny), adj)
    empty = np.zeros((112, 112), np.uint8)
    assert np.array_equal(main.protect_product_tonal_range(src, adj, empty), adj)


def test_tonal_protect_validation_errors():
    src, adj, alpha = _product_eval_pair()
    with pytest.raises(ValueError):
        main.protect_product_tonal_range(src.astype(np.float32), adj, alpha)
    with pytest.raises(ValueError):
        main.protect_product_tonal_range(src, adj.astype(np.float32), alpha)
    with pytest.raises(ValueError):
        main.protect_product_tonal_range(src, adj, alpha.astype(np.float32))
    with pytest.raises(ValueError):
        main.protect_product_tonal_range(src, adj[:, :, :2], alpha)
    with pytest.raises(ValueError):
        main.protect_product_tonal_range(src, adj, alpha[:50, :60])  # shape mismatch
    with pytest.raises(ValueError):
        main.protect_product_tonal_range("nope", adj, alpha)


def test_tonal_protect_adaptivity_across_luminance_profiles():
    # Same geometry (and same damage signature) but different SOURCE
    # luminance: the effect must be near-zero for a dark product and
    # corrective for a pale one — strength emerges from the distributions,
    # not from a fixed luminance rule.
    n = 112
    yy, xx = np.mgrid[:n, :n]
    sel = (24 <= yy) & (yy < n - 24) & (24 <= xx) & (xx < n - 24)
    t = (yy - 24) / (n - 1 - 48)
    alpha = np.zeros((n, n), np.uint8); alpha[sel] = 255

    def build(src_lo, src_hi, adj_lo, adj_hi, label):
        s = np.full((n, n), 20.0, np.float32); s[sel] = src_lo + t[sel] * (src_hi - src_lo)
        a = np.full((n, n), 20.0, np.float32); a[sel] = adj_lo + t[sel] * (adj_hi - adj_lo)
        return _bgr_from_lab(s, 128, 128), _bgr_from_lab(a, 128, 128), label

    pale_src, pale_adj, _ = build(195, 248, 235, 255, "pale")
    dark_src, dark_adj, _ = build(24, 58, 40, 110, "dark")

    out_pale = main.protect_product_tonal_range(pale_src, pale_adj, alpha)
    out_dark = main.protect_product_tonal_range(dark_src, dark_adj, alpha)

    assert not np.array_equal(out_pale, pale_adj)          # engaged
    assert np.array_equal(out_dark, dark_adj)              # no-op
    # adaptive strength genuinely varies across the two profiles
    delta_pale = float(np.abs(_product_L(out_pale, alpha) - _product_L(pale_adj, alpha)).mean())
    delta_dark = float(np.abs(_product_L(out_dark, alpha) - _product_L(dark_adj, alpha)).mean())
    assert delta_pale > 5.0 * max(delta_dark, 1e-6)


def test_tonal_protect_no_invented_detail_on_flat_white_source():
    # A source product whose upper band is ALREADY near the top (crushed in
    # the photo itself) must not be "corrected" into fake texture; the
    # correction approaches zero because the source has no structure to
    # restore.
    n = 112
    yy, xx = np.mgrid[:n, :n]
    sel = (24 <= yy) & (yy < n - 24) & (24 <= xx) & (xx < n - 24)
    alpha = np.zeros((n, n), np.uint8); alpha[sel] = 255
    src_l = np.full((n, n), 30.0, np.float32)
    src_l[sel] = 248.0 + 2.0 * np.sin(yy[sel] / 3.0)  # minuscule, near-top variation
    adj_l = np.full((n, n), 30.0, np.float32)
    adj_l[sel] = 252.0 + 2.0 * np.sin(yy[sel] / 3.0)
    src = _bgr_from_lab(src_l, 150, 140)
    adj = _bgr_from_lab(adj_l, 150, 140)
    out = main.protect_product_tonal_range(src, adj, alpha)
    sL = _product_L(src, alpha)
    oL = _product_L(out, alpha)
    # Near-total no-op: no invented texture, no meaningful darkening.
    assert float(np.abs(oL - sL).mean()) <= 6.0
    assert oL.mean() >= sL.mean() - 3.0


def test_tonal_protect_small_and_large_frames():
    # Vectorized helper must handle different product/frame scales.
    rng = np.random.default_rng(7)
    for h, w in ((64, 64), (300, 200), (129, 73)):
        yy, xx = np.mgrid[:h, :w]
        sel = (h // 8 <= yy) & (yy < h - h // 8) & (w // 8 <= xx) & (xx < w - w // 8)
        src_l = np.full((h, w), 25.0, np.float32)
        adj_l = np.full((h, w), 25.0, np.float32)
        t = (yy - h // 8) / max(h - 2 * (h // 8) - 1, 1)
        src_l[sel] = 190 + t[sel] * 55
        adj_l[sel] = np.clip(215 + t[sel] * 40, 0, 255)
        src = _bgr_from_lab(src_l, 140, 132)
        adj = _bgr_from_lab(adj_l, 140, 132)
        alpha = np.zeros((h, w), np.uint8)
        alpha[sel] = 255
        out = main.protect_product_tonal_range(src, adj, alpha)
        assert out.shape == (h, w, 3)
        assert out.dtype == np.uint8
        assert float((_product_L(out, alpha) >= 254).mean()) == 0.0


def test_tonal_protect_pipeline_deterministic_and_white_bg():
    # Pipeline-level invariants through normalize_lighting_and_flatten (no
    # segmentation needed): repeated runs byte-identical, transparent canvas
    # stays pure white (background left as intended).
    rgba = _phase2_rgba()
    a = main.normalize_lighting_and_flatten(rgba)
    b = main.normalize_lighting_and_flatten(rgba)
    assert np.array_equal(a, b)
    assert np.array_equal(a[0, 0], (255, 255, 255))
    assert np.array_equal(a[-1, -1], (255, 255, 255))
    assert a.shape[:2] == rgba.shape[:2]