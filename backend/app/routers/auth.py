from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Resolve tenant by slug
    tenant = (
        db.query(Tenant).filter(Tenant.slug == req.tenant_slug, Tenant.is_active.is_(True)).first()
    )
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Komunitas / Desa dengan slug tersebut tidak ditemukan",
        )

    # 2. Resolve user within tenant
    user = (
        db.query(User)
        .filter(
            User.tenant_id == tenant.id, User.username == req.username, User.is_active.is_(True)
        )
        .first()
    )
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau kata sandi salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create access token
    access_token = create_access_token(subject=user.id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        tenant_slug=tenant.slug,
        tenant_nama=tenant.nama_organisasi,
        user_id=user.id,
        username=user.username,
        nama_lengkap=user.nama_lengkap,
    )
