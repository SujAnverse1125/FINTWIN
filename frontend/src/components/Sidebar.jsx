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
  ShieldCheck,
  ShieldAlert,
  Building2,
  SlidersHorizontal,
  Bell,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

import {
  getBusiness,
  subscribeFinancialData,
  isDatabaseConnected,
} from "../data/financialStore";
import { calculateRunwayDays } from "../engines/digitalTwin";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import FinTwinLogo from "./FinTwinLogo";

// Grouped navigation structure (Light Translucent Glass Theme)
const NAV_GROUPS = [
  {
    groupTitle: "FINANCIAL TWIN",
    items: [
      { key: "dashboard", name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, iconColor: "#0284c7" },
      { key: "cashFlow", name: "Cash Flow Twin", path: "/cash-flow", icon: Wallet, iconColor: "#059669" },
      { key: "invoices", name: "Invoices & Inflow", path: "/invoices", icon: FileText, badge: "Live", badgeType: "live", iconColor: "#7c3aed" },
      { key: "forecast", name: "90-Day Forecast", path: "/forecast", icon: TrendingUp, iconColor: "#d97706" },
      { key: "risk", name: "Risk Analysis", path: "/risk", icon: ShieldAlert, badge: "AI", badgeType: "live", iconColor: "#ef4444" },
      { key: "simulator", name: "What-If Simulator", path: "/simulator", icon: FlaskConical, iconColor: "#db2777" },
    ],
  },
  {
    groupTitle: "MSME OPERATIONS",
    items: [
      { key: "expenses", name: "Expenses & Burn", path: "/expenses", icon: CreditCard, iconColor: "#dc2626" },
      { key: "customers", name: "Customers & Risk", path: "/customers", icon: Users, iconColor: "#0891b2" },
      { key: "financing", name: "MSME Financing", path: "/financing", icon: Landmark, badge: "TReDS", badgeType: "treds", iconColor: "#2563eb" },
      { key: "gst", name: "GST Reconciler", path: "/gst", icon: Percent, badge: "Tax", badgeType: "tax", iconColor: "#9333ea" },
      { key: "payroll", name: "Payroll & Workers", path: "/payroll", icon: UserCheck, badge: "Payroll", badgeType: "payroll", iconColor: "#16a34a" },
    ],
  },
  {
    groupTitle: "SYSTEM & INSIGHTS",
    items: [
      { key: "reports", name: "Reports & P&L", path: "/reports", icon: FileSpreadsheet, iconColor: "#64748b" },
      { key: "integrations", name: "Integrations", path: "/integrations", icon: Layers, iconColor: "#64748b" },
      { key: "settings", name: "Settings", path: "/settings", icon: Settings, iconColor: "#64748b" },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [business, setBusiness] = useState(getBusiness());
  const [dbConnected, setDbConnected] = useState(isDatabaseConnected());
  const [runway, setRunway] = useState(calculateRunwayDays());
  const [hoveredItem, setHoveredItem] = useState(null);

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

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
      style={{
        width: collapsed ? "76px" : "268px",
        height: "calc(100vh - 24px)",
        position: "fixed",
        top: "12px",
        left: "12px",
        bottom: "12px",
        borderRadius: "22px",
        // Modern Clean Executive Frosted Translucent Glassmorphism
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transition: "width 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        userSelect: "none",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        overflow: "hidden",
        color: "#0F172A",
      }}
    >
      {/* =========================================================================
          1. TOP BRAND HEADER (ZERO OVERLAPPING GUARANTEED)
          ========================================================================= */}
      <div
        style={{
          padding: collapsed ? "16px 0" : "18px 18px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {collapsed ? (
          /* Collapsed Mode: Monogram Emblem Only */
          <div
            onClick={() => setCollapsed(false)}
            title="Expand Sidebar"
            style={{
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FinTwinLogo size={36} variant="mark-only" />
          </div>
        ) : (
          /* Expanded Mode: Full Logo + Title + Collapse Toggle on the Far Right */
          <>
            <Link
              to="/dashboard"
              onClick={handleNavClick}
              style={{
                textDecoration: "none",
                minWidth: 0,
              }}
            >
              <FinTwinLogo size={36} fontSize={17} badgeText="AI TWIN" />
            </Link>

            {/* Collapse Toggle Button (Far Right in Expanded Mode) */}
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse Sidebar"
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                color: "#52525b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                padding: 0,
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#121316";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.color = "#52525b";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <ChevronLeft size={15} />
            </button>
          </>
        )}
      </div>

      {/* =========================================================================
          2. ENTERPRISE SELECTOR CAPSULE (LIGHT FROSTED GLASS CARD)
          ========================================================================= */}
      {!collapsed ? (
        <div
          style={{
            margin: "12px 14px 6px",
            padding: "10px 12px",
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              flexShrink: 0,
            }}
          >
            {business?.name ? business.name[0].toUpperCase() : "E"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#121316",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {business?.name || "Enterprise Twin"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#0284c7",
                  background: "rgba(2, 132, 199, 0.12)",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                {user?.role || "CEO"}
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {user?.name?.split(" ")[0] || "Owner"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "8px 0", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            {business?.name ? business.name[0].toUpperCase() : "E"}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. SCROLLABLE NAVIGATION MENU (WHITE FROSTED GLASS PILLS & SQUIRCLES)
          ========================================================================= */}
      <div
        className="sidebar-nav"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "8px 8px" : "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {/* Semantic Group Header */}
            {!collapsed && (
              <div
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.9px",
                  padding: "0 10px 4px",
                  textTransform: "uppercase",
                }}
              >
                {group.groupTitle}
              </div>
            )}

            {/* Navigation Items */}
            {group.items.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              let badgeStyle = {
                background: "rgba(16, 185, 129, 0.12)",
                color: "#059669",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              };
              if (item.badgeType === "treds") {
                badgeStyle = {
                  background: "rgba(2, 132, 199, 0.12)",
                  color: "#0284c7",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                };
              } else if (item.badgeType === "tax") {
                badgeStyle = {
                  background: "rgba(124, 58, 237, 0.12)",
                  color: "#7c3aed",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                };
              } else if (item.badgeType === "payroll") {
                badgeStyle = {
                  background: "rgba(217, 119, 6, 0.12)",
                  color: "#d97706",
                  border: "1px solid rgba(217, 119, 6, 0.25)",
                };
              }

              return (
                <div
                  key={item.key}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "space-between",
                      padding: collapsed ? "8px 0" : "7px 10px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      position: "relative",
                      background: active
                        ? "#ffffff"
                        : hoveredItem === item.key
                        ? "rgba(255, 255, 255, 0.65)"
                        : "transparent",
                      color: active ? "#121316" : "#475569",
                      fontWeight: active ? 700 : 500,
                      fontSize: "12.5px",
                      boxShadow: active
                        ? "0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                        : "none",
                      border: active
                        ? "1px solid rgba(0, 0, 0, 0.06)"
                        : "1px solid transparent",
                      transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Left Active Accent Pill Indicator */}
                    {active && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "8px",
                          bottom: "8px",
                          width: "3.5px",
                          borderRadius: "0 4px 4px 0",
                          background: "#059669",
                          boxShadow: "0 0 8px rgba(5, 150, 105, 0.4)",
                        }}
                      />
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Tactile Icon Squircle Container */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "9px",
                          background: active
                            ? "rgba(5, 150, 105, 0.1)"
                            : "rgba(0, 0, 0, 0.03)",
                          border: active
                            ? "1px solid rgba(5, 150, 105, 0.2)"
                            : "1px solid rgba(0, 0, 0, 0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Icon
                          size={16}
                          color={active ? "#059669" : item.iconColor || "#64748b"}
                        />
                      </div>

                      {!collapsed && <span style={{ color: active ? "#121316" : "#475569" }}>{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "5px",
                          textTransform: "uppercase",
                          ...badgeStyle,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Collapsed Mode Floating Hover Tooltip (Robin Holesinsky style) */}
                  {collapsed && hoveredItem === item.key && (
                    <div
                      style={{
                        position: "absolute",
                        left: "calc(100% + 14px)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1000,
                        background: "#121316",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        padding: "7px 12px",
                        borderRadius: "9px",
                        fontSize: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        pointerEvents: "none",
                      }}
                    >
                      <span>{item.name}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "#ffffff",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* =========================================================================
          4. BOTTOM RUNWAY & CONTROLS (EXPAND/COLLAPSE TOGGLE FOR COMPACT MODE)
          ========================================================================= */}
      <div
        style={{
          padding: collapsed ? "12px 0" : "12px 14px",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          background: "rgba(255, 255, 255, 0.5)",
          flexShrink: 0,
        }}
      >
        {!collapsed ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Runway Health Indicator */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: runway > 30 ? "#10b981" : "#f59e0b",
                    boxShadow: `0 0 8px ${runway > 30 ? "#10b981" : "#f59e0b"}`,
                  }}
                />
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  Safe Runway
                </span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#121316" }}>
                {runway > 0 ? `${runway} Days` : "Stable"}
              </span>
            </div>

            {/* Logout Action */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", color: "#64748b" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                <span>Twin Active</span>
              </div>

              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  border: "none",
                  background: "transparent",
                  color: "#ef4444",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode: Expand Toggle Button Cleanly Centered at Bottom */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "#52525b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#f4f6f8";
                e.currentTarget.style.color = "#121316";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#52525b";
              }}
            >
              <PanelLeftOpen size={17} />
            </button>

            <button
              onClick={logout}
              title="Logout"
              style={{
                border: "none",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
