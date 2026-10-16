import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(50), unique=True, index=True, nullable=False)
    nama_organisasi = Column(String(100), nullable=False)
    desa = Column(String(100), nullable=False)
    kecamatan = Column(String(100), nullable=True)
    kabupaten = Column(String(100), nullable=True)
    nomor_rekening = Column(Text, nullable=True)
    kontak_pengurus = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    pelanggan = relationship("Pelanggan", back_populates="tenant", cascade="all, delete-orphan")
    kategori_tarif = relationship(
        "KategoriTarif", back_populates="tenant", cascade="all, delete-orphan"
    )
    tagihan = relationship("Tagihan", back_populates="tenant", cascade="all, delete-orphan")
    buku_kas = relationship("BukuKas", back_populates="tenant", cascade="all, delete-orphan")
    meter_induk = relationship("MeterInduk", back_populates="tenant", cascade="all, delete-orphan")
