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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { to: "/", label: "Dashboard", icon: Activity },
    { to: "/catat-meter", label: "Catat Meter (PWA)", icon: Gauge },
    { to: "/tagihan", label: "Tagihan & Kasir", icon: Receipt },
    { to: "/pelanggan", label: "Pelanggan", icon: Users },
    { to: "/kas", label: "Buku Kas", icon: Wallet },
    { to: "/audit-air", label: "Audit Air", icon: Droplets },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tenant Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg text-sky-400">
              <Droplets className="w-6 h-6 text-sky-400" />
              <span>TirtaDesa</span>
            </Link>
            {user && (
              <span className="hidden md:inline-block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                {user.tenant_nama}
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Controls & Online Badge */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                isOnline ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"
              }`}
              title={isOnline ? "Terhubung ke internet" : "Sedang offline — data catat meter disimpan di HP"}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? "Online" : "Offline PWA"}</span>
            </div>

            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 hidden lg:inline">
                  {user.nama_lengkap} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-3 space-y-1">
          {user && (
            <div className="px-3 py-1 text-xs text-slate-400 border-b border-slate-800 mb-2">
              {user.tenant_nama} • {user.nama_lengkap}
            </div>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
