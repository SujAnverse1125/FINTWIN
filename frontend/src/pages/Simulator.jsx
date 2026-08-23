import { useState } from "react";
import {
  AlertTriangle,
  Brain,
  TrendingDown,
  TrendingUp,
  Clock,
  RotateCcw,
} from "lucide-react";

import ModulePage from "../components/ModulePage";

import {
  getFinancialData,
} from "../data/financialStore";


function Simulator() {

  const [revenueChange, setRevenueChange] =
    useState(0);

  const [expenseChange, setExpenseChange] =
    useState(0);

  const [paymentDelay, setPaymentDelay] =
    useState(0);

  const [simulation, setSimulation] =
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
  // RUN SIMULATION
  // ==========================================

  async function runSimulation() {

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

              current_cash:
                data.business.openingCash,

              invoices:
                data.invoices,

              recurring_expenses:
                data.recurringExpenses,

              one_time_expenses:
                data.expenses,

              revenue_change_percent:
                revenueChange,

              expense_change_percent:
                expenseChange,

              payment_delay_days:
                paymentDelay,

            }),
          }
        );


      if (!response.ok) {

        throw new Error(
          `Simulator API returned ${response.status}`
        );

      }


      const result =
        await response.json();


      if (!result.success) {

        throw new Error(
          "Simulation failed."
        );

      }


      setSimulation(
        result.simulation
      );

    } catch (err) {

      console.error(
        "Simulator error:",
        err
      );

      setError(
        err.message ||
        "Unable to run simulation."
      );

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

  function getScenarioIcon(
    scenario
  ) {

    if (
      scenario ===
      "Revenue Shock"
    ) {

      return <TrendingDown size={18} />;

    }

    if (
      scenario ===
      "Expense Shock"
    ) {

      return <TrendingUp size={18} />;

    }

    if (
      scenario ===
      "Payment Delay"
    ) {

      return <Clock size={18} />;

    }

    if (
      scenario ===
      "Combined Shock"
    ) {

      return <AlertTriangle size={18} />;

    }

    return <Brain size={18} />;
  }


  return (
    <ModulePage
      title="Shock Simulator"
      description="Test financial scenarios before making important business decisions."
    >

      {/* =====================================
          INTRO
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
            Financial What-If Simulator
          </strong>

          <p>
            Adjust the assumptions below to
            understand how different shocks could
            affect your available cash.
          </p>

        </div>

      </div>


      {/* =====================================
          CONTROLS
      ====================================== */}

      <div className="module-card">

        <div className="section-heading">

          <div
            className="section-heading-icon"
          >
            <Brain size={19} />
          </div>

          <div>

            <h2>
              Scenario Assumptions
            </h2>

            <p>
              Change one or more assumptions and
              run the financial simulation.
            </p>

          </div>

        </div>


        <div
          style={{
            marginTop: "25px",
            display: "grid",
            gap: "28px",
          }}
        >

          {/* Revenue */}

          <div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >

              <strong>
                Revenue Change
              </strong>

              <strong>
                {revenueChange}%
              </strong>

            </div>

            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={revenueChange}
              onChange={(e) =>
                setRevenueChange(
                  Number(e.target.value)
                )
              }
              style={{
                width: "100%",
              }}
            />

            <small
              style={{
                color: "#6b7280",
              }}
            >
              Negative values simulate a
              revenue decline.
            </small>

          </div>


          {/* Expenses */}

          <div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >

              <strong>
                Expense Change
              </strong>

              <strong>
                +{expenseChange}%
              </strong>

            </div>

            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={expenseChange}
              onChange={(e) =>
                setExpenseChange(
                  Number(e.target.value)
                )
              }
              style={{
                width: "100%",
              }}
            />

            <small
              style={{
                color: "#6b7280",
              }}
            >
              Simulate an increase in
              business expenses.
            </small>

          </div>


          {/* Payment Delay */}

          <div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >

              <strong>
                Customer Payment Delay
              </strong>

              <strong>
                {paymentDelay} days
              </strong>

            </div>

            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={paymentDelay}
              onChange={(e) =>
                setPaymentDelay(
                  Number(e.target.value)
                )
              }
              style={{
                width: "100%",
              }}
            />

            <small
              style={{
                color: "#6b7280",
              }}
            >
              Simulate customers paying later
              than expected.
            </small>

          </div>

        </div>


        {/* Buttons */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "25px",
          }}
        >

          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
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
              ? "Running..."
              : "Run Simulation"}
          </button>


          <button
            onClick={resetSimulation}
            style={{
              padding: "10px 15px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <RotateCcw
              size={14}
              style={{
                verticalAlign:
                  "middle",
                marginRight: "5px",
              }}
            />

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
          }}
        >

          <AlertTriangle size={20} />

          <div>

            <strong>
              Simulation failed
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

      {simulation && (

        <>

          {/* Base Position */}

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
                  Current Financial Position
                </h2>

                <p>
                  Baseline used by the simulator.
                </p>

              </div>

            </div>


            <div
              className="module-grid"
              style={{
                marginTop: "18px",
              }}
            >

              <div className="module-stat">

                <span>
                  CURRENT CASH
                </span>

                <strong>
                  {formatMoney(
                    simulation.base
                      ?.current_cash
                  )}
                </strong>

              </div>


              <div className="module-stat">

                <span>
                  RECEIVABLES
                </span>

                <strong>
                  {formatMoney(
                    simulation.base
                      ?.receivables
                  )}
                </strong>

              </div>


              <div className="module-stat">

                <span>
                  TOTAL EXPENSES
                </span>

                <strong>
                  {formatMoney(
                    simulation.base
                      ?.total_expenses
                  )}
                </strong>

              </div>


              <div className="module-stat">

                <span>
                  NET POSITION
                </span>

                <strong>
                  {formatMoney(
                    simulation.base
                      ?.net_position
                  )}
                </strong>

              </div>

            </div>

          </div>


          {/* Scenario Results */}

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
                  Scenario Results
                </h2>

                <p>
                  Compare the impact of different
                  financial shocks.
                </p>

              </div>

            </div>


            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gap: "12px",
              }}
            >

              {(
                simulation.scenarios ||
                []
              ).map(
                (scenario, index) => (

                  <div
                    key={`${scenario.scenario}-${index}`}
                    style={{
                      padding: "16px",
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

                      <div
                        style={{
                          color:
                            scenario.risk ===
                            "HIGH"
                              ? "#dc2626"
                              : scenario.risk ===
                                "MEDIUM"
                                ? "#a16207"
                                : "#15803d",
                        }}
                      >
                        {getScenarioIcon(
                          scenario.scenario
                        )}
                      </div>


                      <strong
                        style={{
                          flex: 1,
                        }}
                      >
                        {scenario.scenario}
                      </strong>


                      <span
                        className={
                          getRiskClass(
                            scenario.risk
                          )
                        }
                        style={{
                          padding:
                            "5px 8px",
                          borderRadius:
                            "6px",
                          fontSize:
                            "9px",
                          fontWeight:
                            "700",
                        }}
                      >
                        {scenario.risk}
                      </span>

                    </div>


                    <div
                      className="module-grid"
                      style={{
                        marginTop: "14px",
                      }}
                    >

                      <div>

                        <small
                          style={{
                            color:
                              "#6b7280",
                          }}
                        >
                          PROJECTED CASH
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                          }}
                        >
                          {formatMoney(
                            scenario.projected_cash
                          )}
                        </strong>

                      </div>


                      <div>

                        <small
                          style={{
                            color:
                              "#6b7280",
                          }}
                        >
                          CASH IMPACT
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            color:
                              Number(
                                scenario.cash_impact
                              ) < 0
                                ? "#dc2626"
                                : "#15803d",
                          }}
                        >
                          {formatMoney(
                            scenario.cash_impact
                          )}
                        </strong>

                      </div>


                      <div>

                        <small
                          style={{
                            color:
                              "#6b7280",
                          }}
                        >
                          LIQUIDITY GAP
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            color:
                              Number(
                                scenario.liquidity_gap
                              ) > 0
                                ? "#dc2626"
                                : "#15803d",
                          }}
                        >
                          {formatMoney(
                            scenario.liquidity_gap
                          )}
                        </strong>

                      </div>

                    </div>


                    <p
                      style={{
                        margin:
                          "12px 0 0",
                        fontSize:
                          "10px",
                        lineHeight:
                          "1.5",
                        color:
                          "#6b7280",
                      }}
                    >
                      {scenario.explanation}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>


          {/* Assumptions */}

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
            }}
          >

            <strong>
              Simulation assumptions:
            </strong>{" "}

            Revenue{" "}
            {revenueChange}%,
            {" "}
            Expenses +{expenseChange}%,
            {" "}
            Payment delay{" "}
            {paymentDelay} days.

            These are scenario estimates and
            should not be interpreted as guaranteed
            financial outcomes.

          </div>

        </>

      )}

    </ModulePage>
  );
}


export default Simulator;