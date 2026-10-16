# TirtaDesa (`tirtadesa.id`)

> **Sistem Pengelolaan Air Bersih Komunitas Desa (KPSPAMS / HIPPAM / SPAMDes)**  
> *"Air Mengalir Rapi, Kas Transparan"*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

TirtaDesa adalah aplikasi web dan PWA (Progressive Web App) open-source untuk digitalisasi pengelolaan air bersih tingkat desa/kelurahan yang dibangun di bawah program **WSLIC** (Water and Sanitation for Low-Income Communities) dan **PAMSIMAS**, yang dikelola oleh:
- **KPSPAMS** (Kelompok Pengelola Sistem Penyediaan Air Minum dan Sanitasi)
- **HIPPAM** (Himpunan Penduduk Pemakai Air Minum)
- **PAM Desa / Unit Air BUMDes**

Berbeda dengan solusi SaaS berbayar yang membebani kas desa dengan biaya langganan bulanan ratusan ribu rupiah, TirtaDesa **100% gratis, open-source, dan dapat di-self-host** di server desa, VPS murah, maupun laptop pengurus tanpa biaya lisensi.

---

## Fitur Utama

### 1. Catat Meter Offline-First (PWA)
- **Bekerja Tanpa Sinyal:** Petugas lapangan tetap bisa mencatat angka meter di gang dan pelosok desa yang blank spot. Data disimpan di HP via IndexedDB (Dexie.js).
- **Auto-Sync:** Begitu HP tersambung ke WiFi balai desa atau mendapat sinyal, data otomatis tersinkronisasi ke server pusat.
- **Deteksi Anomali Meter:** Alert otomatis jika pemakaian melonjak >200% atau angka meter mundur (indikasi salah catat atau meteran rusak).
- **Bukti Foto:** Simpan catatan foto fisik meteran air.

### 2. Flexible Progressive Tariff Engine
- Mendukung kombinasi komponen tarif air desa:
  - Biaya beban / abonemen bulanan wajib (flat)
  - Biaya pemeliharaan meteran / pipa
  - Tarif volume berjenjang / progresif (misal: 0-10 m³ Rp 1.500, 11-20 m³ Rp 2.500, >20 m³ Rp 3.500)
  - Denda keterlambatan pembayaran

### 3. Kasir & Cetak Struk Bluetooth Thermal (58mm/80mm)
- Kasir pelunasan tagihan 1-klik (tunai, transfer, QRIS).
- Cetak struk/nota pembayaran langsung dari browser Google Chrome HP atau laptop ke printer thermal Bluetooth portabel menggunakan protokol ESC/POS murni (tanpa aplikasi pihak ketiga seperti RawBT).

### 4. Audit Neraca Air & Deteksi Kebocoran (NRW - Non-Revenue Water)
- Input debit meter induk tandon air vs akumulasi meteran warga.
- Menghitung persentase kehilangan air (*water loss*) untuk mendeteksi dini kebocoran pipa transmisi bawah tanah atau sambungan liar.

### 5. Buku Kas Operasional Terbuka
- Pemasukan otomatis terhubung dengan tagihan warga yang lunas.
- Pencatatan beban pengeluaran riil: token listrik pompa submersible PLN, pembelian kaporit/tablet penjernih, dan sparepart pipa perbaikan.
- Running balance saldo kas operasional otomatis terjaga.

### 6. Portal Publik Warga (Tanpa Login)
- **Cek Tagihan Mandiri (`/public/:slug/cek-tagihan`):** Warga cukup memasukkan Nomor Sambungan (SR) atau Nomor WhatsApp untuk melihat rincian tagihan belum lunas, riwayat pemakaian air, dan rekening transfer.
- **Transparansi Neraca Air & Kas (`/public/:slug/transparansi`):** Halaman publik terbuka yang menampilkan volume air tersalurkan, susut air, dan neraca kas operasional desa demi akuntabilitas publik.

---

## Akun Demo & Quick Start

Aplikasi sudah dilengkapi dengan seeder otomatis (`AUTO_SEED=true`) yang menyiapkan komunitas percontohan:

- **Slug Komunitas**: `sukamaju` (KPSPAMS Tirta Makmur, Desa Sukamaju)
- **Bendahara / Admin**: `admin` / `admin123`
- **Ketua KPSPAMS**: `ketua` / `ketua123`
- **Petugas Lapangan**: `petugas` / `petugas123`
- **Portal Cek Tagihan Publik**: `http://localhost:5173/public/sukamaju/cek-tagihan` (Coba cari: `SR-0001` atau `081298765431`)
- **Portal Transparansi Publik**: `http://localhost:5173/public/sukamaju/transparansi`

---

## Menjalankan dengan Docker Compose (1 Command)

```bash
docker compose up -d
```

- **Frontend**: http://localhost
- **Backend API & Swagger Docs**: http://localhost:8000/docs
- **Database**: PostgreSQL 16 pada port 5432

---

## Menjalankan Secara Lokal (Development)

### 1. Backend (FastAPI)

```bash
cd backend

# Buat virtual environment & install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Jalankan server development (menggunakan SQLite otomatis)
uvicorn app.main:app --reload --port 8000
```

Backend aktif di `http://localhost:8000` dengan Swagger UI di `http://localhost:8000/docs`.

Menjalankan pengujian & linter:
```bash
pytest -v
ruff check .
ruff format --check .
```

### 2. Frontend (React + Vite + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Frontend aktif di `http://localhost:5173`.

Menjalankan typecheck & build:
```bash
npm run typecheck
npm run build
npm run lint
```

---

## Arsitektur & Struktur Direktori

```
tirtadesa/
├── backend/
│   ├── app/
│   │   ├── core/         # Config, Database engine, Auth JWT & Security
│   │   ├── models/       # SQLAlchemy 2.0 multi-tenant models
│   │   ├── schemas/      # Pydantic v2 schemas & request validation
│   │   ├── services/     # Progressive billing engine & ESC/POS receipt
│   │   ├── routers/      # API endpoints (auth, pelanggan, tagihan, kas, audit)
│   │   ├── seed.py       # Idempotent database seeder
│   │   └── main.py       # FastAPI application entry point
│   ├── tests/            # Pytest test suite (in-memory SQLite)
│   ├── pyproject.toml    # Ruff & Pytest configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance & JWT auth interceptor
│   │   ├── components/   # Layout, Navbar, responsive navigation
│   │   ├── context/      # AuthContext & user session
│   │   ├── db/           # Dexie.js (IndexedDB) offline-first database
│   │   ├── lib/          # Web Bluetooth ESC/POS thermal printer driver
│   │   ├── pages/        # Dashboard, CatatMeter, Tagihan, Kas, Audit, Public
│   │   └── App.tsx       # React Router v6 setup
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml     # Production multi-container setup
├── .env.example
├── .gitignore
├── LICENSE               # MIT License
└── README.md
```

---

## Lisensi

Didistribusikan di bawah lisensi open source **MIT**. Siapa pun berhak menggunakan, memodifikasi, dan mengembangkannya untuk kemaslahatan masyarakat desa dan komunitas air bersih di seluruh Indonesia.
