import React from "react";
import { Link } from "react-router-dom";
import { Droplets, ArrowLeft, Shield } from "lucide-react";

export const TermsOfService: React.FC = () => {
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
            <Shield className="w-3.5 h-3.5" />
            <span>Ketentuan Hukum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Syarat dan Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Terakhir diperbarui: 16 Oktober 2026
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Ketentuan Umum</h2>
            <p>
              TirtaDesa adalah perangkat lunak sumber terbuka (open-source software) yang dirancang untuk
              membantu kelompok pengelola air bersih berbasis masyarakat (KPSPAMS, HIPPAM, PAM Desa, dan BUMDes Air)
              dalam mencatat meteran air, menghitung tagihan, dan mengelola kas operasional.
            </p>
            <p>
              Dengan mengakses website ini atau mengunduh dan menjalankan perangkat lunak TirtaDesa, Anda
              menyetujui untuk terikat oleh Syarat dan Ketentuan ini serta ketentuan Lisensi MIT.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Lisensi Open Source (MIT)</h2>
            <p>
              TirtaDesa didistribusikan di bawah ketentuan Lisensi MIT. Anda diberikan hak secara bebas untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menggunakan perangkat lunak ini untuk keperluan komersial maupun non-komersial.</li>
              <li>Memodifikasi, menyalin, mendistribusikan, dan menggabungkan kode sumber sesuai kebutuhan komunitas Anda.</li>
              <li>Menjalankan instalasi mandiri (self-hosted) di server, komputer kantor desa, atau infrastruktur cloud pribadi.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Tanggung Jawab Pengelola Air (Tenant)</h2>
            <p>
              Masing-masing pengelola desa yang menjalankan instance TirtaDesa bertanggung jawab penuh atas:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kebenaran penetapan formula tarif air bertingkat, biaya beban, dan denda sesuai kesepakatan Musyawarah Desa (Musdes).</li>
              <li>Akurasi pencatatan angka meter fisik yang diinput oleh petugas lapangan.</li>
              <li>Penerimaan dan pengelolaan uang fisik/transfer iuran kas yang disetorkan oleh warga.</li>
              <li>Keamanan kredensial akun pengurus (username dan kata sandi).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">4. Pembatasan Tanggung Jawab (Disclaimer)</h2>
            <p>
              PERANGKAT LUNAK INI DISEDIAKAN "SEBAGAIMANA ADANYA" (AS IS), TANPA JAMINAN APAPUN BAIK TERSURAT
              MAUPUN TERSIRAT. DALAM KONDISI APAPUN, PENGEMBANG ATAU PEMEGANG HAK CIPTA TIDAK BERTANGGUNG JAWAB
              ATAS KLAIM, KERUSAKAN, KEHILANGAN DANA KAS, ATAU KEWAJIBAN LAINNYA YANG TIMBUL DARI PENGGUNAAN
              PERANGKAT LUNAK INI.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">5. Perubahan Ketentuan</h2>
            <p>
              Kami berhak memperbarui ketentuan ini sewaktu-waktu seiring dengan pengembangan fitur baru.
              Perubahan akan dicantumkan secara terbuka melalui repositori publik proyek.
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
          <Link to="/privacy" className="hover:text-slate-900">Kebijakan Privasi</Link>
        </div>
        <p>TirtaDesa: Sistem Pengelolaan Air Bersih Komunitas Desa di Indonesia (Lisensi Open Source MIT).</p>
      </footer>
    </div>
  );
};
