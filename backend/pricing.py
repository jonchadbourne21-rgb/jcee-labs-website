"""Deterministic pricing engine for AI-scoped property claims.

The public ``compute_claim_estimate`` function intentionally retains the price,
rounding, coverage, depreciation, and payout semantics supplied for this
prototype.  Do not replace its intermediate rounding with decimal aggregation:
those cents are part of the demo contract.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class RegionalUnitRate:
    cat_code: str
    sel_code: str
    action: str
    description: str
    unit: str
    base_unit_price: float
    material_ratio: float
    lifespan_years: float
    is_remediation: bool = False


PRICE_BOOK: dict[tuple[str, str, str], RegionalUnitRate] = {
    ("FNC", "BASE4", "&"): RegionalUnitRate(
        "FNC", "BASE4", "&", "Tear out & replace MDF baseboard - up to 4-1/4\"", "LF", 6.85, 0.45, 15.0
    ),
    ("DRY", "LF", "&"): RegionalUnitRate(
        "DRY", "LF", "&", "Tear out wet drywall up to 2-ft flood cut, hang & tape", "LF", 14.50, 0.35, 25.0
    ),
    ("FCW", "LAM", "&"): RegionalUnitRate(
        "FCW", "LAM", "&", "Tear out & replace engineered hardwood/laminate", "SF", 11.25, 0.60, 20.0
    ),
    ("WTR", "DRY", "+"): RegionalUnitRate(
        "WTR", "DRY", "+", "Centrifugal air mover setup & monitoring", "DA", 38.00, 0.0, 0.0, is_remediation=True
    ),
}

REGIONAL_INDICES: dict[str, float] = {"750": 1.04, "752": 1.08, "770": 1.02, "100": 1.38, "900": 1.32}


def regional_multiplier(zip_code: str) -> float:
    """Return the supplied regional index or the source algorithm's 1.0 default."""
    prefix = str(zip_code).strip()[:3]
    return REGIONAL_INDICES.get(prefix, 1.0)


def compute_claim_estimate(
    payload: dict[str, Any], zip_code: str = "75201", deductible: float = 1000.0, material_age_years: float = 4.0
) -> dict[str, Any]:
    """Compute the canonical line-item estimate with the required semantics.

    This is deliberately structurally and arithmetically equivalent to the
    reference algorithm: price rounding occurs before RCV, depreciation is
    capped before applying the material ratio, remediation has no depreciation,
    only sudden-and-accidental damage contributes to totals, and the deductible
    is applied to aggregate ACV.
    """
    multiplier = regional_multiplier(zip_code)
    items: list[dict[str, Any]] = []

    for room in payload.get("rooms", []):
        for zone in room.get("damaged_zones", []):
            candidate = zone.get("xactimate_candidate", {})
            key = (candidate.get("cat_code"), candidate.get("sel_code"), candidate.get("action"))
            rate = PRICE_BOOK.get(key)
            if not rate:
                # The reference implementation ignores unmapped price codes.
                continue

            quantity = float(zone["measurements"]["affected_quantity"])
            unit_price = round(rate.base_unit_price * multiplier, 2)
            rcv = round(quantity * unit_price, 2)

            if rate.is_remediation or rate.lifespan_years <= 0:
                depreciation_rate, depreciation_amount = 0.0, 0.0
            else:
                depreciation_rate = min((1.0 / rate.lifespan_years) * material_age_years, 0.50) * rate.material_ratio
                depreciation_amount = round(rcv * depreciation_rate, 2)

            acv = round(rcv - depreciation_amount, 2)
            items.append(
                {
                    "zone_id": zone["zone_id"],
                    "room": room["room_name"],
                    "cat_sel": f"{rate.cat_code} {rate.sel_code}",
                    "description": rate.description,
                    "quantity": quantity,
                    "unit": rate.unit,
                    "unit_price": unit_price,
                    "rcv": rcv,
                    "depreciation": depreciation_amount,
                    "acv": acv,
                    "is_covered": zone.get("damage_age_classification") == "SUDDEN_ACCIDENTAL",
                }
            )

    gross_rcv = round(sum(item["rcv"] for item in items if item["is_covered"]), 2)
    total_depreciation = round(sum(item["depreciation"] for item in items if item["is_covered"]), 2)
    net_acv = round(sum(item["acv"] for item in items if item["is_covered"]), 2)
    net_payout = max(0.0, round(net_acv - deductible, 2))

    return {
        "line_items": items,
        "gross_rcv": gross_rcv,
        "total_depreciation": total_depreciation,
        "net_acv": net_acv,
        "deductible": deductible,
        "net_payout": net_payout,
    }


def depreciation_rate_for_zone(payload: dict[str, Any], zone_id: str, material_age_years: float) -> float:
    """Find the source depreciation rate for an existing priced zone.

    This is used only after an adjuster changes a line amount.  It applies the
    same rate formula as the canonical engine rather than deriving a rate from
    a rounded historical depreciation amount.
    """
    for room in payload.get("rooms", []):
        for zone in room.get("damaged_zones", []):
            if zone.get("zone_id") != zone_id:
                continue
            candidate = zone.get("xactimate_candidate", {})
            rate = PRICE_BOOK.get((candidate.get("cat_code"), candidate.get("sel_code"), candidate.get("action")))
            if rate is None or rate.is_remediation or rate.lifespan_years <= 0:
                return 0.0
            return min((1.0 / rate.lifespan_years) * material_age_years, 0.50) * rate.material_ratio
    raise KeyError(zone_id)


def recompute_adjusted_estimate(
    estimate: dict[str, Any],
    vision_payload: dict[str, Any],
    material_age_years: float,
    deductible: float,
    adjustments: list[dict[str, Any]],
) -> dict[str, Any]:
    """Apply allowed line-level edits and independently recompute all totals.

    Client-supplied aggregate fields never enter this calculation.  A supplied
    ``rcv`` is a deliberately explicit line-level replacement-cost override;
    otherwise RCV is recomputed from quantity and unit price.  Supplied ``acv``
    and ``depreciation`` values are accepted for UI round-tripping but ignored.
    """
    adjustment_by_zone = {adjustment["zone_id"]: adjustment for adjustment in adjustments}
    output_items: list[dict[str, Any]] = []

    for original in estimate["line_items"]:
        item = dict(original)
        adjustment = adjustment_by_zone.get(item["zone_id"])
        if adjustment:
            quantity = float(adjustment["quantity"]) if adjustment.get("quantity") is not None else float(item["quantity"])
            explicit_rcv = adjustment.get("rcv")
            if explicit_rcv is not None:
                rcv = round(float(explicit_rcv), 2)
                unit_price = round(rcv / quantity, 2) if quantity else 0.0
            else:
                unit_price = (
                    round(float(adjustment["unit_price"]), 2)
                    if adjustment.get("unit_price") is not None
                    else float(item["unit_price"])
                )
                rcv = round(quantity * unit_price, 2)

            item["quantity"] = quantity
            item["unit_price"] = unit_price
            item["rcv"] = rcv
            if adjustment.get("description") is not None:
                item["description"] = adjustment["description"]
            if adjustment.get("is_covered") is not None:
                item["is_covered"] = bool(adjustment["is_covered"])

            rate = depreciation_rate_for_zone(vision_payload, item["zone_id"], material_age_years)
            item["depreciation"] = round(rcv * rate, 2)
            item["acv"] = round(rcv - item["depreciation"], 2)
        output_items.append(item)

    gross_rcv = round(sum(item["rcv"] for item in output_items if item["is_covered"]), 2)
    total_depreciation = round(sum(item["depreciation"] for item in output_items if item["is_covered"]), 2)
    net_acv = round(sum(item["acv"] for item in output_items if item["is_covered"]), 2)
    net_payout = max(0.0, round(net_acv - deductible, 2))
    return {
        "line_items": output_items,
        "gross_rcv": gross_rcv,
        "total_depreciation": total_depreciation,
        "net_acv": net_acv,
        "deductible": deductible,
        "net_payout": net_payout,
    }


__all__ = [
    "PRICE_BOOK",
    "REGIONAL_INDICES",
    "compute_claim_estimate",
    "depreciation_rate_for_zone",
    "recompute_adjusted_estimate",
    "regional_multiplier",
]
