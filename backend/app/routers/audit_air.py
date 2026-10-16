from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user, require_roles
from app.models.catatan_meter import CatatanMeter
from app.models.meter_induk import MeterInduk
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.audit import MeterIndukCreate, MeterIndukOut, WaterBalanceOut

router = APIRouter(prefix="/audit-air", tags=["audit-air"])


@router.get("/meter-induk", response_model=list[MeterIndukOut])
def list_meter_induk(
    periode: str | None = Query(None),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeterInduk).filter(MeterInduk.tenant_id == tenant.id)
    if periode:
        q = q.filter(MeterInduk.periode == periode)
    return q.order_by(MeterInduk.periode.desc()).all()


@router.post("/meter-induk", response_model=MeterIndukOut)
def record_meter_induk(
    data: MeterIndukCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    vol = max(0, data.meter_kini - data.meter_lalu)
    entry = MeterInduk(
        tenant_id=tenant.id,
        periode=data.periode,
        nama_sumber=data.nama_sumber,
        meter_lalu=data.meter_lalu,
        meter_kini=data.meter_kini,
        total_produksi_m3=vol,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/water-balance", response_model=WaterBalanceOut)
def get_water_balance(
    periode: str = Query(..., description="Periode YYYY-MM"),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Total produksi from meter induk
    total_prod = (
        db.query(func.coalesce(func.sum(MeterInduk.total_produksi_m3), 0))
        .filter(MeterInduk.tenant_id == tenant.id, MeterInduk.periode == periode)
        .scalar()
    )

    # Total konsumsi from catatan meter pelanggan
    total_konsumsi = (
        db.query(func.coalesce(func.sum(CatatanMeter.volume_m3), 0))
        .filter(CatatanMeter.tenant_id == tenant.id, CatatanMeter.periode == periode)
        .scalar()
    )

    kehilangan = max(0, total_prod - total_konsumsi)
    pct_loss = round((kehilangan / total_prod * 100.0), 1) if total_prod > 0 else 0.0

    if pct_loss < 15.0:
        status_efisiensi = "Sangat Baik (<15%)"
    elif pct_loss <= 25.0:
        status_efisiensi = "Wajar (15-25%)"
    else:
        status_efisiensi = "Peringatan Kebocoran / Pipa Rusak (>25%)"

    return WaterBalanceOut(
        periode=periode,
        total_produksi_m3=int(total_prod),
        total_konsumsi_pelanggan_m3=int(total_konsumsi),
        kehilangan_air_m3=int(kehilangan),
        persentase_kehilangan=pct_loss,
        status_efisiensi=status_efisiensi,
    )
