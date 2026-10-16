from datetime import datetime

from pydantic import BaseModel

from app.schemas.tarif import KategoriTarifOut


class PelangganBase(BaseModel):
    nomor_sr: str
    nama_pelanggan: str
    no_hp: str | None = None
    alamat: str
    dusun_rt_rw: str | None = None
    kategori_id: str
    status: str = "aktif"  # 'aktif', 'disegel', 'nonaktif'
    meter_awal_pemasangan: int = 0


class PelangganCreate(PelangganBase):
    pass


class PelangganUpdate(BaseModel):
    nama_pelanggan: str | None = None
    no_hp: str | None = None
    alamat: str | None = None
    dusun_rt_rw: str | None = None
    kategori_id: str | None = None
    status: str | None = None


class PelangganOut(PelangganBase):
    id: str
    tenant_id: str
    created_at: datetime
    kategori: KategoriTarifOut | None = None
    meter_terakhir: int | None = None

    class Config:
        from_attributes = True
