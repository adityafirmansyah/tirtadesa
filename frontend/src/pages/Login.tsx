import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, Lock, User, Building, AlertCircle } from "lucide-react";
import { api } from "../api/client";
import { useAuth, type UserData } from "../context/AuthContext";

export const Login: React.FC = () => {
  const [tenantSlug, setTenantSlug] = useState("sukamaju");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        tenant_slug: tenantSlug.trim().toLowerCase(),
        username: username.trim(),
        password: password,
      });

      const { access_token, ...userData } = res.data;
      login(access_token, userData as UserData);
      navigate("/");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        "Gagal masuk. Periksa kembali slug desa, username, dan kata sandi.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: "admin" | "ketua" | "petugas") => {
    setTenantSlug("sukamaju");
    if (role === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else if (role === "ketua") {
      setUsername("ketua");
      setPassword("ketua123");
    } else {
      setUsername("petugas");
      setPassword("petugas123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3 shadow-sm">
          <Droplets className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TirtaDesa</h1>
        <p className="mt-1 text-xs text-slate-500">
          Sistem Pengelolaan Air Bersih Komunitas (KPSPAMS / HIPPAM / SPAMDes)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 shadow-sm border border-slate-200 rounded-xl sm:px-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Slug Komunitas / Desa
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="sukamaju"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 text-center mb-2">Pilih akun demonstrasi:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 text-center transition-colors"
              >
                Bendahara
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("ketua")}
                className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 text-center transition-colors"
              >
                Ketua
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("petugas")}
                className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 text-center transition-colors"
              >
                Petugas
              </button>
            </div>
          </div>

          {/* Citizen Self-Check Link */}
          <div className="mt-5 text-center pt-2">
            <Link
              to="/public/sukamaju/cek-tagihan"
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold"
            >
              Cek Tagihan Warga Mandiri (Tanpa Login) &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
