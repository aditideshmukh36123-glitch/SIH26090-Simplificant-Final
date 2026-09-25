"""FastAPI application entry point for the SIH26090 AI microservice.

Independent microservice: it is never imported or bundled by the Node core backend.
The React Native client talks to this service directly for the three AI endpoints.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings, verify_config
from app.routers import catalog, image_studio, pricing
from app.services import cloudinary_client, gemini_client

settings = get_settings()
verify_config(settings)
cloudinary_client.configure(settings)
gemini_client.configure(settings)

app = FastAPI(
    title="SIH26090 AI Microservice",
    version="0.1.0",
    description="Gemini multimodal catalog, Rembg studio enhancement and fair-price valuation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_studio.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-microservice", "model": settings.gemini_model}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.ai_port, reload=True)
