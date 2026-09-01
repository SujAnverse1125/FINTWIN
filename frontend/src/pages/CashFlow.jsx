import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  RefreshCw,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  getFinancialData,
  subscribeFinancialData,
} from "../data/financialStore";
import { getCashFlowSummary } from "../engines/digitalTwin";

export default function CashFlow() {
  const [summary, setSummary] = useState(getCashFlowSummary());
  const [data, setData] = useState(getFinancialData());

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setSummary(getCashFlowSummary());
      setData(getFinancialData());
    });
    return unsub;
  }, []);

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  // Waterfall Chart Data
  const waterfallData = [
    { name: "Opening Cash", amount: summary.currentCash, type: "start" },
    { name: "+ Receivables", amount: summary.receivables, type: "inflow" },
    { name: "- Fixed Burn", amount: -summary.recurringExpenses, type: "outflow" },
    { name: "- Variable Exp", amount: -summary.oneTimeExpenses, type: "outflow" },
    { name: "Projected Cash", amount: summary.projectedCash, type: "total" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* =================================================================
          SUMMARY STAT CARDS
          ================================================================= */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Current Cash</span>
            <div className="card-icon-wrap emerald">
              <Wallet size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#1C6758" }}>
              {formatLakhs(summary.currentCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <ShieldCheck size={14} />
            <span>Liquid in Escrow & Current Account</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Expected Inflows (Receivables)</span>
            <div className="card-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#7A9CAE" }}>
              {formatLakhs(summary.receivables)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <ArrowUpRight size={14} />
            <span>{data.invoices.filter((i) => i.status !== "Paid").length} Unsettled Invoices</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Outflows (Burn)</span>
            <div className="card-icon-wrap amber">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C78150" }}>
              {formatLakhs(summary.totalExpenses)}
            </span>
          </div>
          <div className="kpi-trend negative">
            <ArrowDownRight size={14} />
            <span>Fixed: {formatLakhs(summary.recurringExpenses)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Projected Net Liquidity</span>
            <div className="card-icon-wrap purple">
              <Landmark size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span
              className="kpi-value"
              style={{
                color: summary.projectedCash >= 0 ? "#425F6B" : "#C07F7F",
              }}
            >
              {formatLakhs(summary.projectedCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <span
              style={{
                color: summary.projectedCash >= 0 ? "#1C6758" : "#C07F7F",
                fontWeight: 700,
              }}
            >
              {summary.status}
            </span>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
              {summary.runwayDays} Days Runway
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================
          WATERFALL RECONCILIATION
          ================================================================= */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="card-title">Cash Flow Bridge (Waterfall Analysis)</div>
              <div className="card-subtitle">
                Reconciliation from opening bank balance to projected month-end liquidity
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 280, width: "100%", marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(13, 18, 31, 0.95)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val) => [`₹${(Number(val) / 100000).toFixed(2)} Lakhs`, "Amount"]}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === "start"
                        ? "#7A9CAE"
                        : entry.type === "inflow"
                        ? "#1C6758"
                        : entry.type === "outflow"
                        ? "#C07F7F"
                        : "#425F6B"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =================================================================
          DETAILED INFLOWS VS OUTFLOWS TABLE
          ================================================================= */}
      <div className="grid-2">
        {/* Scheduled Inflows */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <div className="card-title">Scheduled Inflows</div>
                <div className="card-subtitle">Pending collections from clients</div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Expected Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices
                  .filter((i) => i.status !== "Paid")
                  .map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{inv.customer}</td>
                      <td style={{ fontWeight: 700, color: "#1C6758" }}>
                        {formatLakhs(inv.amount)}
                      </td>
                      <td>{inv.dueDate}</td>
                      <td>
                        <span className={`status-badge ${inv.status === "Overdue" ? "overdue" : "pending"}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheduled Outflows */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap rose">
                <ArrowDownRight size={18} />
              </div>
              <div>
                <div className="card-title">Committed Outflows</div>
                <div className="card-subtitle">Payroll, rent & vendor obligations</div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {data.recurringExpenses.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>{rec.category}</td>
                    <td>{rec.description}</td>
                    <td style={{ fontWeight: 700, color: "#C07F7F" }}>
                      {formatLakhs(rec.amount)}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: "rgba(139,92,246,0.15)", color: "#425F6B" }}>
                        Monthly (Day {rec.dayOfMonth})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}