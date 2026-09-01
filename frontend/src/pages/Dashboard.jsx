import React, { useState, useEffect, useMemo } from "react";
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
  Activity,
  Calendar,
  Landmark,
  FileSpreadsheet,
  ChevronRight,
  Info,
  DollarSign,
  Layers,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
import UniversalUploadModal from "../components/UniversalUploadModal";

// ==========================================
// MODERN EXECUTIVE FINTECH PALETTE
// ==========================================
const PALETTE = {
  emerald: "#059669",
  emeraldVibrant: "#10B981",
  emeraldLight: "rgba(16, 185, 129, 0.12)",
  indigo: "#4F46E5",
  indigoVibrant: "#6366F1",
  indigoLight: "rgba(99, 102, 241, 0.12)",
  blue: "#0284C7",
  blueLight: "rgba(2, 132, 199, 0.12)",
  amber: "#D97706",
  amberVibrant: "#F59E0B",
  amberLight: "rgba(245, 158, 11, 0.12)",
  rose: "#E11D48",
  roseVibrant: "#F43F5E",
  roseLight: "rgba(244, 63, 94, 0.12)",
  slate: "#334155",
  slateLight: "rgba(51, 65, 85, 0.08)",
  dark: "#0F172A",
  muted: "#64748B",
  dim: "#94A3B8",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState(getFinancialData());
  const [summary, setSummary] = useState(getCashFlowSummary());
  const [aging, setAging] = useState(calculateAgingBreakdown());
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [forecast, setForecast] = useState(generateLocalForecast(90));

  // Quick Onboarding & Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [quickCash, setQuickCash] = useState("");
  const [quickReserve, setQuickReserve] = useState("");
  const [setupSaved, setSetupSaved] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // all, risk, due-soon, paid

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
  const isEmptyState =
    data.invoices.length === 0 &&
    summary.currentCash === 0 &&
    data.expenses.length === 0;

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

  // Filter chart timeline points based on selected period (30, 60, 90)
  const chartData = useMemo(() => {
    const rawTimeline = forecast.timeline.slice(0, forecastPeriod + 1);
    const step = forecastPeriod > 60 ? 3 : forecastPeriod > 30 ? 2 : 1;
    return rawTimeline.filter(
      (_, i) => i % step === 0 || i === rawTimeline.length - 1
    );
  }, [forecast, forecastPeriod]);

  // Aging matrix calculations
  const agingData = useMemo(
    () => [
      {
        name: "0–30 Days",
        desc: "Current / On Track",
        value: aging["0-30 Days"] || 0,
        risk: "Low Risk",
        color: PALETTE.emeraldVibrant,
      },
      {
        name: "31–60 Days",
        desc: "Mild Overdue",
        value: aging["31-60 Days"] || 0,
        risk: "Moderate",
        color: PALETTE.blue,
      },
      {
        name: "61–90 Days",
        desc: "Elevated Risk",
        value: aging["61-90 Days"] || 0,
        risk: "Warning",
        color: PALETTE.amberVibrant,
      },
      {
        name: "90+ Days",
        desc: "Severe Delinquent",
        value: aging["90+ Days"] || 0,
        risk: "Critical",
        color: PALETTE.roseVibrant,
      },
    ],
    [aging]
  );

  // Invoices filtered by active tab
  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === "risk") {
      return data.invoices.filter(
        (i) =>
          (i.predictedDelayDays > 10 || i.riskScore === "High") &&
          i.status !== "Paid"
      );
    }
    if (invoiceFilter === "due-soon") {
      return data.invoices.filter((i) => i.status !== "Paid");
    }
    if (invoiceFilter === "paid") {
      return data.invoices.filter((i) => i.status === "Paid");
    }
    return data.invoices;
  }, [data.invoices, invoiceFilter]);

  // Custom Chart Tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          border: "1px solid rgba(203, 213, 225, 0.9)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 12.5,
          color: "#0F172A",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
          backdropFilter: "blur(12px)",
          minWidth: 180,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            marginBottom: 8,
            fontSize: 13,
            color: "#0F172A",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
            paddingBottom: 4,
          }}
        >
          {label}
        </div>
        {payload.map((entry, idx) =>
          entry.value != null && (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: entry.color,
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "#64748B", fontWeight: 600 }}>
                  {entry.name}:
                </span>
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: "#0F172A",
                }}
              >
                ₹{(Number(entry.value) / 100000).toFixed(2)}L
              </span>
            </div>
          )
        )}
      </div>
    );
  };

  // Runway buffer percentage (capped between 0% and 100% for progress gauge)
  const runwayPercent = Math.min(
    100,
    Math.max(10, Math.round(((summary.runwayDays || 0) / 90) * 100))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* =================================================================
          1. EXECUTIVE BRAND HEADER & DIGITAL TWIN STATUS
          ================================================================= */}
      <div className="executive-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            className="card-icon-wrap emerald"
            style={{ width: 44, height: 44, borderRadius: "var(--radius-md)" }}
          >
            <Activity size={22} className="anim-pulse" />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.4px",
                }}
              >
                {data.business.name || "FinTwin"} Executive Dashboard
              </h1>
              <span className="live-twin-badge">
                <span className="live-twin-dot" />
                <span>AI Twin Active • Real-Time Sync</span>
              </span>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              Real-time liquidity telemetry, AI delay predictions & autonomous cash runway
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadDemoPreset("BUS-001")}
            title="Populate with high-fidelity MSME sample data"
          >
            <Sparkles size={14} style={{ color: PALETTE.emeraldVibrant }} />
            <span>Load Demo MSME Data</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload size={14} />
            <span>Import Invoices</span>
          </button>
        </div>
      </div>

      {/* =================================================================
          2. FIRST TIME SETUP WIZARD (WHEN DATABASE IS FRESH/EMPTY)
          ================================================================= */}
      {isEmptyState && (
        <div
          className="glass-card"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,253,244,0.95) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            padding: "24px 28px",
            boxShadow: "0 10px 30px -5px rgba(16, 185, 129, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div className="card-icon-wrap emerald" style={{ width: 34, height: 34 }}>
                  <Sparkles size={17} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                  Welcome {user?.name || "Partner"} — Calibrate Your Digital Twin
                </h2>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  maxWidth: 620,
                  lineHeight: 1.6,
                }}
              >
                FinTwin starts with a clean slate. Input your current bank liquid cash and minimum safety threshold below to immediately project your daily cash runway, GST obligations, and AI delay radars.
              </p>

              <form
                onSubmit={handleQuickSetupSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 16,
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
                    style={{ width: 170, height: 36 }}
                    value={quickCash}
                    onChange={(e) => setQuickCash(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>
                    Safety Reserve (₹ INR)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 200000"
                    style={{ width: 170, height: 36 }}
                    value={quickReserve}
                    onChange={(e) => setQuickReserve(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-emerald"
                  style={{ alignSelf: "flex-end", height: 36 }}
                >
                  <Save size={14} />
                  <span>Set Balance</span>
                </button>
              </form>

              {setupSaved && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: PALETTE.emerald,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Opening parameters successfully calibrated!</span>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                minWidth: 210,
              }}
            >
              <button
                className="btn btn-emerald"
                style={{ justifyContent: "center", padding: "10px 18px" }}
                onClick={() => loadDemoPreset("BUS-001")}
              >
                <Sparkles size={15} />
                <span>Load Demo MSME Data</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload size={14} />
                <span>Upload Invoices (CSV / PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          3. HERO RUNWAY HEALTH & BUFFER PULSE BAR
          ================================================================= */}
      <div className="runway-health-banner">
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: PALETTE.emerald,
              }}
            >
              Autonomous Runway Gauge
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background:
                  summary.status === "Healthy"
                    ? "rgba(16, 185, 129, 0.14)"
                    : summary.status === "Moderate"
                    ? "rgba(245, 158, 11, 0.14)"
                    : "rgba(244, 63, 94, 0.14)",
                color:
                  summary.status === "Healthy"
                    ? PALETTE.emerald
                    : summary.status === "Moderate"
                    ? PALETTE.amber
                    : PALETTE.rose,
              }}
            >
              {summary.status === "Healthy"
                ? "● Solvency Safe"
                : summary.status === "Moderate"
                ? "▲ Monitor Inflows"
                : "⚠️ Critical Burn"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "var(--text-primary)",
              }}
            >
              {summary.runwayDays} Days
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
              of operational liquidity buffer remaining
            </span>
          </div>

          {/* Runway visual track */}
          <div className="runway-progress-track">
            <div
              className="runway-progress-fill"
              style={{ width: `${runwayPercent}%` }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            borderLeft: "1px solid rgba(226, 232, 240, 0.8)",
            paddingLeft: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Daily Burn Velocity
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: PALETTE.rose,
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              ₹{Math.round(summary.totalExpenses / 30).toLocaleString("en-IN")}/day
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Safety Threshold
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              ₹{(Number(data.business.minCashReserve || 0) / 100000).toFixed(1)}L
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/cash-flow")}
          >
            <span>Cash Flow Twin</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* =================================================================
          4. FOUR KEY EXECUTIVE KPI METRIC CARDS
          ================================================================= */}
      <div className="grid-4">
        {/* KPI 1: Liquid Cash Reserve */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("liquidCash", "Liquid Cash Reserve")}</span>
            <div className="card-icon-wrap emerald">
              <Wallet size={19} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{ color: PALETTE.emerald, fontFamily: "var(--font-mono)" }}
            >
              {formatLakhs(summary.currentCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <ArrowUpRight size={15} />
            <span>{summary.runwayDays} {t("daysBuffer", "Days Buffer")}</span>
            <span
              style={{
                color: "var(--text-muted)",
                marginLeft: "auto",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              Target: ₹{(Number(data.business.minCashReserve || 0) / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* KPI 2: Outstanding Receivables */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("receivables", "Outstanding Receivables")}</span>
            <div className="card-icon-wrap" style={{ background: PALETTE.blueLight, color: PALETTE.blue }}>
              <FileText size={19} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{ color: PALETTE.blue, fontFamily: "var(--font-mono)" }}
            >
              {formatLakhs(summary.receivables)}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <Clock size={14} />
            <span>{pendingInvoices.length} Pending Invoices</span>
            <span
              style={{
                color: "var(--text-muted)",
                marginLeft: "auto",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              DSO: {summary.dso} {t("days", "Days")}
            </span>
          </div>
        </div>

        {/* KPI 3: Monthly Burn Velocity */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("burnRate", "Monthly Burn Rate")}</span>
            <div className="card-icon-wrap" style={{ background: PALETTE.roseLight, color: PALETTE.rose }}>
              <CreditCard size={19} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{ color: PALETTE.rose, fontFamily: "var(--font-mono)" }}
            >
              {formatLakhs(summary.totalExpenses)}
            </span>
          </div>
          <div className="kpi-trend negative">
            <ArrowDownRight size={15} />
            <span>{formatLakhs(summary.recurringExpenses)} Fixed</span>
            <span
              style={{
                color: "var(--text-muted)",
                marginLeft: "auto",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              +{formatLakhs(summary.oneTimeExpenses)} Variable
            </span>
          </div>
        </div>

        {/* KPI 4: 30-Day Net Runway Position */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t("netRunway", "30-Day Projected Net")}</span>
            <div className="card-icon-wrap" style={{ background: PALETTE.indigoLight, color: PALETTE.indigo }}>
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{
                color: summary.projectedCash >= 0 ? PALETTE.indigo : PALETTE.rose,
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatLakhs(summary.projectedCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <Zap size={14} style={{ color: PALETTE.amberVibrant }} />
            <span>Working Cap: {summary.workingCapitalRatio}x</span>
            <span
              style={{
                marginLeft: "auto",
                color:
                  summary.status === "Healthy"
                    ? PALETTE.emerald
                    : summary.status === "Moderate"
                    ? PALETTE.amber
                    : PALETTE.rose,
                fontWeight: 800,
              }}
            >
              {summary.status}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================
          5. MONTE CARLO TRAJECTORY RADAR & RECEIVABLES AGING
          ================================================================= */}
      <div className="grid-12">
        {/* Left (8 Cols): Cash Flow Forecast Trajectory */}
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="card-title">AI Cash Velocity & Confidence Radar</div>
                <div className="card-subtitle">
                  Monte Carlo simulation of expected collections vs operating burn
                </div>
              </div>
            </div>

            {/* Timeframe selector pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  className={`timeline-pill ${forecastPeriod === days ? "active" : ""}`}
                  onClick={() => setForecastPeriod(days)}
                >
                  {days}D
                </button>
              ))}
              <Link to="/forecast" className="btn btn-secondary btn-sm" style={{ marginLeft: 6 }}>
                <span>Radar Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div style={{ height: 320, width: "100%", marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  {/* Confidence band gradient */}
                  <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.indigo} stopOpacity={0.16} />
                    <stop offset="95%" stopColor={PALETTE.indigo} stopOpacity={0.02} />
                  </linearGradient>

                  {/* Main expected cash fill */}
                  <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.emeraldVibrant} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={PALETTE.emeraldVibrant} stopOpacity={0.01} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.8)"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(226, 232, 240, 0.9)" }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(226, 232, 240, 0.9)" }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* GST Risk marker (Day 15) */}
                {forecastPeriod >= 15 && (
                  <ReferenceLine
                    x={`Day ${forecast.gstRiskDay || 15}`}
                    stroke={PALETTE.rose}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "⚠️ GST Risk",
                      position: "top",
                      fill: PALETTE.rose,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  />
                )}

                {/* GST Due marker (Day 45) */}
                {forecastPeriod >= 45 && (
                  <ReferenceLine
                    x={`Day ${forecast.gstDueDay || 45}`}
                    stroke={PALETTE.amber}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "🏛 GST Due",
                      position: "top",
                      fill: PALETTE.amber,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  />
                )}

                {/* Confidence band upper area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="url(#bandGradient)"
                  name="Upper Optimistic"
                  isAnimationActive={false}
                />

                {/* Upper Bound Line */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="transparent"
                  name="Upper Bound"
                  dot={false}
                />

                {/* Projected Expected Cash */}
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke={PALETTE.emerald}
                  strokeWidth={2.8}
                  fill="url(#cashFill)"
                  name="Projected Cash"
                  dot={false}
                />

                {/* Lower Bound (Stress Case) */}
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke={PALETTE.rose}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="transparent"
                  name="Stress Lower Bound"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              justifyContent: "center",
              marginTop: 12,
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--text-muted)",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 3,
                  background: PALETTE.emerald,
                  borderRadius: 2,
                }}
              />
              Expected Cash
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 0,
                  borderBottom: "2px dashed #94A3B8",
                }}
              />
              Upper Envelope
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 0,
                  borderBottom: `2px dashed ${PALETTE.rose}`,
                }}
              />
              Stress Lower Bound
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: "rgba(99, 102, 241, 0.16)",
                  border: `1px solid ${PALETTE.indigo}`,
                  borderRadius: 2,
                }}
              />
              90% Confidence Interval
            </span>
          </div>
        </div>

        {/* Right (4 Cols): Receivables Aging & Concentration Matrix */}
        <div className="col-span-4 glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-wrap amber">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="card-title">Receivables Aging Matrix</div>
                  <div className="card-subtitle">Collection maturity by age bracket</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
              {agingData.map((item, idx) => {
                const total = aging.total || 1;
                const pct = aging.total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    style={{
                      background: "rgba(248, 250, 252, 0.7)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12.5,
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                          • {item.desc}
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          color: item.color,
                        }}
                      >
                        {formatLakhs(item.value)}
                      </span>
                    </div>

                    <div
                      style={{
                        height: 6,
                        background: "rgba(226, 232, 240, 0.8)",
                        borderRadius: 3,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: item.color,
                          borderRadius: 3,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10.5,
                        color: "var(--text-dim)",
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      <span>Share: {pct}%</span>
                      <span style={{ color: item.color }}>{item.risk}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
            onClick={() => navigate("/invoices")}
          >
            <span>Manage Collections & Recovery</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* =================================================================
          6. BOTTOM SECTION: ACTIVE INVOICES & AI DELAY RADAR + COPILOT ACTIONS
          ================================================================= */}
      <div className="grid-12">
        {/* Left (8 Cols): Invoices Table with AI Delays */}
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <FileText size={18} />
              </div>
              <div>
                <div className="card-title">Active Invoices & AI Delay Predictions</div>
                <div className="card-subtitle">
                  Machine learning payment delinquency & probability radar
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[
                { id: "all", label: "All" },
                { id: "risk", label: "⚠️ High Delay" },
                { id: "due-soon", label: "Pending" },
                { id: "paid", label: "Paid" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`timeline-pill ${invoiceFilter === tab.id ? "active" : ""}`}
                  onClick={() => setInvoiceFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px" }}>
              <FileText
                size={34}
                style={{ color: "var(--text-dim)", margin: "0 auto 10px" }}
              />
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                No Matching Invoices Found
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                  marginBottom: 16,
                }}
              >
                Upload your invoices (CSV, Excel, PDF, JSON) to activate AI payment probability telemetry.
              </div>
              <button
                className="btn btn-emerald btn-sm"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload size={14} />
                <span>Import Invoices Now</span>
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
                  {filteredInvoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id}>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                        }}
                      >
                        {inv.id}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {inv.customer}
                      </td>
                      <td
                        style={{
                          fontWeight: 800,
                          color: PALETTE.emerald,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatLakhs(inv.amount)}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color:
                              inv.predictedDelayDays > 15
                                ? PALETTE.rose
                                : inv.predictedDelayDays > 5
                                ? PALETTE.amber
                                : PALETTE.emerald,
                          }}
                        >
                          {inv.predictedDelayDays > 15 ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--border-subtle)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <span>
              Showing top {Math.min(5, filteredInvoices.length)} of {data.invoices.length} invoices
            </span>
            <Link
              to="/invoices"
              style={{
                fontWeight: 700,
                color: PALETTE.indigo,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>View All Invoices</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right (4 Cols): AI Twin Smart Copilot Insights & Instant Actions */}
        <div className="col-span-4 glass-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="card-title-group">
              <div className="card-icon-wrap indigo">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="card-title">AI Twin Insights & Actions</div>
                <div className="card-subtitle">Instant working capital solutions</div>
              </div>
            </div>
          </div>

          {/* Smart Advisory Cards */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Zap size={14} style={{ color: PALETTE.indigoVibrant }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: PALETTE.indigo }}>
                AI Liquidity Opportunity
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              You have ₹{(summary.receivables / 100000).toFixed(1)}L in outstanding invoices. Discounting eligible invoices unlocks working capital at ~1.1% discount.
            </p>
          </div>

          {/* Action Launchers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              className="action-card-glow emerald"
              onClick={() => navigate("/simulator")}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                  🧪 What-If Shock Simulator
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Stress-test revenue drops and delayed client payments.
                </div>
              </div>
              <ArrowRight size={15} style={{ color: PALETTE.emerald }} />
            </div>

            <div
              className="action-card-glow"
              onClick={() => navigate("/financing")}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                  🏦 TReDS Invoice Discounting
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Fast liquidity access from verified GSTN invoices.
                </div>
              </div>
              <ArrowRight size={15} style={{ color: PALETTE.indigo }} />
            </div>

            <div
              className="action-card-glow amber"
              onClick={() => navigate("/reports")}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                  📑 P&L & Cash Statements
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Export monthly financial and aging audit schedules.
                </div>
              </div>
              <ArrowRight size={15} style={{ color: PALETTE.amber }} />
            </div>
          </div>
        </div>
      </div>
      {/* Universal Ingestion Modal Triggered from Dashboard */}
      <UniversalUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}