import React, { useEffect, useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, X } from "lucide-react";
import { api } from "../api/client";

interface BukuKasItem {
  id: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  nominal: number | string;
  keterangan: string;
  created_at: string;
}

export const Kas: React.FC = () => {
  const [list, setList] = useState<BukuKasItem[]>([]);
  const [summary, setSummary] = useState({ total_masuk: 0, total_keluar: 0, saldo: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [kategori, setKategori] = useState("listrik_pln");
  const [nominal, setNomorNominal] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");

  const fetchData = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get("/api/kas?limit=100"),
        api.get("/api/kas/summary"),
      ]);
      setList(listRes.data);
      setSummary({
        total_masuk: Number(sumRes.data.total_masuk),
        total_keluar: Number(sumRes.data.total_keluar),
        saldo: Number(sumRes.data.saldo),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePengeluaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal) return;
    setSubmitting(true);
    try {
      await api.post("/api/kas", {
        jenis: "keluar",
        kategori: kategori,
        nominal: Number(nominal),
        keterangan: keterangan.trim(),
      });
      setModalOpen(false);
      setNomorNominal("");
      setKeterangan("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal mencatat pengeluaran kas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Buku Kas Operasional</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan uang masuk dari iuran air warga dan pengeluaran token listrik pompa, kaporit, serta pipa.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Biaya Operasional</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Total Pemasukan</span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 block">
            Rp {Math.round(summary.total_masuk).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Total Pengeluaran</span>
          <span className="text-lg sm:text-xl font-bold text-red-600 mt-1 block">
            Rp {Math.round(summary.total_keluar).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Saldo Kas Bersih</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
            Rp {Math.round(summary.saldo).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => {
                const isMasuk = item.jenis === "masuk";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isMasuk ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isMasuk ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        <span className="capitalize">{item.jenis}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs text-slate-800 capitalize">
                      {item.kategori.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{item.keterangan}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-bold text-xs ${
                        isMasuk ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isMasuk ? "+" : "-"} Rp {Number(item.nominal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Catat Pengeluaran Kas Operasional</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePengeluaran} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kategori Biaya</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="listrik_pln">Token Listrik Pompa PLN</option>
                  <option value="kaporit">Kaporit & Bahan Penjernih</option>
                  <option value="pipa">Pipa & Sparepart Perbaikan</option>
                  <option value="honor">Honor Petugas Lapangan</option>
                  <option value="lainnya">Biaya Operasional Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={nominal}
                  onChange={(e) => setNomorNominal(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full text-sm font-mono py-2 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keterangan Pengeluaran</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Beli token listrik pompa tandon barat..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg"
                />
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
                  className="w-2/3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  {submitting ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
