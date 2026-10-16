from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user, require_roles
from app.models.tarif import KategoriTarif, TierTarif
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tarif import KategoriTarifCreate, KategoriTarifOut

router = APIRouter(prefix="/tarif", tags=["tarif"])


@router.get("", response_model=list[KategoriTarifOut])
def list_kategori_tarif(
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(KategoriTarif)
        .filter(KategoriTarif.tenant_id == tenant.id)
        .order_by(KategoriTarif.kode.asc())
        .all()
    )


@router.post("", response_model=KategoriTarifOut)
def create_kategori_tarif(
    data: KategoriTarifCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(KategoriTarif)
        .filter(KategoriTarif.tenant_id == tenant.id, KategoriTarif.kode == data.kode)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Kategori dengan kode '{data.kode}' sudah ada",
        )

    kategori = KategoriTarif(
        tenant_id=tenant.id,
        kode=data.kode,
        nama=data.nama,
        biaya_beban=data.biaya_beban,
        biaya_pemeliharaan=data.biaya_pemeliharaan,
        denda_keterlambatan=data.denda_keterlambatan,
    )
    db.add(kategori)
    db.flush()

    for tier_data in data.tiers:
        tier = TierTarif(
            kategori_id=kategori.id,
            min_volume=tier_data.min_volume,
            max_volume=tier_data.max_volume,
            tarif_per_m3=tier_data.tarif_per_m3,
        )
        db.add(tier)

    db.commit()
    db.refresh(kategori)
    return kategori
