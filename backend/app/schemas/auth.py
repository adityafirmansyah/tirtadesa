from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant_slug: str
    tenant_nama: str
    user_id: str
    username: str
    nama_lengkap: str


class TokenData(BaseModel):
    user_id: str | None = None
    tenant_id: str | None = None
    role: str | None = None


class LoginRequest(BaseModel):
    tenant_slug: str
    username: str
    password: str
