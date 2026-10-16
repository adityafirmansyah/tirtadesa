import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class CatatanMeter(Base):
    __tablename__ = "catatan_meter"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    pelanggan_id = Column(
        String(36), ForeignKey("pelanggan.id", ondelete="CASCADE"), nullable=False
    )
    periode = Column(String(7), nullable=False)  # YYYY-MM
    meter_lalu = Column(Integer, nullable=False)
    meter_kini = Column(Integer, nullable=False)
    volume_m3 = Column(Integer, nullable=False)  # Calculated as meter_kini - meter_lalu
    foto_bukti = Column(String(255), nullable=True)
    petugas_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    dicatat_pada = Column(DateTime, default=lambda: datetime.now(UTC))

    pelanggan = relationship("Pelanggan", back_populates="catatan_meter")
    tagihan = relationship("Tagihan", back_populates="catatan_meter", uselist=False)

    __table_args__ = (
        UniqueConstraint("pelanggan_id", "periode", name="uq_pelanggan_periode_meter"),
    )
