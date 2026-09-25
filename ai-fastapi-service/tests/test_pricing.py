"""Unit tests for Order M — deterministic category price bounds.

These are pure-Python functions (no LLM, no network) that form the hard safety
net of the two-stage pricing pipeline, independent of any model output.
"""

import pytest

import main


def test_bounds_pass_through_in_range_price():
    clamped, flagged = main.validate_price_within_bounds("pottery", 1500)
    assert (clamped, flagged) == (1500, False)


def test_bounds_clamp_above_ceiling_and_flag():
    clamped, flagged = main.validate_price_within_bounds("pottery", 50_000)
    assert (clamped, flagged) == (5000, True)


def test_bounds_clamp_below_floor_and_flag():
    clamped, flagged = main.validate_price_within_bounds("pottery", 100)
    assert (clamped, flagged) == (150, True)


def test_bounds_match_is_case_insensitive():
    clamped, flagged = main.validate_price_within_bounds("POTTERY", 50_000)
    assert (clamped, flagged) == (5000, True)


def test_bounds_substring_match_on_free_form_category():
    # Model category strings are free-form; "clay pottery" must resolve to the
    # pottery bounds rather than falling through to default.
    clamped, flagged = main.validate_price_within_bounds("clay pottery & terracotta", 50_000)
    assert (clamped, flagged) == (5000, True)


def test_bounds_unknown_category_falls_back_to_default():
    clamped, flagged = main.validate_price_within_bounds("mystery_gadget", 100_000)
    assert (clamped, flagged) == (25000, True)


def test_bounds_default_within_range_noop():
    clamped, flagged = main.validate_price_within_bounds("mystery_gadget", 5_000)
    assert (clamped, flagged) == (5000, False)


def test_bounds_empty_category_is_safe_default():
    clamped, flagged = main.validate_price_within_bounds("", 0)
    assert (clamped, flagged) == (100, True)


def test_hard_bounds_exist_for_every_directive_category():
    for category in [
        "pottery", "handloom_textile", "bamboo_cane", "wood_carving",
        "embroidery_textile", "jewelry_imitation", "leather_goods",
        "metal_craft", "painting_folk_art", "default",
    ]:
        low, high = main.CATEGORY_PRICE_BOUNDS_INR[category]
        assert low >= 0
        assert high > low


def test_clamped_price_reviolates_no_bounds_and_preserves_signal():
    # After clamping, re-running the validator must no longer flag — the result
    # is inside its own category bounds.
    clamped, flagged = main.validate_price_within_bounds("embroidery_textile", 999_999)
    assert flagged is True
    reclamped, reflagged = main.validate_price_within_bounds("embroidery_textile", clamped)
    assert (reclamped, reflagged) == (clamped, False)