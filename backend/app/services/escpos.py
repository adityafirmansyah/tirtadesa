from datetime import datetime


def format_thermal_receipt_text(
    tenant_nama: str,
    desa: str,
    nomor_tagihan: str,
    nomor_sr: str,
    nama_pelanggan: str,
    periode: str,
    meter_lalu: int,
    meter_kini: int,
    volume_m3: int,
    volume_cost: float,
    beban: float,
    pemeliharaan: float,
    denda: float,
    total: float,
    status: str,
    metode_bayar: str,
    paid_at: datetime | None,
) -> str:
    """Formats receipt for 32-column standard 58mm thermal printers."""
    separator = "-" * 32
    double_sep = "=" * 32
    time_str = (
        paid_at.strftime("%d/%m/%Y %H:%M WIB")
        if paid_at
        else datetime.now().strftime("%d/%m/%Y %H:%M WIB")
    )

    lines = [
        "TIRTADESA".center(32),
        tenant_nama.center(32),
        f"Desa {desa}".center(32),
        double_sep,
        f"No. Nota : {nomor_tagihan}",
        f"Tanggal  : {time_str}",
        f"No. SR   : {nomor_sr}",
        f"Nama     : {nama_pelanggan[:20]}",
        f"Periode  : {periode}",
        separator,
        f"Meter    : {meter_lalu} s/d {meter_kini}",
        f"Pakai    : {volume_m3} m3",
        separator,
        f"Air      : Rp {int(volume_cost):>12,}".replace(",", "."),
        f"Beban    : Rp {int(beban):>12,}".replace(",", "."),
        f"Rawat    : Rp {int(pemeliharaan):>12,}".replace(",", "."),
    ]

    if denda > 0:
        lines.append(f"Denda    : Rp {int(denda):>12,}".replace(",", "."))

    status_label = "LUNAS" if status.lower() == "paid" else "BELUM LUNAS"

    lines.extend(
        [
            double_sep,
            f"TOTAL    : Rp {int(total):>12,}".replace(",", "."),
            f"STATUS   : {status_label} ({metode_bayar.upper()})",
            double_sep,
            "Simpan struk ini sebagai".center(32),
            "bukti pembayaran sah".center(32),
            "Air Mengalir Rapi, Kas Transparan".center(32),
            "\n\n",
        ]
    )

    return "\n".join(lines)
