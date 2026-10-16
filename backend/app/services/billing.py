from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class TierCalculation(BaseModel):
    tier: str
    volume: int
    rate: float
    subtotal: float


class BillCalculationResult(BaseModel):
    usage_m3: int
    beban: float
    pemeliharaan: float
    volume_cost: float
    denda: float
    total: float
    tiers: list[TierCalculation]
    metadata: dict[str, Any] = {}


def calculate_water_bill(
    usage_m3: int,
    biaya_beban: Decimal | float | int,
    biaya_pemeliharaan: Decimal | float | int,
    denda_keterlambatan: Decimal | float | int,
    tiers: list[Any],  # List of objects with min_volume, max_volume, tarif_per_m3
    is_late: bool = False,
) -> BillCalculationResult:
    """Calculate water bill with progressive tier brackets, base fee, and optional late penalty."""
    remaining = max(0, usage_m3)
    volume_cost = Decimal("0.00")
    tier_breakdowns: list[TierCalculation] = []

    # Sort tiers by min_volume ASC
    sorted_tiers = sorted(tiers, key=lambda t: t.min_volume)

    for tier in sorted_tiers:
        if remaining <= 0:
            break

        min_vol = tier.min_volume
        max_vol = tier.max_volume
        rate = Decimal(str(tier.tarif_per_m3))

        # Calculate capacity for this tier
        if max_vol is not None:
            if min_vol == 0:
                capacity = max_vol
            else:
                capacity = max_vol - min_vol + 1
        else:
            capacity = remaining

        consumed_in_tier = min(remaining, capacity)
        if consumed_in_tier > 0:
            subtotal = Decimal(str(consumed_in_tier)) * rate
            volume_cost += subtotal
            tier_label = f"{min_vol}-{max_vol if max_vol is not None else '∞'} m³"
            tier_breakdowns.append(
                TierCalculation(
                    tier=tier_label,
                    volume=consumed_in_tier,
                    rate=float(rate),
                    subtotal=float(subtotal),
                )
            )
            remaining -= consumed_in_tier

    beban_dec = Decimal(str(biaya_beban or 0))
    pemeliharaan_dec = Decimal(str(biaya_pemeliharaan or 0))
    denda_dec = Decimal(str(denda_keterlambatan or 0)) if is_late else Decimal("0.00")

    total_dec = beban_dec + pemeliharaan_dec + volume_cost + denda_dec

    return BillCalculationResult(
        usage_m3=usage_m3,
        beban=float(beban_dec),
        pemeliharaan=float(pemeliharaan_dec),
        volume_cost=float(volume_cost),
        denda=float(denda_dec),
        total=float(total_dec),
        tiers=tier_breakdowns,
    )
