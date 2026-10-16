import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Droplets, ArrowLeft } from "lucide-react";
import { api } from "../api/client";

interface TransparansiData {
  komunitas: {
    nama_organisasi: string;
    desa: string;
    kecamatan: string;
    kabupaten: string;
  };
  statistik: {
    total_sambungan_rumah: number;
    saldo_kas_operasional: number;
    total_kas_masuk: number;
    total_kas_keluar: number;
    total_produksi_air_m3: number;
    total_konsumsi_warga_m3: number;
    tingkat_kehilangan_air_persen: number;
  };
}

export const PublicTransparansi: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<TransparansiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/public/${slug}/transparansi`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-xs text-slate-500">Memuat data transparansi...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-xs text-red-500">Komunitas desa tidak ditemukan.</div>
      </div>
    );
  }

  const { komunitas, statistik } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to={`/public/${slug}/cek-tagihan`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Cek Tagihan Warga</span>
        </Link>

        {/* Hero Header */}
        <div className="bg-white text-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Transparansi Publik Neraca Air & Kas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{komunitas.nama_organisasi}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Desa {komunitas.desa}, Kec. {komunitas.kecamatan || "-"}, {komunitas.kabupaten || "-"}
          </p>
        </div>

        {/* 2x2 Grid of Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Warga Terlayani</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {statistik.total_sambungan_rumah} SR
            </span>
            <span className="text-[11px] text-slate-400">Sambungan Rumah</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Saldo Kas Desa</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 mt-1 block truncate">
              Rp {Math.round(statistik.saldo_kas_operasional).toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-slate-400">Kas Operasional</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Air Tersalur</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-sky-700 mt-1 block">
              {statistik.total_konsumsi_warga_m3.toLocaleString("id-ID")} m³
            </span>
            <span className="text-[11px] text-slate-400">Konsumsi Warga</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Kehilangan Air</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1 block">
              {statistik.tingkat_kehilangan_air_persen}%
            </span>
            <span className="text-[11px] text-slate-400">Tingkat Susut (NRW)</span>
          </div>
        </div>

        {/* Transparency Narrative Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Komitmen Keterbukaan Komunitas</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Data ini diperbarui secara otomatis setiap kali petugas mencatat meteran warga dan kasir mencatat iuran air. 
            Semua dana yang terkumpul digunakan langsung untuk pembiayaan listrik pompa submersible, kaporit penjernih, 
            dan perbaikan pipa yang bocor agar aliran air bersih di desa tetap lancar tanpa hambatan.
          </p>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Akumulasi Kas Masuk Warga</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">
                Rp {Math.round(statistik.total_kas_masuk).toLocaleString("id-ID")}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Akumulasi Biaya Operasional & Pipa</div>
              <div className="text-base font-bold text-red-700 mt-0.5">
                Rp {Math.round(statistik.total_kas_keluar).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-6">
        TirtaDesa — Platform Pengelolaan Air Terbuka untuk Komunitas Indonesia (Open Source MIT)
      </footer>
    </div>
  );
};
