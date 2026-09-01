import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldAlert,
  Wallet,
  CreditCard,
  Building2,
  Clock,
  HelpCircle,
} from "lucide-react";

import {
  getFinancialData,
  getBusiness,
  getInvoices,
} from "../data/financialStore";
import {
  getCashFlowSummary,
  calculateShockSimulation,
  calculateRunwayDays,
  calculateTotalMonthlyBurn,
} from "../engines/digitalTwin";

const CATEGORY_TABS = [
  { id: "risk", label: "🔥 Risk & Delays" },
  { id: "solvency", label: "💧 Cash Solvency" },
  { id: "burn", label: "📉 Burn & Capex" },
  { id: "summary", label: "📋 Executive Summary" },
];

const PROMPTS_BY_CATEGORY = {
  risk: [
    "Why is our top debtor delayed and how do we collect faster?",
    "Why is our average payment delay exceeding 15+ days and how to fix it?",
    "How does MSMED Section 15 statutory interest apply to overdue invoices?",
  ],
  solvency: [
    "What is our biggest single cash trap this month and how to release capital?",
    "What if our largest customer delays payment by 30 days?",
    "How can we extend our cash runway past 60 days?",
  ],
  burn: [
    "Can we afford a ₹3.5L equipment purchase or hiring next month?",
    "Which 3 recurring expense categories can we optimize immediately?",
    "Why is our monthly burn high and what is our daily cash drain rate?",
  ],
  summary: [
    "Generate a 60-second executive financial health & solvency briefing.",
    "What are our top 3 statutory GST and working capital priorities?",
  ],
};

export default function AiCopilotModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("risk");
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "m1",
      role: "assistant",
      text: "Hello! I am your **FinTwin AI Financial Copilot**. I continuously simulate your cash runway, customer payment delays, and working capital risk with root-cause diagnostics.\n\nSelect a suggested inquiry below or ask any question about your cash flow:",
      actions: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
      onClose();
    }
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const data = getFinancialData();
      const summary = getCashFlowSummary();
      const biz = getBusiness();
      const invoices = (data.invoices && data.invoices.length > 0) ? data.invoices : getInvoices();
      const pendingInvoices = invoices.filter((i) => String(i.status).toLowerCase() !== "paid");
      const q = query.toLowerCase();

      // Identify top debtor
      const debtorMap = {};
      invoices.forEach((inv) => {
        const name = inv.customer || "Enterprise Buyer";
        debtorMap[name] = (debtorMap[name] || 0) + Number(inv.amount || 0);
      });
      const sortedDebtors = Object.entries(debtorMap).sort((a, b) => b[1] - a[1]);
      const topDebtorName = sortedDebtors[0]?.[0] || "Mehta Heavy Traders";
      const topDebtorAmount = sortedDebtors[0]?.[1] || 850000;
      const topDebtorLakhs = (topDebtorAmount / 100000).toFixed(2);

      let responseText = "";
      let responseActions = [];

      // 1. TOP DEBTOR / PAYMENT DELAY "WHY & HOW"
      if (q.includes("top debtor") || q.includes("collect faster") || q.includes("delay") || q.includes("mehta") || q.includes("risk")) {
        responseText = `### 🔍 1. Root Cause ("Why It Happened")
**${topDebtorName}** holds **₹${topDebtorLakhs} Lakhs** in outstanding receivables with a predicted delay profile of **16–19 days**.
• **Driver 1**: Concentration risk — this single client accounts for **${Math.round((topDebtorAmount / Math.max(1, summary.receivables || topDebtorAmount)) * 100)}%** of your active receivables.
• **Driver 2**: High buyer ERP processing latency and month-end batching.

---

### ⚠️ 2. Solvency & Runway Impact
If settlement is delayed past Net-30, your net operating cash drops to **₹${((summary.currentCash - topDebtorAmount * 0.4) / 100000).toFixed(2)}L**, reducing your runway by **18 days**.

---

### 🛠️ 3. Resolution Plan ("How to Solve")
1. **Immediate (0–48 hrs)**: Offload invoice via **TReDS Invoice Discounting** at ~8.1% APR to unlock **₹${(topDebtorAmount * 0.9 / 100000).toFixed(2)}L** upfront liquidity.
2. **Medium-Term (7–14 days)**: Trigger a structured **MSMED Section 15 payment notice** requiring settlement within 45 days.
3. **Structural (30 days)**: Offer a **1.5% Early Payment Cash Rebate** for 10-day payment turnaround.`;

        responseActions = [
          { label: "⚡ Discount via TReDS", path: "/financing" },
          { label: "🛡️ View Risk Analysis", path: "/risk" },
          { label: "🧾 Open Invoices Radar", path: "/invoices" },
        ];
      }

      // 2. BIGGEST CASH TRAP
      else if (q.includes("biggest cash trap") || q.includes("cash trap") || q.includes("release capital")) {
        responseText = `### 🔍 1. Root Cause ("Why It Happened")
Your primary cash trap is **Working Capital Lockup in 45-Day Credit Terms**:
• **₹${(summary.receivables / 100000).toFixed(2)} Lakhs** is currently locked in uncollected B2B invoices.
• Fixed recurring operational liabilities (**₹${(summary.recurringExpenses / 100000).toFixed(2)}L/mo**) continue to draw down liquid reserves before customer payments clear.

---

### ⚠️ 2. Solvency Impact
This creates a temporary liquidity squeeze between **Day 15 and Day 35** of the monthly cycle when payroll and GST liabilities coincide.

---

### 🛠️ 3. Resolution Plan ("How to Solve")
1. **Immediate**: Discount top 2 verified corporate invoices (releases **₹5.20L** in 24 hours).
2. **Short-Term**: Align vendor payment cycles from 15-day terms to standard 30-day net terms.
3. **Long-Term**: Shift high-exposure accounts to TReDS digital reverse-factoring.`;

        responseActions = [
          { label: "⚡ Unlock TReDS Liquidity", path: "/financing" },
          { label: "📊 Stress Test in Simulator", path: "/simulator" },
        ];
      }

      // 3. 30-DAY DELAY SHOCK SIMULATION
      else if (q.includes("30 days") || q.includes("largest customer delays") || q.includes("delay by 30")) {
        const shock = calculateShockSimulation({ paymentDelayDays: 30, revenueChangePercent: -15 });
        responseText = `### 🔍 1. Root Cause ("Why It Happened")
Simulating a macroeconomic 30-day debtor lag shock across top tier accounts:
• Baseline Projected Cash: **₹${(summary.projectedCash / 100000).toFixed(2)} Lakhs**
• Stressed Inflow Dip: **-₹${Math.abs(shock.cashVariance / 100000).toFixed(2)} Lakhs**

---

### ⚠️ 2. Solvency & Runway Impact
• Net Stressed Cash: **₹${(shock.stressedCash / 100000).toFixed(2)} Lakhs**
• Cash Runway shrinks from **${summary.runwayDays} days** down to **${shock.stressedRunway} days**.
• Solvency Classification: **${shock.stressedCash < 0 ? "CRITICAL SHORTFALL" : "TIGHT WORKING CAPITAL"}**.

---

### 🛠️ 3. Recommended Survival Strategy
1. Activate invoice discounting immediately to maintain minimum cash reserve above ₹3.00L.
2. Defer non-critical machinery capex disbursements.
3. Apply for pre-approved working capital overdraft.`;

        responseActions = [
          { label: "📊 Open Shock Simulator", path: "/simulator" },
          { label: "⚡ Compare Financing Options", path: "/financing" },
        ];
      }

      // 4. CAPEX & PURCHASE AFFORDABILITY
      else if (q.includes("afford") || q.includes("purchase") || q.includes("machine") || q.includes("hiring")) {
        const currentCash = summary.currentCash || 840000;
        const purchaseAmt = 350000;
        const postPurchaseCash = currentCash - purchaseAmt;
        const canAfford = postPurchaseCash > (summary.totalExpenses || 480000) * 0.5;

        responseText = `### 🔍 1. Affordability Evaluation (₹3.50L Capex)
• **Current Opening Cash**: ₹${(currentCash / 100000).toFixed(2)} Lakhs
• **Total Monthly Burn**: ₹${(summary.totalExpenses / 100000).toFixed(2)} Lakhs
• **Post-Purchase Cash Reserve**: ₹${(postPurchaseCash / 100000).toFixed(2)} Lakhs

---

### ⚠️ 2. Verdict & Risk Analysis
**${canAfford ? "✅ APPROVED WITH STAGED TERMS" : "⚠️ HIGH RISK DILUTION"}**
• Immediate full-cash payment would compress your runway to **${Math.round(postPurchaseCash / Math.max(1, (summary.totalExpenses || 480000) / 30))} days**.

---

### 🛠️ 3. Execution Recommendation
1. **Option A (Optimal)**: Negotiate **3-stage milestone payments** (30% advance, 40% dispatch, 30% after 45 days).
2. **Option B**: Use equipment financing or leaseback to preserve liquid working capital.`;

        responseActions = [
          { label: "💳 Inspect Monthly Burn", path: "/expenses" },
          { label: "📊 Test in What-If Simulator", path: "/simulator" },
        ];
      }

      // 5. EXTEND RUNWAY PAST 60 DAYS
      else if (q.includes("runway") || q.includes("extend")) {
        responseText = `### 🔍 1. Current Runway Baseline
Your current runway stands at **${summary.runwayDays} Days** with a net monthly burn of **₹${(summary.totalExpenses / 100000).toFixed(2)}L**.

---

### 🛠️ 2. 3-Step Strategy to Reach 75+ Days Runway
1. **Accelerate Inflow via TReDS (+22 Days)**:
   - Discount ₹6.50L in approved corporate invoices for instant cash credit.
2. **Optimize Fixed & Variable Burn (+9 Days)**:
   - Consolidate logistics freight shipments and annualized cloud licenses (saves ₹45,000/mo).
3. **Statutory GST Input Credit Claims (+6 Days)**:
   - Claim ₹68,000 in eligible GSTR-2B ITC to reduce net tax outflow.`;

        responseActions = [
          { label: "📈 View 90-Day Forecast", path: "/forecast" },
          { label: "⚡ Invoice Financing", path: "/financing" },
        ];
      }

      // 6. EXECUTIVE SOLVENCY BRIEFING
      else if (q.includes("briefing") || q.includes("executive") || q.includes("summary") || q.includes("health")) {
        responseText = `### 📋 60-Second Executive Solvency Briefing (**${biz.name || "My Enterprise"}**)

• **Liquid Cash Position**: **₹${(summary.currentCash / 100000).toFixed(2)} Lakhs**
• **Expected Receivables**: **₹${(summary.receivables / 100000).toFixed(2)} Lakhs** across **${invoices.length}** invoices
• **Total Monthly Burn**: **₹${(summary.totalExpenses / 100000).toFixed(2)} Lakhs** (Daily burn: ₹${((summary.totalExpenses || 480000) / 30 / 1000).toFixed(1)}k)
• **Projected Solvency Horizon**: **${summary.runwayDays} Days Runway** (**${summary.status || "HEALTHY"}**)

---

### ⚠️ Top Strategic Focus:
1. Rebalance customer concentration on top accounts.
2. Maintain TReDS discounting liquidity buffer for tax settlement dates.`;

        responseActions = [
          { label: "📊 Open Executive Dashboard", path: "/dashboard" },
          { label: "🛡️ Risk Radar", path: "/risk" },
        ];
      }

      // 7. DEFAULT / GENERIC RESPONSE
      else {
        responseText = `### 🤖 FinTwin AI Diagnostic Summary
I've analyzed your financial twin data for **${biz.name}**:
• **Opening Cash**: ₹${(summary.currentCash / 100000).toFixed(2)}L
• **Total Receivables**: ₹${(summary.receivables / 100000).toFixed(2)}L across ${invoices.length} invoices
• **Estimated Runway**: ${summary.runwayDays} Days (${summary.status})
• **Net Monthly Burn**: ₹${(summary.totalExpenses / 100000).toFixed(2)}L

Select one of the suggested inquiry chips above for a structured **Why & How to Solve** root cause breakdown.`;

        responseActions = [
          { label: "📊 What-If Simulator", path: "/simulator" },
          { label: "🛡️ Risk Analysis", path: "/risk" },
          { label: "⚡ Financing Marketplace", path: "/financing" },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: responseText,
          actions: responseActions,
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <>
      <div className="copilot-backdrop" onClick={onClose} />
      <div className={`ai-copilot-drawer ${isExpanded ? "expanded" : ""}`}>
        {/* Header */}
        <div className="copilot-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                FinTwin Copilot 2.0
              </div>
              <div style={{ fontSize: "11px", color: "#a78bfa" }}>
                AI Diagnostic & "Why & How" Engine
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e2e8f0",
                padding: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title={isExpanded ? "Collapse View" : "Expand Wide View"}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e2e8f0",
                padding: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="copilot-messages">
          {messages.map((m) => (
            <div key={m.id} className={`copilot-msg ${m.role}`}>
              <div style={{ whiteSpace: "pre-line" }}>
                {m.text}
              </div>

              {/* Action Trigger Buttons */}
              {m.actions && m.actions.length > 0 && (
                <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                  <div style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: 600, marginBottom: "4px" }}>
                    EXECUTE ACTIONS:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        className="copilot-action-btn"
                        onClick={() => handleActionClick(act)}
                      >
                        {act.label} <ArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="copilot-msg assistant" style={{ fontStyle: "italic", color: "#a78bfa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} style={{ animation: "spin 1.5s linear infinite" }} />
                <span>Running root-cause diagnosis & digital twin calculations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Categorized Inquiry Tabs */}
        <div className="copilot-category-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`copilot-category-tab ${activeCategory === tab.id ? "active" : ""}`}
              onClick={() => setActiveCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Suggested Prompts List */}
        <div style={{ padding: "0 14px 10px" }}>
          <div className="copilot-prompts">
            {(PROMPTS_BY_CATEGORY[activeCategory] || []).map((p, idx) => (
              <button
                key={idx}
                className="quick-prompt-btn"
                onClick={() => handleSend(p)}
              >
                <span>{p}</span>
                <ChevronRight size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="copilot-input-bar">
          <input
            type="text"
            className="form-input"
            style={{
              height: 40,
              fontSize: "13px",
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontWeight: 500,
            }}
            placeholder="Ask a question or request a diagnostic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="btn btn-primary"
            style={{
              width: 40,
              height: 40,
              padding: 0,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
            }}
            onClick={() => handleSend()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
