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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 text-sky-400 mb-4 ring-1 ring-sky-500/20">
          <Droplets className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">TirtaDesa</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sistem Pengelolaan Air Bersih Komunitas (KPSPAMS / HIPPAM / SPAMDes)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-4 shadow-xl border border-slate-700 sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-950/60 border border-red-800 text-red-200 text-sm p-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
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
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
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
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
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
                  className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center mb-2">Akun Demo Cepat (Klik untuk isi):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-600 text-center"
              >
                Bendahara
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("ketua")}
                className="text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-600 text-center"
              >
                Ketua
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("petugas")}
                className="text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-600 text-center"
              >
                Petugas
              </button>
            </div>
          </div>

          {/* Link to Public Portal */}
          <div className="mt-5 text-center">
            <Link
              to="/public/sukamaju/cek-tagihan"
              className="text-xs text-sky-400 hover:text-sky-300 underline"
            >
              Cek Tagihan Warga Mandiri (Tanpa Login) &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
