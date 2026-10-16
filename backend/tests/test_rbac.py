import pytest

from app.core.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.fixture
def bendahara_user(db_session, test_tenant):
    user = User(
        tenant_id=test_tenant.id,
        username="bendahara1",
        hashed_password=get_password_hash("pass123"),
        nama_lengkap="Bendahara Test",
        role="bendahara",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def petugas_user(db_session, test_tenant):
    user = User(
        tenant_id=test_tenant.id,
        username="petugas1",
        hashed_password=get_password_hash("pass123"),
        nama_lengkap="Petugas Test",
        role="petugas_lapangan",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_rbac_petugas_limitations(client, petugas_user):
    token = create_access_token(subject=petugas_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Petugas CANNOT add new Pelanggan (SR) -> 403 Forbidden
    res = client.post(
        "/api/pelanggan",
        headers=headers,
        json={
            "nomor_sr": "SR-9999",
            "nama_pelanggan": "Ilegal",
            "alamat": "Jalan",
            "kategori_id": "dummy",
        },
    )
    assert res.status_code == 403

    # 2. Petugas CANNOT generate monthly bills -> 403 Forbidden
    res = client.post(
        "/api/tagihan/generate-monthly",
        headers=headers,
        json={"periode": "2026-10", "jatuh_tempo_days": 20},
    )
    assert res.status_code == 403

    # 3. Petugas CANNOT create Kategori Tarif -> 403 Forbidden
    res = client.post(
        "/api/tarif",
        headers=headers,
        json={
            "kode": "X",
            "nama": "X",
            "biaya_beban": 0,
            "biaya_pemeliharaan": 0,
            "denda_keterlambatan": 0,
            "tiers": [],
        },
    )
    assert res.status_code == 403

    # 4. Petugas CANNOT create Kas Expense -> 403 Forbidden
    res = client.post(
        "/api/kas",
        headers=headers,
        json={
            "jenis": "keluar",
            "kategori": "listrik_pln",
            "nominal": 10000,
            "keterangan": "beli token",
        },
    )
    assert res.status_code == 403

    # 5. Petugas CANNOT record Meter Induk -> 403 Forbidden
    res = client.post(
        "/api/audit-air/meter-induk",
        headers=headers,
        json={
            "periode": "2026-10",
            "nama_sumber": "Tandon",
            "meter_lalu": 0,
            "meter_kini": 10,
        },
    )
    assert res.status_code == 403

    # 6. Petugas CANNOT manage users -> 403 Forbidden
    res = client.get("/api/users", headers=headers)
    assert res.status_code == 403


def test_rbac_bendahara_limitations(client, bendahara_user):
    token = create_access_token(subject=bendahara_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Bendahara CANNOT manage users (Ketua only) -> 403 Forbidden
    res = client.get("/api/users", headers=headers)
    assert res.status_code == 403

    res = client.post(
        "/api/users",
        headers=headers,
        json={
            "username": "newuser",
            "password": "password",
            "nama_lengkap": "New User",
            "role": "petugas_lapangan",
        },
    )
    assert res.status_code == 403

    # 2. Bendahara CANNOT update tenant profile / bank account (Ketua only) -> 403 Forbidden
    res = client.patch(
        "/api/tenants/current",
        headers=headers,
        json={"nama_organisasi": "Hacked Name"},
    )
    assert res.status_code == 403


def test_rbac_ketua_full_access(client, test_user):
    # test_user role is 'ketua'
    token = create_access_token(subject=test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Ketua CAN list users -> 200 OK
    res = client.get("/api/users", headers=headers)
    assert res.status_code == 200

    # 2. Ketua CAN create new user -> 200 OK
    res = client.post(
        "/api/users",
        headers=headers,
        json={
            "username": "petugas_baru",
            "password": "password123",
            "nama_lengkap": "Petugas Baru",
            "role": "petugas_lapangan",
        },
    )
    assert res.status_code == 200
    assert res.json()["username"] == "petugas_baru"

    # 3. Ketua CAN update tenant profile -> 200 OK
    res = client.patch(
        "/api/tenants/current",
        headers=headers,
        json={"kontak_pengurus": "0899999999"},
    )
    assert res.status_code == 200
    assert res.json()["kontak_pengurus"] == "0899999999"
