from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class TagihanBase(BaseModel):
    nomor_tagihan: str
    periode: str
    rincian_tarif: dict[str, Any]
    nominal_volume: Decimal
    nominal_beban: Decimal
    nominal_pemeliharaan: Decimal
    nominal_denda: Decimal
    total_tagihan: Decimal
    status: str
    jatuh_tempo: date


class TagihanOut(TagihanBase):
    id: str
    tenant_id: str
    pelanggan_id: str
    catatan_meter_id: str | None = None
    paid_at: datetime | None = None
    metode_pembayaran: str | None = None
    kasir_id: str | None = None
    created_at: datetime
    nama_pelanggan: str | None = None
    nomor_sr: str | None = None

    class Config:
        from_attributes = True


class TagihanPayRequest(BaseModel):
    metode_pembayaran: str = "tunai"  # 'tunai', 'transfer', 'qris'


class TagihanGenerateRequest(BaseModel):
    periode: str  # YYYY-MM
    jatuh_tempo_days: int = 20  # e.g. 20th of the month
