import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CatatMeter } from "./pages/CatatMeter";
import { Tagihan } from "./pages/Tagihan";
import { Pelanggan } from "./pages/Pelanggan";
import { Kas } from "./pages/Kas";
import { AuditAir } from "./pages/AuditAir";
import { PublicCekTagihan } from "./pages/PublicCekTagihan";
import { PublicTransparansi } from "./pages/PublicTransparansi";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Citizen Portals (No login required) */}
          <Route path="/public/:slug/cek-tagihan" element={<PublicCekTagihan />} />
          <Route path="/public/:slug/transparansi" element={<PublicTransparansi />} />

          {/* Guest Route */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          {/* Protected Routes for Village Water Board / Staff */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/catat-meter" element={<CatatMeter />} />
            <Route path="/tagihan" element={<Tagihan />} />
            <Route path="/pelanggan" element={<Pelanggan />} />
            <Route path="/kas" element={<Kas />} />
            <Route path="/audit-air" element={<AuditAir />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
