from datetime import datetime

from pydantic import BaseModel


class MeterIndukBase(BaseModel):
    periode: str  # YYYY-MM
    nama_sumber: str
    meter_lalu: int
    meter_kini: int


class MeterIndukCreate(MeterIndukBase):
    pass


class MeterIndukOut(MeterIndukBase):
    id: str
    tenant_id: str
    total_produksi_m3: int
    dicatat_pada: datetime

    class Config:
        from_attributes = True


class WaterBalanceOut(BaseModel):
    periode: str
    total_produksi_m3: int
    total_konsumsi_pelanggan_m3: int
    kehilangan_air_m3: int
    persentase_kehilangan: float
    status_efisiensi: str  # 'Sangat Baik (<15%)', 'Wajar (15-25%)', 'Peringatan Bocor (>25%)'
