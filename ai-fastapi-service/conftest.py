"""
Shared test fixtures.

Sets dummy credentials BEFORE importing main so no real secret ever touches a
test, clears FastAPI's startup handlers so the multi-hundred-MB rembg models
are never downloaded/loaded in tests, and exposes a TestClient for the
HTTP-level tests.
"""

import os

import pytest

os.environ.setdefault("GEMINI_API_KEY", "test-dummy-gemini-key")
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test")
os.environ.setdefault("CLOUDINARY_API_KEY", "test")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test")
os.environ.setdefault("X_API_KEY", "test-secret")
# The catalog-audio backend is selected at import time via AI_PROVIDER (which
# DEFAULTS to "groq"). The pre-existing endpoint tests fake the GEMINI client,
# so this is a HARD pin to "gemini" (not setdefault): a developer who exported
# AI_PROVIDER=groq in their shell must not silently reroute those tests into
# the Groq branch. The dedicated Groq tests switch to "groq" per-test via
# monkeypatch on the module global, and are immune to this pin.
os.environ["AI_PROVIDER"] = "gemini"

import main  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402


# Ensure FastAPI never runs the heavyweight startup (rembg model loading) --
# unit and endpoint tests must not pay for (or attempt to download) the ONNX
# models or talk to Google/Cloudinary.
main.app.router.on_startup.clear()


@pytest.fixture()
def client():
    with TestClient(main.app) as test_client:
        yield test_client