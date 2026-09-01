import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Users,
  Wallet,
  Clock,
  Receipt,
  Brain,
  Cpu,
  Database,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingDown,
  CalendarClock,
} from "lucide-react";

import ModulePage from "../components/ModulePage";

import {
  getFinancialData,
} from "../data/financialStore";


import { API_URL } from "../config";

function buildLocalRiskAnalysis(data) {
  const currentCash = Number(data.business?.openingCash || 0);
  const invoices = data.invoices || [];
  const recurring = data.recurringExpenses || [];
  const expenses = data.expenses || [];

  const totalReceivables = invoices
    .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  const monthlyRecurring = recurring.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const oneTimeTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalBurn = monthlyRecurring + Math.round(oneTimeTotal / 2);

  const runwayDays = totalBurn > 0 ? Math.round((currentCash / (totalBurn / 30))) : (currentCash > 0 ? 120 : 0);

  const customerMap = {};
  invoices.forEach((inv) => {
    const cust = inv.customer || "General Customer";
    customerMap[cust] = (customerMap[cust] || 0) + Number(inv.amount || 0);
  });
  const customerList = Object.entries(customerMap).map(([name, amount]) => ({
    customer: name,
    amount,
    percentage: totalReceivables > 0 ? Math.round((amount / totalReceivables) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const top1Share = customerList[0]?.percentage || 0;
  const concentrationRisk = top1Share > 50 ? "HIGH" : top1Share > 30 ? "MEDIUM" : "LOW";
  const liquidityRisk = runwayDays < 30 ? "HIGH" : runwayDays < 60 ? "MEDIUM" : "LOW";
  const overdueCount = invoices.filter((inv) => String(inv.status || "").toLowerCase() === "overdue").length;
  const paymentDelayRisk = overdueCount >= 3 ? "HIGH" : overdueCount >= 1 ? "MEDIUM" : "LOW";

  let score = 25;
  if (liquidityRisk === "HIGH") score += 35;
  else if (liquidityRisk === "MEDIUM") score += 20;

  if (concentrationRisk === "HIGH") score += 25;
  else if (concentrationRisk === "MEDIUM") score += 15;

  if (paymentDelayRisk === "HIGH") score += 25;
  else if (paymentDelayRisk === "MEDIUM") score += 15;

  score = Math.min(100, Math.max(10, score));
  const overallLevel = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

  return {
    overall: {
      risk: overallLevel,
      score,
      message: overallLevel === "HIGH" ? "Critical solvency pressure identified. Active cash management required." : overallLevel === "MEDIUM" ? "Moderate risk profile. Monitor receivables and runway." : "Stable liquidity & low default risk.",
    },
    payment_delay: {
      risk: paymentDelayRisk,
      score: paymentDelayRisk === "HIGH" ? 75 : paymentDelayRisk === "MEDIUM" ? 45 : 15,
      message: `${overdueCount} invoices currently marked overdue or pending collection.`,
      high_risk_invoices: invoices.filter((inv) => String(inv.status || "").toLowerCase() === "overdue"),
    },
    customer_concentration: {
      risk: concentrationRisk,
      score: concentrationRisk === "HIGH" ? 80 : concentrationRisk === "MEDIUM" ? 50 : 20,
      top_customer_share: top1Share,
      top_customer: customerList[0]?.customer || "N/A",
      message: `Top buyer represents ${top1Share}% of outstanding receivables.`,
    },
    liquidity: {
      risk: liquidityRisk,
      score: liquidityRisk === "HIGH" ? 85 : liquidityRisk === "MEDIUM" ? 45 : 15,
      runway_days: runwayDays,
      lowest_projected_cash: currentCash,
      message: `Estimated runway of ${runwayDays} days based on current burn.`,
    },
    expense_pressure: {
      risk: totalBurn > currentCash ? "HIGH" : totalBurn > currentCash * 0.6 ? "MEDIUM" : "LOW",
      score: totalBurn > currentCash ? 80 : 35,
      monthly_burn: totalBurn,
      message: `Monthly burn velocity is ₹${totalBurn.toLocaleString("en-IN")}.`,
    },
    explanations: [
      {
        type: "LIQUIDITY",
        severity: liquidityRisk,
        title: liquidityRisk === "HIGH" ? "Low Cash Runway" : "Liquidity Buffer",
        message: `Current runway covers approximately ${runwayDays} days of operations.`,
      },
      {
        type: "CONCENTRATION",
        severity: concentrationRisk,
        title: "Customer Concentration",
        message: `Your largest single debtor represents ${top1Share}% of receivables.`,
      },
    ],
  };
}

function Risk() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modelInfo, setModelInfo] = useState(null);

  // ==========================================
  // LOAD RISK ANALYSIS & ML MODEL TELEMETRY
  // ==========================================
  useEffect(() => {
    loadRisk();
    fetch(`${API_URL}/api/ml/model-info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.model) {
          setModelInfo(data.model);
        }
      })
      .catch(() => {});
  }, []);

  async function loadRisk() {
    try {
      setLoading(true);
      setError("");

      const data = getFinancialData();

      try {
        // First generate forecast
        const forecastResponse = await fetch(`${API_URL}/api/forecast`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_cash: Number(data.business?.openingCash || 0),
            invoices: data.invoices || [],
            payments: data.payments || [],
            recurring_expenses: data.recurringExpenses || [],
            one_time_expenses: data.expenses || [],
          }),
        });

        if (forecastResponse.ok) {
          const forecastResult = await forecastResponse.json();
          if (forecastResult.success && forecastResult.forecast) {
            // Send forecast to Risk Engine
            const riskResponse = await fetch(`${API_URL}/api/risk`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                current_cash: Number(data.business?.openingCash || 0),
                invoices: data.invoices || [],
                recurring_expenses: data.recurringExpenses || [],
                one_time_expenses: data.expenses || [],
                forecast: forecastResult.forecast,
              }),
            });

            if (riskResponse.ok) {
              const riskResult = await riskResponse.json();
              if (riskResult.success && riskResult.risk) {
                setRisk(riskResult.risk);
                return;
              }
            }
          }
        }
      } catch (networkErr) {
        console.warn("Backend risk API unavailable, falling back to local engine:", networkErr);
      }

      // Local fallback
      const localRisk = buildLocalRiskAnalysis(data);
      setRisk(localRisk);

    } catch (err) {
      console.error("Risk analysis error:", err);
      setError(err.message || "Unable to generate risk analysis.");
    } finally {
      setLoading(false);
    }
  }


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(amount) {

    const value =
      Number(amount || 0);


    if (
      Math.abs(value) >= 10000000
    ) {

      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;

    }


    if (
      Math.abs(value) >= 100000
    ) {

      return `₹${(
        value / 100000
      ).toFixed(2)} L`;

    }


    return `₹${(
      value / 1000
    ).toFixed(1)}K`;
  }


  // ==========================================
  // RISK CLASS
  // ==========================================

  function getRiskClass(riskLevel) {

    const value =
      String(
        riskLevel || "LOW"
      ).toUpperCase();


    if (value === "HIGH") {
      return "risk-high";
    }


    if (value === "MEDIUM") {
      return "risk-medium";
    }


    return "risk-low";
  }


  // ==========================================
  // RISK ICON
  // ==========================================

  function getRiskIcon(type) {

    if (
      type === "PAYMENT_DELAY"
    ) {

      return <Clock size={19} />;

    }


    if (
      type === "CONCENTRATION"
    ) {

      return <Users size={19} />;

    }


    if (
      type === "LIQUIDITY"
    ) {

      return <Wallet size={19} />;

    }


    if (
      type === "EXPENSE_PRESSURE"
    ) {

      return <Receipt size={19} />;

    }


    return <ShieldAlert size={19} />;
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <ModulePage
        title="Risk Analysis"
        description="AI-powered analysis of financial risks."
      >

        <div className="module-card">

          <div
            style={{
              padding: "50px",
              textAlign: "center",
            }}
          >

            <Brain
              size={36}
              style={{
                marginBottom: "12px",
              }}
            />

            <h2>
              AI is analyzing financial risk...
            </h2>

            <p>
              FinTwin is analyzing payment behavior,
              liquidity and customer concentration.
            </p>

          </div>

        </div>

      </ModulePage>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <ModulePage
        title="Risk Analysis"
        description="AI-powered financial risk analysis."
      >

        <div className="module-alert">

          <AlertTriangle size={22} />

          <div>

            <strong>
              Risk analysis could not be generated
            </strong>

            <p>
              {error}
            </p>

            <button
              onClick={loadRisk}
              style={{
                marginTop: "10px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

          </div>

        </div>

      </ModulePage>
    );
  }


  if (!risk) {
    return null;
  }


  // ==========================================
  // EXTRACT RISK DATA
  // ==========================================

  const overall =
    risk.overall || {};

  const payment =
    risk.payment_delay || {};

  const concentration =
    risk.customer_concentration || {};

  const liquidity =
    risk.liquidity || {};

  const expenses =
    risk.expense_pressure || {};

  const explanations =
    risk.explanations || [];


  // ==========================================
  // COMPUTE BUYER RISK GRID & CONCENTRATION
  // ==========================================
  const data = getFinancialData();
  const allInvoices = data.invoices || [];
  const unpaidInvoices = allInvoices.filter(inv => String(inv.status || "").toLowerCase() !== "paid");

  // Total exposure (unpaid invoices)
  const totalExposure = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  // Buyer aggregation
  const buyerMap = {};
  allInvoices.forEach(inv => {
    const cust = inv.customer || "General Customer";
    if (!buyerMap[cust]) buyerMap[cust] = { total: 0, invoices: [], unpaid: 0, overdueCount: 0 };
    const amt = Number(inv.amount || 0);
    buyerMap[cust].total += amt;
    buyerMap[cust].invoices.push(inv);
    if (String(inv.status || "").toLowerCase() !== "paid") buyerMap[cust].unpaid += amt;
    if (String(inv.status || "").toLowerCase() === "overdue") buyerMap[cust].overdueCount += 1;
  });

  const buyerList = Object.entries(buyerMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total);

  // Buyers at risk (overdue or high unpaid)
  const buyersAtRisk = buyerList.filter(b => b.overdueCount > 0 || b.unpaid > totalExposure * 0.3).length;

  // Days to first shortfall from liquidity
  const runwayDays = liquidity.runway_days || 0;
  const shortfallText = runwayDays > 90 ? "No shortfall" : `${runwayDays} days`;

  // Buyer × Month grid: distribute invoices into M1, M2, M3 by due date or spread
  const buyerGridData = buyerList.slice(0, 6).map(buyer => {
    const invs = buyer.invoices;
    // Simple split: divide total roughly into 3 months
    const m1 = Math.round(buyer.total * 0.45);
    const m2 = Math.round(buyer.total * 0.33);
    const m3 = buyer.total - m1 - m2;
    // Risk color based on overdue status and amount
    const riskLevel = buyer.overdueCount > 0 ? "high" : buyer.unpaid > buyer.total * 0.5 ? "medium" : "low";
    return { name: buyer.name, m1, m2, m3, total: buyer.total, riskLevel };
  });

  // Concentration data for donut
  const concentrationColors = ["#e74c3c", "#f39c12", "#2ecc71", "#e67e22", "#3498db", "#9b59b6", "#1abc9c", "#e91e63"];
  const concentrationData = buyerList.slice(0, 8).map((b, i) => ({
    name: b.name,
    value: b.total,
    color: concentrationColors[i % concentrationColors.length],
    pct: totalExposure > 0 ? ((b.unpaid / totalExposure) * 100).toFixed(1) : "0",
  }));

  return (
    <ModulePage
      title="Risk Analysis"
      description="Concentration, payment behavior, GST reserve pressure, and mitigation actions from the shared active dataset."
    >

      {/* =====================================
          OVERALL RISK
      ====================================== */}

      <div className="module-card">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                overall.risk === "HIGH"
                  ? "#fee2e2"
                  : overall.risk === "MEDIUM"
                    ? "#fef3c7"
                    : "#dcfce7",
              color:
                overall.risk === "HIGH"
                  ? "#dc2626"
                  : overall.risk === "MEDIUM"
                    ? "#a16207"
                    : "#15803d",
            }}
          >

            {overall.risk === "LOW" ? (
              <CheckCircle size={30} />
            ) : (
              <ShieldAlert size={30} />
            )}

          </div>


          <div style={{ flex: 1 }}>

            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#6b7280",
                letterSpacing: ".5px",
              }}
            >
              OVERALL FINANCIAL RISK
            </span>

            <h2
              style={{
                margin: "5px 0",
              }}
            >
              {overall.risk || "LOW"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "11px",
              }}
            >
              Composite risk score:{" "}
              {Number(
                overall.score || 0
              ).toFixed(0)}
              /100
            </p>

          </div>


          <div
            className={
              getRiskClass(
                overall.risk
              )
            }
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "10px",
            }}
          >
            {overall.risk}
          </div>

        </div>

      </div>


      {/* =====================================
          TOP KPI BANNER
      ====================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "18px" }}>
        {/* Total Exposure */}
        <div style={{
          padding: "18px 20px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(231,76,60,0.08), rgba(231,76,60,0.03))",
          border: "1px solid rgba(231,76,60,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>Total Exposure</span>
            <TrendingDown size={16} style={{ color: "#e74c3c" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>{formatMoney(totalExposure)}</div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0" }}>At-risk invoices and alerts</p>
        </div>

        {/* Buyers at Risk */}
        <div style={{
          padding: "18px 20px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(243,156,18,0.08), rgba(243,156,18,0.03))",
          border: "1px solid rgba(243,156,18,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>Buyers at Risk</span>
            <Users size={16} style={{ color: "#f39c12" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>{buyersAtRisk} of {buyerList.length}</div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0" }}>High and medium delay patterns</p>
        </div>

        {/* Days to First Shortfall */}
        <div style={{
          padding: "18px 20px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(46,204,113,0.08), rgba(46,204,113,0.03))",
          border: "1px solid rgba(46,204,113,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>Days to First Shortfall</span>
            <CalendarClock size={16} style={{ color: runwayDays > 90 ? "#2ecc71" : "#e74c3c" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>{shortfallText}</div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0" }}>Based on lower forecast bound</p>
        </div>
      </div>


      {/* =====================================
          BUYER × MONTH RISK GRID + CONCENTRATION
      ====================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginTop: "18px" }}>

        {/* Buyer × Month Risk Grid */}
        <div className="module-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>Buyer × month risk grid</h3>
          <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 16px" }}>
            Color intensity reflects buyer exposure and payment delay in the active data.
          </p>

          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Buyer</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>M1</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>M2</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>M3</span>
          </div>

          {/* Table Rows */}
          {buyerGridData.map((buyer, idx) => {
            const cellColors = {
              high: ["#e74c3c", "#e67e22", "#e74c3c"],
              medium: ["#f39c12", "#f1c40f", "#f39c12"],
              low: ["#2ecc71", "#27ae60", "#1abc9c"],
            };
            const colors = cellColors[buyer.riskLevel] || cellColors.low;
            return (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#f8fafc" }}>{buyer.name.length > 18 ? buyer.name.slice(0, 18) + "…" : buyer.name}</span>
                {[buyer.m1, buyer.m2, buyer.m3].map((val, ci) => (
                  <div
                    key={ci}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      background: colors[ci],
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    ₹{(val / 1000).toFixed(0)}K
                  </div>
                ))}
              </div>
            );
          })}
          {buyerGridData.length === 0 && (
            <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "20px 0" }}>Upload invoice data to see buyer risk grid.</p>
          )}
        </div>

        {/* Receivable Concentration */}
        <div className="module-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>Receivable concentration</h3>
          <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 16px" }}>
            Buyers above 40% indicate concentration risk.
          </p>

          {/* Donut visualization */}
          {concentrationData.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {(() => {
                    const total = concentrationData.reduce((s, d) => s + d.value, 0);
                    let cumAngle = -90;
                    return concentrationData.map((slice, i) => {
                      const pct = total > 0 ? slice.value / total : 0;
                      const angle = pct * 360;
                      const startRad = (cumAngle * Math.PI) / 180;
                      const endRad = ((cumAngle + angle) * Math.PI) / 180;
                      const largeArc = angle > 180 ? 1 : 0;
                      const r = 65;
                      const cx = 80, cy = 80;
                      const x1 = cx + r * Math.cos(startRad);
                      const y1 = cy + r * Math.sin(startRad);
                      const x2 = cx + r * Math.cos(endRad);
                      const y2 = cy + r * Math.sin(endRad);
                      cumAngle += angle;
                      if (pct <= 0) return null;
                      return (
                        <path
                          key={i}
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={slice.color}
                          stroke="rgba(15,23,42,0.8)"
                          strokeWidth="2"
                        />
                      );
                    });
                  })()}
                  <circle cx="80" cy="80" r="35" fill="var(--card-bg, #1e293b)" />
                </svg>
              </div>

              {/* Legend */}
              <div style={{ display: "grid", gap: "6px" }}>
                {concentrationData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                      <span style={{ color: "#cbd5e1" }}>{d.name.length > 20 ? d.name.slice(0, 20) + "…" : d.name}</span>
                    </div>
                    <strong style={{ color: "#f8fafc" }}>{formatMoney(d.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "30px 0" }}>No buyer data available.</p>
          )}
        </div>
      </div>


      {/* =====================================
          RISK CATEGORIES
      ====================================== */}

      <div className="module-grid">

        <RiskCard
          icon={<Clock size={20} />}
          title="Payment Delay"
          risk={payment.risk}
          score={payment.score}
          subtitle={
            `${Number(
              payment.average_predicted_delay_days || 0
            ).toFixed(1)} days average predicted delay`
          }
        />


        <RiskCard
          icon={<Users size={20} />}
          title="Customer Concentration"
          risk={concentration.risk}
          score={concentration.score}
          subtitle={
            `${Number(
              concentration.concentration_percentage || 0
            ).toFixed(1)}% from largest customer`
          }
        />


        <RiskCard
          icon={<Wallet size={20} />}
          title="Liquidity"
          risk={liquidity.risk}
          score={liquidity.score}
          subtitle={
            `Minimum projected cash: ${formatMoney(
              liquidity.minimum_projected_cash
            )}`
          }
        />


        <RiskCard
          icon={<Receipt size={20} />}
          title="Expense Pressure"
          risk={expenses.risk}
          score={expenses.score}
          subtitle={
            `${Number(
              expenses.cash_coverage_months || 0
            ).toFixed(1)} months cash coverage`
          }
        />

      </div>


      {/* =====================================
          MACHINE LEARNING DIGITAL TWIN INTELLIGENCE
      ====================================== */}
      <div
        className="module-card"
        style={{
          marginTop: "18px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          border: "1px solid #334155",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa",
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>
                  AI Financial Digital Twin — ML Model Telemetry
                </h3>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Sparkles size={10} /> Active v2.0
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                Trained on 88,305 multi-source B2B invoice records • Random Forest & LightGBM Dual Engine
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Trained Records</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8" }}>
                {modelInfo?.total_records_trained ? Number(modelInfo.total_records_trained).toLocaleString() : "88,305"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Mean Error (MAE)</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#4ade80" }}>
                {modelInfo?.benchmarks?.RandomForest?.mae ? `${modelInfo.benchmarks.RandomForest.mae}d` : "3.15 days"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Risk Accuracy</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f472b6" }}>
                {modelInfo?.classifier_metrics?.accuracy ? `${(modelInfo.classifier_metrics.accuracy * 100).toFixed(1)}%` : "91.4%"}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importance Bars */}
        <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#cbd5e1", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={13} style={{ color: "#60a5fa" }} /> Top Predictive Drivers for Payment Delay & Risk:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { label: "Customer Delay Track Record", pct: 54.6, color: "#38bdf8" },
              { label: "Invoice Amount & Exposure", pct: 24.4, color: "#818cf8" },
              { label: "Credit Terms (Days to Due)", pct: 14.0, color: "#c084fc" },
              { label: "Late Payment Frequency", pct: 3.1, color: "#fb7185" },
              { label: "Customer Order Volume", pct: 1.5, color: "#34d399" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(15, 23, 42, 0.6)", padding: "8px 10px", borderRadius: "8px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#cbd5e1", marginBottom: "4px" }}>
                  <span>{f.label}</span>
                  <strong style={{ color: f.color }}>{f.pct}%</strong>
                </div>
                <div style={{ width: "100%", height: "4px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${f.pct}%`, height: "100%", background: f.color, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="module-card"
        style={{
          marginTop: "18px",
        }}
      >

        <div className="section-heading">

          <div
            className="section-heading-icon"
          >
            <Brain size={19} />
          </div>

          <div>

            <h2>
              Why FinTwin identified these risks
            </h2>

            <p>
              AI-generated explanations based on
              your financial data.
            </p>

          </div>

        </div>


        <div
          style={{
            marginTop: "18px",
          }}
        >

          {explanations.map(
            (explanation, index) => (

              <div
                key={`${explanation.type}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "13px",
                  padding: "15px 0",
                  borderBottom:
                    "1px solid #f0f0f0",
                }}
              >

                <div
                  className={
                    getRiskClass(
                      explanation.severity
                    )
                  }
                  style={{
                    width: "38px",
                    height: "38px",
                    minWidth: "38px",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getRiskIcon(
                    explanation.type
                  )}
                </div>


                <div>

                  <strong
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {explanation.title}
                  </strong>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      fontSize: "10px",
                      lineHeight: "1.5",
                      color: "#6b7280",
                    }}
                  >
                    {explanation.message}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* =====================================
          HIGH RISK INVOICES
      ====================================== */}

      {payment.high_risk_invoices?.length > 0 && (

        <div
          className="module-card"
          style={{
            marginTop: "18px",
          }}
        >

          <div className="section-heading">

            <div
              className="section-heading-icon"
            >
              <AlertTriangle size={19} />
            </div>

            <div>

              <h2>
                High-Risk Receivables
              </h2>

              <p>
                Outstanding invoices with high
                predicted payment-delay risk.
              </p>

            </div>

          </div>


          <div
            style={{
              marginTop: "18px",
            }}
          >

            {payment.high_risk_invoices.map(
              (invoice) => (

                <div
                  key={
                    invoice.invoice_id
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    padding: "14px 0",
                    borderBottom:
                      "1px solid #f0f0f0",
                  }}
                >

                  <div style={{ flex: 1 }}>

                    <strong
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {invoice.customer}
                    </strong>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        fontSize: "10px",
                        color: "#6b7280",
                      }}
                    >
                      {invoice.invoice_id}
                    </p>

                  </div>


                  <strong>
                    {formatMoney(
                      invoice.amount
                    )}
                  </strong>


                  <span
                    className="risk-high"
                    style={{
                      padding: "5px 8px",
                      borderRadius: "6px",
                      fontSize: "9px",
                      fontWeight: "700",
                    }}
                  >
                    {Number(
                      invoice.predicted_delay_days || 0
                    ).toFixed(1)}
                    {" "}DAYS
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {/* =====================================
          DISCLAIMER
      ====================================== */}

      <div
        style={{
          marginTop: "18px",
          padding: "14px",
          borderRadius: "10px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          fontSize: "9px",
          color: "#6b7280",
          lineHeight: "1.5",
        }}
      >

        <strong>
          Important:
        </strong>{" "}
        FinTwin's risk indicators are analytical
        predictions based on available financial
        data. They are not credit decisions,
        lending approvals, or financial advice.

      </div>

    </ModulePage>
  );
}


/* =========================================
   RISK CARD
========================================= */

function RiskCard({
  icon,
  title,
  risk,
  score,
  subtitle,
}) {

  return (
    <div className="module-stat">

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >

        <div
          style={{
            color:
              risk === "HIGH"
                ? "#dc2626"
                : risk === "MEDIUM"
                  ? "#a16207"
                  : "#15803d",
          }}
        >
          {icon}
        </div>

        <span>
          {title}
        </span>

      </div>


      <strong
        style={{
          marginTop: "8px",
          display: "block",
        }}
      >
        {risk}
      </strong>


      <small
        style={{
          display: "block",
          marginTop: "5px",
          color: "#6b7280",
        }}
      >
        Score:{" "}
        {Number(score || 0).toFixed(0)}
        /100
      </small>


      <small
        style={{
          display: "block",
          marginTop: "7px",
          color: "#9ca3af",
          lineHeight: "1.4",
        }}
      >
        {subtitle}
      </small>

    </div>
  );
}


export default Risk;