from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.catatan_meter import CatatanMeter
from app.models.kas import BukuKas
from app.models.meter_induk import MeterInduk
from app.models.pelanggan import Pelanggan
from app.models.tagihan import Tagihan
from app.models.tenant import Tenant

router = APIRouter(prefix="/public/{slug}", tags=["public"])


@router.get("/info")
def get_public_community_info(slug: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.slug == slug, Tenant.is_active.is_(True)).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Komunitas desa tidak ditemukan"
        )

    return {
        "nama_organisasi": tenant.nama_organisasi,
        "desa": tenant.desa,
        "kecamatan": tenant.kecamatan,
        "kabupaten": tenant.kabupaten,
        "nomor_rekening": tenant.nomor_rekening,
        "kontak_pengurus": tenant.kontak_pengurus,
    }


@router.get("/cek-tagihan")
def public_cek_tagihan(
    slug: str,
    nomor: str = Query(..., description="Nomor SR (misal: SR-0001) atau Nomor HP"),
    db: Session = Depends(get_db),
):
    """Allows residents to check their water bill without login using SR number or phone."""
    tenant = db.query(Tenant).filter(Tenant.slug == slug, Tenant.is_active.is_(True)).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Komunitas tidak ditemukan"
        )

    # Clean phone or SR query
    clean_nomor = nomor.strip()
    pelanggan = (
        db.query(Pelanggan)
        .filter(
            Pelanggan.tenant_id == tenant.id,
            (Pelanggan.nomor_sr.ilike(clean_nomor)) | (Pelanggan.no_hp.ilike(f"%{clean_nomor}%")),
        )
        .first()
    )

    if not pelanggan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data pelanggan dengan Nomor Sambungan / HP tersebut tidak ditemukan",
        )

    # Get bills
    tagihan_list = (
        db.query(Tagihan)
        .filter(Tagihan.pelanggan_id == pelanggan.id)
        .order_by(Tagihan.periode.desc())
        .limit(12)
        .all()
    )

    unpaid_total = sum(t.total_tagihan for t in tagihan_list if t.status == "unpaid")

    return {
        "pelanggan": {
            "nomor_sr": pelanggan.nomor_sr,
            "nama_pelanggan": pelanggan.nama_pelanggan,
            "alamat": pelanggan.alamat,
            "status": pelanggan.status,
        },
        "total_tunggakan": float(unpaid_total),
        "tagihan": [
            {
                "id": t.id,
                "nomor_tagihan": t.nomor_tagihan,
                "periode": t.periode,
                "total_tagihan": float(t.total_tagihan),
                "status": t.status,
                "jatuh_tempo": t.jatuh_tempo.isoformat(),
                "paid_at": t.paid_at.isoformat() if t.paid_at else None,
                "rincian": t.rincian_tarif,
            }
            for t in tagihan_list
        ],
        "info_pembayaran": {
            "nomor_rekening": tenant.nomor_rekening,
            "kontak_pengurus": tenant.kontak_pengurus,
        },
    }


@router.get("/transparansi")
def public_transparansi_neraca(slug: str, db: Session = Depends(get_db)):
    """Open community transparency page showing water production vs consumption and cash summary."""
    tenant = db.query(Tenant).filter(Tenant.slug == slug, Tenant.is_active.is_(True)).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Komunitas tidak ditemukan"
        )

    # Total Pelanggan Aktif
    total_pelanggan = (
        db.query(func.count(Pelanggan.id))
        .filter(Pelanggan.tenant_id == tenant.id, Pelanggan.status == "aktif")
        .scalar()
    )

    # Total Kas Masuk & Keluar
    kas_masuk = (
        db.query(func.coalesce(func.sum(BukuKas.nominal), 0))
        .filter(BukuKas.tenant_id == tenant.id, BukuKas.jenis == "masuk")
        .scalar()
    )
    kas_keluar = (
        db.query(func.coalesce(func.sum(BukuKas.nominal), 0))
        .filter(BukuKas.tenant_id == tenant.id, BukuKas.jenis == "keluar")
        .scalar()
    )
    saldo_kas = Decimal(str(kas_masuk)) - Decimal(str(kas_keluar))

    # Total Produksi vs Konsumsi All Time
    total_produksi = (
        db.query(func.coalesce(func.sum(MeterInduk.total_produksi_m3), 0))
        .filter(MeterInduk.tenant_id == tenant.id)
        .scalar()
    )
    total_konsumsi = (
        db.query(func.coalesce(func.sum(CatatanMeter.volume_m3), 0))
        .filter(CatatanMeter.tenant_id == tenant.id)
        .scalar()
    )

    kehilangan = max(0, total_produksi - total_konsumsi)
    persentase_loss = round((kehilangan / total_produksi * 100.0), 1) if total_produksi > 0 else 0.0

    return {
        "komunitas": {
            "nama_organisasi": tenant.nama_organisasi,
            "desa": tenant.desa,
            "kecamatan": tenant.kecamatan,
            "kabupaten": tenant.kabupaten,
        },
        "statistik": {
            "total_sambungan_rumah": total_pelanggan,
            "saldo_kas_operasional": float(saldo_kas),
            "total_kas_masuk": float(kas_masuk),
            "total_kas_keluar": float(kas_keluar),
            "total_produksi_air_m3": int(total_produksi),
            "total_konsumsi_warga_m3": int(total_konsumsi),
            "tingkat_kehilangan_air_persen": persentase_loss,
        },
    }
