def test_full_api_workflow(client, test_tenant, test_user, auth_headers):
    # 1. Login
    res = client.post(
        "/api/auth/login",
        json={"tenant_slug": test_tenant.slug, "username": "pengurus", "password": "password123"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Kategori Tarif
    res = client.post(
        "/api/tarif",
        headers=headers,
        json={
            "kode": "R1",
            "nama": "Rumah Tangga",
            "biaya_beban": 10000,
            "biaya_pemeliharaan": 2000,
            "denda_keterlambatan": 5000,
            "tiers": [
                {"min_volume": 0, "max_volume": 10, "tarif_per_m3": 1500},
                {"min_volume": 11, "max_volume": None, "tarif_per_m3": 2500},
            ],
        },
    )
    assert res.status_code == 200
    kategori_id = res.json()["id"]

    # 3. Create Pelanggan
    res = client.post(
        "/api/pelanggan",
        headers=headers,
        json={
            "nomor_sr": "SR-0001",
            "nama_pelanggan": "Pak RT Santoso",
            "no_hp": "081234567890",
            "alamat": "RT 01 RW 01",
            "kategori_id": kategori_id,
            "meter_awal_pemasangan": 100,
        },
    )
    assert res.status_code == 200
    pelanggan_id = res.json()["id"]

    # 4. Catat Meter (15 m3 usage: 100 -> 115)
    res = client.post(
        "/api/catat-meter",
        headers=headers,
        json={
            "pelanggan_id": pelanggan_id,
            "periode": "2026-10",
            "meter_lalu": 100,
            "meter_kini": 115,
        },
    )
    assert res.status_code == 200
    assert res.json()["volume_m3"] == 15

    # 5. Generate Tagihan
    res = client.post(
        "/api/tagihan/generate-monthly",
        headers=headers,
        json={"periode": "2026-10", "jatuh_tempo_days": 20},
    )
    assert res.status_code == 200
    assert res.json()["generated_count"] == 1

    # 6. List Tagihan
    res = client.get("/api/tagihan?periode=2026-10", headers=headers)
    assert res.status_code == 200
    tagihans = res.json()
    assert len(tagihans) == 1
    tagihan = tagihans[0]
    # Calculation: Tier 1 (10*1500=15000) + Tier 2 (5*2500=12500) = 27500 volume
    # + 10000 beban + 2000 pemeliharaan = 39500 total
    assert float(tagihan["total_tagihan"]) == 39500.0
    assert tagihan["status"] == "unpaid"

    # 7. Public Cek Tagihan (No Login!)
    res = client.get(f"/api/public/{test_tenant.slug}/cek-tagihan?nomor=SR-0001")
    assert res.status_code == 200
    cek_data = res.json()
    assert cek_data["pelanggan"]["nama_pelanggan"] == "Pak RT Santoso"
    assert cek_data["total_tunggakan"] == 39500.0

    # 8. Pay Tagihan
    res = client.post(
        f"/api/tagihan/{tagihan['id']}/pay",
        headers=headers,
        json={"metode_pembayaran": "tunai"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "paid"

    # 9. Verify thermal receipt generation
    res = client.get(f"/api/tagihan/{tagihan['id']}/thermal-receipt", headers=headers)
    assert res.status_code == 200
    receipt_text = res.json()["receipt_text"]
    assert "TIRTADESA" in receipt_text
    assert "LUNAS (TUNAI)" in receipt_text

    # 10. Check Kas Ledger
    res = client.get("/api/kas/summary", headers=headers)
    assert res.status_code == 200
    summary = res.json()
    assert float(summary["total_masuk"]) == 39500.0
    assert float(summary["saldo"]) == 39500.0
