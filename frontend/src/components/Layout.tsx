import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Droplets, ExternalLink } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard Utama";
      case "/catat-meter":
        return "Pencatatan Meter Air";
      case "/tagihan":
        return "Tagihan & Kasir Pembayaran";
      case "/pelanggan":
        return "Master Sambungan Rumah (SR)";
      case "/kas":
        return "Buku Kas Operasional";
      case "/audit-air":
        return "Audit Neraca Air & Kehilangan (NRW)";
      case "/pengaturan":
        return "Pengaturan & Manajemen Akun";
      default:
        return "Sistem Informasi Air";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar (Desktop persistent 240px, mobile slide-over) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (Offset by 240px on lg: screens) */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          {/* Quick Header Links */}
          <div className="flex items-center space-x-2">
            <a
              href={`/public/${user?.tenant_slug || "sukamaju"}/cek-tagihan`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>Cek Tagihan Warga</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <div className="text-xs font-medium text-slate-500 hidden md:block border-l border-slate-200 pl-3">
              {user?.tenant_nama}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 bg-white">
          <span>TirtaDesa: Sistem Pengelolaan Air Bersih Swadaya Komunitas (Open Source MIT)</span>
        </footer>
      </div>
    </div>
  );
};
