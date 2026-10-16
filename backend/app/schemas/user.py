from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    nama_lengkap: str
    no_hp: str | None = None
    role: str = "petugas_lapangan"  # 'ketua', 'bendahara', 'petugas_lapangan'


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    nama_lengkap: str | None = None
    no_hp: str | None = None
    role: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserOut(UserBase):
    id: str
    tenant_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
