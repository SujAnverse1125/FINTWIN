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

  // ==========================================
  // LOAD RISK ANALYSIS
  // ==========================================
  useEffect(() => {
    loadRisk();
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


  return (
    <ModulePage
      title="Risk Analysis"
      description="Understand the financial risks identified by the FinTwin AI engine."
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
          RISK EXPLANATIONS
      ====================================== */}

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