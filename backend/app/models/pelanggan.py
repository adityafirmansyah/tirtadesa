import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pelanggan(Base):
    __tablename__ = "pelanggan"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(
        String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    nomor_sr = Column(String(30), nullable=False, index=True)  # e.g. 'SR-0001'
    nama_pelanggan = Column(String(120), nullable=False, index=True)
    no_hp = Column(String(25), nullable=True, index=True)
    alamat = Column(Text, nullable=False)
    dusun_rt_rw = Column(String(50), nullable=True, index=True)
    kategori_id = Column(String(36), ForeignKey("kategori_tarif.id"), nullable=False, index=True)
    status = Column(String(20), default="aktif", index=True)  # 'aktif', 'disegel', 'nonaktif'
    meter_awal_pemasangan = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", back_populates="pelanggan")
    kategori = relationship("KategoriTarif", back_populates="pelanggan")
    catatan_meter = relationship(
        "CatatanMeter", back_populates="pelanggan", cascade="all, delete-orphan"
    )
    tagihan = relationship("Tagihan", back_populates="pelanggan", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("tenant_id", "nomor_sr", name="uq_tenant_nomor_sr"),)
