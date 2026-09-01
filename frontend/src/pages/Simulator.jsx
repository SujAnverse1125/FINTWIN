import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Brain,
  TrendingDown,
  TrendingUp,
  Clock,
  RotateCcw,
  BarChart3,
  LineChart,
  Layers,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

import ModulePage from "../components/ModulePage";
import { getFinancialData } from "../data/financialStore";
import { API_URL } from "../config";

function buildLocalSimulation(
  data,
  revenueChange,
  expenseChange,
  paymentDelay,
  collectionRate = 100,
  gstRate = 18,
  additionalRevenue = 0
) {
  const currentCash = Number(data.business?.openingCash || 0) + Number(additionalRevenue || 0);
  const rawReceivables = (data.invoices || [])
    .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  
  const collFactor = Math.max(0.1, Math.min(1.0, collectionRate / 100));
  const receivables = rawReceivables * collFactor;
  const recurring = (data.recurringExpenses || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const oneTime = (data.expenses || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalExpenses = recurring + oneTime;
  const gstFactor = 1.0 + (gstRate - 18) / 100;
  const netPosition = currentCash + receivables - totalExpenses;

  const base = {
    current_cash: currentCash,
    receivables,
    recurring_expenses: recurring,
    one_time_expenses: oneTime,
    total_expenses: totalExpenses,
    net_position: netPosition,
  };

  const adjRev = receivables * (1 + revenueChange / 100);
  const revImpact = adjRev - receivables;
  const revCash = currentCash + adjRev - totalExpenses;

  const adjExp = totalExpenses * (1 + expenseChange / 100) * gstFactor;
  const expImpact = totalExpenses - adjExp;
  const expCash = currentCash + receivables - adjExp;

  const delayPct = paymentDelay <= 0 ? 0 : paymentDelay <= 15 ? 25 : paymentDelay <= 30 ? 50 : paymentDelay <= 60 ? 75 : 100;
  const delayedAmt = (receivables * delayPct) / 100;
  const delayCash = currentCash + (receivables - delayedAmt) - totalExpenses;

  const combinedAdjRev = receivables * (1 + revenueChange / 100);
  const combinedDelayed = (combinedAdjRev * delayPct) / 100;
  const combinedAvailable = combinedAdjRev - combinedDelayed;
  const combinedCash = currentCash + combinedAvailable - adjExp;

  const classify = (cash, gap) => (gap > 0 || cash <= 0 ? "HIGH" : cash < 100000 ? "MEDIUM" : "LOW");

  return {
    base,
    assumptions: {
      revenue_change_percent: revenueChange,
      expense_change_percent: expenseChange,
      payment_delay_days: paymentDelay,
      collection_rate_percent: collectionRate,
      gst_rate_percent: gstRate,
      additional_revenue: additionalRevenue,
    },
    scenarios: [
      {
        scenario: "Base Case",
        projected_cash: netPosition,
        cash_impact: 0,
        liquidity_gap: Math.max(0, -netPosition),
        risk: classify(netPosition, Math.max(0, -netPosition)),
        explanation: "Current financial position without applying any additional shock.",
      },
      {
        scenario: "Revenue Shock",
        revenue_change_percent: revenueChange,
        adjusted_receivables: adjRev,
        projected_cash: revCash,
        cash_impact: revImpact,
        liquidity_gap: Math.max(0, -revCash),
        risk: classify(revCash, Math.max(0, -revCash)),
        explanation: revCash <= 0 ? "Revenue shock leads to a potential liquidity deficit." : "Revenue shock absorbed with remaining buffer.",
      },
      {
        scenario: "Expense Shock",
        expense_change_percent: expenseChange,
        adjusted_expenses: adjExp,
        projected_cash: expCash,
        cash_impact: expImpact,
        liquidity_gap: Math.max(0, -expCash),
        risk: classify(expCash, Math.max(0, -expCash)),
        explanation: expCash <= 0 ? "Expense shock exhausts current cash and receivables." : "Expense shock manageable under current reserves.",
      },
      {
        scenario: "Payment Delay",
        delay_days: paymentDelay,
        delayed_percentage: delayPct,
        delayed_amount: delayedAmt,
        projected_cash: delayCash,
        cash_impact: -delayedAmt,
        liquidity_gap: Math.max(0, -delayCash),
        risk: classify(delayCash, Math.max(0, -delayCash)),
        explanation: delayCash <= 0 ? `Payment delay of ${paymentDelay} days creates a cash gap.` : `Payment delay of ${paymentDelay} days does not exhaust reserves.`,
      },
      {
        scenario: "Combined Shock",
        revenue_change_percent: revenueChange,
        expense_change_percent: expenseChange,
        payment_delay_days: paymentDelay,
        projected_cash: combinedCash,
        cash_impact: combinedCash - netPosition,
        liquidity_gap: Math.max(0, -combinedCash),
        risk: classify(combinedCash, Math.max(0, -combinedCash)),
        explanation: combinedCash <= 0 ? "Combined shock severely threatens solvency. Consider early invoice discounting." : "Combined shock sustained with remaining working capital.",
      },
    ],
  };
}

function Simulator() {
  const [revenueChange, setRevenueChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [paymentDelay, setPaymentDelay] = useState(0);
  const [collectionRate, setCollectionRate] = useState(100);
  const [gstRate, setGstRate] = useState(18);
  const [additionalRevenue, setAdditionalRevenue] = useState(0);
  const [activePreset, setActivePreset] = useState("custom");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedToast, setAppliedToast] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState("trajectory"); // "trajectory" | "bar" | "cards" | "aiRisk"
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Scenario presets
  const presets = {
    base: { label: "Base Case", revenue: 0, expense: 0, delay: 0, collection: 100, gst: 18, additional: 0 },
    optimistic: { label: "Optimistic", revenue: 15, expense: -5, delay: 0, collection: 95, gst: 18, additional: 500000 },
    stress: { label: "Stress Test", revenue: -30, expense: 25, delay: 45, collection: 60, gst: 21, additional: 0 },
    custom: { label: "Custom" },
  };

  function applyPreset(key) {
    setActivePreset(key);
    if (key !== "custom") {
      const p = presets[key];
      setRevenueChange(p.revenue);
      setExpenseChange(p.expense);
      setPaymentDelay(p.delay);
      setCollectionRate(p.collection);
      setGstRate(p.gst);
      setAdditionalRevenue(p.additional || 0);
    }
  }

  // ==========================================
  // FORMAT MONEY
  // ==========================================
  function formatMoney(amount) {
    const value = Number(amount || 0);
    const absolute = Math.abs(value);

    if (absolute >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (absolute >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    if (absolute >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toFixed(0)}`;
  }

  // ==========================================
  // RISK CLASS
  // ==========================================
  function getRiskClass(risk) {
    const value = String(risk || "LOW").toUpperCase();
    if (value === "HIGH") return "risk-high";
    if (value === "MEDIUM") return "risk-medium";
    return "risk-low";
  }

  // ==========================================
  // RUN SIMULATION
  // ==========================================
  async function fetchAiSuggestions(data) {
    try {
      setAiLoading(true);
      const aiResponse = await fetch(`${API_URL}/api/simulator/ai-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_cash: Number(data.business?.openingCash || 0),
          invoices: data.invoices || [],
          recurring_expenses: data.recurringExpenses || [],
          one_time_expenses: data.expenses || [],
          revenue_change_percent: Number(revenueChange || 0),
          expense_change_percent: Number(expenseChange || 0),
          payment_delay_days: Number(paymentDelay || 0),
          collection_rate_percent: Number(collectionRate || 100),
          gst_rate_percent: Number(gstRate || 18),
          additional_revenue: Number(additionalRevenue || 0),
        }),
      });
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        if (aiResult.success && aiResult.ai_insights) {
          setAiInsights(aiResult.ai_insights);
        }
      }
    } catch (aiErr) {
      console.warn("AI suggestions unavailable:", aiErr);
    } finally {
      setAiLoading(false);
    }
  }

  async function runSimulation() {
    try {
      setLoading(true);
      setError("");
      setAiInsights(null);

      const data = getFinancialData();

      try {
        const response = await fetch(`${API_URL}/api/simulator`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_cash: Number(data.business?.openingCash || 0),
            invoices: data.invoices || [],
            recurring_expenses: data.recurringExpenses || [],
            one_time_expenses: data.expenses || [],
            revenue_change_percent: Number(revenueChange || 0),
            expense_change_percent: Number(expenseChange || 0),
            payment_delay_days: Number(paymentDelay || 0),
            collection_rate_percent: Number(collectionRate || 100),
            gst_rate_percent: Number(gstRate || 18),
            additional_revenue: Number(additionalRevenue || 0),
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.simulation) {
            setSimulation(result.simulation);
            // Fire AI suggestions in parallel
            fetchAiSuggestions(data);
            return;
          }
        }
      } catch (networkErr) {
        console.warn("Backend simulator unavailable, falling back to local engine:", networkErr);
      }

      // Local Digital Twin Fallback
      const localSim = buildLocalSimulation(
        data,
        revenueChange,
        expenseChange,
        paymentDelay,
        collectionRate,
        gstRate,
        additionalRevenue
      );
      setSimulation(localSim);
      // Still try AI suggestions
      fetchAiSuggestions(data);
    } catch (err) {
      console.error("Simulator error:", err);
      setError(err.message || "Unable to run simulation.");
    } finally {
      setLoading(false);
    }
  }

  // Run initial simulation on load
  useEffect(() => {
    runSimulation();
  }, []);

  // ==========================================
  // RESET
  // ==========================================
  function resetSimulation() {
    setRevenueChange(0);
    setExpenseChange(0);
    setPaymentDelay(0);
    setCollectionRate(100);
    setGstRate(18);
    setAdditionalRevenue(0);
    setActivePreset("custom");
    setSimulation(null);
    setAiInsights(null);
    setError("");
  }

  // ==========================================
  // APPLY TO DASHBOARD
  // ==========================================
  function applyToDashboard() {
    try {
      localStorage.setItem("fintwin_active_scenario", JSON.stringify({
        revenueChange,
        expenseChange,
        paymentDelay,
        collectionRate,
        gstRate,
        additionalRevenue,
        timestamp: Date.now(),
      }));
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 3000);
    } catch (e) {
      console.warn("Could not save scenario:", e);
    }
  }

  // ==========================================
  // SCENARIO ICON
  // ==========================================
  function getScenarioIcon(scenario) {
    if (scenario === "Revenue Shock") return <TrendingDown size={18} />;
    if (scenario === "Expense Shock") return <TrendingUp size={18} />;
    if (scenario === "Payment Delay") return <Clock size={18} />;
    if (scenario === "Combined Shock") return <AlertTriangle size={18} />;
    return <Brain size={18} />;
  }

  // ==========================================
  // PREPARE CHART DATA
  // ==========================================
  const comparisonChartData = simulation?.scenarios?.map((s) => {
    let shortName = s.scenario;
    if (s.scenario === "Base Case") shortName = "Base Case";
    else if (s.scenario === "Revenue Shock") shortName = "Revenue Shock";
    else if (s.scenario === "Expense Shock") shortName = "Expense Shock";
    else if (s.scenario === "Payment Delay") shortName = "Payment Delay";
    else if (s.scenario === "Combined Shock") shortName = "Combined Shock";

    return {
      name: shortName,
      projectedCash: Math.round(s.projected_cash || 0),
      liquidityGap: Math.round(s.liquidity_gap || 0),
      cashImpact: Math.round(s.cash_impact || 0),
      risk: s.risk,
    };
  }) || [];

  // Generate 90-Day Trajectory Curve
  const trajectoryData = [];
  let day30Diff = 0;
  let day60Diff = 0;
  let day90Diff = 0;
  let firstShortfallDay = null;

  if (simulation) {
    const currentCash = Number(simulation.base?.current_cash || 0);
    const receivables = Number(simulation.base?.receivables || 0);
    const totalExpenses = Number(simulation.base?.total_expenses || 0);
    const dailyBaseBurn = totalExpenses / 30;

    const collFactor = Math.max(0.1, Math.min(1.0, collectionRate / 100));
    const effectiveAddRevenue = Number(additionalRevenue || 0);
    const adjRev = (receivables * (1 + revenueChange / 100) + effectiveAddRevenue) * collFactor;
    const gstImpactFactor = 1.0 + (gstRate - 18) / 100;
    const adjExp = totalExpenses * (1 + expenseChange / 100) * gstImpactFactor;
    const dailyStressedBurn = adjExp / 30;

    for (let d = 0; d <= 90; d += 5) {
      // Baseline trajectory
      const baseInflow = receivables > 0 ? (d / 60) * receivables : 0;
      const baseCash = Math.round(currentCash + baseInflow - dailyBaseBurn * d);

      // Stressed trajectory
      const delayOffset = Math.max(0, d - paymentDelay);
      const stressedInflow = adjRev > 0 ? (delayOffset / 60) * adjRev : 0;
      const stressedCash = Math.round(currentCash + stressedInflow - dailyStressedBurn * d);

      if (stressedCash < 0 && firstShortfallDay === null && d > 0) {
        firstShortfallDay = { day: d, deficit: Math.abs(stressedCash) };
      }

      if (d === 30) day30Diff = stressedCash - baseCash;
      if (d === 60) day60Diff = stressedCash - baseCash;
      if (d === 90) day90Diff = stressedCash - baseCash;

      trajectoryData.push({
        day: `Day ${d}`,
        dayNum: d,
        baseline: baseCash,
        stressed: stressedCash,
        zeroLine: 0,
      });
    }
  }

  return (
    <ModulePage
      title="Shock Simulator"
      description="Test financial scenarios before making important business decisions."
    >
      {/* =====================================
          INTRO BANNER
      ====================================== */}
      <div
        className="cash-success"
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)",
          border: "1px solid rgba(59,130,246,0.3)",
          padding: "16px 20px",
          borderRadius: "12px",
        }}
      >
        <div style={{ color: "#7A9CAE" }}>
          <Brain size={24} />
        </div>
        <div>
          <strong style={{ fontSize: "14px", color: "#fff", display: "block" }}>
            Financial What-If Stress Simulator & Graphical Projection
          </strong>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12.5px" }}>
            Adjust the sliders below to run live simulations and visualize how macroeconomic shocks, debtor payment delays, and expense surges impact your solvency in real-time graphs.
          </p>
        </div>
      </div>

      {/* =====================================
          ERROR
      ====================================== */}
      {error && (
        <div
          className="module-alert"
          style={{
            marginBottom: "18px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "14px 18px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fca5a5",
          }}
        >
          <AlertTriangle size={20} color="#C07F7F" />
          <div>
            <strong>Simulation failed</strong>
            <p style={{ margin: "2px 0 0", fontSize: "12px" }}>{error}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SIDE-BY-SIDE: SCENARIO CONTROLS (LEFT) + GRAPHICAL SIMULATION (RIGHT)
          ========================================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "20px",
          alignItems: "start",
          marginBottom: "20px",
        }}
      >
        {/* =====================================
            LEFT COLUMN: CONTROLS CARD
        ====================================== */}
        <div className="module-card" style={{ margin: 0 }}>
          <div className="section-heading">
            <div className="section-heading-icon" style={{ background: "rgba(59,130,246,0.2)", color: "#7A9CAE" }}>
              <Brain size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700" }}>Scenario Assumptions</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                Configure your stress test parameters and run the digital twin calculation.
              </p>
            </div>
          </div>

          {/* Scenario Presets */}
          <div style={{ marginTop: "18px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(presets).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: activePreset === key ? "2px solid #7A9CAE" : "1px solid rgba(255,255,255,0.15)",
                  background: activePreset === key ? "rgba(122,156,174,0.15)" : "rgba(255,255,255,0.04)",
                  color: activePreset === key ? "#fff" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: activePreset === key ? "700" : "500",
                  transition: "all 0.2s ease",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: "22px",
              display: "grid",
              gap: "20px",
            }}
          >
            {/* Revenue Slider */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "#f8fafc" }}>Revenue Change (Demand Shock)</strong>
                <strong style={{ color: revenueChange < 0 ? "#C07F7F" : revenueChange > 0 ? "#1C6758" : "#94a3b8" }}>
                  {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
                </strong>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={revenueChange}
                onChange={(e) => setRevenueChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7A9CAE" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Negative values simulate a decline in sales orders or client cancellations.
              </small>
            </div>

            {/* Expenses Slider */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "#f8fafc" }}>Expense Surge (Inflation / OpEx Shock)</strong>
                <strong style={{ color: expenseChange > 0 ? "#C07F7F" : "#94a3b8" }}>
                  +{expenseChange}%
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={expenseChange}
                onChange={(e) => setExpenseChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#C07F7F" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Simulate an increase in raw material costs, rent, or unexpected operational disbursements.
              </small>
            </div>

            {/* Payment Delay Slider */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "#f8fafc" }}>Customer Payment Delay (Debtor Lag)</strong>
                <strong style={{ color: paymentDelay > 0 ? "#C78150" : "#94a3b8" }}>
                  {paymentDelay} days
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={paymentDelay}
                onChange={(e) => setPaymentDelay(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#C78150" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Simulate enterprise buyers delaying settlements past agreed credit periods.
              </small>
            </div>

            {/* Invoice Collection Rate Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <strong style={{ color: "#f8fafc" }}>Invoice Collection Rate</strong>
                <strong style={{ color: collectionRate < 80 ? "#C07F7F" : "#1C6758" }}>{collectionRate}%</strong>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="2"
                value={collectionRate}
                onChange={(e) => { setCollectionRate(Number(e.target.value)); setActivePreset("custom"); }}
                style={{ width: "100%", accentColor: "#a78bfa" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Percentage of invoiced amounts actually collected within the period.
              </small>
            </div>

            {/* GST Rate Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <strong style={{ color: "#f8fafc" }}>GST Rate</strong>
                <strong style={{ color: "#94a3b8" }}>{gstRate}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="28"
                step="1"
                value={gstRate}
                onChange={(e) => { setGstRate(Number(e.target.value)); setActivePreset("custom"); }}
                style={{ width: "100%", accentColor: "#60a5fa" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Effective GST rate applied to receivables and outflows for tax liability estimation.
              </small>
            </div>

            {/* Additional Revenue Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <strong style={{ color: "#f8fafc" }}>Additional Revenue</strong>
                <strong style={{ color: additionalRevenue > 0 ? "#10b981" : "#94a3b8" }}>
                  {additionalRevenue > 0 ? `+${formatMoney(additionalRevenue)}` : "₹0"}
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={additionalRevenue}
                onChange={(e) => { setAdditionalRevenue(Number(e.target.value)); setActivePreset("custom"); }}
                style={{ width: "100%", accentColor: "#10b981" }}
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
                Inject projected pipeline orders or fresh sales commitments into the simulation.
              </small>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "22px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={runSimulation}
              disabled={loading}
              style={{
                padding: "9px 18px",
                border: "none",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7A9CAE 0%, #2563eb 100%)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              }}
            >
              <Sparkles size={15} />
              {loading ? "Running Twin..." : "Run Simulation"}
            </button>

            <button
              onClick={applyToDashboard}
              style={{
                padding: "9px 14px",
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: "8px",
                background: appliedToast ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.1)",
                color: "#34d399",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <ShieldCheck size={15} />
              {appliedToast ? "✓ Applied!" : "Apply to Dashboard"}
            </button>

            <button
              onClick={resetSimulation}
              style={{
                padding: "9px 14px",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* =================================================================
            RIGHT COLUMN: INTERACTIVE GRAPH VISUALIZER SECTION
            ================================================================= */}
        <div className="module-card" style={{ margin: 0, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="section-heading-icon" style={{ background: "rgba(59,130,246,0.2)", color: "#7A9CAE" }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", margin: 0 }}>
                  Live Scenario Comparison
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>
                  Interactive charts comparing baseline solvency vs stressed depletion curves.
                </p>
              </div>
            </div>

            {/* Chart Mode Toggle */}
            <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: "3px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => setActiveChartTab("trajectory")}
                style={{
                  padding: "5px 11px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeChartTab === "trajectory" ? "#7A9CAE" : "transparent",
                  color: activeChartTab === "trajectory" ? "#fff" : "#94a3b8",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <LineChart size={13} />
                90-Day Trajectory
              </button>

              <button
                onClick={() => setActiveChartTab("bar")}
                style={{
                  padding: "5px 11px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeChartTab === "bar" ? "#7A9CAE" : "transparent",
                  color: activeChartTab === "bar" ? "#fff" : "#94a3b8",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <BarChart3 size={13} />
                Scenario Bar
              </button>

              <button
                onClick={() => setActiveChartTab("cards")}
                style={{
                  padding: "5px 11px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeChartTab === "cards" ? "#7A9CAE" : "transparent",
                  color: activeChartTab === "cards" ? "#fff" : "#94a3b8",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Layers size={13} />
                Matrix
              </button>

              <button
                onClick={() => setActiveChartTab("aiRisk")}
                style={{
                  padding: "5px 11px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeChartTab === "aiRisk"
                    ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                    : "transparent",
                  color: activeChartTab === "aiRisk" ? "#fff" : "#94a3b8",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Zap size={13} />
                AI Risk Map
              </button>
            </div>
          </div>

          {/* GRAPH VIEW 1: SCENARIO COMPARISON BAR CHART */}
          {activeChartTab === "bar" && (
              <div>
                <div style={{ height: 340, width: "100%", marginTop: "10px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={11.5}
                        tickLine={false}
                        interval={0}
                        angle={-10}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        }}
                        formatter={(val, name) => [
                          `₹${Number(val).toLocaleString("en-IN")}`,
                          name === "projectedCash" ? "Projected Cash" : name === "liquidityGap" ? "Liquidity Gap" : "Cash Impact",
                        ]}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                            {value === "projectedCash" ? "Projected Cash (Post-Shock)" : value === "liquidityGap" ? "Liquidity Gap / Deficit" : "Cash Impact"}
                          </span>
                        )}
                      />
                      <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                      <Bar dataKey="projectedCash" name="projectedCash" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={38}>
                        {comparisonChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.projectedCash < 0 ? "#C07F7F" : entry.risk === "HIGH" ? "#fb923c" : "#38bdf8"}
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="liquidityGap" name="liquidityGap" fill="#C07F7F" radius={[4, 4, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#94a3b8" }}>
                  <span>🔵 Cyan/Blue = Positive Reserves</span>
                  <span>🟠 Orange = High Warning Buffer</span>
                  <span>🔴 Red = Liquidity Deficit (Requires Discounting)</span>
                </div>
              </div>
            )}

            {/* GRAPH VIEW 2: 90-DAY TRAJECTORY AREA CHART */}
            {activeChartTab === "trajectory" && (
              <div>
                <div style={{ height: 340, width: "100%", marginTop: "10px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trajectoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorStressed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C07F7F" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C07F7F" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(val, name) => [
                          `₹${Number(val).toLocaleString("en-IN")}`,
                          name === "baseline" ? "Baseline Cash Trajectory" : "Stressed Cash Trajectory",
                        ]}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                            {value === "baseline" ? "Baseline Cash (Normal Flow)" : "Stressed Cash (With Active Shocks)"}
                          </span>
                        )}
                      />
                      <ReferenceLine y={0} stroke="#C07F7F" strokeDasharray="4 4" label={{ value: "Solvency Breach Line (₹0)", fill: "#C07F7F", fontSize: 11 }} />
                      <Area
                        type="monotone"
                        dataKey="baseline"
                        name="baseline"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorBaseline)"
                      />
                      <Area
                        type="monotone"
                        dataKey="stressed"
                        name="stressed"
                        stroke="#C07F7F"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorStressed)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#cbd5e1" }}>
                  💡 <strong>Digital Twin Takeaway:</strong> The red area illustrates your cash depletion trajectory under {revenueChange}% revenue change, +{expenseChange}% expense surge, and {paymentDelay} days customer delay.
                </div>

                {/* =====================================
                    IMPACT SUMMARY
                ====================================== */}
                <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", margin: "0 0 12px" }}>
                    Impact Summary
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {/* Day 30 Difference */}
                    <div style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        DAY 30 DIFFERENCE
                      </span>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        marginTop: "4px",
                        color: day30Diff < 0 ? "#ef4444" : day30Diff > 0 ? "#10b981" : "#cbd5e1",
                      }}>
                        {day30Diff < 0 ? `-₹${Math.abs(day30Diff).toLocaleString("en-IN")}` : day30Diff > 0 ? `+₹${day30Diff.toLocaleString("en-IN")}` : "₹0"}
                      </div>
                    </div>

                    {/* Day 60 Difference */}
                    <div style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        DAY 60 DIFFERENCE
                      </span>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        marginTop: "4px",
                        color: day60Diff < 0 ? "#ef4444" : day60Diff > 0 ? "#10b981" : "#cbd5e1",
                      }}>
                        {day60Diff < 0 ? `-₹${Math.abs(day60Diff).toLocaleString("en-IN")}` : day60Diff > 0 ? `+₹${day60Diff.toLocaleString("en-IN")}` : "₹0"}
                      </div>
                    </div>

                    {/* Day 90 Difference */}
                    <div style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        DAY 90 DIFFERENCE
                      </span>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        marginTop: "4px",
                        color: day90Diff < 0 ? "#ef4444" : day90Diff > 0 ? "#10b981" : "#cbd5e1",
                      }}>
                        {day90Diff < 0 ? `-₹${Math.abs(day90Diff).toLocaleString("en-IN")}` : day90Diff > 0 ? `+₹${day90Diff.toLocaleString("en-IN")}` : "₹0"}
                      </div>
                    </div>
                  </div>

                  {/* First Shortfall Day Card */}
                  <div style={{
                    marginTop: "12px",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: firstShortfallDay ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.08)",
                    border: `1px solid ${firstShortfallDay ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.2)"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        FIRST SHORTFALL DAY
                      </span>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        color: firstShortfallDay ? "#fca5a5" : "#34d399",
                        marginTop: "2px",
                      }}>
                        {firstShortfallDay
                          ? `Day ${firstShortfallDay.day} (Projected Deficit: ₹${firstShortfallDay.deficit.toLocaleString("en-IN")})`
                          : "No shortfall detected"}
                      </div>
                    </div>

                    <div style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: firstShortfallDay ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: firstShortfallDay ? "#ef4444" : "#10b981",
                    }}>
                      {firstShortfallDay ? "BREACH RISK" : "SOLVENT"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GRAPH VIEW 3: DETAILED SCENARIO CARDS MATRIX */}
            {activeChartTab === "cards" && (
              <div
                style={{
                  marginTop: "16px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                {(simulation.scenarios || []).map((scenario, index) => (
                  <div
                    key={`${scenario.scenario}-${index}`}
                    style={{
                      padding: "18px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      background: "rgba(15, 23, 42, 0.4)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          color:
                            scenario.risk === "HIGH"
                              ? "#C07F7F"
                              : scenario.risk === "MEDIUM"
                              ? "#C78150"
                              : "#1C6758",
                        }}
                      >
                        {getScenarioIcon(scenario.scenario)}
                      </div>

                      <strong style={{ flex: 1, fontSize: "14px", color: "#f8fafc" }}>
                        {scenario.scenario}
                      </strong>

                      <span
                        className={getRiskClass(scenario.risk)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: "700",
                        }}
                      >
                        {scenario.risk} RISK
                      </span>
                    </div>

                    <div className="module-grid" style={{ marginTop: "14px" }}>
                      <div>
                        <small style={{ color: "#94a3b8", fontSize: "11px" }}>PROJECTED CASH</small>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "15px",
                            color: Number(scenario.projected_cash) >= 0 ? "#38bdf8" : "#C07F7F",
                          }}
                        >
                          {formatMoney(scenario.projected_cash)}
                        </strong>
                      </div>

                      <div>
                        <small style={{ color: "#94a3b8", fontSize: "11px" }}>CASH IMPACT</small>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "15px",
                            color: Number(scenario.cash_impact) < 0 ? "#C07F7F" : "#1C6758",
                          }}
                        >
                          {formatMoney(scenario.cash_impact)}
                        </strong>
                      </div>

                      <div>
                        <small style={{ color: "#94a3b8", fontSize: "11px" }}>LIQUIDITY GAP</small>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "15px",
                            color: Number(scenario.liquidity_gap) > 0 ? "#C07F7F" : "#1C6758",
                          }}
                        >
                          {formatMoney(scenario.liquidity_gap)}
                        </strong>
                      </div>
                    </div>

                    <p style={{ margin: "12px 0 0", fontSize: "12px", lineHeight: "1.5", color: "#94a3b8" }}>
                      {scenario.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* GRAPH VIEW 4: AI RISK MAP */}
            {activeChartTab === "aiRisk" && (
              <div style={{ marginTop: "16px" }}>
                {aiLoading && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    <Activity size={24} style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: "10px", fontSize: "13px" }}>Running ML inference on invoice portfolio...</p>
                  </div>
                )}
                {!aiLoading && !aiInsights && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                    <Brain size={28} />
                    <p style={{ marginTop: "10px", fontSize: "13px" }}>AI risk analysis will appear after simulation runs.</p>
                  </div>
                )}
                {!aiLoading && aiInsights && (() => {
                  const dist = aiInsights.stressed_portfolio?.distribution || {};
                  const baseDist = aiInsights.base_portfolio?.distribution || {};
                  const tiers = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
                  const tierColors = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444", CRITICAL: "#dc2626" };
                  const totalInvoices = aiInsights.stressed_portfolio?.total_invoices || 0;

                  return (
                    <div>
                      {/* Risk Distribution Bar */}
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "600" }}>Stressed Portfolio Risk Distribution</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{totalInvoices} invoices scored</span>
                        </div>
                        <div style={{ display: "flex", height: "28px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                          {tiers.map(tier => {
                            const pct = dist[tier]?.percentage || 0;
                            if (pct <= 0) return null;
                            return (
                              <div
                                key={tier}
                                style={{
                                  width: `${pct}%`,
                                  background: tierColors[tier],
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: "#fff",
                                  transition: "width 0.6s ease",
                                  minWidth: pct > 5 ? "auto" : "0",
                                }}
                              >
                                {pct > 8 ? `${tier} ${pct}%` : ""}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                          {tiers.map(tier => (
                            <div key={tier} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94a3b8" }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: tierColors[tier] }} />
                              {tier}: {dist[tier]?.count || 0} ({dist[tier]?.percentage || 0}%)
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Base vs Stressed Comparison */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                        <div style={{ padding: "14px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Baseline Avg Delay</span>
                          <div style={{ fontSize: "22px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                            {aiInsights.base_portfolio?.weighted_avg_delay || 0} <span style={{ fontSize: "12px", fontWeight: "500" }}>days</span>
                          </div>
                        </div>
                        <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stressed Avg Delay</span>
                          <div style={{ fontSize: "22px", fontWeight: "800", color: "#ef4444", marginTop: "4px" }}>
                            {aiInsights.stressed_portfolio?.weighted_avg_delay || 0} <span style={{ fontSize: "12px", fontWeight: "500" }}>days</span>
                          </div>
                        </div>
                      </div>

                      {/* Tier-by-tier comparison cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        {tiers.map(tier => {
                          const baseCount = baseDist[tier]?.count || 0;
                          const stressedCount = dist[tier]?.count || 0;
                          const delta = stressedCount - baseCount;
                          return (
                            <div key={tier} style={{
                              padding: "12px",
                              background: "rgba(15,23,42,0.5)",
                              border: `1px solid ${tierColors[tier]}33`,
                              borderRadius: "8px",
                              textAlign: "center",
                            }}>
                              <div style={{ fontSize: "10px", color: tierColors[tier], fontWeight: "700", marginBottom: "4px" }}>{tier}</div>
                              <div style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>{stressedCount}</div>
                              {delta !== 0 && (
                                <div style={{ fontSize: "10px", color: delta > 0 ? "#ef4444" : "#10b981", marginTop: "2px" }}>
                                  {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`} from baseline
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Baseline KPI Cards */}
        <div className="module-card" style={{ marginTop: "20px" }}>
          <div className="section-heading">
            <div className="section-heading-icon" style={{ background: "rgba(16,185,129,0.2)", color: "#1C6758" }}>
              <Brain size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: "700" }}>Current Baseline Financial Position</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                Pre-shock operating parameters used by the Digital Twin model.
              </p>
            </div>
          </div>

          <div className="module-grid" style={{ marginTop: "18px" }}>
            <div className="module-stat">
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>CURRENT CASH</span>
              <strong style={{ fontSize: "18px", color: "#38bdf8" }}>
                {formatMoney(simulation?.base?.current_cash)}
              </strong>
            </div>

            <div className="module-stat">
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>RECEIVABLES</span>
              <strong style={{ fontSize: "18px", color: "#1C6758" }}>
                {formatMoney(simulation?.base?.receivables)}
              </strong>
            </div>

            <div className="module-stat">
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL EXPENSES</span>
              <strong style={{ fontSize: "18px", color: "#C07F7F" }}>
                {formatMoney(simulation?.base?.total_expenses)}
              </strong>
            </div>

            <div className="module-stat">
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>NET POSITION</span>
              <strong style={{ fontSize: "18px", color: Number(simulation?.base?.net_position || 0) >= 0 ? "#1C6758" : "#C07F7F" }}>
                {formatMoney(simulation?.base?.net_position)}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================
            AI INSIGHTS PANEL
        ====================================== */}
        {aiInsights && (
            <div className="module-card" style={{ marginTop: "20px" }}>
              <div className="section-heading">
                <div
                  className="section-heading-icon"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))",
                    color: "#a78bfa",
                    boxShadow: "0 0 20px rgba(139,92,246,0.15)",
                  }}
                >
                  <Zap size={19} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    AI-Powered Suggestions
                    <span style={{
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      color: "#fff",
                      fontWeight: "600",
                    }}>
                      ML Engine v{aiInsights.model_info?.version || "2.0"}
                    </span>
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Trained on {(aiInsights.model_info?.total_records_trained || 88305).toLocaleString()} records • {aiInsights.model_info?.selected_model || "RandomForest"} Regressor + LightGBM Classifier
                  </p>
                </div>
              </div>

              {/* Suggestion Cards */}
              <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
                {(aiInsights.suggestions || []).map((sug, idx) => {
                  const priorityConfig = {
                    CRITICAL: { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.3)", icon: <AlertTriangle size={16} />, color: "#fca5a5", badge: "#dc2626" },
                    WARNING: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: <ShieldAlert size={16} />, color: "#fcd34d", badge: "#f59e0b" },
                    INFO: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", icon: <Target size={16} />, color: "#93c5fd", badge: "#3b82f6" },
                    SAFE: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", icon: <Shield size={16} />, color: "#6ee7b7", badge: "#10b981" },
                  };
                  const config = priorityConfig[sug.priority] || priorityConfig.INFO;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "16px 18px",
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        borderRadius: "10px",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = `0 4px 16px ${config.border}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ color: config.color }}>{config.icon}</div>
                        <strong style={{ flex: 1, fontSize: "13px", color: "#f8fafc" }}>{sug.title}</strong>
                        <span style={{
                          fontSize: "10px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: config.badge,
                          color: "#fff",
                          fontWeight: "700",
                        }}>
                          {sug.priority}
                        </span>
                        {sug.metric && (
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.08)",
                            color: "#cbd5e1",
                            fontWeight: "600",
                          }}>
                            {sug.metric}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.6", color: "#94a3b8" }}>
                        {sug.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Top At-Risk Invoices Table */}
              {aiInsights.top_risk_invoices && aiInsights.top_risk_invoices.length > 0 && (
                <div style={{ marginTop: "22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Target size={16} style={{ color: "#a78bfa" }} />
                    <strong style={{ fontSize: "13px", color: "#f8fafc" }}>Top At-Risk Invoices</strong>
                    <ChevronRight size={14} style={{ color: "#64748b" }} />
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Ranked by ML risk score</span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>Customer</th>
                          <th style={{ textAlign: "right", padding: "8px 12px", color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>Amount</th>
                          <th style={{ textAlign: "center", padding: "8px 12px", color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>Predicted Delay</th>
                          <th style={{ textAlign: "center", padding: "8px 12px", color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>Risk</th>
                          <th style={{ textAlign: "center", padding: "8px 12px", color: "#94a3b8", fontWeight: "600", fontSize: "11px" }}>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiInsights.top_risk_invoices.map((inv, idx) => {
                          const riskColors = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444", CRITICAL: "#dc2626" };
                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                background: idx % 2 === 0 ? "rgba(15,23,42,0.3)" : "transparent",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.06)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "rgba(15,23,42,0.3)" : "transparent")}
                            >
                              <td style={{ padding: "10px 12px", color: "#f8fafc", fontWeight: "500" }}>{inv.customer}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: "#38bdf8" }}>{formatMoney(inv.amount)}</td>
                              <td style={{ padding: "10px 12px", textAlign: "center", color: "#fbbf24", fontWeight: "600" }}>{inv.predicted_delay_days}d</td>
                              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                <span style={{
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  background: `${riskColors[inv.risk] || "#64748b"}22`,
                                  color: riskColors[inv.risk] || "#94a3b8",
                                  border: `1px solid ${riskColors[inv.risk] || "#64748b"}44`,
                                }}>
                                  {inv.risk}
                                </span>
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", color: "#94a3b8" }}>
                                {(inv.confidence * 100).toFixed(0)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Loading State */}
          {aiLoading && !aiInsights && (
            <div
              className="module-card"
              style={{
                marginTop: "20px",
                textAlign: "center",
                padding: "30px",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "#a78bfa" }}>
                <Activity size={20} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "13px", fontWeight: "600" }}>ML engine scoring invoice portfolio...</span>
              </div>
            </div>
          )}

          {/* Assumptions Footer Note */}
          <div
            style={{
              marginTop: "18px",
              padding: "14px 18px",
              borderRadius: "10px",
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            <strong>Simulation assumptions:</strong> Revenue {revenueChange}%, Expenses +{expenseChange}%, Payment delay {paymentDelay} days. These are mathematical scenarios based on your digital twin ledger.
            {aiInsights && " • AI suggestions powered by ML pipeline trained on 88,305 payment records."}
          </div>
    </ModulePage>
  );
}

export default Simulator;