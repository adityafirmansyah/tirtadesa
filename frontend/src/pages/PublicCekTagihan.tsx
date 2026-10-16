import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Droplets, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { api } from "../api/client";

interface TagihanDetail {
  id: string;
  nomor_tagihan: string;
  periode: string;
  total_tagihan: number;
  status: "paid" | "unpaid";
  jatuh_tempo: string;
  rincian: {
    usage_m3: number;
    volume_cost: number;
    beban: number;
    pemeliharaan: number;
    denda: number;
    tiers: Array<{ tier: string; volume: number; rate: number; subtotal: number }>;
  };
}

export const PublicCekTagihan: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [nomor, setNomor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    pelanggan: {
      nomor_sr: string;
      nama_pelanggan: string;
      alamat: string;
      status: string;
    };
    total_tunggakan: number;
    tagihan: TagihanDetail[];
    info_pembayaran: {
      nomor_rekening: string;
      kontak_pengurus: string;
    };
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomor.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const res = await api.get(`/api/public/${slug}/cek-tagihan?nomor=${encodeURIComponent(nomor.trim())}`);
      setData(res.data);
    } catch (err: unknown) {
      setData(null);
      setError(
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
          "Data tidak ditemukan. Pastikan Nomor SR atau Nomor HP sudah benar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Header */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-600 text-white shadow-sm mb-2">
            <Droplets className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cek Tagihan Air Warga</h1>
          <p className="text-xs text-slate-500">
            KPSPAMS / PAM Desa <span className="capitalize font-semibold text-slate-700">{slug}</span>
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nomor Sambungan (SR) atau No. HP
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: SR-0001 atau 0812..."
                  value={nomor}
                  onChange={(e) => setNomor(e.target.value)}
                  className="w-full text-xs py-2.5 pl-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bg-sky-600 hover:bg-sky-500 text-white p-1.5 rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Card */}
        {data && (
          <div className="space-y-4">
            {/* Customer Profile Banner */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                {data.pelanggan.nomor_sr}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">{data.pelanggan.nama_pelanggan}</h2>
              <p className="text-xs text-slate-500">{data.pelanggan.alamat}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Total Tunggakan:</span>
                <span className="text-lg font-bold font-mono text-amber-700">
                  Rp {Math.round(data.total_tunggakan).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* List of Bills */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">Riwayat Tagihan</h3>
              {data.tagihan.map((t) => {
                const isPaid = t.status === "paid";
                return (
                  <div
                    key={t.id}
                    className={`bg-white p-4 rounded-xl border shadow-sm ${
                      isPaid ? "border-slate-200" : "border-amber-300 bg-amber-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">Periode {t.periode}</span>
                        <span className="text-xs text-slate-400 font-mono">{t.nomor_tagihan}</span>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{isPaid ? "Lunas" : "Belum Bayar"}</span>
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Pemakaian ({t.rincian?.usage_m3 || 0} m³):</span>
                        <span className="font-mono">Rp {Math.round(t.rincian?.volume_cost || 0).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Beban & Rawat:</span>
                        <span className="font-mono">
                          Rp {Math.round((t.rincian?.beban || 0) + (t.rincian?.pemeliharaan || 0)).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-dashed border-slate-200 text-sm">
                        <span>Total Tagihan:</span>
                        <span className="text-sky-700">Rp {Math.round(t.total_tagihan).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Info Box */}
            {data.info_pembayaran.nomor_rekening && (
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 space-y-1">
                <span className="font-bold uppercase tracking-wider block text-sky-950">Cara Pembayaran</span>
                <p>Silakan bayar tunai ke petugas loket atau transfer ke:</p>
                <div className="font-mono font-bold bg-white p-2 rounded border border-sky-300 text-sky-900 select-all">
                  {data.info_pembayaran.nomor_rekening}
                </div>
                {data.info_pembayaran.kontak_pengurus && (
                  <p className="text-[11px] text-sky-700">Konfirmasi WA: {data.info_pembayaran.kontak_pengurus}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Public transparency link */}
        <div className="text-center pt-2">
          <Link
            to={`/public/${slug}/transparansi`}
            className="text-xs text-sky-700 font-semibold hover:underline"
          >
            Lihat Neraca Air & Kas Terbuka Desa &rarr;
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-4">
        TirtaDesa: Platform Pengelolaan Air Terbuka untuk Komunitas Indonesia
      </footer>
    </div>
  );
};
