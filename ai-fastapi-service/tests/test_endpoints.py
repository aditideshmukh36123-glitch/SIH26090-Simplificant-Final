"""End-to-end endpoint tests with all external services mocked.

Enhance-image: rembg and Cloudinary are faked; the whole OpenCV pipeline runs
for real. Catalog-audio: the Gemini client is faked across the two-stage
verification->pricing pipeline (Orders I-N) — or the Groq client where the
provider is switched to "groq" — asserting the shared hard gate, the Python-side
deviation flag, the category bounds clamp, and the contract being identical
across both providers, plus the try/finally zero-leak cleanup guarantee.
"""

import asyncio
import io
import os
from types import SimpleNamespace

import groq
import pytest
from PIL import Image, ImageDraw

import main

HEADERS = {"X-API-Key": "test-secret"}


def _sample_product_png_bytes() -> bytes:
    """128x96 PNG: opaque terracotta block on the left, transparent right."""
    img = Image.new("RGBA", (128, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([5, 5, 60, 90], fill=(180, 90, 60, 255))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


# --------------------------------------------------------------------------
# /api/enhance-image
# --------------------------------------------------------------------------
def _valid_image_upload():
    return {"file": ("pot.png", _sample_product_png_bytes(), "image/png")}


def test_enhance_image_happy_path(client, monkeypatch):
    monkeypatch.setattr(main, "_REMBG_SESSION", object())
    monkeypatch.setattr(main, "_REMBG_FALLBACK_SESSION", None)

    def fake_remove(image_bytes, **kwargs):
        return _sample_product_png_bytes()

    monkeypatch.setattr(main, "remove", fake_remove)
    monkeypatch.setattr(
        main,
        "upload_to_cloudinary",
        lambda img_bytes, public_id: "https://cloud.test/out.jpg",
    )

    resp = client.post("/api/enhance-image", headers=HEADERS, files=_valid_image_upload())
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "success"
    assert body["clean_image_url"] == "https://cloud.test/out.jpg"


def test_enhance_image_rejects_bad_content_type(client, monkeypatch):
    resp = client.post(
        "/api/enhance-image",
        headers=HEADERS,
        files={"file": ("x.gif", b"GIF89a", "image/gif")},
    )
    assert resp.status_code == 415


# --------------------------------------------------------------------------
# /api/catalog-audio
# --------------------------------------------------------------------------
class FakeFile:
    def __init__(self, name):
        self.name = name
        self.state = SimpleNamespace(name="ACTIVE")


class FakeFilesAPI:
    def __init__(self):
        self.deleted = []

    def upload(self, **kwargs):
        return FakeFile("files/fake-" + str(len(self.deleted) + 1))

    def delete(self, **kwargs):
        self.deleted.append(kwargs["name"])


def _default_verification(
    match=True, confidence="high", seller_price=500
) -> "main.ProductVerification":
    return main.ProductVerification(
        image_detected_category="pottery",
        image_detected_materials=["terracotta", "clay"],
        image_visual_quality_tier="standard",
        audio_described_product="a handcrafted clay pot",
        audio_mentioned_price_inr=seller_price,
        audio_mentioned_cost_context="two days of work",
        consistency_match=match,
        consistency_confidence=confidence,
        consistency_notes=(
            "Image shows a terracotta pot and the seller describes a clay pot "
            "— clear match." if match
            else "Audio describes a saree but the image shows a clay pot."
        ),
    )


def _default_catalog(suggested_price_inr=550, price_confidence="high") -> "main.CatalogData":
    return main.CatalogData(
        seo_title="Handcrafted Clay Matka",
        description_english="Professional English description.",
        description_hindi="पेशेवर हिंदी विवरण।",
        tags=["matka", "clay pot", "handcrafted"],
        suggested_price_inr=suggested_price_inr,
        price_confidence=price_confidence,
        pricing_reasoning="Standard-tier terracotta pottery.",
    )


class FakeModels:
    def __init__(self, fail_with=None, verification=None, catalog=None):
        self.fail_with = fail_with
        self.verification = verification or _default_verification()
        self.catalog = catalog or _default_catalog()
        self.calls = []

    def generate_content(self, **kwargs):
        if self.fail_with is not None:
            raise self.fail_with
        schema = getattr(kwargs.get("config"), "response_schema", None)
        if schema is main.ProductVerification:
            self.calls.append("verification")
            return SimpleNamespace(parsed=self.verification, text=None)
        self.calls.append("pricing")
        return SimpleNamespace(parsed=self.catalog, text=None)


class _FakeAsyncFilesAPI:
    """Async .aio.files surface delegating to the sync fake below."""

    def __init__(self, files):
        self._files = files

    async def upload(self, **kwargs):
        return self._files.upload(**kwargs)

    async def get(self, **kwargs):
        return self._files.get(**kwargs)

    async def delete(self, **kwargs):
        self._files.delete(**kwargs)


class _FakeAsyncModels:
    """Async .aio.models surface delegating to the sync fake below."""

    def __init__(self, models):
        self._models = models

    async def generate_content(self, **kwargs):
        return self._models.generate_content(**kwargs)


class FakeGemini:
    def __init__(self, fail_with=None, verification=None, catalog=None):
        self.files = FakeFilesAPI()
        self.models = FakeModels(
            fail_with=fail_with, verification=verification, catalog=catalog
        )
        # The real client exposes `aio` for async SDK calls; the route now
        # goes exclusively through it, so expose async wrappers backed by the
        # same fakes (state — deleted list, call log — stays shared/assertable).
        self.aio = SimpleNamespace(
            files=_FakeAsyncFilesAPI(self.files),
            models=_FakeAsyncModels(self.models),
        )


def _patch_catalog_deps(monkeypatch, tmp_path, gemini):
    async def fake_save_audio(file) -> str:
        path = tmp_path / "audio.mp4"
        path.write_bytes(b"audio-bytes")
        return str(path)

    async def fake_download_image(image_url):
        path = tmp_path / "product.png"
        path.write_bytes(b"png-bytes")
        return str(path), "image/png"

    async def fake_wait(f, label="file"):
        return f

    monkeypatch.setattr(main, "validate_and_save_audio_upload", fake_save_audio)
    monkeypatch.setattr(main, "download_image_to_tempfile", fake_download_image)
    monkeypatch.setattr(main, "wait_for_file_active", fake_wait)
    monkeypatch.setattr(main, "_genai_client", gemini)


# --------------------------------------------------------------------------
# Groq provider — fakes for the AsyncGroq client surface
# --------------------------------------------------------------------------
class _FakeGroqAudioTranscriptions:
    def __init__(self, transcript):
        self._transcript = transcript
        self.calls = 0

    async def create(self, **kwargs):
        self.calls += 1
        return self._transcript


class _FakeGroqChatCompletions:
    """Serves verification JSON first, pricing JSON second (call order)."""

    def __init__(self, verification, catalog):
        self._payloads = [
            (verification or _default_verification()).model_dump_json(),
            (catalog or _default_catalog()).model_dump_json(),
        ]
        self.calls = []

    async def create(self, **kwargs):
        index = len(self.calls)
        self.calls.append("verification" if index == 0 else "pricing")
        payload = self._payloads[index]
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=payload))]
        )


class _FakeGroqClient:
    """Async surface mirroring groq.AsyncGroq sufficiently for the route."""

    def __init__(self, transcript="...", verification=None, catalog=None):
        self.audio = SimpleNamespace(
            transcriptions=_FakeGroqAudioTranscriptions(transcript)
        )
        self.chat = SimpleNamespace(
            completions=_FakeGroqChatCompletions(verification, catalog)
        )


def _tiny_png_bytes() -> bytes:
    img = Image.new("RGB", (64, 64), (180, 90, 60))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def _patch_groq_catalog_deps(monkeypatch, tmp_path, groq_client):
    async def fake_save_audio(file) -> str:
        path = tmp_path / "audio.mp4"
        path.write_bytes(b"audio-bytes")
        return str(path)

    async def fake_download_image(image_url):
        path = tmp_path / "product.png"
        path.write_bytes(_tiny_png_bytes())
        return str(path), "image/png"

    monkeypatch.setattr(main, "validate_and_save_audio_upload", fake_save_audio)
    monkeypatch.setattr(main, "download_image_to_tempfile", fake_download_image)
    monkeypatch.setattr(main, "_groq_client", groq_client)


AUDIO_FILES = {"file": ("note.mp4", b"audio-bytes", "video/mp4")}
AUDIO_DATA = {"image_url": "https://cloud.test/product.jpg"}


def test_catalog_audio_success_with_zero_leak(client, monkeypatch, tmp_path):
    gemini = FakeGemini()
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 200, resp.text

    body = resp.json()
    assert body["status"] == "success"
    # Full verification block ships on every success (Order N).
    assert body["verification"]["consistency_match"] is True
    assert body["verification"]["image_detected_category"] == "pottery"
    catalog = body["catalog"]
    assert catalog["seo_title"] == "Handcrafted Clay Matka"
    assert catalog["suggested_price_inr"] == 550
    assert catalog["seller_stated_price_inr"] == 500
    # |550 - 500| / 500 = 0.10 -> no deviation flag.
    assert catalog["price_deviation_flag"] is False
    assert catalog["price_bounds_clamped"] is False
    assert "matka" in catalog["tags"]
    # Exactly two Gemini calls: verification first, pricing second.
    assert gemini.models.calls == ["verification", "pricing"]

    # Zero leak: both remote Gemini files deleted, both local temp files gone.
    assert len(gemini.files.deleted) == 2
    assert not os.path.exists(tmp_path / "audio.mp4")
    assert not os.path.exists(tmp_path / "product.png")


def test_catalog_audio_gate_blocks_mismatched_product(client, monkeypatch, tmp_path):
    # Audio describes a saree, image shows a clay pot -> hard stop, no price.
    gemini = FakeGemini(
        verification=_default_verification(match=False, confidence="high")
    )
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 422

    body = resp.json()
    assert body["status"] == "needs_review"
    assert "saree" in body["reason"]
    assert body["verification"]["consistency_match"] is False

    # Hard gate: the pricing call must never have run.
    assert gemini.models.calls == ["verification"]
    # Cleanup still fires on the gate short-circuit path.
    assert len(gemini.files.deleted) == 2
    assert not os.path.exists(tmp_path / "audio.mp4")
    assert not os.path.exists(tmp_path / "product.png")


def test_catalog_audio_gate_blocks_low_confidence_audio(client, monkeypatch, tmp_path):
    # Ambiguous/vague audio: low confidence is treated exactly like a mismatch.
    gemini = FakeGemini(
        verification=_default_verification(match=True, confidence="low")
    )
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 422
    assert resp.json()["status"] == "needs_review"
    assert gemini.models.calls == ["verification"]


def test_catalog_audio_flags_large_price_deviation(client, monkeypatch, tmp_path):
    # Seller states 500; independent model estimate is 1200 -> ratio 1.4 > 0.40.
    gemini = FakeGemini(
        verification=_default_verification(seller_price=500),
        catalog=_default_catalog(suggested_price_inr=1200),
    )
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 200, resp.text
    catalog = resp.json()["catalog"]
    assert catalog["seller_stated_price_inr"] == 500
    assert catalog["suggested_price_inr"] == 1200
    assert catalog["price_deviation_flag"] is True


def test_catalog_audio_clamps_out_of_bounds_price(client, monkeypatch, tmp_path):
    # Pottery ceiling is 5000; a model-suggested 50,000 must be clamped and
    # confidence forced to "low" regardless of what the model reported.
    gemini = FakeGemini(
        verification=_default_verification(),
        catalog=_default_catalog(suggested_price_inr=50_000, price_confidence="high"),
    )
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 200, resp.text
    catalog = resp.json()["catalog"]
    assert catalog["suggested_price_inr"] == 5000
    assert catalog["price_bounds_clamped"] is True
    assert catalog["price_confidence"] == "low"


def test_catalog_audio_cleanup_fires_on_generate_failure(
    client, monkeypatch, tmp_path,
):
    from google.genai.errors import APIError

    # Permanent error (400) so the retry wrapper does not add latency.
    gemini = FakeGemini(fail_with=APIError(code=400, response_json={}))
    _patch_catalog_deps(monkeypatch, tmp_path, gemini)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 500
    assert "cataloging/pricing failed" in resp.json()["detail"]

    # Even on failure: remote files deleted, local temp files deleted.
    assert len(gemini.files.deleted) == 2
    assert not os.path.exists(tmp_path / "audio.mp4")
    assert not os.path.exists(tmp_path / "product.png")


def test_catalog_audio_cleanup_fires_when_image_download_fails(
    client, monkeypatch, tmp_path,
):
    from fastapi import HTTPException

    async def fake_save_audio(file) -> str:
        path = tmp_path / "audio.mp4"
        path.write_bytes(b"audio-bytes")
        return str(path)

    async def fake_download_fails(image_url):
        raise HTTPException(status_code=422, detail="url unreachable")

    monkeypatch.setattr(main, "validate_and_save_audio_upload", fake_save_audio)
    monkeypatch.setattr(main, "download_image_to_tempfile", fake_download_fails)
    monkeypatch.setattr(main, "_genai_client", FakeGemini())

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 422
    # Audio temp file must still be removed; nothing was uploaded to Gemini.
    assert not os.path.exists(tmp_path / "audio.mp4")


def test_catalog_audio_retries_transient_then_succeeds(monkeypatch, tmp_path):
    """The retry wrapper absorbs one transient failure before succeeding."""
    calls = {"n": 0}

    def flaky():
        calls["n"] += 1
        if calls["n"] == 1:
            raise main.httpx.ConnectError("blip", request=None)
        return "ok"

    monkeypatch.setattr(main, "API_RETRY_BASE_DELAY_SECONDS", 0.01)
    monkeypatch.setattr(main, "API_RETRY_MAX_DELAY_SECONDS", 0.03)

    import asyncio

    result = asyncio.run(main.run_google_call(flaky, label="test"))
    assert result == "ok"
    assert calls["n"] == 2


def test_retry_wrapper_does_not_retry_permanent_errors(monkeypatch):
    from google.genai.errors import APIError

    calls = {"n": 0}

    def always_bad():
        calls["n"] += 1
        raise APIError(code=401, response_json={})

    monkeypatch.setattr(main, "API_RETRY_BASE_DELAY_SECONDS", 0.01)
    monkeypatch.setattr(main, "API_RETRY_MAX_DELAY_SECONDS", 0.03)

    import asyncio

    with pytest.raises(APIError):
        asyncio.run(main.run_google_call(always_bad, label="test"))
    assert calls["n"] == 1  # single attempt — 401 not retried


# --------------------------------------------------------------------------
# Groq provider — /api/catalog-audio via the toggleable backend
# --------------------------------------------------------------------------
GROQ_CONTRACT_EXPECTED = (
    "Top-level/verification/catalog key sets must match the Gemini path exactly "
    "— the external contract is provider-agnostic."
)


def _assert_groq_contract_shape(body):
    assert sorted(body.keys()) == ["catalog", "status", "verification"], GROQ_CONTRACT_EXPECTED
    assert set(body["verification"].keys()) == {
        "audio_described_product",
        "audio_mentioned_cost_context",
        "audio_mentioned_price_inr",
        "consistency_confidence",
        "consistency_match",
        "consistency_notes",
        "image_detected_category",
        "image_detected_materials",
        "image_visual_quality_tier",
    }, GROQ_CONTRACT_EXPECTED
    assert set(body["catalog"].keys()) == {
        "description_english",
        "description_hindi",
        "price_bounds_clamped",
        "price_confidence",
        "price_deviation_flag",
        "pricing_reasoning",
        "seller_stated_price_inr",
        "seo_title",
        "suggested_price_inr",
        "tags",
    }, GROQ_CONTRACT_EXPECTED


def test_catalog_audio_groq_path_contract_identical(client, monkeypatch, tmp_path):
    """Groq branch: identical JSON contract, correct call sequence, zero leak."""
    groq_client = _FakeGroqClient(
        transcript="Maine mitti ke matke banaye hain. Sawa paanch sau rupaye.",
        verification=_default_verification(),
        catalog=_default_catalog(),
    )
    # The Gemini client is left installed but must NEVER be touched on the
    # groq path — assert its Files API saw zero traffic.
    gemini = FakeGemini()
    monkeypatch.setattr(main, "AI_PROVIDER", "groq")
    monkeypatch.setattr(main, "_genai_client", gemini)
    _patch_groq_catalog_deps(monkeypatch, tmp_path, groq_client)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 200, resp.text

    body = resp.json()
    _assert_groq_contract_shape(body)
    assert body["status"] == "success"
    assert body["verification"]["consistency_match"] is True
    assert body["verification"]["image_detected_category"] == "pottery"
    catalog = body["catalog"]
    assert catalog["seo_title"] == "Handcrafted Clay Matka"
    assert catalog["suggested_price_inr"] == 550
    assert catalog["seller_stated_price_inr"] == 500
    assert catalog["price_deviation_flag"] is False
    assert catalog["price_bounds_clamped"] is False

    # Whisper transcribed once, then verification chat then pricing chat.
    assert groq_client.audio.transcriptions.calls == 1
    assert groq_client.chat.completions.calls == ["verification", "pricing"]

    # Zero leak: no Files-API lifecycle on the groq path, local temp files gone.
    assert gemini.files.deleted == []
    assert not os.path.exists(tmp_path / "audio.mp4")
    assert not os.path.exists(tmp_path / "product.png")


def test_catalog_audio_groq_path_gate_blocks_mismatch(client, monkeypatch, tmp_path):
    """The shared hard gate fires identically on the groq branch."""
    groq_client = _FakeGroqClient(
        transcript="Main ek saree bech raha hoon.",
        verification=_default_verification(match=False, confidence="high"),
    )
    gemini = FakeGemini()
    monkeypatch.setattr(main, "AI_PROVIDER", "groq")
    monkeypatch.setattr(main, "_genai_client", gemini)
    _patch_groq_catalog_deps(monkeypatch, tmp_path, groq_client)

    resp = client.post(
        "/api/catalog-audio", headers=HEADERS, files=AUDIO_FILES, data=AUDIO_DATA
    )
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == "needs_review"
    assert "saree" in body["reason"]
    assert body["verification"]["consistency_match"] is False

    # Transcription + verification chat happened; the pricing chat never ran.
    assert groq_client.audio.transcriptions.calls == 1
    assert groq_client.chat.completions.calls == ["verification"]
    # Cleanup still fires on the gate short-circuit path, and nothing was
    # uploaded to Gemini.
    assert gemini.files.deleted == []
    assert not os.path.exists(tmp_path / "audio.mp4")
    assert not os.path.exists(tmp_path / "product.png")


def test_groq_structured_chat_validates_json(monkeypatch):
    """The real groq_structured_chat parses+validates the raw model text."""
    catalog = _default_catalog()

    class _ChatOnce:
        async def create(self, **kwargs):
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(message=SimpleNamespace(content=catalog.model_dump_json()))
                ]
            )

    monkeypatch.setattr(
        main, "_groq_client",
        SimpleNamespace(chat=SimpleNamespace(completions=_ChatOnce())),
    )
    result = asyncio.run(
        main.groq_structured_chat(
            "some prompt", "data:image/png;base64,AAAA", main.CatalogData, label="groq pricing"
        )
    )
    assert result.model_dump() == catalog.model_dump()


def test_groq_structured_chat_raises_502_on_bad_schema(monkeypatch):
    from fastapi import HTTPException

    class _ChatGarbage:
        async def create(self, **kwargs):
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(message=SimpleNamespace(content='{"not": "valid schema"}'))
                ]
            )

    monkeypatch.setattr(
        main, "_groq_client",
        SimpleNamespace(chat=SimpleNamespace(completions=_ChatGarbage())),
    )
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            main.groq_structured_chat(
                "some prompt", "data:image/png;base64,AAAA", main.CatalogData, label="groq pricing"
            )
        )
    assert exc_info.value.status_code == 502


def test_transcribe_audio_groq_returns_transcript_text(monkeypatch, tmp_path):
    """response_format="text" returns a bare str, passed through unchanged."""
    path = tmp_path / "note.mp4"
    path.write_bytes(b"audio-bytes")
    monkeypatch.setattr(
        main, "_groq_client",
        SimpleNamespace(
            audio=SimpleNamespace(transcriptions=_FakeGroqAudioTranscriptions("hello transcript"))
        ),
    )
    result = asyncio.run(main.transcribe_audio_groq(str(path)))
    assert result == "hello transcript"


def test_image_to_base64_data_uri_downscales(monkeypatch, tmp_path):
    """Oversized product photos must be downscaled before inlining."""
    from PIL import Image as _PILImage

    img = _PILImage.new("RGB", (4000, 100), (180, 90, 60))
    path = tmp_path / "large.png"
    img.save(str(path), format="PNG")

    monkeypatch.setattr(main, "GROQ_IMAGE_MAX_DIMENSION", 1200)
    data_uri = main._image_to_base64_data_uri(str(path), "image/png")

    assert data_uri.startswith("data:image/png;base64,")
    import base64 as _b64

    decoded = _PILImage.open(io.BytesIO(_b64.b64decode(data_uri.split(",", 1)[1])))
    assert max(decoded.size) <= 1200


# Permanent vs transient classification of Groq SDK errors. The openai-style
# exceptions require (message, response, body) at construction, so build them
# for real with a minimal httpx.Response to control the status code.
def _make_groq_error(cls, code):
    request = main.httpx.Request("POST", "https://api.groq.com/openai/v1/test")
    response = main.httpx.Response(code, request=request)
    return cls("test error", response=response, body=None)


def test_is_transient_groq_error_classification():
    assert main._is_transient_groq_error(_make_groq_error(groq.RateLimitError, 429))
    assert main._is_transient_groq_error(_make_groq_error(groq.APIStatusError, 500))
    assert main._is_transient_groq_error(groq.APITimeoutError(request=main.httpx.Request("POST", "https://api.groq.com/openai/v1/test")))
    assert not main._is_transient_groq_error(_make_groq_error(groq.AuthenticationError, 401))
    assert not main._is_transient_groq_error(_make_groq_error(groq.NotFoundError, 404))


def test_run_groq_call_async_retries_transient_then_succeeds(monkeypatch):
    calls = {"n": 0}

    async def flaky():
        calls["n"] += 1
        if calls["n"] == 1:
            raise _make_groq_error(groq.RateLimitError, 429)
        return "ok"

    monkeypatch.setattr(main, "API_RETRY_BASE_DELAY_SECONDS", 0.01)
    monkeypatch.setattr(main, "API_RETRY_MAX_DELAY_SECONDS", 0.03)

    result = asyncio.run(main.run_groq_call_async(flaky, label="test"))
    assert result == "ok"
    assert calls["n"] == 2


def test_run_groq_call_async_does_not_retry_permanent_errors(monkeypatch):
    calls = {"n": 0}

    async def always_bad():
        calls["n"] += 1
        raise _make_groq_error(groq.AuthenticationError, 401)

    monkeypatch.setattr(main, "API_RETRY_BASE_DELAY_SECONDS", 0.01)
    monkeypatch.setattr(main, "API_RETRY_MAX_DELAY_SECONDS", 0.03)

    with pytest.raises(groq.AuthenticationError):
        asyncio.run(main.run_groq_call_async(always_bad, label="test"))
    assert calls["n"] == 1  # single attempt — 401 not retried