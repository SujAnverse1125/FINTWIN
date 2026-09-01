import { useState } from "react";
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

function buildLocalSimulation(data, revenueChange, expenseChange, paymentDelay) {
  const currentCash = Number(data.business?.openingCash || 0);
  const receivables = (data.invoices || [])
    .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const recurring = (data.recurringExpenses || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const oneTime = (data.expenses || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalExpenses = recurring + oneTime;
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

  const adjExp = totalExpenses * (1 + expenseChange / 100);
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
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeChartTab, setActiveChartTab] = useState("bar"); // "bar" | "trajectory" | "cards"

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
  async function runSimulation() {
    try {
      setLoading(true);
      setError("");

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
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.simulation) {
            setSimulation(result.simulation);
            return;
          }
        }
      } catch (networkErr) {
        console.warn("Backend simulator unavailable, falling back to local engine:", networkErr);
      }

      // Local Digital Twin Fallback
      const localSim = buildLocalSimulation(data, revenueChange, expenseChange, paymentDelay);
      setSimulation(localSim);
    } catch (err) {
      console.error("Simulator error:", err);
      setError(err.message || "Unable to run simulation.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RESET
  // ==========================================
  function resetSimulation() {
    setRevenueChange(0);
    setExpenseChange(0);
    setPaymentDelay(0);
    setSimulation(null);
    setError("");
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
  if (simulation) {
    const currentCash = Number(simulation.base?.current_cash || 0);
    const receivables = Number(simulation.base?.receivables || 0);
    const totalExpenses = Number(simulation.base?.total_expenses || 0);
    const dailyBaseBurn = totalExpenses / 30;

    const adjRev = receivables * (1 + revenueChange / 100);
    const adjExp = totalExpenses * (1 + expenseChange / 100);
    const dailyStressedBurn = adjExp / 30;

    for (let d = 0; d <= 90; d += 5) {
      // Baseline trajectory
      const baseInflow = receivables > 0 ? (d / 60) * receivables : 0;
      const baseCash = Math.round(currentCash + baseInflow - dailyBaseBurn * d);

      // Stressed trajectory
      const delayOffset = Math.max(0, d - paymentDelay);
      const stressedInflow = adjRev > 0 ? (delayOffset / 60) * adjRev : 0;
      const stressedCash = Math.round(currentCash + stressedInflow - dailyStressedBurn * d);

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
          CONTROLS CARD
      ====================================== */}
      <div className="module-card">
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

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gap: "22px",
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
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
            alignItems: "center",
          }}
        >
          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #7A9CAE 0%, #2563eb 100%)",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}
          >
            <Sparkles size={16} />
            {loading ? "Running Twin Simulation..." : "Run Graphical Simulation"}
          </button>

          <button
            onClick={resetSimulation}
            style={{
              padding: "10px 16px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              color: "#cbd5e1",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* =====================================
          ERROR
      ====================================== */}
      {error && (
        <div
          className="module-alert"
          style={{
            marginTop: "18px",
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

      {/* =====================================
          SIMULATION VISUAL RESULTS
      ====================================== */}
      {simulation && (
        <>
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
                  {formatMoney(simulation.base?.current_cash)}
                </strong>
              </div>

              <div className="module-stat">
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>RECEIVABLES</span>
                <strong style={{ fontSize: "18px", color: "#1C6758" }}>
                  {formatMoney(simulation.base?.receivables)}
                </strong>
              </div>

              <div className="module-stat">
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL EXPENSES</span>
                <strong style={{ fontSize: "18px", color: "#C07F7F" }}>
                  {formatMoney(simulation.base?.total_expenses)}
                </strong>
              </div>

              <div className="module-stat">
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>NET POSITION</span>
                <strong style={{ fontSize: "18px", color: Number(simulation.base?.net_position || 0) >= 0 ? "#1C6758" : "#C07F7F" }}>
                  {formatMoney(simulation.base?.net_position)}
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================================
              INTERACTIVE GRAPH VISUALIZER SECTION
              ================================================================= */}
          <div className="module-card" style={{ marginTop: "20px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="section-heading-icon" style={{ background: "rgba(59,130,246,0.2)", color: "#7A9CAE" }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>
                    Visual Shock Graphs & Impact Trajectories
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                    Interactive charts comparing scenario solvency and 90-day cash depletion curves.
                  </p>
                </div>
              </div>

              {/* Chart Mode Toggle */}
              <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: "3px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <button
                  onClick={() => setActiveChartTab("bar")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeChartTab === "bar" ? "#7A9CAE" : "transparent",
                    color: activeChartTab === "bar" ? "#fff" : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <BarChart3 size={14} />
                  Scenario Bar Chart
                </button>

                <button
                  onClick={() => setActiveChartTab("trajectory")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeChartTab === "trajectory" ? "#7A9CAE" : "transparent",
                    color: activeChartTab === "trajectory" ? "#fff" : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LineChart size={14} />
                  90-Day Trajectory
                </button>

                <button
                  onClick={() => setActiveChartTab("cards")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeChartTab === "cards" ? "#7A9CAE" : "transparent",
                    color: activeChartTab === "cards" ? "#fff" : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Layers size={14} />
                  Detailed Matrix
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
          </div>

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
          </div>
        </>
      )}
    </ModulePage>
  );
}

export default Simulator;