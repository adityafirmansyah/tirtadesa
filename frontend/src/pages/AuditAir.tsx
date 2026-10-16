import React, { useEffect, useState } from "react";
import { Droplets, AlertTriangle, Plus, X } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface WaterBalanceData {
  periode: string;
  total_produksi_m3: number;
  total_konsumsi_pelanggan_m3: number;
  kehilangan_air_m3: number;
  persentase_kehilangan: number;
  status_efisiensi: string;
}

interface MeterIndukItem {
  id: string;
  periode: string;
  nama_sumber: string;
  meter_lalu: number;
  meter_kini: number;
  total_produksi_m3: number;
}

export const AuditAir: React.FC = () => {
  const { user } = useAuth();
  const canManageAudit = user?.role === "ketua" || user?.role === "bendahara";

  const [periode, setPeriode] = useState("2026-10");
  const [balance, setBalance] = useState<WaterBalanceData | null>(null);
  const [meters, setMeters] = useState<MeterIndukItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [namaSumber, setNamaSumber] = useState("Tandon Mata Air Dusun Barat");
  const [meterLalu, setMeterLalu] = useState<number>(0);
  const [meterKini, setMeterKini] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [balRes, mRes] = await Promise.all([
        api.get(`/api/audit-air/water-balance?periode=${periode}`),
        api.get(`/api/audit-air/meter-induk?periode=${periode}`),
      ]);
      setBalance(balRes.data);
      setMeters(mRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periode]);

  const handleAddMeterInduk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/audit-air/meter-induk", {
        periode: periode,
        nama_sumber: namaSumber.trim(),
        meter_lalu: Number(meterLalu),
        meter_kini: Number(meterKini),
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal mencatat meter induk.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Audit Neraca Air & Deteksi Bocor (NRW)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bandingkan total debit air yang dipompa dari tandon dengan total air yang tercatat di meteran warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="py-1.5 px-3 text-sm border border-slate-300 rounded-lg bg-white"
          />
          {canManageAudit && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Meter Induk Tandon</span>
            </button>
          )}
        </div>
      </div>

      {/* Water Balance Diagnosis */}
      {balance && (
        <div className="bg-white text-slate-900 p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Diagnosis Efisiensi Distribusi Air • Periode {balance.periode}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                balance.persentase_kehilangan > 25
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {balance.status_efisiensi}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Air Dipompa (Produksi)</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {balance.total_produksi_m3.toLocaleString("id-ID")} m³
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Air Dikonsumsi Warga</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-sky-700 mt-1 block">
                {balance.total_konsumsi_pelanggan_m3.toLocaleString("id-ID")} m³
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Air Susut / Hilang</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1 block">
                {balance.kehilangan_air_m3.toLocaleString("id-ID")} m³
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Tingkat Kehilangan (Loss)</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
                {balance.persentase_kehilangan}%
              </span>
            </div>
          </div>

          {balance.persentase_kehilangan > 25 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Peringatan: Tingkat kehilangan air melebihi batas wajar (25%). Disarankan periksa pipa transmisi dari tandon atau sambungan warga yang belum termeter.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Meter Induk List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
        <h3 className="font-bold text-sm text-slate-900 mb-3">Daftar Meter Induk Tandon Mata Air</h3>
        <div className="divide-y divide-slate-100">
          {meters.map((m) => (
            <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-900 block">{m.nama_sumber}</span>
                <span className="text-slate-400">Periode: {m.periode}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-slate-700 block">
                  {m.meter_lalu} &rarr; {m.meter_kini}
                </span>
                <span className="font-mono font-bold text-indigo-600">Total: {m.total_produksi_m3} m³</span>
              </div>
            </div>
          ))}
          {meters.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              Belum ada pencatatan meter induk untuk periode ini.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Meter Induk */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Catat Meter Induk Tandon</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMeterInduk} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Tandon / Sumber</label>
                <input
                  type="text"
                  required
                  value={namaSumber}
                  onChange={(e) => setNamaSumber(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Meter Awal (Lalu)</label>
                  <input
                    type="number"
                    required
                    value={meterLalu}
                    onChange={(e) => setMeterLalu(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Meter Akhir (Kini)</label>
                  <input
                    type="number"
                    required
                    value={meterKini}
                    onChange={(e) => setMeterKini(Number(e.target.value))}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
                >
                  {submitting ? "Menyimpan..." : "Simpan Meter Induk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
