"""MoSJE Fair-Price Guild Valuation endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import FairPriceRequest, FairPriceResponse
from app.services.pricing_engine import calculate_fair_price

router = APIRouter(tags=["pricing"])


@router.post(
    "/predict-fair-price",
    response_model=FairPriceResponse,
    summary="Guild fair-wage valuation with middleman-cut transparency",
)
async def predict_fair_price(request: FairPriceRequest) -> FairPriceResponse:
    return calculate_fair_price(request)
