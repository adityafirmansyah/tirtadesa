import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class BukuKas(Base):
    __tablename__ = "buku_kas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    jenis = Column(String(15), nullable=False)  # 'masuk', 'keluar'
    kategori = Column(
        String(50), nullable=False
    )  # 'iuran_air', 'listrik_pln', 'kaporit', 'pipa', 'honor', 'lainnya'
    nominal = Column(Numeric(14, 2), nullable=False)
    keterangan = Column(Text, nullable=False)
    foto_nota = Column(String(255), nullable=True)
    tagihan_id = Column(String(36), ForeignKey("tagihan.id"), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", back_populates="buku_kas")
    tagihan = relationship("Tagihan", back_populates="buku_kas")
