import React from "react";
import { Link } from "react-router-dom";
import { Droplets, HeartHandshake, ShieldCheck, ArrowLeft, Github, Globe } from "lucide-react";

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">TirtaDesa</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8 flex-1">
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Tentang Kami
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Misi Digitalisasi Air Bersih Desa untuk Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform terbuka yang dibangun untuk mendukung keberlanjutan unit air swadaya masyarakat.
          </p>
        </div>

        {/* Section 1: Latar Belakang */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Latar Belakang Proyek</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Program WSLIC (Water and Sanitation for Low-Income Communities) dan PAMSIMAS telah berhasil
            membangun infrastruktur fisik air minum di puluhan ribu desa di seluruh Indonesia. Namun,
            tantangan terbesar pasca-konstruksi adalah keberlanjutan operasional. Banyak unit pengelola
            seperti KPSPAMS, HIPPAM, dan unit air BUMDes mengalami kesulitan dalam pencatatan meter yang
            akurat, penagihan iuran yang tertib, dan pelacakan kebocoran pipa bawah tanah.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Aplikasi proprietary komersial di pasaran sering membebani kas desa dengan biaya langganan
            bulanan ratusan ribu rupiah. TirtaDesa hadir sebagai alternatif yang 100% gratis, berlisensi
            open-source MIT, dan dapat dijalankan secara mandiri di server kantor desa tanpa ketergantungan vendor.
          </p>
        </section>

        {/* Section 2: Tiga Prinsip Utama */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Prinsip Kerja TirtaDesa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">1. Offline-First Lapangan</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Petugas tetap dapat mencatat meter di pelosok desa yang blank spot tanpa koneksi internet. Data
                tersimpan di ponsel dan otomatis sinkron saat ada sinyal.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">2. Transparansi Warga</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Warga desa berhak mengetahui ke mana uang iuran dialokasikan. Portal publik membuka neraca
                kas operasional dan selisih debit air tandon secara akuntabel.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">3. Kedaulatan Data Desa</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Data warga dan catatan keuangan sepenuhnya milik pengelola desa. Tidak ada data yang dijual
                atau dikunci oleh pihak ketiga.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Kontribusi & Komunitas */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900">Komunitas & Kontribusi</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            TirtaDesa dikembangkan secara terbuka untuk kemaslahatan masyarakat desa. Kode sumber dapat diakses,
            dipelajari, dan dikembangkan bersama oleh para pegiat teknologi, pengurus desa, dan relawan di
            seluruh Indonesia melalui repositori resmi kami.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/adityafirmansyah/tirtadesa"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Github className="w-4 h-4" />
              <span>Lihat Proyek di GitHub</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 bg-white text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-4 font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900">Beranda</Link>
          <span>•</span>
          <Link to="/tos" className="hover:text-slate-900">Syarat & Ketentuan</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-slate-900">Kebijakan Privasi</Link>
        </div>
        <p>TirtaDesa: Sistem Pengelolaan Air Bersih Komunitas Desa di Indonesia (Lisensi Open Source MIT).</p>
      </footer>
    </div>
  );
};
