from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user, require_roles
from app.models.catatan_meter import CatatanMeter
from app.models.pelanggan import Pelanggan
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.pelanggan import PelangganCreate, PelangganOut, PelangganUpdate

router = APIRouter(prefix="/pelanggan", tags=["pelanggan"])


@router.get("", response_model=list[PelangganOut])
def list_pelanggan(
    query: str | None = Query(None, description="Cari nama atau No. SR"),
    dusun: str | None = Query(None, description="Filter dusun / RT RW"),
    status_filter: str | None = Query(None, alias="status"),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Pelanggan).filter(Pelanggan.tenant_id == tenant.id)

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (Pelanggan.nama_pelanggan.ilike(search_pattern))
            | (Pelanggan.nomor_sr.ilike(search_pattern))
            | (Pelanggan.no_hp.ilike(search_pattern))
        )
    if dusun:
        q = q.filter(Pelanggan.dusun_rt_rw.ilike(f"%{dusun}%"))
    if status_filter:
        q = q.filter(Pelanggan.status == status_filter)

    pelanggan_list = q.order_by(Pelanggan.nomor_sr.asc()).all()

    # Attach latest recorded meter for offline cache assistance
    results = []
    for p in pelanggan_list:
        latest_meter = (
            db.query(CatatanMeter)
            .filter(CatatanMeter.pelanggan_id == p.id)
            .order_by(CatatanMeter.periode.desc())
            .first()
        )
        p_dict = PelangganOut.model_validate(p)
        p_dict.meter_terakhir = latest_meter.meter_kini if latest_meter else p.meter_awal_pemasangan
        results.append(p_dict)

    return results


@router.post("", response_model=PelangganOut)
def create_pelanggan(
    data: PelangganCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Pelanggan)
        .filter(Pelanggan.tenant_id == tenant.id, Pelanggan.nomor_sr == data.nomor_sr)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nomor SR '{data.nomor_sr}' sudah terdaftar",
        )

    p = Pelanggan(
        tenant_id=tenant.id,
        nomor_sr=data.nomor_sr,
        nama_pelanggan=data.nama_pelanggan,
        no_hp=data.no_hp,
        alamat=data.alamat,
        dusun_rt_rw=data.dusun_rt_rw,
        kategori_id=data.kategori_id,
        status=data.status,
        meter_awal_pemasangan=data.meter_awal_pemasangan,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    out = PelangganOut.model_validate(p)
    out.meter_terakhir = p.meter_awal_pemasangan
    return out


@router.patch("/{pelanggan_id}", response_model=PelangganOut)
def update_pelanggan(
    pelanggan_id: str,
    data: PelangganUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    p = (
        db.query(Pelanggan)
        .filter(Pelanggan.id == pelanggan_id, Pelanggan.tenant_id == tenant.id)
        .first()
    )
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pelanggan tidak ditemukan"
        )

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)

    db.commit()
    db.refresh(p)
    latest_meter = (
        db.query(CatatanMeter)
        .filter(CatatanMeter.pelanggan_id == p.id)
        .order_by(CatatanMeter.periode.desc())
        .first()
    )
    out = PelangganOut.model_validate(p)
    out.meter_terakhir = latest_meter.meter_kini if latest_meter else p.meter_awal_pemasangan
    return out
