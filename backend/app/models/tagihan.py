import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Column, Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Tagihan(Base):
    __tablename__ = "tagihan"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    pelanggan_id = Column(
        String(36), ForeignKey("pelanggan.id", ondelete="CASCADE"), nullable=False
    )
    catatan_meter_id = Column(String(36), ForeignKey("catatan_meter.id"), nullable=True)
    nomor_tagihan = Column(String(40), unique=True, nullable=False, index=True)
    periode = Column(String(7), nullable=False)  # YYYY-MM
    rincian_tarif = Column(JSON, nullable=False)  # JSON snapshot calculation
    nominal_volume = Column(Numeric(12, 2), default=0)
    nominal_beban = Column(Numeric(12, 2), default=0)
    nominal_pemeliharaan = Column(Numeric(12, 2), default=0)
    nominal_denda = Column(Numeric(12, 2), default=0)
    total_tagihan = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="unpaid")  # 'unpaid', 'paid', 'cancelled'
    jatuh_tempo = Column(Date, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    metode_pembayaran = Column(String(30), nullable=True)  # 'tunai', 'transfer', 'qris'
    kasir_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", back_populates="tagihan")
    pelanggan = relationship("Pelanggan", back_populates="tagihan")
    catatan_meter = relationship("CatatanMeter", back_populates="tagihan")
    buku_kas = relationship("BukuKas", back_populates="tagihan", uselist=False)

    __table_args__ = (
        UniqueConstraint("pelanggan_id", "periode", name="uq_pelanggan_periode_tagihan"),
    )
