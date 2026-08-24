import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  FlaskConical,
  Landmark,
  FileSpreadsheet,
  Layers,
  Settings,
  Percent,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  User,
  UserCheck,
  LogOut,
  X,
} from "lucide-react";

import {
  getBusiness,
  subscribeFinancialData,
  isDatabaseConnected,
} from "../data/financialStore";
import { calculateRunwayDays } from "../engines/digitalTwin";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const primaryNav = [
  { key: "dashboard", name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { key: "cashFlow", name: "Cash Flow Twin", path: "/cash-flow", icon: Wallet },
  { key: "invoices", name: "Invoices", path: "/invoices", icon: FileText, badge: "Live" },
  { key: "expenses", name: "Expenses & Burn", path: "/expenses", icon: CreditCard },
  { key: "customers", name: "Customers & Risk", path: "/customers", icon: Users },
  { key: "forecast", name: "90-Day Forecast", path: "/forecast", icon: TrendingUp },
  { key: "simulator", name: "What-If Simulator", path: "/simulator", icon: FlaskConical },
  { key: "financing", name: "MSME Financing", path: "/financing", icon: Landmark, badge: "New" },
  { key: "gst", name: "GST & Tax Calculator", path: "/gst", icon: Percent, badge: "Tax" },
  { key: "payroll", name: "Payroll & Workers", path: "/payroll", icon: UserCheck, badge: "Payroll" },
  { key: "reports", name: "Reports & P&L", path: "/reports", icon: FileSpreadsheet },
  { key: "integrations", name: "Integrations", path: "/integrations", icon: Layers },
  { key: "settings", name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [business, setBusiness] = useState(getBusiness());
  const [dbConnected, setDbConnected] = useState(isDatabaseConnected());
  const [runway, setRunway] = useState(calculateRunwayDays());

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setBusiness(getBusiness());
      setDbConnected(isDatabaseConnected());
      setRunway(calculateRunwayDays());
    });
    return unsub;
  }, []);

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/landing" className="brand-logo-wrap" onClick={handleNavClick}>
          <div className="brand-logo-icon">FT</div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-title">FinTwin</span>
              <span className="brand-subtitle">
                <Sparkles size={11} /> AI Digital Twin
              </span>
            </div>
          )}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Desktop collapse toggle */}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile close toggle */}
          <button
            className="sidebar-collapse-btn mobile-close-btn"
            onClick={onCloseMobile}
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Logged in User Profile Card */}
      {!collapsed && (
        <div style={{ padding: "0 14px", marginBottom: 12 }}>
          <div
            className="sidebar-business-card"
            onClick={() => {
              navigate("/settings");
              handleNavClick();
            }}
            title="Manage Company Settings"
          >
            <div className="biz-avatar">
              {user?.company ? user.company.charAt(0) : "B"}
            </div>
              <div className="biz-details">
                <div className="biz-name">{user?.company || business.name || "My Enterprise"}</div>
                <div className="biz-type" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span>{user?.name || "Executive"}</span>
                  {user?.role && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)",
                        background:
                          user.role === "Accountant"
                            ? "rgba(16,185,129,0.15)"
                            : user.role === "CFO"
                            ? "rgba(139,92,246,0.15)"
                            : "rgba(59,130,246,0.15)",
                        color:
                          user.role === "Accountant"
                            ? "#34d399"
                            : user.role === "CFO"
                            ? "#c4b5fd"
                            : "#60a5fa",
                      }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Operations</div>}
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
              title={collapsed ? item.name : undefined}
            >
              <div className="nav-item-icon">
                <Icon size={18} />
              </div>
              {!collapsed && <span>{t(item.key, item.name)}</span>}
              {!collapsed && item.badge && (
                <span className={`nav-badge ${item.badge === "Live" ? "success" : item.badge === "Tax" ? "alert" : ""}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-runway-chip">
            <div className="runway-pulse"></div>
            <div>
              <div className="runway-label">{t("netRunway", "Estimated Runway")}</div>
              <div className="runway-val">{runway} {t("daysBuffer", "Days Buffer")}</div>
            </div>
          </div>

          <div className="sidebar-db-status">
            <span className="status-indicator">
              <span className={dbConnected ? "dot-connected" : "dot-offline"} />
              {dbConnected ? t("Database Synced", "Database Synced") : t("Local Twin Mode", "Local Twin Mode")}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
                handleNavClick();
                navigate("/login");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#fb7185",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <LogOut size={11} /> {t("logout", "Logout")}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
