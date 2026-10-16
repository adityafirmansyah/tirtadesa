import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class MeterInduk(Base):
    __tablename__ = "meter_induk"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    periode = Column(String(7), nullable=False)  # YYYY-MM
    nama_sumber = Column(String(100), nullable=False)  # e.g. 'Tandon Mata Air Dusun Barat'
    meter_lalu = Column(Integer, nullable=False)
    meter_kini = Column(Integer, nullable=False)
    total_produksi_m3 = Column(Integer, nullable=False)  # Calculated meter_kini - meter_lalu
    dicatat_pada = Column(DateTime, default=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", back_populates="meter_induk")

    __table_args__ = (
        UniqueConstraint("tenant_id", "periode", "nama_sumber", name="uq_tenant_periode_sumber"),
    )
