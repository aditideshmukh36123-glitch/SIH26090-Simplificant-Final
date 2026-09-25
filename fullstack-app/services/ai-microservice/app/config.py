"""Pydantic settings for the AI microservice.

Secrets are read from the local .env file via pydantic-settings. Field names map
to uppercase environment variables (e.g. ``gemini_api_key`` <-> ``GEMINI_API_KEY``).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

GEMINI_DEFAULT_MODEL = "gemini-1.5-flash"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ai_port: int = 5000
    ai_env: str = "development"

    gemini_api_key: str = ""
    gemini_model: str = GEMINI_DEFAULT_MODEL

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_folder: str = "sih26090/ai"


def verify_config(settings: Settings) -> None:
    """Fail fast at startup when a required upstream provider is unconfigured."""
    missing: list[str] = []
    if not settings.gemini_api_key:
        missing.append("GEMINI_API_KEY")
    if not (
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    ):
        missing.append("Cloudinary credentials (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)")
    if missing:
        raise RuntimeError("AI microservice is missing required environment variables: " + ", ".join(missing))


@lru_cache
def get_settings() -> Settings:
    return Settings()
