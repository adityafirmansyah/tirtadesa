from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class BukuKasBase(BaseModel):
    jenis: str  # 'masuk', 'keluar'
    kategori: str  # 'iuran_air', 'listrik_pln', 'kaporit', 'pipa', 'honor', 'lainnya'
    nominal: Decimal
    keterangan: str
    foto_nota: str | None = None


class BukuKasCreate(BukuKasBase):
    pass


class BukuKasOut(BukuKasBase):
    id: str
    tenant_id: str
    tagihan_id: str | None = None
    created_by: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class KasSummaryOut(BaseModel):
    total_masuk: Decimal
    total_keluar: Decimal
    saldo: Decimal
    bulan_ini_masuk: Decimal
    bulan_ini_keluar: Decimal
