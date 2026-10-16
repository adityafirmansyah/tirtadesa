import uuid

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class KategoriTarif(Base):
    __tablename__ = "kategori_tarif"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    kode = Column(String(20), nullable=False)  # e.g. 'R1', 'R2', 'NIAGA', 'SOSIAL'
    nama = Column(String(100), nullable=False)
    biaya_beban = Column(Numeric(12, 2), default=0)
    biaya_pemeliharaan = Column(Numeric(12, 2), default=0)
    denda_keterlambatan = Column(Numeric(12, 2), default=0)

    tenant = relationship("Tenant", back_populates="kategori_tarif")
    tiers = relationship(
        "TierTarif",
        back_populates="kategori",
        cascade="all, delete-orphan",
        order_by="TierTarif.min_volume",
    )
    pelanggan = relationship("Pelanggan", back_populates="kategori")

    __table_args__ = (UniqueConstraint("tenant_id", "kode", name="uq_tenant_kode_tarif"),)


class TierTarif(Base):
    __tablename__ = "tier_tarif"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kategori_id = Column(
        String(36), ForeignKey("kategori_tarif.id", ondelete="CASCADE"), nullable=False
    )
    min_volume = Column(Integer, nullable=False)  # e.g. 0, 11, 21
    max_volume = Column(Integer, nullable=True)  # e.g. 10, 20, None for infinity
    tarif_per_m3 = Column(Numeric(12, 2), nullable=False)

    kategori = relationship("KategoriTarif", back_populates="tiers")
