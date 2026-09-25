"""Tests for the X-API-Key route protection."""


def test_health_is_open(client):
    assert client.get("/health").status_code == 200


def test_enhance_image_rejects_missing_key(client):
    resp = client.post("/api/enhance-image")
    assert resp.status_code == 401
    assert "X-API-Key" in resp.json()["detail"]


def test_enhance_image_rejects_wrong_key(client):
    resp = client.post(
        "/api/enhance-image",
        headers={"X-API-Key": "totally-wrong-key"},
    )
    assert resp.status_code == 401


def test_catalog_audio_rejects_missing_key(client):
    resp = client.post("/api/catalog-audio")
    assert resp.status_code == 401


def test_auth_fails_closed_when_server_key_unset(monkeypatch):
    import main
    import pytest
    from fastapi import HTTPException

    monkeypatch.setattr(main, "X_API_KEY", "")
    with pytest.raises(HTTPException) as exc_info:
        main.verify_api_key(x_api_key="anything")
    assert exc_info.value.status_code == 503


def test_auth_accepts_correct_key(monkeypatch):
    import main

    monkeypatch.setattr(main, "X_API_KEY", "test-secret")
    assert main.verify_api_key(x_api_key="test-secret") is None


def test_auth_rejects_wrong_key_directly(monkeypatch):
    import main
    from fastapi import HTTPException
    import pytest

    monkeypatch.setattr(main, "X_API_KEY", "test-secret")
    with pytest.raises(HTTPException) as exc_info:
        main.verify_api_key(x_api_key="nope")
    assert exc_info.value.status_code == 401