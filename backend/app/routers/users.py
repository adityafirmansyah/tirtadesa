from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, require_roles
from app.core.security import get_password_hash
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_tenant_users(
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua")),
    db: Session = Depends(get_db),
):
    return db.query(User).filter(User.tenant_id == tenant.id).order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut)
def create_tenant_user(
    data: UserCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua")),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(User).filter(User.tenant_id == tenant.id, User.username == data.username).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{data.username}' sudah digunakan di komunitas ini",
        )

    new_user = User(
        tenant_id=tenant.id,
        username=data.username,
        hashed_password=get_password_hash(data.password),
        nama_lengkap=data.nama_lengkap,
        no_hp=data.no_hp,
        role=data.role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserOut)
def update_tenant_user(
    user_id: str,
    data: UserUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id, User.tenant_id == tenant.id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    update_dict = data.model_dump(exclude_unset=True)
    if "password" in update_dict and update_dict["password"]:
        target.hashed_password = get_password_hash(update_dict.pop("password"))

    for k, v in update_dict.items():
        setattr(target, k, v)

    db.commit()
    db.refresh(target)
    return target
