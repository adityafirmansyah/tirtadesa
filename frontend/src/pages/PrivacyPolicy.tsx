import React from "react";
import { Link } from "react-router-dom";
import { Droplets, ArrowLeft, Lock } from "lucide-react";

export const PrivacyPolicy: React.FC = () => {
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
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Privasi & Perlindungan Data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Terakhir diperbarui: 16 Oktober 2026
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Komitmen Privasi Komunitas</h2>
            <p>
              TirtaDesa menghormati privasi warga desa dan pengurus komunitas air. Kebijakan Privasi ini
              menjelaskan bagaimana data operasional dikelola ketika menggunakan platform TirtaDesa.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Data yang Dikelola Sistem</h2>
            <p>
              Dalam operasional pencatatan air dan penagihan iuran, sistem menyimpan data terbatas berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data Sambungan Rumah (SR):</strong> Nomor sambungan, nama kepala keluarga, alamat/RT/RW, dan nomor telepon/WhatsApp.</li>
              <li><strong>Catatan Meteran:</strong> Angka meter awal, angka meter akhir, volume pemakaian bulanan, dan foto dokumentasi meter fisik (opsional).</li>
              <li><strong>Transaksi Tagihan & Kas:</strong> Riwayat pembayaran, metode pelunasan (tunai/transfer), dan pencatatan kas operasional keluar.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Penyimpanan Data Lokal & Offline (IndexedDB)</h2>
            <p>
              Saat petugas lapangan mencatat meteran di wilayah yang tidak memiliki sinyal internet, data
              disimpan secara lokal pada memori peramban (browser) perangkat petugas menggunakan teknologi
              IndexedDB (Dexie.js). Data ini hanya disinkronisasikan ke server balai desa ketika perangkat
              kembali terhubung ke jaringan internet.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">4. Perlindungan Privasi pada Halaman Publik</h2>
            <p>
              TirtaDesa menerapkan prinsip pembatasan data pada halaman yang dapat diakses publik:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Cek Tagihan Warga:</strong> Akses rincian tagihan memerlukan nomor sambungan rumah (SR) atau nomor WhatsApp yang telah terdaftar pada unit desa bersangkutan.
              </li>
              <li>
                <strong>Neraca Publik Desa:</strong> Halaman transparansi publik hanya menampilkan data agregat (total volume produksi tandon, total konsumsi warga, tingkat kehilangan air, dan saldo kas). Sistem tidak pernah mempublikasikan daftar nama warga yang menunggak secara terbuka demi menjaga martabat dan privasi warga.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">5. Kedaulatan Data & Pihak Ketiga</h2>
            <p>
              TirtaDesa adalah perangkat lunak mandiri. Kami tidak menjual, menyewakan, atau membagikan data
              pelanggan air desa kepada pihak periklanan atau pihak ketiga manapun. Pada instalasi mandiri
              (self-hosted), seluruh database berada di bawah kendali penuh pengelola desa setempat.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">6. Kontak & Pertanyaan</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai tata kelola privasi perangkat lunak TirtaDesa, Anda dapat
              menghubungi komunitas pengembang melalui halaman isu di repositori publik GitHub kami.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 bg-white text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-4 font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900">Beranda</Link>
          <span>•</span>
          <Link to="/about" className="hover:text-slate-900">Tentang Kami</Link>
          <span>•</span>
          <Link to="/tos" className="hover:text-slate-900">Syarat & Ketentuan</Link>
        </div>
        <p>TirtaDesa: Sistem Pengelolaan Air Bersih Komunitas Desa di Indonesia (Lisensi Open Source MIT).</p>
      </footer>
    </div>
  );
};
