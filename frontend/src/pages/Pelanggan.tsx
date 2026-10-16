import React, { useEffect, useState } from "react";
import { Users, Plus, X, Search, CheckCircle } from "lucide-react";
import { api } from "../api/client";

interface PelangganItem {
  id: string;
  nomor_sr: string;
  nama_pelanggan: string;
  no_hp: string;
  alamat: string;
  dusun_rt_rw: string;
  status: string;
  meter_terakhir: number;
}

interface KategoriItem {
  id: string;
  kode: string;
  nama: string;
}

export const Pelanggan: React.FC = () => {
  const [list, setList] = useState<PelangganItem[]>([]);
  const [kategoris, setKategoris] = useState<KategoriItem[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [nomorSr, setNomorSr] = useState("");
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [dusun, setDusun] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [meterAwal, setMeterAwal] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [pRes, kRes] = await Promise.all([
        api.get("/api/pelanggan"),
        api.get("/api/tarif"),
      ]);
      setList(pRes.data);
      setKategoris(kRes.data);
      if (kRes.data.length > 0) {
        setKategoriId(kRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/pelanggan", {
        nomor_sr: nomorSr.trim().toUpperCase(),
        nama_pelanggan: nama.trim(),
        no_hp: noHp.trim() || undefined,
        alamat: alamat.trim(),
        dusun_rt_rw: dusun.trim() || undefined,
        kategori_id: kategoriId,
        meter_awal_pemasangan: Number(meterAwal),
      });

      setModalOpen(false);
      setNomorSr("");
      setNama("");
      setNoHp("");
      setAlamat("");
      setDusun("");
      fetchData();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Gagal menambah pelanggan");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = list.filter(
    (p) =>
      p.nomor_sr.toLowerCase().includes(search.toLowerCase()) ||
      p.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
      (p.dusun_rt_rw && p.dusun_rt_rw.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">Master Sambungan Rumah (SR)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh warga pelanggan PAM desa / KPSPAMS.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sambungan Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor SR, nama, alamat RT/RW..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. SR</th>
                <th className="px-4 py-3">Nama Warga</th>
                <th className="px-4 py-3">No. HP / WA</th>
                <th className="px-4 py-3">Dusun / RT RW</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Meter Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-bold text-xs text-sky-700">{p.nomor_sr}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{p.nama_pelanggan}</td>
                  <td className="px-4 py-3 text-xs">{p.no_hp || "-"}</td>
                  <td className="px-4 py-3 text-xs">{p.dusun_rt_rw || p.alamat}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3" />
                      <span>{p.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-bold text-slate-800">
                    {p.meter_terakhir} m³
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Registrasi Sambungan Baru (SR)</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor SR</label>
                  <input
                    type="text"
                    required
                    placeholder="SR-0005"
                    value={nomorSr}
                    onChange={(e) => setNomorSr(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kategori Tarif</label>
                  <select
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {kategoris.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.kode} - {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Warga / Kepala Keluarga</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dusun / RT RW</label>
                  <input
                    type="text"
                    placeholder="RT 01 RW 02"
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jl. Mawar No..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Angka Awal Meter Fisik</label>
                <input
                  type="number"
                  value={meterAwal}
                  onChange={(e) => setMeterAwal(Number(e.target.value))}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500"
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
                  className="w-2/3 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow"
                >
                  {submitting ? "Menyimpan..." : "Simpan Sambungan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
