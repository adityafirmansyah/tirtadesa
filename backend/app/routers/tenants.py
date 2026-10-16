from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, require_roles
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tenant import TenantOut, TenantUpdate

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/current", response_model=TenantOut)
def get_current_tenant_profile(tenant: Tenant = Depends(get_current_tenant)):
    return tenant


@router.patch("/current", response_model=TenantOut)
def update_current_tenant_profile(
    data: TenantUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua")),
    db: Session = Depends(get_db),
):
    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(tenant, field, val)

    db.commit()
    db.refresh(tenant)
    return tenant
