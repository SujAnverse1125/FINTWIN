import { useState } from "react";
import {
  Brain,
  Wallet,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

import ModulePage from "../components/ModulePage";
import { getFinancialData } from "../data/financialStore";
import { API_URL } from "../config";

function buildLocalFinancing(liquidityGap, outstandingReceivables, currentCash) {
  const gap = Math.max(0, Number(liquidityGap || 0));
  const receivables = Math.max(0, Number(outstandingReceivables || 0));
  const cash = Math.max(0, Number(currentCash || 0));
  const fundingNeeded = gap;
  const invoiceCap = Math.min(fundingNeeded, Math.round(receivables * 0.8));

  const nonDebt = {
    type: "NON_DEBT",
    name: "Customer Advance / Early Collection",
    funding_amount: fundingNeeded,
    estimated_cost: Math.round(fundingNeeded * 0.01),
    estimated_total_repayment: Math.round(fundingNeeded * 1.01),
    estimated_rate_percent: 1.0,
    repayment_period_months: 1,
    risk_level: "LOW",
    description: "Use customer advances, early-payment discounts, or internal cash-flow acceleration before taking new debt.",
    score: 95,
  };

  const invoiceFin = {
    type: "INVOICE_FINANCING",
    name: "Invoice Discounting (TReDS)",
    funding_amount: invoiceCap > 0 ? invoiceCap : fundingNeeded,
    estimated_cost: Math.round((invoiceCap > 0 ? invoiceCap : fundingNeeded) * 0.02 * 3),
    estimated_total_repayment: Math.round((invoiceCap > 0 ? invoiceCap : fundingNeeded) * 1.06),
    estimated_rate_percent: 2.0,
    repayment_period_months: 3,
    risk_level: "MEDIUM",
    description: "Raise funds against eligible outstanding invoices. Discounting converts unpaid customer bills to immediate liquid cash.",
    score: 88,
  };

  const workingCap = {
    type: "WORKING_CAPITAL",
    name: "Working Capital Credit Facility",
    funding_amount: fundingNeeded,
    estimated_cost: Math.round(fundingNeeded * 0.12 * 0.5),
    estimated_total_repayment: Math.round(fundingNeeded * 1.06),
    estimated_rate_percent: 12.0,
    repayment_period_months: 6,
    risk_level: "MEDIUM",
    description: "A revolving credit facility or short-term MSME loan to cover operational cash deficit.",
    score: 76,
  };

  const options = [nonDebt, invoiceFin, workingCap];
  const rec = invoiceCap >= fundingNeeded && fundingNeeded > 0
    ? { recommended_option: "Invoice Discounting (TReDS)", option_type: "INVOICE_FINANCING", reason: "Eligible receivables cover your liquidity gap without adding general corporate debt." }
    : fundingNeeded === 0
    ? { recommended_option: "No External Financing Required", option_type: "NONE", reason: "No cash deficit detected. Retain internal liquid cash buffer." }
    : { recommended_option: "Working Capital Credit Facility", option_type: "WORKING_CAPITAL", reason: "Flexible funding for short-term operating liquidity." };

  return {
    liquidity_gap: gap,
    funding_needed: fundingNeeded,
    outstanding_receivables: receivables,
    current_cash: cash,
    invoice_financing_capacity: invoiceCap,
    options,
    recommendation: rec,
    disclaimer: "All financing costs and recommendations are illustrative estimates for decision support.",
  };
}

function Financing() {

  const [liquidityGap, setLiquidityGap] =
    useState(200000);

  const [analysis, setAnalysis] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  function formatMoney(amount) {

    const value =
      Number(amount || 0);

    const absolute =
      Math.abs(value);

    if (absolute >= 10000000) {

      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;

    }

    if (absolute >= 100000) {

      return `₹${(
        value / 100000
      ).toFixed(2)} L`;

    }

    if (absolute >= 1000) {

      return `₹${(
        value / 1000
      ).toFixed(1)}K`;

    }

    return `₹${value.toFixed(0)}`;
  }


  // ==========================================
  // RISK CLASS
  // ==========================================

  function getRiskClass(risk) {

    const value =
      String(
        risk || "LOW"
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
  // OPTION ICON
  // ==========================================

  function getOptionIcon(type) {

    if (
      type === "NON_DEBT"
    ) {

      return <Wallet size={22} />;

    }

    if (
      type === "INVOICE_FINANCING"
    ) {

      return <FileText size={22} />;

    }

    return <CreditCard size={22} />;
  }


  // ==========================================
  // RUN ANALYSIS
  // ==========================================

  async function runAnalysis() {
    try {
      setLoading(true);
      setError("");

      const data = getFinancialData();
      const receivables = (data.invoices || [])
        .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      const currentCash = Number(data.business?.openingCash || 0);

      try {
        const response = await fetch(`${API_URL}/api/financing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            liquidity_gap: Number(liquidityGap || 0),
            outstanding_receivables: receivables,
            current_cash: currentCash,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.financing) {
            setAnalysis(result.financing);
            return;
          }
        }
      } catch (networkErr) {
        console.warn("Backend financing API unavailable, falling back to local engine:", networkErr);
      }

      // Local fallback
      const localFin = buildLocalFinancing(liquidityGap, receivables, currentCash);
      setAnalysis(localFin);

    } catch (err) {
      console.error("Financing error:", err);
      setError(err.message || "Unable to run financing analysis.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <ModulePage
      title="Financing Options"
      description="Compare potential ways to address a liquidity gap before making a financing decision."
    >

      {/* =====================================
          HEADER
      ====================================== */}
      <div
        className="cash-success"
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "linear-gradient(135deg, rgba(2,132,199,0.08) 0%, rgba(16,185,129,0.08) 100%)",
          border: "1px solid rgba(2,132,199,0.2)",
          padding: "16px 20px",
          borderRadius: "14px",
        }}
      >
        <div style={{ color: "#0284c7" }}>
          <Brain size={24} />
        </div>
        <div>
          <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
            Decision-Support Financing Analysis
          </strong>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12.5px" }}>
            NexFin compares illustrative non-debt, invoice-financing and working-capital options.
          </p>
        </div>
      </div>

      {/* =====================================
          LIQUIDITY GAP INPUT
      ====================================== */}
      <div className="module-card">
        <div className="section-heading">
          <div
            className="section-heading-icon"
            style={{ background: "rgba(2,132,199,0.1)", color: "#0284c7" }}
          >
            <IndianRupee size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              Liquidity Requirement
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Enter the amount you may need to cover the projected cash gap.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            maxWidth: "500px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Estimated liquidity gap
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontWeight: "800",
                fontSize: "16px",
                color: "#0f172a",
              }}
            >
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="10000"
              value={liquidityGap}
              onChange={(e) =>
                setLiquidityGap(
                  Number(
                    e.target.value
                  )
                )
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: "14px",
                fontWeight: "700",
              }}
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "13px",
              boxShadow: "0 4px 14px rgba(2,132,199,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Analyzing Options..." : "Compare Options"}
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
          }}
        >

          <AlertTriangle size={20} />

          <div>

            <strong>
              Analysis failed
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          RESULTS
      ====================================== */}

      {analysis && (

        <>

          {/* Recommendation */}

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
                <CheckCircle size={19} />
              </div>

              <div>

                <h2>
                  NexFin's Analysis
                </h2>

                <p>
                  An explainable comparison based
                  on the assumptions provided.
                </p>

              </div>

            </div>


            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                borderRadius: "10px",
                background: "#f9fafb",
              }}
            >

              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: "#6b7280",
                }}
              >
                SUGGESTED DIRECTION
              </span>

              <h2
                style={{
                  margin:
                    "6px 0",
                }}
              >
                {
                  analysis
                    .recommendation
                    ?.recommended_option
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                {
                  analysis
                    .recommendation
                    ?.reason
                }
              </p>

            </div>

          </div>


          {/* Options */}

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
                <Wallet size={19} />
              </div>

              <div>

                <h2>
                  Compare Financing Options
                </h2>

                <p>
                  Estimated costs are illustrative
                  and must be verified with providers.
                </p>

              </div>

            </div>


            <div
              className="module-grid"
              style={{
                marginTop: "20px",
              }}
            >

              {(
                analysis.options ||
                []
              ).map(
                (option) => (

                  <div
                    key={option.type}
                    style={{
                      padding: "18px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "10px",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                      }}
                    >

                      <div>
                        {
                          getOptionIcon(
                            option.type
                          )
                        }
                      </div>

                      <strong>
                        {option.name}
                      </strong>

                    </div>


                    <p
                      style={{
                        margin:
                          "12px 0",
                        fontSize: "10px",
                        color: "#6b7280",
                        lineHeight: "1.5",
                      }}
                    >
                      {
                        option.description
                      }
                    </p>


                    <div
                      style={{
                        display: "grid",
                        gap: "8px",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >

                        <span>
                          Funding
                        </span>

                        <strong>
                          {formatMoney(
                            option
                              .funding_amount
                          )}
                        </strong>

                      </div>


                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >

                        <span>
                          Estimated Cost
                        </span>

                        <strong>
                          {formatMoney(
                            option
                              .estimated_cost
                          )}
                        </strong>

                      </div>


                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >

                        <span>
                          Total Repayment
                        </span>

                        <strong>
                          {formatMoney(
                            option
                              .estimated_total_repayment
                          )}
                        </strong>

                      </div>


                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >

                        <span>
                          Risk
                        </span>

                        <span
                          className={
                            getRiskClass(
                              option
                                .risk_level
                            )
                          }
                          style={{
                            padding:
                              "4px 7px",
                            borderRadius:
                              "5px",
                            fontSize:
                              "9px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {
                            option
                              .risk_level
                          }
                        </span>

                      </div>


                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >

                        <span>
                          Score
                        </span>

                        <strong>
                          {
                            Number(
                              option.score ||
                              0
                            ).toFixed(0)
                          }
                          /100
                        </strong>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* Important information */}

          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              borderRadius: "10px",
              background: "#f9fafb",
              border:
                "1px solid #e5e7eb",
              fontSize: "9px",
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >

            <strong>
              Important:
            </strong>{" "}

            Financing rates, fees, eligibility,
            collateral requirements and repayment
            terms shown here are illustrative.
            NexFin does not approve, reject or
            originate loans.

          </div>

        </>

      )}

    </ModulePage>
  );
}


export default Financing;