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
  CheckCircle2,
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
      {/* Grounded Operational Header (No generic AI gradient) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Unit Layanan Aktif • Desa Sukamaju</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {user?.tenant_nama || "KPSPAMS TirtaDesa"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Petugas bertugas: <strong className="text-slate-700">{user?.nama_lengkap}</strong> ({user?.role?.replace("_", " ")}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/catat-meter"
            className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Gauge className="w-4 h-4" />
            <span>Mulai Catat Meter</span>
          </Link>
          <Link
            to="/tagihan"
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
          >
            <Receipt className="w-4 h-4" />
            <span>Buka Kasir</span>
          </Link>
        </div>
      </div>

      {/* 2x2 Metric Cards (Clean, readable, no floating blur shadows) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Sambungan Rumah */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sambungan Rumah</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {loading ? "..." : stats.totalPelanggan}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Semua terdaftar aktif</span>
            </div>
          </div>
        </div>

        {/* Card 2: Saldo Kas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas Bersih</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono truncate">
              {loading ? "..." : `Rp ${Math.round(stats.saldoKas).toLocaleString("id-ID")}`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Kas operasional unit air</div>
          </div>
        </div>

        {/* Card 3: Tunggakan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tunggakan Iuran</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-amber-700 font-mono truncate">
              {loading ? "..." : `Rp ${Math.round(stats.totalTunggakan).toLocaleString("id-ID")}`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Belum dilunasi warga</div>
          </div>
        </div>

        {/* Card 4: Susut Air / NRW */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Susut Air (NRW)</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {loading ? "..." : `${stats.kehilanganAirPct}%`}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Selisih tandon vs meteran</div>
          </div>
        </div>
      </div>

      {/* Structured Operational Modules */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900">Alur Kerja Pengelolaan</h2>
          <span className="text-xs text-slate-500">Pilih modul tugas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/catat-meter"
            className="p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">1. Catat Meter Warga</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pencatatan angka meter offline di lapangan per dusun / RT.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5" />
          </Link>

          <Link
            to="/tagihan"
            className="p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">2. Tagihan & Kasir</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Penerbitan rekening air otomatis dan cetak nota kasir thermal 58mm.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5" />
          </Link>

          <Link
            to="/audit-air"
            className="p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all flex items-start justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">3. Audit & Neraca Air</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pemantauan air dipompa vs tertagih untuk melacak pipa bocor.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5" />
          </Link>
        </div>
      </div>

      {/* Citizen Access Transparency Callout */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-800">Akses Publik Transparansi Warga:</span>
          <span className="text-slate-600 ml-1">
            Warga desa dapat melihat tagihan mandiri dan laporan transparansi kas tanpa login.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/public/${user?.tenant_slug || "sukamaju"}/cek-tagihan`}
            target="_blank"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
          >
            Cek Tagihan Mandiri
          </Link>
          <Link
            to={`/public/${user?.tenant_slug || "sukamaju"}/transparansi`}
            target="_blank"
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Laporan Neraca Publik
          </Link>
        </div>
      </div>
    </div>
  );
};
