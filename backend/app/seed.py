from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.catatan_meter import CatatanMeter
from app.models.kas import BukuKas
from app.models.meter_induk import MeterInduk
from app.models.pelanggan import Pelanggan
from app.models.tagihan import Tagihan
from app.models.tarif import KategoriTarif, TierTarif
from app.models.tenant import Tenant
from app.models.user import User
from app.services.billing import calculate_water_bill


def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    existing_tenant = db.query(Tenant).filter(Tenant.slug == "sukamaju").first()
    if existing_tenant:
        print("Database already seeded. Skipping...")
        return

    print("Seeding initial data for TirtaDesa...")

    # 1. Tenant
    tenant = Tenant(
        slug="sukamaju",
        nama_organisasi="KPSPAMS Tirta Makmur",
        desa="Sukamaju",
        kecamatan="Karanganyar",
        kabupaten="Surakarta",
        nomor_rekening="BRI: 0123-01-004567-53-1 a.n. KPSPAMS Tirta Makmur",
        kontak_pengurus="081234567890 (Pak Wardi)",
        is_active=True,
    )
    db.add(tenant)
    db.flush()

    # 2. Users
    users = [
        User(
            tenant_id=tenant.id,
            username="admin",
            hashed_password=get_password_hash("admin123"),
            nama_lengkap="Siti Rahayu (Bendahara)",
            no_hp="081234567891",
            role="bendahara",
        ),
        User(
            tenant_id=tenant.id,
            username="ketua",
            hashed_password=get_password_hash("ketua123"),
            nama_lengkap="Suwardi (Ketua KPSPAMS)",
            no_hp="081234567890",
            role="ketua",
        ),
        User(
            tenant_id=tenant.id,
            username="petugas",
            hashed_password=get_password_hash("petugas123"),
            nama_lengkap="Agus Santoso (Petugas Lapangan)",
            no_hp="081234567892",
            role="petugas_lapangan",
        ),
    ]
    for u in users:
        db.add(u)
    db.flush()

    # 3. Kategori Tarif & Tiers
    kategori_r1 = KategoriTarif(
        tenant_id=tenant.id,
        kode="R1",
        nama="Rumah Tangga Biasa",
        biaya_beban=Decimal("10000.00"),
        biaya_pemeliharaan=Decimal("2500.00"),
        denda_keterlambatan=Decimal("5000.00"),
    )
    db.add(kategori_r1)
    db.flush()

    tiers_r1 = [
        TierTarif(
            kategori_id=kategori_r1.id, min_volume=0, max_volume=10, tarif_per_m3=Decimal("1500.00")
        ),
        TierTarif(
            kategori_id=kategori_r1.id,
            min_volume=11,
            max_volume=20,
            tarif_per_m3=Decimal("2500.00"),
        ),
        TierTarif(
            kategori_id=kategori_r1.id,
            min_volume=21,
            max_volume=None,
            tarif_per_m3=Decimal("3500.00"),
        ),
    ]
    for t in tiers_r1:
        db.add(t)

    kategori_niaga = KategoriTarif(
        tenant_id=tenant.id,
        kode="NIAGA",
        nama="Usaha / Warung",
        biaya_beban=Decimal("20000.00"),
        biaya_pemeliharaan=Decimal("5000.00"),
        denda_keterlambatan=Decimal("10000.00"),
    )
    db.add(kategori_niaga)
    db.flush()

    tier_niaga = TierTarif(
        kategori_id=kategori_niaga.id,
        min_volume=0,
        max_volume=None,
        tarif_per_m3=Decimal("4000.00"),
    )
    db.add(tier_niaga)
    db.flush()

    # 4. Pelanggan
    pelanggans = [
        Pelanggan(
            tenant_id=tenant.id,
            nomor_sr="SR-0001",
            nama_pelanggan="Budi Santoso",
            no_hp="081298765431",
            alamat="Jl. Kenanga No. 12",
            dusun_rt_rw="Dusun I / RT 01 RW 02",
            kategori_id=kategori_r1.id,
            meter_awal_pemasangan=100,
        ),
        Pelanggan(
            tenant_id=tenant.id,
            nomor_sr="SR-0002",
            nama_pelanggan="Ibu Siti Aminah",
            no_hp="081298765432",
            alamat="Jl. Kenanga No. 15",
            dusun_rt_rw="Dusun I / RT 01 RW 02",
            kategori_id=kategori_r1.id,
            meter_awal_pemasangan=80,
        ),
        Pelanggan(
            tenant_id=tenant.id,
            nomor_sr="SR-0003",
            nama_pelanggan="Joko Widodo",
            no_hp="081298765433",
            alamat="Jl. Mawar No. 04",
            dusun_rt_rw="Dusun II / RT 02 RW 02",
            kategori_id=kategori_r1.id,
            meter_awal_pemasangan=150,
        ),
        Pelanggan(
            tenant_id=tenant.id,
            nomor_sr="SR-0004",
            nama_pelanggan="Warung Bu Tejo",
            no_hp="081298765434",
            alamat="Jl. Raya Pasar Desa No. 01",
            dusun_rt_rw="Dusun II / RT 03 RW 02",
            kategori_id=kategori_niaga.id,
            meter_awal_pemasangan=200,
        ),
    ]
    for p in pelanggans:
        db.add(p)
    db.flush()

    # 5. Meter Induk Tandon (Produksi)
    meter_induk = MeterInduk(
        tenant_id=tenant.id,
        periode="2026-10",
        nama_sumber="Tandon Mata Air Sumber Rejo",
        meter_lalu=1000,
        meter_kini=1120,
        total_produksi_m3=120,
    )
    db.add(meter_induk)

    # 6. Catatan Meter Pelanggan & Tagihan (Periode 2026-10)
    meter_readings = [
        (pelanggans[0], 100, 115),  # 15 m3
        (pelanggans[1], 80, 88),  # 8 m3
        (pelanggans[2], 150, 175),  # 25 m3
        (pelanggans[3], 200, 240),  # 40 m3
    ]

    for p, lalu, kini in meter_readings:
        vol = kini - lalu
        cm = CatatanMeter(
            tenant_id=tenant.id,
            pelanggan_id=p.id,
            periode="2026-10",
            meter_lalu=lalu,
            meter_kini=kini,
            volume_m3=vol,
            petugas_id=users[2].id,
        )
        db.add(cm)
        db.flush()

        # Calculate bill
        kategori = kategori_niaga if p.kategori_id == kategori_niaga.id else kategori_r1
        calc = calculate_water_bill(
            usage_m3=vol,
            biaya_beban=kategori.biaya_beban,
            biaya_pemeliharaan=kategori.biaya_pemeliharaan,
            denda_keterlambatan=kategori.denda_keterlambatan,
            tiers=kategori.tiers,
        )

        is_paid = p.nomor_sr in ["SR-0001", "SR-0002"]
        tagihan = Tagihan(
            tenant_id=tenant.id,
            pelanggan_id=p.id,
            catatan_meter_id=cm.id,
            nomor_tagihan=f"INV-202610-{p.nomor_sr.replace('SR-', '')}",
            periode="2026-10",
            rincian_tarif=calc.model_dump(),
            nominal_volume=Decimal(str(calc.volume_cost)),
            nominal_beban=Decimal(str(calc.beban)),
            nominal_pemeliharaan=Decimal(str(calc.pemeliharaan)),
            nominal_denda=Decimal("0.00"),
            total_tagihan=Decimal(str(calc.total)),
            status="paid" if is_paid else "unpaid",
            jatuh_tempo=date(2026, 10, 20),
            paid_at=datetime.now(UTC) if is_paid else None,
            metode_pembayaran="tunai" if is_paid else None,
            kasir_id=users[0].id if is_paid else None,
        )
        db.add(tagihan)
        db.flush()

        if is_paid:
            kas_in = BukuKas(
                tenant_id=tenant.id,
                jenis="masuk",
                kategori="iuran_air",
                nominal=tagihan.total_tagihan,
                keterangan=f"Iuran air {tagihan.periode} - {p.nama_pelanggan} ({tagihan.nomor_tagihan})",
                tagihan_id=tagihan.id,
                created_by=users[0].id,
            )
            db.add(kas_in)

    # 7. Pengeluaran Operasional Kas (Listrik & Kaporit)
    kas_out_1 = BukuKas(
        tenant_id=tenant.id,
        jenis="keluar",
        kategori="listrik_pln",
        nominal=Decimal("150000.00"),
        keterangan="Token listrik pompa submersible tandon mata air (Oktober 2026)",
        created_by=users[0].id,
    )
    kas_out_2 = BukuKas(
        tenant_id=tenant.id,
        jenis="keluar",
        kategori="kaporit",
        nominal=Decimal("45000.00"),
        keterangan="Pembelian kaporit tablet penjernih air 2 kaleng",
        created_by=users[0].id,
    )
    db.add(kas_out_1)
    db.add(kas_out_2)

    db.commit()
    print("Seed complete! Demo login: sukamaju / admin / admin123")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
