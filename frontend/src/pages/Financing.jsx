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

import {
  getFinancialData,
} from "../data/financialStore";


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


      const data =
        getFinancialData();


      const response =
        await fetch(
          "https://fintwin-h7pc.onrender.com",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              liquidity_gap:
                Number(
                  liquidityGap
                ),

              outstanding_receivables:
                data.invoices
                  .filter(
                    (invoice) =>
                      String(
                        invoice.status ||
                        ""
                      ).toLowerCase()
                      !== "paid"
                  )
                  .reduce(
                    (
                      total,
                      invoice
                    ) =>
                      total +
                      Number(
                        invoice.amount ||
                        0
                      ),
                    0
                  ),

              current_cash:
                Number(
                  data.business
                    .openingCash ||
                  0
                ),

            }),
          }
        );


      if (!response.ok) {

        throw new Error(
          `Financing API returned ${response.status}`
        );

      }


      const result =
        await response.json();


      if (!result.success) {

        throw new Error(
          "Financing analysis failed."
        );

      }


      setAnalysis(
        result.financing
      );

    } catch (err) {

      console.error(
        "Financing error:",
        err
      );

      setError(
        err.message ||
        "Unable to generate financing analysis."
      );

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
        }}
      >

        <Brain size={21} />

        <div>

          <strong>
            Decision-Support Financing Analysis
          </strong>

          <p>
            FinTwin compares illustrative
            non-debt, invoice-financing and
            working-capital options.
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
          >
            <IndianRupee size={19} />
          </div>

          <div>

            <h2>
              Liquidity Requirement
            </h2>

            <p>
              Enter the amount you may need to
              cover the projected cash gap.
            </p>

          </div>

        </div>


        <div
          style={{
            marginTop: "22px",
            maxWidth: "500px",
          }}
        >

          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "700",
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
                fontWeight: "700",
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
                padding: "10px",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />

          </div>


          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              marginTop: "15px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "700",
            }}
          >

            {loading
              ? "Analyzing..."
              : "Compare Options"}

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
                  FinTwin's Analysis
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
            FinTwin does not approve, reject or
            originate loans.

          </div>

        </>

      )}

    </ModulePage>
  );
}


export default Financing;