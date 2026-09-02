import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// Master Layout
import AppLayout from "./components/AppLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CashFlow from "./pages/CashFlow";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Customers from "./pages/Customers";
import Forecast from "./pages/Forecast";
import Risk from "./pages/Risk";
import Simulator from "./pages/Simulator";
import Financing from "./pages/Financing";
import CashRecovery from "./pages/CashRecovery";
import Gst from "./pages/Gst";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";

// ==========================================
// PROTECTED ROUTE WRAPPER
// Ensures users MUST log in before accessing app data
// ==========================================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Redirects logged in users from /login to /dashboard
function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />

          {/* Protected Application Routes (Requires Login) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-flow"
            element={
              <ProtectedRoute>
                <CashFlow />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forecast"
            element={
              <ProtectedRoute>
                <Forecast />
              </ProtectedRoute>
            }
          />

          <Route
            path="/risk"
            element={
              <ProtectedRoute>
                <Risk />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/risk"
            element={
              <ProtectedRoute>
                <Risk />
              </ProtectedRoute>
            }
          />

          <Route
            path="/simulator"
            element={
              <ProtectedRoute>
                <Simulator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financing"
            element={
              <ProtectedRoute>
                <Financing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-recovery"
            element={
              <ProtectedRoute>
                <CashRecovery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gst"
            element={
              <ProtectedRoute>
                <Gst />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <Payroll />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </AuthProvider>
);
}

export default App;