import React, { useEffect, useState } from "react";
import {
  Receipt,
  Printer,
  CheckCircle,
  Clock,
  Play,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { printViaBluetooth } from "../lib/thermal";

interface TagihanItem {
  id: string;
  nomor_tagihan: string;
  nomor_sr: string;
  nama_pelanggan: string;
  periode: string;
  total_tagihan: number | string;
  status: "paid" | "unpaid";
  jatuh_tempo: string;
  metode_pembayaran?: string;
}

export const Tagihan: React.FC = () => {
  const [tagihanList, setTagihanList] = useState<TagihanItem[]>([]);
  const [periode, setPeriode] = useState("2026-10");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [payingTagihan, setPayingTagihan] = useState<TagihanItem | null>(null);
  const [metodeBayar, setMetodeBayar] = useState<string>("tunai");
  const [submitting, setSubmitting] = useState(false);
  const [receiptTextModal, setReceiptTextModal] = useState<string | null>(null);

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      let url = `/api/tagihan?periode=${periode}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setTagihanList(res.data);
    } catch (err) {
      console.error("Gagal load tagihan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTagihan();
  }, [periode, statusFilter]);

  const handleGenerateBills = async () => {
    if (!confirm(`Terbitkan seluruh tagihan bulan ${periode} secara otomatis dari data meteran?`)) return;
    try {
      const res = await api.post("/api/tagihan/generate-monthly", {
        periode: periode,
        jatuh_tempo_days: 20,
      });
      alert(`Berhasil membuat ${res.data.generated_count} tagihan baru! (${res.data.skipped_count} dilewati karena sudah ada)`);
      fetchTagihan();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat tagihan bulanan.");
    }
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTagihan) return;

    setSubmitting(true);
    try {
      await api.post(`/api/tagihan/${payingTagihan.id}/pay`, {
        metode_pembayaran: metodeBayar,
      });

      // Auto-fetch receipt for printing
      const rcRes = await api.get(`/api/tagihan/${payingTagihan.id}/thermal-receipt`);
      setPayingTagihan(null);
      fetchTagihan();
      setReceiptTextModal(rcRes.data.receipt_text);
    } catch (err) {
      console.error("Gagal bayar:", err);
      alert("Gagal mencatat pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = async (tagihanId: string) => {
    try {
      const res = await api.get(`/api/tagihan/${tagihanId}/thermal-receipt`);
      const text = res.data.receipt_text;
      setReceiptTextModal(text);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil teks kuitansi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Batch Generate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">Tagihan & Kasir Pelunasan</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penagihan bulanan, catat pelunasan kasir, dan cetak kuitansi struk thermal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="py-1.5 px-3 text-sm border border-slate-300 rounded-lg bg-white"
          />
          <button
            onClick={handleGenerateBills}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Terbitkan Tagihan Bulan Ini</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            statusFilter === "" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Semua Status
        </button>
        <button
          onClick={() => setStatusFilter("unpaid")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            statusFilter === "unpaid" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Belum Lunas (Tunggakan)
        </button>
        <button
          onClick={() => setStatusFilter("paid")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            statusFilter === "paid" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Lunas
        </button>
      </div>

      {/* Tagihan Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Tagihan</th>
                <th className="px-4 py-3">SR & Pelanggan</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Total (Rp)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tagihanList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">{t.nomor_tagihan}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 block">{t.nama_pelanggan}</span>
                    <span className="text-xs text-slate-400 font-mono">{t.nomor_sr}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{t.periode}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    Rp {Number(t.total_tagihan).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    {t.status === "paid" ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Lunas ({t.metode_pembayaran})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Belum Bayar</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {t.status === "unpaid" ? (
                      <button
                        onClick={() => setPayingTagihan(t)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Bayar Sekarang
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePrintReceipt(t.id)}
                        className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-300"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Struk</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && tagihanList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    Tidak ada data tagihan untuk periode {periode}. Klik "Terbitkan Tagihan" jika meteran sudah dicatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {payingTagihan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Pelunasan Tagihan Kasir</h3>
              <button onClick={() => setPayingTagihan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="mt-4 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Nama Warga / SR</div>
                <div className="font-bold text-slate-900 text-base">{payingTagihan.nama_pelanggan} ({payingTagihan.nomor_sr})</div>
                <div className="text-xs text-slate-500 mt-2">Nominal Tagihan</div>
                <div className="text-2xl font-black text-sky-600">
                  Rp {Number(payingTagihan.total_tagihan).toLocaleString("id-ID")}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {["tunai", "transfer", "qris"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetodeBayar(m)}
                      className={`py-2 text-xs font-bold rounded-lg border capitalize ${
                        metodeBayar === m ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayingTagihan(null)}
                  className="w-1/3 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  {submitting ? "Menyimpan..." : "Konfirmasi Lunas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview & Thermal Print Modal */}
      {receiptTextModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Struk Pembayaran (58mm)</h3>
              <button onClick={() => setReceiptTextModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="mt-3 bg-slate-100 p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre leading-relaxed border border-slate-200">
              {receiptTextModal}
            </pre>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setReceiptTextModal(null)}
                className="w-1/2 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => printViaBluetooth(receiptTextModal)}
                className="w-1/2 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center space-x-1 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Bluetooth</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
