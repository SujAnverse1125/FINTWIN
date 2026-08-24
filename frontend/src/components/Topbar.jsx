import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CreditCard,
  X,
  ArrowRight,
  TrendingDown,
  User,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
} from "lucide-react";

import { getInvoices } from "../data/financialStore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const titles = {
  "/dashboard": { title: "Executive Dashboard", sub: "Real-time liquidity, receivables & cash runway telemetry" },
  "/cash-flow": { title: "Cash Flow Digital Twin", sub: "Visual cash waterfall, historical velocity & runway projection" },
  "/invoices": { title: "Invoices & Collections", sub: "Receivables tracker, multi-format importer (CSV/Excel/PDF/JSON) & AI delay radar" },
  "/expenses": { title: "Expenses & Monthly Burn", sub: "Recurring liabilities, categorized burn rate & cost optimization" },
  "/customers": { title: "Customer Intelligence & Risk", sub: "Credit risk scoring, payment delay tracking & concentration" },
  "/forecast": { title: "AI 90-Day Cash Forecast", sub: "Probabilistic runway simulation with confidence intervals" },
  "/simulator": { title: "What-If Shock Simulator", sub: "Interactive scenario stress-testing for MSME liquidity" },
  "/financing": { title: "MSME Financing Marketplace", sub: "Working capital gap solutions & invoice discounting options" },
  "/gst": { title: "GST Intelligence & Tax Calculator", sub: "Overall GST reconciliation (GSTR-1/2B/3B), transaction calculator & GSTIN lookup" },
  "/payroll": { title: "Workers & Salary Payroll Hub", sub: "Employee directory, 1-click salary disbursements, and payroll burn ledger" },
  "/reports": { title: "Financial Reports & P&L", sub: "Exportable statements, monthly burn & liquidity reconciliation" },
  "/integrations": { title: "Accounting Integrations", sub: "Seamless sync with Tally Prime, Zoho Books, GSTN & Banks" },
  "/settings": { title: "Business Settings & Profiles", sub: "Company parameters, GSTIN setup, targets & scenario presets" },
};

export default function Topbar({ onOpenAiCopilot, onOpenQuickAction, onOpenSearch, onToggleMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [invoices, setInvoices] = useState(getInvoices());

  const currentInfo = titles[location.pathname] || {
    title: "FinTwin MSME Platform",
    sub: "AI Financial Intelligence & Digital Twin",
  };

  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;
  const highRiskCount = invoices.filter((i) => i.riskScore === "High" && i.status !== "Paid").length;

  return (
    <header className="app-topbar">
      {/* Page Title & Subtitle */}
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-page-info">
          <h1 className="topbar-page-title">{t(currentInfo.title, currentInfo.title)}</h1>
          <span className="topbar-page-subtitle">{t(currentInfo.sub, currentInfo.sub)}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="topbar-right">
        {/* Search button */}
        <button className="topbar-search-btn" onClick={onOpenSearch}>
          <Search size={15} />
          <span>{t("quickSearch", "Quick search...")}</span>
          <kbd className="search-kbd">⌘K</kbd>
        </button>

        {/* Quick Add Button */}
        <button
          className="topbar-btn primary-action"
          onClick={onOpenQuickAction}
          title="Create Invoice or Expense"
        >
          <Plus size={15} />
          <span>{t("quickAdd", "Quick Add")}</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-btn icon-only"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Alerts"
          >
            <Bell size={17} />
            {(overdueCount > 0 || highRiskCount > 0) && <div className="topbar-badge-dot" />}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 10,
                width: "min(340px, calc(100vw - 32px))",
                background: "var(--bg-card-solid)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 200,
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>
                  Alerts & Notifications
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{ color: "var(--text-muted)", fontSize: 12 }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {overdueCount > 0 && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(244,63,94,0.1)",
                      border: "1px solid rgba(244,63,94,0.25)",
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate("/invoices");
                      setShowNotifications(false);
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#fb7185" }}>
                      <AlertTriangle size={14} /> {overdueCount} Overdue Invoices
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 11.5 }}>
                      Review payment terms or trigger financing.
                    </div>
                  </div>
                )}

                {highRiskCount > 0 && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate("/customers");
                      setShowNotifications(false);
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#fbbf24" }}>
                      <TrendingDown size={14} /> {highRiskCount} High Risk Customer Invoices
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 11.5 }}>
                      AI predicts high default probability.
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: 10,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#34d399" }}>
                    <ShieldCheck size={14} /> Digital Twin Engine Synchronized
                  </div>
                  <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 11.5 }}>
                    Cash runway baseline calculated with 94.8% confidence.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Authentication Profile Button */}
        <div style={{ position: "relative" }}>
          {isAuthenticated ? (
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 8px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-medium)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {user?.avatar || "FT"}
              </div>
              <div className="topbar-user-text" style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
                  {user?.name || "Executive"}
                </span>
                <span style={{ fontSize: 9.5, color: "var(--accent-emerald)", fontWeight: 600 }}>
                  {user?.role?.split(" ")[0] || "Admin"}
                </span>
              </div>
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/login")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* User Profile Dropdown */}
          {isAuthenticated && showUserDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 10,
                width: "min(260px, calc(100vw - 32px))",
                background: "var(--bg-card-solid)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 200,
                padding: "8px",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#fff" }}>{user?.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{user?.email}</div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(59,130,246,0.15)",
                    color: "#60a5fa",
                    display: "inline-block",
                    marginTop: 6,
                  }}
                >
                  {user?.role}
                </div>
              </div>

              <div style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "var(--text-primary)" }} onClick={() => { setShowUserDropdown(false); navigate("/settings"); }}>
                <span>🏢 Company Settings & Targets</span>
              </div>

              <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />

              <div
                style={{
                  padding: "6px 8px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#fb7185",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => {
                  logout();
                  setShowUserDropdown(false);
                  navigate("/login");
                }}
              >
                <LogOut size={13} />
                <span>Sign Out & Save</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
