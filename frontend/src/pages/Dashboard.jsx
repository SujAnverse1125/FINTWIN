import React, { useState, useEffect, useCallback } from "react";
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
  ReferenceLine,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  getFinancialData,
  getBusiness,
  getInvoices,
  getCustomers,
  updateBusinessProfile,
  subscribeFinancialData,
  loadDemoPreset,
} from "../data/financialStore";
import {
  getCashFlowSummary,
  calculateAgingBreakdown,
  generateLocalForecast,
} from "../engines/digitalTwin";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// ==========================================
// PARCHMENT PALETTE (Matching Landing Page)
// ==========================================
const PALETTE = {
  juniper: "#1C6758",      // Primary accent (cash, positive)
  juniperLight: "rgba(28, 103, 88, 0.12)",
  dustyBlue: "#7A9CAE",    // Receivables
  dustyBlueLight: "rgba(122, 156, 174, 0.12)",
  burntOchre: "#C78150",   // Burn / expenses
  burntOchreLight: "rgba(199, 129, 80, 0.12)",
  slateTeal: "#425F6B",    // Runway / net
  slateTealLight: "rgba(66, 95, 107, 0.12)",
  desertRose: "#C07F7F",   // Negative / risk
  desertRoseLight: "rgba(192, 127, 127, 0.12)",
  walnut: "#2D2620",       // Upper bound line
  sage: "#8BA896",         // Sage green accent
  sageFill: "rgba(139, 168, 150, 0.18)",
  amber: "#D4A843",        // GST markers
  parchment: "#F5F2EE",    // Card bg
  ivory: "#EBE6DF",        // Page bg
};

const AGING_COLORS = [PALETTE.juniper, PALETTE.dustyBlue, PALETTE.burntOchre, PALETTE.desertRose];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState(getFinancialData());
  const [summary, setSummary] = useState(getCashFlowSummary());
  const [aging, setAging] = useState(calculateAgingBreakdown());
  const [forecast, setForecast] = useState(generateLocalForecast(90));

  // Quick Onboarding Inputs
  const [quickCash, setQuickCash] = useState("");
  const [quickReserve, setQuickReserve] = useState("");
  const [setupSaved, setSetupSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setData(getFinancialData());
      setSummary(getCashFlowSummary());
      setAging(calculateAgingBreakdown());
      setForecast(generateLocalForecast(90));
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

  // Chart data - sample every 5th point for performance while keeping daily granularity in the engine
  const chartData = forecast.timeline.filter((_, i) => i % 3 === 0 || i === forecast.timeline.length - 1);

  // Chart data for Aging Breakdown
  const agingData = [
    { name: "0-30 Days", value: aging["0-30 Days"] || 0 },
    { name: "31-60 Days", value: aging["31-60 Days"] || 0 },
    { name: "61-90 Days", value: aging["61-90 Days"] || 0 },
    { name: "90+ Days", value: aging["90+ Days"] || 0 },
  ];

  // Custom chart tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        style={{
          background: "rgba(245, 242, 238, 0.97)",
          border: `1px solid ${PALETTE.juniper}30`,
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 12,
          fontWeight: 600,
          color: PALETTE.walnut,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</div>
        {payload.map((entry, idx) => (
          entry.value != null && (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
              <span style={{ color: "#736955" }}>{entry.name}:</span>
              <span style={{ fontWeight: 800 }}>₹{(Number(entry.value) / 100000).toFixed(2)}L</span>
            </div>
          )
        ))}
      </div>
    );
  };

  // Custom legend
  const renderLegend = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center", marginTop: 8, fontSize: 11, fontWeight: 600, color: "#736955", flexWrap: "wrap" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 24, height: 10, background: PALETTE.sageFill, border: `1px solid ${PALETTE.sage}`, borderRadius: 2, display: "inline-block" }} />
        Projected Cash
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 18, height: 2, background: PALETTE.walnut, display: "inline-block" }} />
        Upper Bound
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 18, height: 0, borderBottom: `2px dashed ${PALETTE.desertRose}`, display: "inline-block" }} />
        Lower Bound
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 18, height: 0, borderBottom: `2px dashed ${PALETTE.slateTeal}`, display: "inline-block" }} />
        Future projection
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* =================================================================
          INITIAL DATA SETUP WIZARD (FIRST TIME AFTER LOGIN)
          ================================================================= */}
      {isEmptyState && (
        <div
          className="glass-card"
          style={{
            background: `linear-gradient(135deg, ${PALETTE.juniperLight} 0%, ${PALETTE.dustyBlueLight} 100%)`,
            border: `1px solid ${PALETTE.juniper}40`,
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div className="card-icon-wrap emerald" style={{ width: 32, height: 32 }}>
                  <Sparkles size={16} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
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
                <div style={{ marginTop: 8, fontSize: 12, color: PALETTE.juniper, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={13} />
                  <span>Opening balance saved to your account!</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 220 }}>
              <button
                className="btn btn-emerald"
                style={{ justifyContent: "center", padding: "12px 20px" }}
                onClick={() => loadDemoPreset("BUS-001")}
              >
                <Sparkles size={16} />
                <span>Load Demo MSME Data</span>
              </button>
              <button
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "10px 18px" }}
                onClick={() => navigate("/invoices")}
              >
                <Upload size={15} />
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
          TOP KPI ROW (Parchment Palette)
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
            <span className="kpi-value" style={{ color: PALETTE.juniper }}>
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
            <div className="card-icon-wrap" style={{ background: PALETTE.dustyBlueLight, color: PALETTE.dustyBlue }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: PALETTE.dustyBlue }}>
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
            <div className="card-icon-wrap" style={{ background: PALETTE.burntOchreLight, color: PALETTE.burntOchre }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: PALETTE.burntOchre }}>
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
            <div className="card-icon-wrap" style={{ background: PALETTE.slateTealLight, color: PALETTE.slateTeal }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{
                color: summary.projectedCash >= 0 ? PALETTE.slateTeal : PALETTE.desertRose,
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
                color: summary.status === "Healthy" ? PALETTE.juniper : summary.status === "Moderate" ? PALETTE.burntOchre : "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              {t(summary.status, summary.status)}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================
          MONTE CARLO CONFIDENCE BAND CHART & AGING
          ================================================================= */}
      <div className="grid-12">
        {/* Cash Flow Forecast Trajectory */}
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap" style={{ background: PALETTE.juniperLight, color: PALETTE.juniper }}>
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

          <div style={{ height: 300, width: "100%", marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Confidence band fill (sage green translucent) */}
                  <linearGradient id="monteCarloFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.sage} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={PALETTE.sage} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 38, 32, 0.06)" vertical={false} />

                <XAxis
                  dataKey="day"
                  stroke="#998F7C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(45, 38, 32, 0.1)" }}
                  interval={9}
                />
                <YAxis
                  stroke="#998F7C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(45, 38, 32, 0.1)" }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* GST Risk marker (Day 15) */}
                <ReferenceLine
                  x={`Day ${forecast.gstRiskDay}`}
                  stroke={PALETTE.amber}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "△ GST risk",
                    position: "top",
                    fill: PALETTE.desertRose,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                />

                {/* GST Due marker (Day 45) */}
                <ReferenceLine
                  x={`Day ${forecast.gstDueDay}`}
                  stroke={PALETTE.amber}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "🏛 GST due",
                    position: "top",
                    fill: PALETTE.burntOchre,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                />

                {/* Uncertainty marker (Day 75) */}
                <ReferenceLine
                  x={`Day ${forecast.uncertaintyDay}`}
                  stroke={PALETTE.amber}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "◆ Uncertainty",
                    position: "top",
                    fill: PALETTE.amber,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                />

                {/* Confidence band: filled area between upper and lower bounds */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fillOpacity={1}
                  fill="url(#monteCarloFill)"
                  name="Upper Bound"
                  stackId="band"
                  isAnimationActive={false}
                />

                {/* Upper Bound line (solid dark walnut) */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke={PALETTE.walnut}
                  strokeWidth={1.5}
                  fillOpacity={0}
                  fill="transparent"
                  name="Upper Bound"
                  dot={false}
                />

                {/* Main Projected Cash line */}
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke={PALETTE.juniper}
                  strokeWidth={2.5}
                  fillOpacity={0}
                  fill="transparent"
                  name="Projected Cash"
                  dot={false}
                />

                {/* Lower Bound (dashed red) */}
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke={PALETTE.desertRose}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fillOpacity={0}
                  fill="transparent"
                  name="Lower Bound"
                  dot={false}
                />

                {/* Future Projection (dashed olive beyond Day 75) */}
                <Area
                  type="monotone"
                  dataKey="futureProjection"
                  stroke={PALETTE.slateTeal}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fillOpacity={0}
                  fill="transparent"
                  name="Future Projection"
                  dot={false}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          {renderLegend()}
        </div>

        {/* Receivables Aging Breakdown */}
        <div className="col-span-4 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap" style={{ background: PALETTE.burntOchreLight, color: PALETTE.burntOchre }}>
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
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatLakhs(item.value)} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(0,0,0,0.04)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: AGING_COLORS[idx % AGING_COLORS.length],
                        borderRadius: 3,
                        transition: "width 0.4s ease",
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
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>No Invoices Yet</div>
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
                      <td style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {inv.id}
                      </td>
                      <td>{inv.customer}</td>
                      <td style={{ fontWeight: 700, color: PALETTE.juniper }}>
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
                                ? PALETTE.desertRose
                                : inv.predictedDelayDays > 5
                                ? PALETTE.burntOchre
                                : PALETTE.juniper,
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
              <div className="card-icon-wrap" style={{ background: PALETTE.slateTealLight, color: PALETTE.slateTeal }}>
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
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                  🧪 What-If Shock Simulator
                </div>
                <ArrowRight size={14} style={{ color: PALETTE.dustyBlue }} />
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
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                  🏦 Invoice Discounting
                </div>
                <ArrowRight size={14} style={{ color: PALETTE.juniper }} />
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
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                  📑 P&L & Cash Statements
                </div>
                <ArrowRight size={14} style={{ color: PALETTE.slateTeal }} />
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