from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user, require_roles
from app.models.kas import BukuKas
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.kas import BukuKasCreate, BukuKasOut, KasSummaryOut

router = APIRouter(prefix="/kas", tags=["kas"])


@router.get("", response_model=list[BukuKasOut])
def list_buku_kas(
    jenis: str | None = Query(None, description="'masuk' atau 'keluar'"),
    kategori: str | None = Query(None),
    limit: int = Query(50, le=200),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(BukuKas).filter(BukuKas.tenant_id == tenant.id)
    if jenis:
        q = q.filter(BukuKas.jenis == jenis)
    if kategori:
        q = q.filter(BukuKas.kategori == kategori)

    return q.order_by(BukuKas.created_at.desc()).limit(limit).all()


@router.post("", response_model=BukuKasOut)
def create_kas_entry(
    data: BukuKasCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    entry = BukuKas(
        tenant_id=tenant.id,
        jenis=data.jenis,
        kategori=data.kategori,
        nominal=data.nominal,
        keterangan=data.keterangan,
        foto_nota=data.foto_nota,
        created_by=current_user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/summary", response_model=KasSummaryOut)
def get_kas_summary(
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Total Masuk
    total_masuk = (
        db.query(func.coalesce(func.sum(BukuKas.nominal), 0))
        .filter(BukuKas.tenant_id == tenant.id, BukuKas.jenis == "masuk")
        .scalar()
    )
    # Total Keluar
    total_keluar = (
        db.query(func.coalesce(func.sum(BukuKas.nominal), 0))
        .filter(BukuKas.tenant_id == tenant.id, BukuKas.jenis == "keluar")
        .scalar()
    )

    saldo = Decimal(str(total_masuk)) - Decimal(str(total_keluar))

    return KasSummaryOut(
        total_masuk=Decimal(str(total_masuk)),
        total_keluar=Decimal(str(total_keluar)),
        saldo=saldo,
        bulan_ini_masuk=Decimal(str(total_masuk)),
        bulan_ini_keluar=Decimal(str(total_keluar)),
    )
