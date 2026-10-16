import React, { useEffect, useState } from "react";
import {
  Gauge,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import { api } from "../api/client";
import { offlineDb, type OfflineMeterEntry } from "../db/offlineDb";

interface PelangganItem {
  id: string;
  nomor_sr: string;
  nama_pelanggan: string;
  dusun_rt_rw: string;
  meter_terakhir: number;
}

export const CatatMeter: React.FC = () => {
  const [periode, setPeriode] = useState("2026-10");
  const [pelangganList, setPelangganList] = useState<PelangganItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPelanggan, setSelectedPelanggan] = useState<PelangganItem | null>(null);
  const [meterKini, setMeterKini] = useState<number | "">("");
  const [fotoBukti, setFotoBukti] = useState<string>("");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [alertWarning, setAlertWarning] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadData = async () => {
    // 1. Try loading from network
    if (navigator.onLine) {
      try {
        const res = await api.get("/api/pelanggan");
        setPelangganList(res.data);
        // Cache to local Dexie IndexedDB
        await offlineDb.pelanggan.clear();
        await offlineDb.pelanggan.bulkAdd(
          res.data.map((p: PelangganItem) => ({
            id: p.id,
            nomor_sr: p.nomor_sr,
            nama_pelanggan: p.nama_pelanggan,
            dusun_rt_rw: p.dusun_rt_rw || "",
            alamat: "",
            kategori_nama: "",
            meter_terakhir: p.meter_terakhir || 0,
          }))
        );
      } catch (err) {
        console.error("Network fetch failed, loading from local Dexie IndexedDB:", err);
        const cached = await offlineDb.pelanggan.toArray();
        setPelangganList(cached as unknown as PelangganItem[]);
      }
    } else {
      // Offline mode: load from Dexie
      const cached = await offlineDb.pelanggan.toArray();
      setPelangganList(cached as unknown as PelangganItem[]);
    }

    // Load pending queue count
    const pending = await offlineDb.meterQueue.where("status").equals("pending").count();
    setPendingCount(pending);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPelanggan = (p: PelangganItem) => {
    setSelectedPelanggan(p);
    setMeterKini("");
    setAlertWarning(null);
    setSuccessMsg(null);
  };

  const handleMeterChange = (val: string) => {
    const num = val === "" ? "" : parseInt(val, 10);
    setMeterKini(num);
    setAlertWarning(null);

    if (num !== "" && selectedPelanggan) {
      const lalu = selectedPelanggan.meter_terakhir || 0;
      if (num < lalu) {
        setAlertWarning(`Angka meter kini (${num}) lebih kecil dari meter lalu (${lalu}). Pastikan angka benar atau beri catatan jika ganti meteran.`);
      } else if (num - lalu > 50) {
        setAlertWarning(`Pemakaian sangat tinggi (${num - lalu} m³). Periksa kembali angka meteran warga.`);
      }
    }
  };

  const handleSaveMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPelanggan || meterKini === "") return;

    const meterLalu = selectedPelanggan.meter_terakhir || 0;
    const nowStr = new Date().toISOString();

    const entry: OfflineMeterEntry = {
      pelanggan_id: selectedPelanggan.id,
      nomor_sr: selectedPelanggan.nomor_sr,
      periode: periode,
      meter_lalu: meterLalu,
      meter_kini: Number(meterKini),
      foto_bukti: fotoBukti || undefined,
      status: "pending",
      recorded_at: nowStr,
    };

    // Save to local IndexedDB queue
    await offlineDb.meterQueue.add(entry);

    // Update local state and cached list
    setPelangganList((prev) =>
      prev.map((item) =>
        item.id === selectedPelanggan.id ? { ...item, meter_terakhir: Number(meterKini) } : item
      )
    );

    const pending = await offlineDb.meterQueue.where("status").equals("pending").count();
    setPendingCount(pending);
    setSuccessMsg(`Berhasil mencatat meter ${selectedPelanggan.nomor_sr} (${selectedPelanggan.nama_pelanggan}): ${meterKini} m³`);
    setSelectedPelanggan(null);
    setMeterKini("");
    setFotoBukti("");

    // Auto-sync if online
    if (navigator.onLine) {
      triggerBatchSync();
    }
  };

  const triggerBatchSync = async () => {
    if (!navigator.onLine) {
      alert("Tidak ada koneksi internet. Data tersimpan aman di HP dan akan di-sync begitu ada sinyal.");
      return;
    }

    setSyncing(true);
    try {
      const pendingItems = await offlineDb.meterQueue.where("status").equals("pending").toArray();
      if (pendingItems.length === 0) {
        setSyncing(false);
        return;
      }

      const payload = {
        items: pendingItems.map((item) => ({
          pelanggan_id: item.pelanggan_id,
          nomor_sr: item.nomor_sr,
          periode: item.periode,
          meter_lalu: item.meter_lalu,
          meter_kini: item.meter_kini,
          foto_bukti: item.foto_bukti,
        })),
      };

      const res = await api.post("/api/catat-meter/batch-sync", payload);
      // Mark synced
      for (const item of pendingItems) {
        if (item.id) {
          await offlineDb.meterQueue.update(item.id, { status: "synced" });
        }
      }

      setPendingCount(0);
      setSuccessMsg(`Sukses sync ${res.data.synced_count} catatan meter ke server balai desa!`);
    } catch (err) {
      console.error("Batch sync failed:", err);
      alert("Gagal sync ke server. Data tetap tersimpan aman di HP.");
    } finally {
      setSyncing(false);
    }
  };

  const filteredPelanggan = pelangganList.filter(
    (p) =>
      p.nomor_sr.toLowerCase().includes(search.toLowerCase()) ||
      p.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
      (p.dusun_rt_rw && p.dusun_rt_rw.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Offline Sync Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">Catat Meter Lapangan (PWA)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung pencatatan tanpa internet di pelosok desa. Otomatis sinkronisasi saat kembali ke balai desa.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
            <span>{isOnline ? "Tersambung" : "Offline (Local DB)"}</span>
          </div>

          <button
            onClick={triggerBatchSync}
            disabled={syncing || pendingCount === 0}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
          >
            {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            <span>Sync ({pendingCount} pending)</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Selection List & Input Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Customer Route List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari SR, nama warga, RT/RW..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="py-1.5 px-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredPelanggan.map((p) => {
              const isSelected = selectedPelanggan?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPelanggan(p)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                    isSelected ? "bg-sky-50 border border-sky-300" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {p.nomor_sr}
                      </span>
                      <span className="font-semibold text-sm text-slate-900">{p.nama_pelanggan}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.dusun_rt_rw || "Alamat umum"}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Meter Lalu</span>
                    <span className="font-mono text-sm font-semibold text-slate-700">{p.meter_terakhir} m³</span>
                  </div>
                </button>
              );
            })}
            {filteredPelanggan.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                Tidak ada pelanggan yang cocok dengan pencarian.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Meter Input & Validation Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          {selectedPelanggan ? (
            <form onSubmit={handleSaveMeter} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Input Meteran</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedPelanggan.nama_pelanggan}</h3>
                <p className="text-xs text-slate-500">
                  {selectedPelanggan.nomor_sr} • {selectedPelanggan.dusun_rt_rw}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Meteran Lalu</span>
                  <span className="text-lg font-mono font-bold text-slate-800">
                    {selectedPelanggan.meter_terakhir} m³
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Volume Terhitung</span>
                  <span className="text-lg font-mono font-bold text-sky-600">
                    {meterKini !== "" ? Math.max(0, Number(meterKini) - selectedPelanggan.meter_terakhir) : 0} m³
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Angka Meteran Baru (Kini)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  placeholder="Masukkan angka meteran air fisik"
                  value={meterKini}
                  onChange={(e) => handleMeterChange(e.target.value)}
                  className="w-full text-lg font-mono py-2.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {alertWarning && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <span>{alertWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Foto Bukti Angka Meter (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="URL / keterangan bukti foto"
                  value={fotoBukti}
                  onChange={(e) => setFotoBukti(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPelanggan(null)}
                  className="w-1/3 py-2.5 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow transition-colors"
                >
                  Simpan Catatan Meter
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Gauge className="w-12 h-12 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">Pilih warga dari daftar</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Pilih sambungan rumah warga di sebelah kiri untuk mengisi angka meteran bulan {periode}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
