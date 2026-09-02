import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Clock,
  Mail,
  Building,
  ArrowRight,
  FileText,
  Sparkles,
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
  getCustomers,
  getInvoices,
  addCustomer,
  subscribeFinancialData,
} from "../data/financialStore";
import { INDUSTRY_SECTORS } from "../data/sampleData";
import { calculateReceivables } from "../engines/digitalTwin";

const COLORS = ["#7A9CAE", "#1C6758", "#C78150", "#C07F7F", "#425F6B", "#06b6d4"];

export default function Customers() {
  const [customers, setCustomers] = useState(getCustomers());
  const [invoices, setInvoices] = useState(getInvoices());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Manufacturing");
  const [contactEmail, setContactEmail] = useState("");
  const [creditScore, setCreditScore] = useState("Medium Risk");
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setCustomers(getCustomers());
      setInvoices(getInvoices());
    });
    return unsub;
  }, []);

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  const totalReceivables = calculateReceivables();

  // Calculate outstanding balance and concentration per customer
  const customerMetrics = customers.map((c) => {
    const custInvoices = invoices.filter((i) => i.customer === c.name || i.customerId === c.id);
    const outstanding = custInvoices
      .filter((i) => i.status !== "Paid")
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalInvoiced = custInvoices.reduce((s, i) => s + Number(i.amount || 0), 0);
    const concentration = totalReceivables > 0 ? ((outstanding / totalReceivables) * 100).toFixed(1) : 0;

    return {
      ...c,
      outstanding,
      totalInvoiced,
      invoiceCount: custInvoices.length,
      concentration: Number(concentration),
    };
  });

  const highConcentrationCust = customerMetrics.find((c) => c.concentration > 40);

  const concentrationChartData = customerMetrics
    .filter((c) => c.outstanding > 0)
    .map((c) => ({
      name: c.name,
      value: c.outstanding,
    }));

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!name) return;

    addCustomer({
      name,
      industry,
      contactEmail: contactEmail || `accounts@${name.toLowerCase().replace(/\s+/g, "")}.com`,
      creditScore,
      paymentTermsDays: Number(paymentTermsDays),
      avgDelayDays: creditScore === "High Risk" ? 18 : creditScore === "Medium Risk" ? 8 : 2,
    });

    setName("");
    setShowAddModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Metric Cards */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Customer Accounts</span>
            <Users size={18} style={{ color: "#7A9CAE" }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#7A9CAE" }}>
              {customers.length}
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>Accounts with active ledger history</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Top Account Concentration</span>
            <AlertTriangle size={18} style={{ color: "#C07F7F" }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C07F7F" }}>
              {highConcentrationCust ? `${highConcentrationCust.concentration}%` : "32.4%"}
            </span>
          </div>
          <div className="kpi-trend negative">
            <span>{highConcentrationCust ? highConcentrationCust.name : "Customer A"}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Average Portfolio Delay</span>
            <Clock size={18} style={{ color: "#C78150" }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C78150" }}>
              14.2 Days
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>Beyond agreed 30-day net terms</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Credit Safe Ratio</span>
            <ShieldCheck size={18} style={{ color: "#1C6758" }} />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#1C6758" }}>
              76.4%
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>Low-to-Medium Risk Accounts</span>
          </div>
        </div>
      </div>

      {/* Concentration Radar & Warning */}
      <div className="grid-12">
        {/* Receivables Concentration Pie */}
        <div className="col-span-6 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap amber">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="card-title">Customer Concentration Risk</div>
                <div className="card-subtitle">Distribution of outstanding receivables</div>
              </div>
            </div>
          </div>

          <div style={{ height: 260, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={concentrationChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {concentrationChartData.map((entry, index) => (
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

        {/* AI Concentration Assessment */}
        <div className="col-span-6 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap purple">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="card-title">AI Concentration Diagnostics</div>
                <div className="card-subtitle">Liquidity dependency analysis</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Add Customer
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#C07F7F" }}>
                ⚠️ Critical Concentration: Customer A (Auto Corp)
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                This single client holds over 45% of your total receivables. A 30-day payment delay will immediately cause a ₹2.80L cash deficit.
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1C6758" }}>
                ⭐ High Reliability Account: Customer C (Apex Infra)
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Consistently settles invoices within 2 days of due date. Eligible for preferential credit volume expansion.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap emerald">
              <Users size={18} />
            </div>
            <div>
              <div className="card-title">Customer Ledger & Credit Profiles</div>
              <div className="card-subtitle">Payment habits, delay histories & credit ratings</div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Industry</th>
                <th>Outstanding Balance</th>
                <th>Payment Terms</th>
                <th>Historical Avg Delay</th>
                <th>Credit Health Rating</th>
              </tr>
            </thead>
            <tbody>
              {customerMetrics.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0F172A" }}>{cust.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {cust.contactEmail || "billing@client.com"}
                    </div>
                  </td>
                  <td>{cust.industry}</td>
                  <td style={{ fontWeight: 700, color: "#7A9CAE" }}>
                    {formatLakhs(cust.outstanding)}
                  </td>
                  <td>Net {cust.paymentTermsDays || 30} Days</td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          cust.avgDelayDays > 12
                            ? "#C07F7F"
                            : cust.avgDelayDays > 5
                            ? "#C78150"
                            : "#1C6758",
                      }}
                    >
                      +{cust.avgDelayDays || 2} Days
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: "var(--radius-full)",
                        background:
                          cust.creditScore === "High Risk"
                            ? "rgba(244,63,94,0.15)"
                            : cust.creditScore === "Low Risk"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          cust.creditScore === "High Risk"
                            ? "#C07F7F"
                            : cust.creditScore === "Low Risk"
                            ? "#1C6758"
                            : "#C78150",
                      }}
                    >
                      {cust.creditScore || "Medium Risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Customer Account</div>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label className="form-label">Company / Client Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paramount Tech Solutions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select
                    className="form-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {INDUSTRY_SECTORS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Credit Rating</label>
                  <select
                    className="form-select"
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                  >
                    <option value="Low Risk">Low Risk (Prompt Payer)</option>
                    <option value="Medium Risk">Medium Risk</option>
                    <option value="High Risk">High Risk (Chronic Delays)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Billing Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. accounts@paramount.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agreed Net Payment Terms (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={paymentTermsDays}
                  onChange={(e) => setPaymentTermsDays(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}