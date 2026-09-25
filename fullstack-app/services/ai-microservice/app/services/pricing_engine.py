"""MoSJE fair-wage mathematical valuation engine.

Formulas
--------
    Base Cost                = Material Cost + (Labor Hours * Hourly Wage)
    Fair Artisan Direct Price = Base Cost * 1.22
    Retail Middleman Price    = Fair Artisan Direct Price * 2.85
    Middleman Cut Saved       = Retail Middleman Price - Fair Artisan Direct Price
    Artisan Net Earnings      = Fair Artisan Direct Price - Material Cost
    Fair Price Band           = [0.90 * Fair, 1.18 * Fair]

The complexity multiplier (1.22), middleman multiplier (2.85) and price band
factors are constants mandated by the SIH26090 specification.
"""

from __future__ import annotations

from app.models.schemas import (
    FairPriceBand,
    FairPriceRequest,
    FairPriceResponse,
    MaterialCostLine,
    PriceLineItem,
)

COMPLEXITY_MULTIPLIER = 1.22
RETAIL_MIDDLEMAN_MULTIPLIER = 2.85
BAND_MIN_FACTOR = 0.90
BAND_MAX_FACTOR = 1.18

DEFAULT_AUTHENTICITY_GRADE = "UNVERIFIED"


def _round_money(value: float) -> float:
    return round(value, 2)


def calculate_fair_price(request: FairPriceRequest) -> FairPriceResponse:
    material_allocations: list[MaterialCostLine] | None = None
    material_cost = request.raw_material_cost

    if request.materials:
        material_allocations = []
        allocated_total = 0.0
        for line in request.materials:
            total_cost = round(line.unit_cost * line.quantity_used, 2)
            material_allocations.append(
                MaterialCostLine(
                    material=line.material,
                    unit_cost=round(line.unit_cost, 2),
                    quantity_used=line.quantity_used,
                    total_cost=total_cost,
                )
            )
            allocated_total += total_cost
        material_cost = allocated_total if allocated_total > 0 else request.raw_material_cost

    labor_cost = request.labor_hours * request.hourly_wage
    base_cost = material_cost + labor_cost

    fair_artisan_price = base_cost * COMPLEXITY_MULTIPLIER
    retail_middleman_price = fair_artisan_price * RETAIL_MIDDLEMAN_MULTIPLIER
    middleman_cut_saved = retail_middleman_price - fair_artisan_price
    artisan_net_earnings = fair_artisan_price - material_cost

    band = FairPriceBand(
        min_price=_round_money(fair_artisan_price * BAND_MIN_FACTOR),
        recommended_price=_round_money(fair_artisan_price),
        max_price=_round_money(fair_artisan_price * BAND_MAX_FACTOR),
    )

    breakdown = [
        PriceLineItem(label="Raw Material Cost", amount=_round_money(material_cost)),
        PriceLineItem(label="Labor Cost (hrs * wage)", amount=_round_money(labor_cost)),
        PriceLineItem(label="Base Cost", amount=_round_money(base_cost)),
        PriceLineItem(label="Complexity Multiplier (1.22)", amount=COMPLEXITY_MULTIPLIER),
        PriceLineItem(label="Fair Artisan Direct Price", amount=_round_money(fair_artisan_price)),
        PriceLineItem(label="Retail Middleman Price (x2.85)", amount=_round_money(retail_middleman_price)),
        PriceLineItem(label="Middleman Cut Saved (DBT)", amount=_round_money(middleman_cut_saved)),
        PriceLineItem(label="Artisan Net Earnings", amount=_round_money(artisan_net_earnings)),
    ]

    return FairPriceResponse(
        status="success",
        base_cost=_round_money(base_cost),
        complexity_multiplier=COMPLEXITY_MULTIPLIER,
        fair_artisan_price=_round_money(fair_artisan_price),
        retail_middleman_price=_round_money(retail_middleman_price),
        middleman_cut_saved=_round_money(middleman_cut_saved),
        artisan_net_earnings=_round_money(artisan_net_earnings),
        authenticity_grade=request.authenticity_grade or DEFAULT_AUTHENTICITY_GRADE,
        breakdown=breakdown,
        material_allocations=material_allocations,
        fair_price_band=band,
    )
