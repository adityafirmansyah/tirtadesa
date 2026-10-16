from datetime import datetime

from pydantic import BaseModel


class CatatanMeterBase(BaseModel):
    pelanggan_id: str
    periode: str  # YYYY-MM
    meter_lalu: int
    meter_kini: int
    foto_bukti: str | None = None
    lat: float | None = None
    lon: float | None = None


class CatatanMeterCreate(CatatanMeterBase):
    pass


class CatatanMeterOut(CatatanMeterBase):
    id: str
    tenant_id: str
    volume_m3: int
    petugas_id: str | None = None
    dicatat_pada: datetime

    class Config:
        from_attributes = True


class BatchMeterItem(BaseModel):
    pelanggan_id: str
    nomor_sr: str
    periode: str
    meter_lalu: int
    meter_kini: int
    foto_bukti: str | None = None
    lat: float | None = None
    lon: float | None = None
    timestamp: datetime | None = None


class BatchSyncMeterRequest(BaseModel):
    items: list[BatchMeterItem]


class BatchSyncMeterResponse(BaseModel):
    synced_count: int
    skipped_count: int
    errors: list[str] = []
