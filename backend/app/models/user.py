import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(
        String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    username = Column(String(50), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nama_lengkap = Column(String(100), nullable=False)
    no_hp = Column(String(20), nullable=True)
    role = Column(
        String(20), nullable=False, default="petugas_lapangan", index=True
    )  # 'ketua', 'bendahara', 'petugas_lapangan'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", back_populates="users")

    __table_args__ = (UniqueConstraint("tenant_id", "username", name="uq_tenant_username"),)
