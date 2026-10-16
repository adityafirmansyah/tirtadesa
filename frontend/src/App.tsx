import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { AboutUs } from "./pages/AboutUs";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CatatMeter } from "./pages/CatatMeter";
import { Tagihan } from "./pages/Tagihan";
import { Pelanggan } from "./pages/Pelanggan";
import { Kas } from "./pages/Kas";
import { AuditAir } from "./pages/AuditAir";
import { Pengaturan } from "./pages/Pengaturan";
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
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catat-meter" element={<CatatMeter />} />
            <Route path="/tagihan" element={<Tagihan />} />
            <Route path="/pelanggan" element={<Pelanggan />} />
            <Route path="/kas" element={<Kas />} />
            <Route path="/audit-air" element={<AuditAir />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
