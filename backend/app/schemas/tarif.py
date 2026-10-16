from decimal import Decimal

from pydantic import BaseModel


class TierTarifBase(BaseModel):
    min_volume: int
    max_volume: int | None = None
    tarif_per_m3: Decimal


class TierTarifCreate(TierTarifBase):
    pass


class TierTarifOut(TierTarifBase):
    id: str

    class Config:
        from_attributes = True


class KategoriTarifBase(BaseModel):
    kode: str
    nama: str
    biaya_beban: Decimal = Decimal("0.00")
    biaya_pemeliharaan: Decimal = Decimal("0.00")
    denda_keterlambatan: Decimal = Decimal("0.00")


class KategoriTarifCreate(KategoriTarifBase):
    tiers: list[TierTarifCreate]


class KategoriTarifOut(KategoriTarifBase):
    id: str
    tenant_id: str
    tiers: list[TierTarifOut] = []

    class Config:
        from_attributes = True
