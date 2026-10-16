import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Droplets,
  Gauge,
  Receipt,
  Users,
  Wallet,
  Activity,
  LogOut,
  Wifi,
  WifiOff,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const navGroups = [
    {
      title: "Ringkasan",
      items: [
        { to: "/", label: "Dashboard", icon: Activity },
      ],
    },
    {
      title: "Operasional Air",
      items: [
        { to: "/catat-meter", label: "Catat Meter", icon: Gauge },
        { to: "/tagihan", label: "Tagihan & Kasir", icon: Receipt },
        { to: "/pelanggan", label: "Pelanggan (SR)", icon: Users },
      ],
    },
    {
      title: "Keuangan & Audit",
      items: [
        { to: "/kas", label: "Buku Kas Operasional", icon: Wallet },
        { to: "/audit-air", label: "Audit Neraca Air (NRW)", icon: Droplets },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight leading-none">TirtaDesa</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sistem Air Komunitas</div>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Community Info Snippet */}
      {user && (
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Komunitas</div>
          <div className="text-xs font-semibold text-white truncate mt-0.5">{user.tenant_nama}</div>
          <div className="flex items-center space-x-1.5 mt-1 text-[11px]">
            {isOnline ? (
              <span className="flex items-center text-emerald-400">
                <Wifi className="w-3 h-3 mr-1" /> Online
              </span>
            ) : (
              <span className="flex items-center text-amber-400">
                <WifiOff className="w-3 h-3 mr-1" /> Mode Offline (PWA)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Public Portals Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Portal Warga
          </div>
          <div className="space-y-1">
            <Link
              to={`/public/${user?.tenant_slug || "sukamaju"}/cek-tagihan`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-4 h-4 text-sky-400" />
                <span>Cek Tagihan Warga</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link
              to={`/public/${user?.tenant_slug || "sukamaju"}/transparansi`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Neraca Publik</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      {user && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-white truncate">{user.nama_lengkap}</div>
            <div className="text-[11px] text-slate-400 capitalize">{user.role.replace("_", " ")}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Keluar dari sistem"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Fixed 240px) */}
      <aside className="hidden lg:block w-60 fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
