import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

import {
  getFinancialData,
  getBusiness,
  getInvoices,
} from "../data/financialStore";
import {
  getCashFlowSummary,
  calculateShockSimulation,
} from "../engines/digitalTwin";

const quickPrompts = [
  "What is our biggest cash trap this month?",
  "What if our largest customer delays payment by 30 days?",
  "Can we afford a ₹2.5L machine purchase next week?",
  "How can we extend our runway past 60 days?",
];

export default function AiCopilotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "m1",
      role: "assistant",
      text: "Hello! I am your FinTwin AI Financial Copilot. I continuously simulate your business cash flow, customer payment delays, and working capital risk. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const summary = getCashFlowSummary();
      const biz = getBusiness();
      const invoices = getInvoices();
      const q = query.toLowerCase();

      let reply = "";

      if (q.includes("biggest cash trap") || q.includes("cash risk") || q.includes("delay")) {
        reply = `Based on your digital twin simulation, your biggest cash vulnerability is **Customer A (Auto Corp)** holding **₹6.30 Lakhs** across pending invoices with an average historical delay of 18 days. If this client delays by another 15 days, your net projected cash buffer will dip below the ₹3.00L safety threshold.`;
      } else if (q.includes("30 days") || q.includes("largest customer delays")) {
        const shock = calculateShockSimulation({ paymentDelayDays: 30 });
        reply = `Simulating a 30-day payment delay from major accounts:
• Projected Cash drops to: **₹${(shock.stressedCash / 100000).toFixed(2)} Lakhs** (a deficit of ₹${Math.abs(shock.cashVariance / 100000).toFixed(2)}L)
• Estimated runway drops from **${shock.baselineRunway} days** to **${shock.stressedRunway} days**.
• Recommended action: Initiate TReDS invoice discounting on Invoice #INV-1001 to release ₹2.80L immediately.`;
      } else if (q.includes("afford") || q.includes("purchase") || q.includes("machine")) {
        reply = `Evaluating a ₹2.50 Lakh capex purchase against your current runway:
• Current Liquid Cash: **₹${(summary.currentCash / 100000).toFixed(2)} Lakhs**
• Monthly Net Burn: **₹${(summary.totalExpenses / 100000).toFixed(2)} Lakhs**
Verdict: You have sufficient liquidity to purchase the machine, but your cash runway will temporarily tighten to 28 days until your pending invoices clear. We recommend staging payments across 2 installments.`;
      } else if (q.includes("runway") || q.includes("extend")) {
        reply = `Here are 3 AI-optimized recommendations to extend your runway to 75+ days:
1. **Invoice Discounting**: Discount INV-1001 & INV-1005 (release ₹5.00L liquid cash within 48 hours).
2. **Payment Terms Restructuring**: Offer a 2% early settlement discount to Customer B to collect ₹1.80L 10 days earlier.
3. **Variable Burn Optimization**: Defer non-critical machinery servicing and logistics freight batches.`;
      } else {
        reply = `I've analyzed your financial twin model for **${biz.name}**:
• Current Cash: ₹${(summary.currentCash / 100000).toFixed(2)}L
• Total Receivables: ₹${(summary.receivables / 100000).toFixed(2)}L
• Estimated Runway: ${summary.runwayDays} Days
• Health Status: **${summary.status}**
Would you like me to simulate a what-if stress scenario or check working capital financing options?`;
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      <div className="copilot-backdrop" onClick={onClose} />
      <div className="ai-copilot-drawer">
        {/* Header */}
        <div className="copilot-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Sparkles size={15} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
              FinTwin Copilot
            </div>
            <div style={{ fontSize: 10.5, color: "#a78bfa" }}>
              Active Twin Diagnostic
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ color: "var(--text-muted)", padding: 4 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="copilot-messages">
        {messages.map((m) => (
          <div key={m.id} className={`copilot-msg ${m.role}`}>
            {m.text}
          </div>
        ))}

        {isTyping && (
          <div className="copilot-msg assistant" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
            FinTwin is running simulation calculations...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "0 14px 10px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-dim)", marginBottom: 4 }}>
          Suggested Inquiries
        </div>
        <div className="copilot-prompts">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="quick-prompt-btn"
              onClick={() => handleSend(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="copilot-input-bar">
        <input
          type="text"
          className="form-input"
          style={{ height: 38, fontSize: 12.5 }}
          placeholder="Ask a question about your cash flow..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="btn btn-primary"
          style={{ width: 38, height: 38, padding: 0 }}
          onClick={() => handleSend()}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
    </>
  );
}
