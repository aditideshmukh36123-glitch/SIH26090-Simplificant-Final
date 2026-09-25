"""Unit tests for the MoSJE fair-price valuation engine."""

from app.models.schemas import FairPriceRequest, MaterialCostLineInput
from app.services.pricing_engine import calculate_fair_price


def test_spec_example_formula() -> None:
    request = FairPriceRequest(
        raw_material_cost=100.0,
        labor_hours=8.0,
        hourly_wage=50.0,
    )
    result = calculate_fair_price(request)

    base_cost = 100.0 + 8.0 * 50.0  # 500.0
    fair = base_cost * 1.22  # 610.0
    retail = fair * 2.85  # 1738.5
    cut_saved = retail - fair
    artisan_net = fair - 100.0

    assert result.base_cost == round(base_cost, 2)
    assert result.fair_artisan_price == round(fair, 2)
    assert result.retail_middleman_price == round(retail, 2)
    assert result.middleman_cut_saved == round(cut_saved, 2)
    assert result.artisan_net_earnings == round(artisan_net, 2)

    assert result.fair_price_band.min_price == round(fair * 0.90, 2)
    assert result.fair_price_band.recommended_price == round(fair, 2)
    assert result.fair_price_band.max_price == round(fair * 1.18, 2)
    assert result.authenticity_grade == "UNVERIFIED"


def test_material_allocations_sum_overrides_aggregate() -> None:
    request = FairPriceRequest(
        raw_material_cost=999.0,
        labor_hours=2.0,
        hourly_wage=60.0,
        materials=[
            MaterialCostLineInput(material="Natural Clay", unit_cost=40.0, quantity_used=1.5),
            MaterialCostLineInput(material="Organic Husk", unit_cost=20.0, quantity_used=1.0),
        ],
    )
    result = calculate_fair_price(request)

    assert result.material_allocations is not None
    allocated = [line.total_cost for line in result.material_allocations]
    assert allocated == [60.0, 20.0]

    base_cost = 80.0 + 2.0 * 60.0
    assert result.base_cost == round(base_cost, 2)
    assert result.fair_artisan_price == round(base_cost * 1.22, 2)


def test_positive_breakdown_invariants() -> None:
    result = calculate_fair_price(
        FairPriceRequest(raw_material_cost=25.0, labor_hours=1.0, hourly_wage=100.0)
    )
    assert len(result.breakdown) == 8
    # Middleman cut always exceeds the artisan take when margins are constant.
    assert result.middleman_cut_saved > result.artisan_net_earnings
