import React, { useEffect, useState } from "react";
import { Settings, Users, Building, Plus, X, Shield, CheckCircle } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface UserItem {
  id: string;
  username: string;
  nama_lengkap: string;
  no_hp: string;
  role: string;
  is_active: boolean;
}

interface TenantProfile {
  nama_organisasi: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  nomor_rekening: string;
  kontak_pengurus: string;
  qris_payload?: string;
}

export const Pengaturan: React.FC = () => {
  const { user } = useAuth();
  const isKetua = user?.role === "ketua";

  const [activeTab, setActiveTab] = useState<"profil" | "users">("profil");
  const [profile, setProfile] = useState<TenantProfile>({
    nama_organisasi: "",
    desa: "",
    kecamatan: "",
    kabupaten: "",
    nomor_rekening: "",
    kontak_pengurus: "",
    qris_payload: "",
  });

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newNoHp, setNewNoHp] = useState("");
  const [newRole, setNewRole] = useState("petugas_lapangan");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/tenants/current");
      setProfile({
        nama_organisasi: res.data.nama_organisasi || "",
        desa: res.data.desa || "",
        kecamatan: res.data.kecamatan || "",
        kabupaten: res.data.kabupaten || "",
        nomor_rekening: res.data.nomor_rekening || "",
        kontak_pengurus: res.data.kontak_pengurus || "",
        qris_payload: res.data.qris_payload || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    if (!isKetua) return;
    try {
      const res = await api.get("/api/users");
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (isKetua) {
      fetchUsers();
    }
  }, [isKetua]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKetua) return;

    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      await api.patch("/api/tenants/current", profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan profil komunitas.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKetua) return;

    setCreatingUser(true);
    try {
      await api.post("/api/users", {
        username: newUsername.trim(),
        password: newPassword,
        nama_lengkap: newNama.trim(),
        no_hp: newNoHp.trim() || undefined,
        role: newRole,
      });

      setModalUserOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewNama("");
      setNewNoHp("");
      fetchUsers();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Gagal menambah user.");
    } finally {
      setCreatingUser(false);
    }
  };

  if (!isKetua) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center py-12 space-y-2">
        <Shield className="w-10 h-10 text-slate-400 mx-auto stroke-[1.5]" />
        <h2 className="text-base font-bold text-slate-900">Hak Akses Khusus Ketua</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Halaman Pengaturan Komunitas dan Manajemen Akun Pengurus hanya dapat diakses oleh akun dengan peran Ketua KPSPAMS.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900">Pengaturan & Manajemen Akun</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola profil unit air desa, info rekening warga, dan akun staf pengurus (Kewenangan Ketua).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "profil" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Profil Desa</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "users" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staf & Pengurus</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profil komunitas berhasil disimpan dan diperbarui!</span>
        </div>
      )}

      {/* Tab 1: Community Profile */}
      {activeTab === "profil" && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identitas Komunitas Pengelola Air
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Organisasi</label>
              <input
                type="text"
                required
                value={profile.nama_organisasi}
                onChange={(e) => setProfile({ ...profile, nama_organisasi: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Desa</label>
              <input
                type="text"
                required
                value={profile.desa}
                onChange={(e) => setProfile({ ...profile, desa: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kecamatan</label>
              <input
                type="text"
                value={profile.kecamatan}
                onChange={(e) => setProfile({ ...profile, kecamatan: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kabupaten</label>
              <input
                type="text"
                value={profile.kabupaten}
                onChange={(e) => setProfile({ ...profile, kabupaten: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-3">
            Informasi Pembayaran Warga
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nomor Rekening Bank Transfer (Tampil di portal warga)
              </label>
              <textarea
                rows={2}
                placeholder="BRI: 0123-01-004567-53-1 a.n. KPSPAMS Tirta Makmur"
                value={profile.nomor_rekening}
                onChange={(e) => setProfile({ ...profile, nomor_rekening: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Data QRIS Pembayaran Desa (Teks EMVCo / String QRIS)
              </label>
              <textarea
                rows={2}
                placeholder="00020101021126600016ID.CO.QRIS.WWW... (Bisa diisi string QRIS resmi atau link gambar barcode QRIS)"
                value={profile.qris_payload}
                onChange={(e) => setProfile({ ...profile, qris_payload: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Jika diisi, barcode QRIS akan otomatis di-generate dan tampil di portal cek tagihan warga.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kontak Pengurus / Layanan Konfirmasi WhatsApp
              </label>
              <input
                type="text"
                placeholder="081234567890 (Pak Wardi)"
                value={profile.kontak_pengurus}
                onChange={(e) => setProfile({ ...profile, kontak_pengurus: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {savingProfile ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Akun Pengurus & Petugas</h2>
              <p className="text-xs text-slate-500">Akun yang memiliki hak akses login ke sistem ini.</p>
            </div>
            <button
              onClick={() => setModalUserOpen(true)}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Nama Lengkap</th>
                  <th className="px-4 py-2.5">Username</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">No. HP</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.nama_lengkap}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-800">
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.no_hp || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center text-emerald-700 font-semibold">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {modalUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Tambah Akun Pengurus Baru</h3>
              <button onClick={() => setModalUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Peran (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="petugas_lapangan">Petugas Lapangan (Catat Meter & Kasir)</option>
                  <option value="bendahara">Bendahara (Kas, Billing, Master SR)</option>
                  <option value="ketua">Ketua (Semua Akses & Pengaturan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama staf"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="agus_santoso"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812xxxx"
                  value={newNoHp}
                  onChange={(e) => setNewNoHp(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalUserOpen(false)}
                  className="w-1/3 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-2/3 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow"
                >
                  {creatingUser ? "Menyimpan..." : "Buat Akun Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
