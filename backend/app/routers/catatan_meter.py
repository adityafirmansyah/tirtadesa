from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user
from app.models.catatan_meter import CatatanMeter
from app.models.pelanggan import Pelanggan
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.meter import (
    BatchSyncMeterRequest,
    BatchSyncMeterResponse,
    CatatanMeterCreate,
    CatatanMeterOut,
)

router = APIRouter(prefix="/catat-meter", tags=["catat-meter"])


@router.get("", response_model=list[CatatanMeterOut])
def list_catatan_meter(
    periode: str = Query(..., description="Periode YYYY-MM"),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CatatanMeter)
        .filter(CatatanMeter.tenant_id == tenant.id, CatatanMeter.periode == periode)
        .order_by(CatatanMeter.dicatat_pada.desc())
        .all()
    )


@router.post("", response_model=CatatanMeterOut)
def record_single_meter(
    data: CatatanMeterCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify pelanggan
    pelanggan = (
        db.query(Pelanggan)
        .filter(Pelanggan.id == data.pelanggan_id, Pelanggan.tenant_id == tenant.id)
        .first()
    )
    if not pelanggan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pelanggan tidak ditemukan"
        )

    # Check for existing record in this period
    existing = (
        db.query(CatatanMeter)
        .filter(
            CatatanMeter.pelanggan_id == data.pelanggan_id, CatatanMeter.periode == data.periode
        )
        .first()
    )

    volume = max(0, data.meter_kini - data.meter_lalu)

    if existing:
        existing.meter_lalu = data.meter_lalu
        existing.meter_kini = data.meter_kini
        existing.volume_m3 = volume
        existing.foto_bukti = data.foto_bukti or existing.foto_bukti
        existing.petugas_id = current_user.id
        db.commit()
        db.refresh(existing)
        return existing

    record = CatatanMeter(
        tenant_id=tenant.id,
        pelanggan_id=data.pelanggan_id,
        periode=data.periode,
        meter_lalu=data.meter_lalu,
        meter_kini=data.meter_kini,
        volume_m3=volume,
        foto_bukti=data.foto_bukti,
        lat=data.lat,
        lon=data.lon,
        petugas_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/batch-sync", response_model=BatchSyncMeterResponse)
def batch_sync_meter(
    payload: BatchSyncMeterRequest,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Offline-first batch synchronization endpoint called by PWA upon regaining connectivity."""
    synced = 0
    skipped = 0
    errors = []

    # 1. Pre-fetch valid pelanggan IDs in ONE query
    item_pelanggan_ids = [item.pelanggan_id for item in payload.items]
    valid_pelanggan_ids = {
        r[0]
        for r in db.query(Pelanggan.id)
        .filter(Pelanggan.id.in_(item_pelanggan_ids), Pelanggan.tenant_id == tenant.id)
        .all()
    }

    # 2. Pre-fetch existing meter records in ONE query
    existing_meters = {
        (m.pelanggan_id, m.periode): m
        for m in db.query(CatatanMeter)
        .filter(CatatanMeter.pelanggan_id.in_(item_pelanggan_ids))
        .all()
    }

    for item in payload.items:
        try:
            if item.pelanggan_id not in valid_pelanggan_ids:
                skipped += 1
                errors.append(f"Pelanggan {item.nomor_sr} ({item.pelanggan_id}) tidak ditemukan")
                continue

            volume = max(0, item.meter_kini - item.meter_lalu)
            existing = existing_meters.get((item.pelanggan_id, item.periode))

            if existing:
                existing.meter_lalu = item.meter_lalu
                existing.meter_kini = item.meter_kini
                existing.volume_m3 = volume
                if item.foto_bukti:
                    existing.foto_bukti = item.foto_bukti
                existing.petugas_id = current_user.id
            else:
                new_rec = CatatanMeter(
                    tenant_id=tenant.id,
                    pelanggan_id=item.pelanggan_id,
                    periode=item.periode,
                    meter_lalu=item.meter_lalu,
                    meter_kini=item.meter_kini,
                    volume_m3=volume,
                    foto_bukti=item.foto_bukti,
                    lat=item.lat,
                    lon=item.lon,
                    petugas_id=current_user.id,
                )
                db.add(new_rec)
            synced += 1
        except Exception as e:
            skipped += 1
            errors.append(f"Gagal sync SR {item.nomor_sr}: {str(e)}")

    db.commit()
    return BatchSyncMeterResponse(
        synced_count=synced,
        skipped_count=skipped,
        errors=errors,
    )
