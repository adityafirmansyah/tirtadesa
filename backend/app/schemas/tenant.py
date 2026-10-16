from datetime import datetime

from pydantic import BaseModel


class TenantBase(BaseModel):
    slug: str
    nama_organisasi: str
    desa: str
    kecamatan: str | None = None
    kabupaten: str | None = None
    nomor_rekening: str | None = None
    kontak_pengurus: str | None = None
    qris_payload: str | None = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    nama_organisasi: str | None = None
    desa: str | None = None
    kecamatan: str | None = None
    kabupaten: str | None = None
    nomor_rekening: str | None = None
    kontak_pengurus: str | None = None
    qris_payload: str | None = None


class TenantOut(TenantBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
