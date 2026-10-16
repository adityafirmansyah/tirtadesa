from decimal import Decimal

from pydantic import BaseModel

from app.services.billing import calculate_water_bill


class MockTier(BaseModel):
    min_volume: int
    max_volume: int | None
    tarif_per_m3: Decimal


def test_calculate_water_bill_tier_1_only():
    # Tiers: 0-10 m3: 1500, 11-20 m3: 2500, 21+ m3: 3500
    tiers = [
        MockTier(min_volume=0, max_volume=10, tarif_per_m3=Decimal("1500.00")),
        MockTier(min_volume=11, max_volume=20, tarif_per_m3=Decimal("2500.00")),
        MockTier(min_volume=21, max_volume=None, tarif_per_m3=Decimal("3500.00")),
    ]

    # Usage: 8 m3 (Only tier 1)
    # Volume cost: 8 * 1500 = 12000
    # Beban: 10000, Pemeliharaan: 2500
    # Total: 12000 + 10000 + 2500 = 24500
    result = calculate_water_bill(
        usage_m3=8,
        biaya_beban=Decimal("10000.00"),
        biaya_pemeliharaan=Decimal("2500.00"),
        denda_keterlambatan=Decimal("5000.00"),
        tiers=tiers,
        is_late=False,
    )

    assert result.usage_m3 == 8
    assert result.volume_cost == 12000.0
    assert result.beban == 10000.0
    assert result.pemeliharaan == 2500.0
    assert result.denda == 0.0
    assert result.total == 24500.0
    assert len(result.tiers) == 1
    assert result.tiers[0].volume == 8


def test_calculate_water_bill_multi_tier():
    # Usage: 25 m3
    # Tier 1 (0-10 -> 10 m3): 10 * 1500 = 15000
    # Tier 2 (11-20 -> 10 m3): 10 * 2500 = 25000
    # Tier 3 (21+ -> 5 m3): 5 * 3500 = 17500
    # Total volume cost: 15000 + 25000 + 17500 = 57500
    # Beban: 10000, Pemeliharaan: 2500
    # Late fee: 5000
    # Total: 57500 + 10000 + 2500 + 5000 = 75000
    tiers = [
        MockTier(min_volume=0, max_volume=10, tarif_per_m3=Decimal("1500.00")),
        MockTier(min_volume=11, max_volume=20, tarif_per_m3=Decimal("2500.00")),
        MockTier(min_volume=21, max_volume=None, tarif_per_m3=Decimal("3500.00")),
    ]

    result = calculate_water_bill(
        usage_m3=25,
        biaya_beban=Decimal("10000.00"),
        biaya_pemeliharaan=Decimal("2500.00"),
        denda_keterlambatan=Decimal("5000.00"),
        tiers=tiers,
        is_late=True,
    )

    assert result.usage_m3 == 25
    assert result.volume_cost == 57500.0
    assert result.denda == 5000.0
    assert result.total == 75000.0
    assert len(result.tiers) == 3
    assert result.tiers[0].volume == 10
    assert result.tiers[1].volume == 10
    assert result.tiers[2].volume == 5


def test_calculate_water_bill_zero_usage():
    # Zero usage still pays base fee (abonemen) and maintenance fee
    tiers = [
        MockTier(min_volume=0, max_volume=10, tarif_per_m3=Decimal("1500.00")),
    ]

    result = calculate_water_bill(
        usage_m3=0,
        biaya_beban=Decimal("10000.00"),
        biaya_pemeliharaan=Decimal("2500.00"),
        denda_keterlambatan=Decimal("5000.00"),
        tiers=tiers,
        is_late=False,
    )

    assert result.usage_m3 == 0
    assert result.volume_cost == 0.0
    assert result.total == 12500.0
