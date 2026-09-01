import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import {
  getFinancialData,
  getRecurringExpenses,
  getExpenses,
  addExpense,
  deleteExpense,
  subscribeFinancialData,
} from "../data/financialStore";
import {
  calculateRecurringExpenses,
  calculateOneTimeExpenses,
  calculateTotalMonthlyBurn,
} from "../engines/digitalTwin";

const COLORS = [
  "#7A9CAE",
  "#1C6758",
  "#C78150",
  "#C07F7F",
  "#425F6B",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

export default function Expenses() {
  const [data, setData] = useState(getFinancialData());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Form State
  const [category, setCategory] = useState("Payroll & Salaries");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setData(getFinancialData());
    });
    return unsub;
  }, []);

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  const totalRecurring = calculateRecurringExpenses();
  const totalOneTime = calculateOneTimeExpenses();
  const totalBurn = calculateTotalMonthlyBurn();

  // Category breakdown data for charts
  const categoryMap = {};
  data.recurringExpenses.forEach((r) => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + Number(r.amount || 0);
  });
  data.expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount || 0);
  });

  const chartData = Object.keys(categoryMap).map((k) => ({
    name: k,
    value: categoryMap[k],
  }));

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      category,
      description: description || category,
      amount: Number(amount),
      recurring,
      dayOfMonth: Number(dayOfMonth),
    });

    setDescription("");
    setAmount("");
    setShowAddModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Metric Cards */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Monthly Burn</span>
            <div className="card-icon-wrap rose">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C07F7F" }}>
              {formatLakhs(totalBurn)}
            </span>
          </div>
          <div className="kpi-trend negative">
            <span>₹{(totalBurn / 30 / 1000).toFixed(1)}k Daily Burn Rate</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Fixed Recurring Liabilities</span>
            <div className="card-icon-wrap amber">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C78150" }}>
              {formatLakhs(totalRecurring)}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>{data.recurringExpenses.length} Fixed Subscriptions / Payroll</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Variable & One-Time Spend</span>
            <div className="card-icon-wrap">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#7A9CAE" }}>
              {formatLakhs(totalOneTime)}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>{data.expenses.length} Logged Variable Invoices</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Burn Optimization Potential</span>
            <div className="card-icon-wrap emerald">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#1C6758" }}>
              ₹0.85L
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>AI identified 3 reducible cost centers</span>
          </div>
        </div>
      </div>

      {/* Expense Analytics & Category Breakdown */}
      <div className="grid-12">
        {/* Pie Breakdown */}
        <div className="col-span-6 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap purple">
                <PieIcon size={18} />
              </div>
              <div>
                <div className="card-title">Expense Distribution by Category</div>
                <div className="card-subtitle">Aggregated fixed & variable expenditure</div>
              </div>
            </div>
          </div>

          <div style={{ height: 260, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(13, 18, 31, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`₹${(Number(val) / 100000).toFixed(2)} Lakhs`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Cost Optimization Insights */}
        <div className="col-span-6 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="card-title">AI Burn Optimization Insights</div>
                <div className="card-subtitle">Actionable cost rationalization</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Log Expense
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#7A9CAE" }}>
                💡 Vendor Term Renegotiation
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Raw material supplier invoicing on 15-day cycles. Switching to standard 30-day net terms retains ₹1.80L cash buffer for 2 extra weeks.
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1C6758" }}>
                ⚡ Software & SaaS Rationalization
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Annualized cloud licenses save ₹35,000 compared to month-to-month billing cycles.
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#C78150" }}>
                🚛 Freight Consolidation
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Consolidating bi-weekly carrier dispatches into weekly batches can trim 12% in logistics freight surcharges.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Listings Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="card-title">Expense Itemization</div>
              <div className="card-subtitle">Active recurring & one-time operational costs</div>
            </div>
          </div>

          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Items
            </button>
            <button
              className={`tab-btn ${activeTab === "recurring" ? "active" : ""}`}
              onClick={() => setActiveTab("recurring")}
            >
              Recurring ({data.recurringExpenses.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "variable" ? "active" : ""}`}
              onClick={() => setActiveTab("variable")}
            >
              One-Time ({data.expenses.length})
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Cadence / Date</th>
                <th>Classification</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "all" || activeTab === "recurring") &&
                data.recurringExpenses.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>{rec.category}</td>
                    <td>{rec.description}</td>
                    <td style={{ fontWeight: 700, color: "#C78150" }}>
                      {formatLakhs(rec.amount)}
                    </td>
                    <td>Monthly (Day {rec.dayOfMonth})</td>
                    <td>
                      <span className="status-badge" style={{ background: "rgba(139,92,246,0.15)", color: "#425F6B" }}>
                        Fixed Recurring
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px" }}
                        onClick={() => deleteExpense(rec.id, true)}
                        title="Remove Expense"
                      >
                        <Trash2 size={13} style={{ color: "#C07F7F" }} />
                      </button>
                    </td>
                  </tr>
                ))}

              {(activeTab === "all" || activeTab === "variable") &&
                data.expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>{exp.category}</td>
                    <td>{exp.description}</td>
                    <td style={{ fontWeight: 700, color: "#7A9CAE" }}>
                      {formatLakhs(exp.amount)}
                    </td>
                    <td>{exp.date || "2026-08-10"}</td>
                    <td>
                      <span className="status-badge" style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                        One-Time
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px" }}
                        onClick={() => deleteExpense(exp.id, false)}
                        title="Remove Expense"
                      >
                        <Trash2 size={13} style={{ color: "#C07F7F" }} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Record Expense</div>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Payroll & Salaries">Payroll & Salaries</option>
                  <option value="Raw Materials">Raw Materials & Supplies</option>
                  <option value="Facility & Rent">Facility & Warehouse Rent</option>
                  <option value="Utilities & Power">Utilities & Power</option>
                  <option value="Logistics & Freight">Logistics & Freight</option>
                  <option value="Software & SaaS">Software & Cloud Subscriptions</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="General & Misc">General & Misc</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Monthly CNC Tooling purchase"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 120000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <input
                  type="checkbox"
                  id="recCheck"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--accent-blue)" }}
                />
                <label htmlFor="recCheck" style={{ fontSize: 13, cursor: "pointer", color: "var(--text-primary)" }}>
                  Monthly recurring liability
                </label>
              </div>

              {recurring && (
                <div className="form-group">
                  <label className="form-label">Billing Day of Month (1-28)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    className="form-input"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}