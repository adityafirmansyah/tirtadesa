from datetime import UTC, date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant, get_current_user, require_roles
from app.models.catatan_meter import CatatanMeter
from app.models.kas import BukuKas
from app.models.pelanggan import Pelanggan
from app.models.tagihan import Tagihan
from app.models.tarif import KategoriTarif
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tagihan import TagihanGenerateRequest, TagihanOut, TagihanPayRequest
from app.services.billing import calculate_water_bill
from app.services.escpos import format_thermal_receipt_text

router = APIRouter(prefix="/tagihan", tags=["tagihan"])


@router.get("", response_model=list[TagihanOut])
def list_tagihan(
    periode: str | None = Query(None, description="Periode YYYY-MM"),
    status_filter: str | None = Query(None, alias="status"),
    pelanggan_id: str | None = Query(None),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Tagihan, Pelanggan.nama_pelanggan, Pelanggan.nomor_sr)
        .join(Pelanggan, Tagihan.pelanggan_id == Pelanggan.id)
        .filter(Tagihan.tenant_id == tenant.id)
    )

    if periode:
        q = q.filter(Tagihan.periode == periode)
    if status_filter:
        q = q.filter(Tagihan.status == status_filter)
    if pelanggan_id:
        q = q.filter(Tagihan.pelanggan_id == pelanggan_id)

    rows = q.order_by(Tagihan.created_at.desc()).all()

    results = []
    for tagihan, nama, sr in rows:
        out = TagihanOut.model_validate(tagihan)
        out.nama_pelanggan = nama
        out.nomor_sr = sr
        results.append(out)

    return results


@router.post("/generate-monthly")
def generate_monthly_bills(
    payload: TagihanGenerateRequest,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara")),
    db: Session = Depends(get_db),
):
    """Generates monthly water bills based on recorded meter readings and category progressive tariffs."""
    # Find active customers
    pelanggan_list = (
        db.query(Pelanggan)
        .filter(Pelanggan.tenant_id == tenant.id, Pelanggan.status == "aktif")
        .all()
    )

    generated_count = 0
    skipped_count = 0

    # Parse period year and month for due date
    parts = payload.periode.split("-")
    year, month = int(parts[0]), int(parts[1])
    due_date = date(year, month, payload.jatuh_tempo_days)

    for p in pelanggan_list:
        # Check if already generated
        existing = (
            db.query(Tagihan)
            .filter(Tagihan.pelanggan_id == p.id, Tagihan.periode == payload.periode)
            .first()
        )
        if existing:
            skipped_count += 1
            continue

        # Get meter reading for this period
        meter_rec = (
            db.query(CatatanMeter)
            .filter(CatatanMeter.pelanggan_id == p.id, CatatanMeter.periode == payload.periode)
            .first()
        )

        usage_m3 = meter_rec.volume_m3 if meter_rec else 0

        # Load tariff category
        kategori = db.query(KategoriTarif).filter(KategoriTarif.id == p.kategori_id).first()
        if not kategori:
            continue

        calc = calculate_water_bill(
            usage_m3=usage_m3,
            biaya_beban=kategori.biaya_beban,
            biaya_pemeliharaan=kategori.biaya_pemeliharaan,
            denda_keterlambatan=kategori.denda_keterlambatan,
            tiers=kategori.tiers,
            is_late=False,
        )

        nomor_inv = f"INV-{payload.periode.replace('-', '')}-{p.nomor_sr.replace('SR-', '')}"

        new_tagihan = Tagihan(
            tenant_id=tenant.id,
            pelanggan_id=p.id,
            catatan_meter_id=meter_rec.id if meter_rec else None,
            nomor_tagihan=nomor_inv,
            periode=payload.periode,
            rincian_tarif=calc.model_dump(),
            nominal_volume=Decimal(str(calc.volume_cost)),
            nominal_beban=Decimal(str(calc.beban)),
            nominal_pemeliharaan=Decimal(str(calc.pemeliharaan)),
            nominal_denda=Decimal("0.00"),
            total_tagihan=Decimal(str(calc.total)),
            status="unpaid",
            jatuh_tempo=due_date,
        )
        db.add(new_tagihan)
        generated_count += 1

    db.commit()
    return {
        "status": "success",
        "periode": payload.periode,
        "generated_count": generated_count,
        "skipped_count": skipped_count,
    }


@router.post("/{tagihan_id}/pay", response_model=TagihanOut)
def pay_tagihan(
    tagihan_id: str,
    payload: TagihanPayRequest,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(require_roles("ketua", "bendahara", "petugas_lapangan")),
    db: Session = Depends(get_db),
):
    tagihan = (
        db.query(Tagihan).filter(Tagihan.id == tagihan_id, Tagihan.tenant_id == tenant.id).first()
    )
    if not tagihan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tagihan tidak ditemukan")

    if tagihan.status == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tagihan sudah lunas")

    now = datetime.now(UTC)
    tagihan.status = "paid"
    tagihan.paid_at = now
    tagihan.metode_pembayaran = payload.metode_pembayaran
    tagihan.kasir_id = current_user.id

    # Automatically create BukuKas entry for operational accounting
    pelanggan = db.query(Pelanggan).filter(Pelanggan.id == tagihan.pelanggan_id).first()
    pelanggan_nama = pelanggan.nama_pelanggan if pelanggan else tagihan.pelanggan_id

    kas_entry = BukuKas(
        tenant_id=tenant.id,
        jenis="masuk",
        kategori="iuran_air",
        nominal=tagihan.total_tagihan,
        keterangan=f"Pembayaran tagihan air {tagihan.periode} oleh {pelanggan_nama} ({tagihan.nomor_tagihan})",
        tagihan_id=tagihan.id,
        created_by=current_user.id,
    )
    db.add(kas_entry)
    db.commit()
    db.refresh(tagihan)

    out = TagihanOut.model_validate(tagihan)
    out.nama_pelanggan = pelanggan_nama
    out.nomor_sr = pelanggan.nomor_sr if pelanggan else ""
    return out


@router.get("/{tagihan_id}/thermal-receipt")
def get_thermal_receipt(
    tagihan_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tagihan = (
        db.query(Tagihan).filter(Tagihan.id == tagihan_id, Tagihan.tenant_id == tenant.id).first()
    )
    if not tagihan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tagihan tidak ditemukan")

    pelanggan = db.query(Pelanggan).filter(Pelanggan.id == tagihan.pelanggan_id).first()
    meter_rec = (
        db.query(CatatanMeter).filter(CatatanMeter.id == tagihan.catatan_meter_id).first()
        if tagihan.catatan_meter_id
        else None
    )

    meter_lalu = meter_rec.meter_lalu if meter_rec else 0
    meter_kini = meter_rec.meter_kini if meter_rec else 0
    vol_m3 = meter_rec.volume_m3 if meter_rec else 0

    receipt_text = format_thermal_receipt_text(
        tenant_nama=tenant.nama_organisasi,
        desa=tenant.desa,
        nomor_tagihan=tagihan.nomor_tagihan,
        nomor_sr=pelanggan.nomor_sr if pelanggan else "-",
        nama_pelanggan=pelanggan.nama_pelanggan if pelanggan else "-",
        periode=tagihan.periode,
        meter_lalu=meter_lalu,
        meter_kini=meter_kini,
        volume_m3=vol_m3,
        volume_cost=float(tagihan.nominal_volume),
        beban=float(tagihan.nominal_beban),
        pemeliharaan=float(tagihan.nominal_pemeliharaan),
        denda=float(tagihan.nominal_denda),
        total=float(tagihan.total_tagihan),
        status=tagihan.status,
        metode_bayar=tagihan.metode_pembayaran or "tunai",
        paid_at=tagihan.paid_at,
    )

    return {
        "tagihan_id": tagihan.id,
        "receipt_text": receipt_text,
    }
