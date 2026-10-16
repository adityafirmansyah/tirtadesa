import React from "react";
import { Link } from "react-router-dom";
import {
  Droplets,
  Receipt,
  Wallet,
  ShieldCheck,
  CheckCircle,
  WifiOff,
  Printer,
  FileCode,
  ArrowRight,
  ExternalLink,
  Github,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const operationalFeatures = [
    {
      icon: WifiOff,
      title: "Catat Meter Tanpa Sinyal (PWA)",
      desc: "Petugas keliling gang atau dusun pelosok yang minim sinyal tanpa khawatir. Angka meter tersimpan aman di memori HP dan otomatis tersinkronisasi saat kembali ke balai desa.",
    },
    {
      icon: Receipt,
      title: "Kalkulasi Tarif Bertingkat Otomatis",
      desc: "Menghitung biaya pemakaian air berdasarkan golongan, biaya beban abonemen bulanan, dana pemeliharaan meteran, dan denda telat bayar secara akurat.",
    },
    {
      icon: Printer,
      title: "Kasir & Cetak Struk Bluetooth 58mm",
      desc: "Mencetak bukti pelunasan sah langsung dari browser Google Chrome ke printer kasir mini thermal Bluetooth via Web Bluetooth API tanpa perlu aplikasi pihak ketiga.",
    },
    {
      icon: Droplets,
      title: "Audit Neraca Air & Lacak Kebocoran",
      desc: "Membandingkan debit air yang keluar dari tandon induk dengan total kubikasi meteran warga untuk menghitung persentase kehilangan air (Non-Revenue Water).",
    },
    {
      icon: Wallet,
      title: "Buku Kas Operasional Terbuka",
      desc: "Arus kas masuk otomatis sinkron dengan tagihan warga yang lunas. Pencatatan pengeluaran rutin untuk token listrik pompa submersible PLN, kaporit, dan pipa perbaikan.",
    },
    {
      icon: ShieldCheck,
      title: "Portal Warga Tanpa Login",
      desc: "Warga desa cukup memasukkan nomor sambungan rumah (SR) atau nomor WhatsApp untuk melihat rincian tagihan belum lunas, riwayat meter, dan rekening pembayaran.",
    },
  ];

  const comparisons = [
    {
      problem: "Pencatatan angka meteran ditulis di buku kertas, rawan salah baca dan sering hilang.",
      solution: "Input angka meter langsung lewat HP dengan validasi anomali pemakaian dan foto fisik.",
    },
    {
      problem: "Menghitung tarif berjenjang di Excel rawan rumus error dan lambat saat rekap akhir bulan.",
      solution: "Tagihan ratusan warga terbit otomatis dalam 1 klik dengan rincian biaya yang transparan.",
    },
    {
      problem: "Warga menunggak karena tidak tahu nominal pasti dan pengurus repot mengantar surat tagihan fisik.",
      solution: "Warga bisa cek tagihan sendiri kapan saja lewat ponsel tanpa perlu instal aplikasi.",
    },
    {
      problem: "Biaya listrik pompa submersible membengkak tapi pengurus tidak tahu ada pipa distribusi yang bocor.",
      solution: "Neraca air membandingkan produksi tandon vs konsumsi warga untuk mendeteksi dini kebocoran.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">TirtaDesa</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-sky-700 transition-colors">
              Fitur Operasional
            </a>
            <a href="#masalah" className="hover:text-sky-700 transition-colors">
              Masalah & Solusi
            </a>
            <a href="#portal-warga" className="hover:text-sky-700 transition-colors">
              Cek Tagihan Warga
            </a>
            <a
              href="https://github.com/adityafirmansyah/tirtadesa"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-slate-700 hover:text-slate-900"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub (MIT)</span>
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Buka Dashboard &rarr;
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Masuk Pengurus
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100/70 border border-sky-200 text-sky-800 text-xs font-semibold">
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          <span>Sistem Informasi Air Bersih Komunitas Desa</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Aplikasi Catat Meter & Iuran Air <br className="hidden sm:inline" />
          Swadaya Desa Tanpa Biaya Lisensi
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Dibangun untuk KPSPAMS, HIPPAM, dan unit air BUMDes di seluruh Indonesia.
          Catat angka meteran tanpa sinyal di pelosok desa, hitung tarif berjenjang otomatis,
          cetak kuitansi kasir thermal, dan buka neraca air secara transparan.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm"
          >
            <span>Coba Demo Pengurus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/public/sukamaju/cek-tagihan"
            target="_blank"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            <span>Cek Tagihan Warga Mandiri</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>
          <a
            href="https://github.com/adityafirmansyah/tirtadesa"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Source Code (MIT)</span>
          </a>
        </div>

        <div className="pt-4 flex items-center justify-center space-x-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" /> 100% Gratis & Open Source
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Mandiri di Server Desa
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Cetak Thermal 58mm
          </span>
        </div>
      </section>

      {/* Realistic Product Workflow Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-sm">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                Pratinjau Nyata Sistem
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Alur Pengelolaan Dari Lapangan Hingga Kasir
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Demo Desa Sukamaju
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>1. Catat di HP (Offline)</span>
                <span className="text-slate-400 font-mono">SR-0001</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Meter Lalu:</span>
                  <span className="font-mono font-semibold text-slate-700">100 m³</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>Meter Kini:</span>
                  <span className="font-mono text-sky-700">115 m³</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                  Pemakaian: 15 m³ (Tersimpan di IndexedDB)
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>2. Hitung Tarif Bertingkat</span>
                <span className="text-slate-400 font-mono">Oktober 2026</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Tier 1 (0-10 m³):</span>
                  <span className="font-mono">Rp 15.000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tier 2 (11-15 m³):</span>
                  <span className="font-mono">Rp 12.500</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-emerald-700">Rp 39.500</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>3. Cetak Struk Kasir</span>
                <span className="text-slate-400 font-mono">58mm Thermal</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono leading-tight text-slate-700">
                <div className="text-center font-bold">TIRTADESA SUKAMAJU</div>
                <div className="border-b border-dashed border-slate-300 my-1"></div>
                <div className="flex justify-between">
                  <span>Pak RT Santoso</span>
                  <span>SR-0001</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>TOTAL LUNAS:</span>
                  <span>Rp 39.500</span>
                </div>
                <div className="text-center text-[10px] text-slate-400 mt-1">Cetak langsung via Bluetooth</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Cara Lama vs TirtaDesa */}
      <section id="masalah" className="py-14 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Tantangan Nyata di Desa
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Mengapa Pengelolaan Air Desa Harus Rapi dan Transparan?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Banyak pengelola air desa kembali memakai buku manual karena software berbayar terlalu mahal,
              padahal kas air sangat dibutuhkan untuk menjaga pompa tetap menyala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisons.map((c, i) => (
              <div key={i} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                    Kendala Cara Lama
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.problem}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                    Solusi TirtaDesa
                  </span>
                  <p className="text-xs text-slate-900 font-medium leading-relaxed">{c.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Features */}
      <section id="fitur" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Fitur Inti Pengurus
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dirancang Sesuai Kebutuhan Lapangan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fokus pada kemudahan kerja petugas meteran, akurasi kasir, dan akuntabilitas keuangan desa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Citizen Transparency Showcase */}
      <section id="portal-warga" className="py-14 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Keterbukaan Publik Tanpa Sekat
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Warga Bisa Memeriksa Tagihan dan Neraca Kas Sendiri
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tidak ada lagi kecurigaan atau kas yang ditutup-tutupi. Warga desa cukup membuka tautan
            lewat ponsel untuk melihat rincian pemakaian meter mereka atau melihat akumulasi saldo operasional desa.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/public/sukamaju/cek-tagihan"
              target="_blank"
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow"
            >
              Coba Portal Cek Tagihan Warga
            </Link>
            <Link
              to="/public/sukamaju/transparansi"
              target="_blank"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
            >
              Lihat Neraca Air Terbuka
            </Link>
          </div>
        </div>
      </section>

      {/* Self-Host & Installation Callout */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pasang Mandiri di Server Desa Anda
        </h2>
        <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-600">
          TirtaDesa dapat dijalankan menggunakan 1 perintah Docker Compose atau langsung di server lokal kantor desa.
        </p>

        <div className="max-w-md mx-auto bg-slate-900 text-slate-200 text-left p-3.5 rounded-xl font-mono text-xs border border-slate-800 shadow-sm flex items-center justify-between">
          <span>docker compose up -d</span>
          <FileCode className="w-4 h-4 text-slate-500" />
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-700 hover:text-sky-800"
          >
            <span>Masuk ke demo online TirtaDesa sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-6 px-4 sm:px-6 bg-white text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-4 font-medium text-slate-600">
          <Link to="/login" className="hover:text-slate-900">
            Masuk Pengurus
          </Link>
          <span>•</span>
          <Link to="/public/sukamaju/cek-tagihan" className="hover:text-slate-900">
            Portal Warga
          </Link>
          <span>•</span>
          <a
            href="https://github.com/adityafirmansyah/tirtadesa"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900"
          >
            Repositori GitHub
          </a>
        </div>
        <p>TirtaDesa: Sistem Pengelolaan Air Bersih Komunitas Desa di Indonesia (Lisensi Open Source MIT).</p>
      </footer>
    </div>
  );
};
