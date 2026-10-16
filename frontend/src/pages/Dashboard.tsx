import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Wallet,
  AlertCircle,
  Droplets,
  ArrowRight,
  Gauge,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPelanggan: 0,
    saldoKas: 0,
    totalTunggakan: 0,
    kehilanganAirPct: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [pelangganRes, kasRes, tagihanRes, auditRes] = await Promise.all([
          api.get("/api/pelanggan"),
          api.get("/api/kas/summary"),
          api.get("/api/tagihan?status=unpaid"),
          api.get("/api/audit-air/water-balance?periode=2026-10"),
        ]);

        const totalTunggakan = (tagihanRes.data || []).reduce(
          (acc: number, item: { total_tagihan: number | string }) => acc + Number(item.total_tagihan),
          0
        );

        setStats({
          totalPelanggan: (pelangganRes.data || []).length,
          saldoKas: Number(kasRes.data?.saldo || 0),
          totalTunggakan: totalTunggakan,
          kehilanganAirPct: auditRes.data?.persentase_kehilangan || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-400/30">
            Sistem Informasi Air Bersih Desa
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            {user?.tenant_nama || "KPSPAMS TirtaDesa"}
          </h1>
          <p className="text-sm text-sky-100/80 mt-1">
            Selamat bekerja, {user?.nama_lengkap}. Kelola tagihan, pantau kebocoran pipa, dan transparansi kas desa.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/catat-meter"
            className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition-all"
          >
            <Gauge className="w-4 h-4" />
            <span>Catat Meter</span>
          </Link>
        </div>
      </div>

      {/* 2x2 Grid on Mobile, 4 columns on Desktop (Compact Cards per SOP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Sambungan Rumah */}
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sambungan (SR)</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.totalPelanggan}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Aktif</span>
          </div>
        </div>

        {/* Card 2: Saldo Kas */}
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Saldo Kas</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-slate-900 truncate block">
              {loading ? "..." : `Rp ${Math.round(stats.saldoKas).toLocaleString("id-ID")}`}
            </span>
            <span className="text-xs text-slate-400">Kas Operasional</span>
          </div>
        </div>

        {/* Card 3: Tunggakan */}
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tunggakan</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold text-amber-600 truncate block">
              {loading ? "..." : `Rp ${Math.round(stats.totalTunggakan).toLocaleString("id-ID")}`}
            </span>
            <span className="text-xs text-slate-400">Belum Terbayar</span>
          </div>
        </div>

        {/* Card 4: Kehilangan Air */}
        <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Susut Air (NRW)</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {loading ? "..." : `${stats.kehilanganAirPct}%`}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Bulan Ini</span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Menu Cepat Pengelola</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/catat-meter"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Catat Meter PWA</div>
                <div className="text-xs text-slate-500">Mode offline di lapangan</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
          </Link>

          <Link
            to="/tagihan"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Kasir & Cetak Struk</div>
                <div className="text-xs text-slate-500">Cetak printer Bluetooth 58mm</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </Link>

          <Link
            to="/audit-air"
            className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Neraca & Kebocoran</div>
                <div className="text-xs text-slate-500">Meter induk vs meter warga</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </Link>
        </div>
      </div>

      {/* Citizen Transparency Link Box */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-sky-950">Portal Transparansi Warga Siap Digunakan</h4>
          <p className="text-xs text-sky-800 mt-0.5">
            Warga desa dapat memeriksa tagihan mandiri dan melihat neraca air publik tanpa harus memiliki akun login.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/public/${user?.tenant_slug || "sukamaju"}/cek-tagihan`}
            target="_blank"
            className="text-xs bg-white text-sky-700 font-semibold px-3 py-1.5 rounded-lg border border-sky-300 shadow-sm hover:bg-sky-100 transition-colors"
          >
            Buka Cek Tagihan Warga
          </Link>
          <Link
            to={`/public/${user?.tenant_slug || "sukamaju"}/transparansi`}
            target="_blank"
            className="text-xs bg-sky-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-sky-700 transition-colors"
          >
            Lihat Neraca Publik
          </Link>
        </div>
      </div>
    </div>
  );
};
