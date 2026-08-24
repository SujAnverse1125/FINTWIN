import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Zap,
  Users,
  FlaskConical,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Upload,
  Plus,
  Building,
  Save,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getFinancialData,
  getBusiness,
  getInvoices,
  getCustomers,
  updateBusinessProfile,
  subscribeFinancialData,
} from "../data/financialStore";
import {
  getCashFlowSummary,
  calculateAgingBreakdown,
  generateLocalForecast,
} from "../engines/digitalTwin";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState(getFinancialData());
  const [summary, setSummary] = useState(getCashFlowSummary());
  const [aging, setAging] = useState(calculateAgingBreakdown());
  const [forecast, setForecast] = useState(generateLocalForecast(30));

  // Quick Onboarding Inputs
  const [quickCash, setQuickCash] = useState("");
  const [quickReserve, setQuickReserve] = useState("");
  const [setupSaved, setSetupSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setData(getFinancialData());
      setSummary(getCashFlowSummary());
      setAging(calculateAgingBreakdown());
      setForecast(generateLocalForecast(30));
    });
    return unsub;
  }, []);

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  const pendingInvoices = data.invoices.filter((i) => i.status !== "Paid");
  const isEmptyState = data.invoices.length === 0 && summary.currentCash === 0 && data.expenses.length === 0;

  const handleQuickSetupSave = (e) => {
    e.preventDefault();
    if (!quickCash && !quickReserve) return;
    updateBusinessProfile({
      openingCash: Number(quickCash) || data.business.openingCash || 0,
      minCashReserve: Number(quickReserve) || data.business.minCashReserve || 0,
    });
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 3000);
  };

  // Chart data for Aging Breakdown
  const agingData = [
    { name: "0-30 Days", value: aging["0-30 Days"] || 0 },
    { name: "31-60 Days", value: aging["31-60 Days"] || 0 },
    { name: "61-90 Days", value: aging["61-90 Days"] || 0 },
    { name: "90+ Days", value: aging["90+ Days"] || 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* =================================================================
          INITIAL DATA SETUP WIZARD (FIRST TIME AFTER LOGIN)
          ================================================================= */}
      {isEmptyState && (
        <div
          className="glass-card"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)",
            border: "1px solid rgba(59,130,246,0.35)",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div className="card-icon-wrap emerald" style={{ width: 32, height: 32 }}>
                  <Sparkles size={16} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  Welcome {user?.name || "Partner"} — Initialize Your Digital Twin
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13.5, maxWidth: 640, lineHeight: 1.6 }}>
                FinTwin starts with a clean slate ready for your business data. Enter your current liquid cash balance below and upload your invoices to calculate your real cash runway, delay predictions, and working capital.
              </p>

              {/* Inline Quick Cash Setup */}
              <form
                onSubmit={handleQuickSetupSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 18,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>
                    Opening Liquid Cash (₹ INR)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 500000"
                    style={{ width: 180, height: 38 }}
                    value={quickCash}
                    onChange={(e) => setQuickCash(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>
                    Min. Safety Reserve (₹ INR)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 200000"
                    style={{ width: 180, height: 38 }}
                    value={quickReserve}
                    onChange={(e) => setQuickReserve(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-emerald"
                  style={{ alignSelf: "flex-end", height: 38 }}
                >
                  <Save size={14} />
                  <span>Set Balance</span>
                </button>
              </form>

              {setupSaved && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={13} />
                  <span>Opening balance saved to your account!</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 220 }}>
              <button
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "12px 20px" }}
                onClick={() => navigate("/invoices")}
              >
                <Upload size={16} />
                <span>Upload Invoices (CSV / Excel / PDF)</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
                onClick={() => navigate("/expenses")}
              >
                <CreditCard size={15} />
                <span>Log Monthly Expenses</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          TOP KPI ROW
          ================================================================= */}
      <div className="grid-4">
        {/* Current Cash */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("liquidCash", "Liquid Cash Reserve")}</span>
            <div className="card-icon-wrap emerald">
              <Wallet size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#34d399" }}>
              {formatLakhs(summary.currentCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <ArrowUpRight size={14} />
            <span>{summary.runwayDays} {t("daysBuffer", "Days Buffer")}</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
              Target: ₹{(Number(data.business.minCashReserve || 0) / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* Total Receivables */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("receivables", "Outstanding Receivables")}</span>
            <div className="card-icon-wrap">
              <FileText size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#60a5fa" }}>
              {formatLakhs(summary.receivables)}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <Clock size={14} />
            <span>{pendingInvoices.length} {t("Pending Invoices")}</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
              DSO: {summary.dso} {t("days", "Days")}
            </span>
          </div>
        </div>

        {/* Monthly Burn */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("burnRate", "Monthly Burn Velocity")}</span>
            <div className="card-icon-wrap amber">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#fbbf24" }}>
              {formatLakhs(summary.totalExpenses)}
            </span>
          </div>
          <div className="kpi-trend negative">
            <ArrowDownRight size={14} />
            <span>{formatLakhs(summary.recurringExpenses)} Fixed</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
              +{formatLakhs(summary.oneTimeExpenses)} Var
            </span>
          </div>
        </div>

        {/* 30-Day Net Liquidity */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("netRunway", "30-Day Net Runway")}</span>
            <div className="card-icon-wrap purple">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{
                color: summary.projectedCash >= 0 ? "#c4b5fd" : "#fb7185",
              }}
            >
              {formatLakhs(summary.projectedCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <Zap size={14} />
            <span>{t("Working Cap")}: {summary.workingCapitalRatio}x</span>
            <span
              style={{
                marginLeft: "auto",
                color: summary.status === "Healthy" ? "#34d399" : summary.status === "Moderate" ? "#fbbf24" : "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              {t(summary.status, summary.status)}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================
          PRIMARY CHARTS & DIGITAL TWIN TELEMETRY
          ================================================================= */}
      <div className="grid-12">
        {/* Cash Flow Forecast Trajectory */}
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap">
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="card-title">30-Day AI Cash Velocity Trajectory</div>
                <div className="card-subtitle">
                  Monte Carlo simulation of expected collections vs operating burn
                </div>
              </div>
            </div>
            <Link to="/forecast" className="btn btn-secondary btn-sm">
              <span>90-Day Radar</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ height: 260, width: "100%", marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.timeline}>
                <defs>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(13, 18, 31, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`₹${(Number(val) / 100000).toFixed(2)}L`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExpected)"
                  name="Expected Cash"
                />
                <Area
                  type="monotone"
                  dataKey="worstCase"
                  stroke="#f43f5e"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorWorst)"
                  name="Worst-Case Stress"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Aging Breakdown */}
        <div className="col-span-4 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap amber">
                <Clock size={18} />
              </div>
              <div>
                <div className="card-title">Receivables Aging</div>
                <div className="card-subtitle">Breakdown by maturity bracket</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            {agingData.map((item, idx) => {
              const total = aging.total || 1;
              const pct = aging.total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: "#fff" }}>
                      {formatLakhs(item.value)} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: COLORS[idx % COLORS.length],
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", marginTop: 24, justifyContent: "center" }}
            onClick={() => navigate("/invoices")}
          >
            <span>Manage Collections</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* =================================================================
          BOTTOM SECTION: INVOICES & QUICK ACTIONS
          ================================================================= */}
      <div className="grid-12">
        {/* Active Invoices with Delay Prediction */}
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <FileText size={18} />
              </div>
              <div>
                <div className="card-title">Active Invoices & AI Delay Predictions</div>
                <div className="card-subtitle">Real-time payment probability scores</div>
              </div>
            </div>
            <Link to="/invoices" className="btn btn-secondary btn-sm">
              View All ({data.invoices.length})
            </Link>
          </div>

          {data.invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px" }}>
              <FileText size={32} style={{ color: "var(--text-dim)", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>No Invoices Yet</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, marginBottom: 16 }}>
                Upload your first invoice file (CSV, Excel, PDF, or JSON) to activate AI delay predictions.
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/invoices")}>
                <Upload size={14} />
                <span>Import Invoices</span>
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>AI Predicted Delay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, color: "#fff", fontFamily: "var(--font-mono)" }}>
                        {inv.id}
                      </td>
                      <td>{inv.customer}</td>
                      <td style={{ fontWeight: 700, color: "#60a5fa" }}>
                        {formatLakhs(inv.amount)}
                      </td>
                      <td>{inv.dueDate}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              inv.predictedDelayDays > 15
                                ? "#fb7185"
                                : inv.predictedDelayDays > 5
                                ? "#fbbf24"
                                : "#34d399",
                          }}
                        >
                          +{inv.predictedDelayDays || 3} Days Delay
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            inv.status === "Paid"
                              ? "paid"
                              : inv.status === "Overdue"
                              ? "overdue"
                              : "pending"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stress Test Launchers */}
        <div className="col-span-4 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap purple">
                <FlaskConical size={18} />
              </div>
              <div>
                <div className="card-title">Instant Actions</div>
                <div className="card-subtitle">Tools to simulate and manage cash</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="glass-card interactive"
              style={{ padding: 14 }}
              onClick={() => navigate("/simulator")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>
                  🧪 What-If Shock Simulator
                </div>
                <ArrowRight size={14} style={{ color: "#60a5fa" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                Stress test revenue drops and client payment stalls.
              </div>
            </div>

            <div
              className="glass-card interactive"
              style={{ padding: 14 }}
              onClick={() => navigate("/financing")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>
                  🏦 Invoice Discounting
                </div>
                <ArrowRight size={14} style={{ color: "#34d399" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                Unlock working capital from your uploaded invoices.
              </div>
            </div>

            <div
              className="glass-card interactive"
              style={{ padding: 14 }}
              onClick={() => navigate("/reports")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>
                  📑 P&L & Cash Statements
                </div>
                <ArrowRight size={14} style={{ color: "#a78bfa" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                Export monthly financial statements and aging CSVs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}