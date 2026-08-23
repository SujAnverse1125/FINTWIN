import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Edit,
  Send,
  Building,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";

import {
  getWorkers,
  getPayrollDisbursements,
  addWorker,
  updateWorker,
  deleteWorker,
  disburseSalary,
  disburseAllSalaries,
  getBusiness,
  subscribeFinancialData,
} from "../data/financialStore";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = [
  "Operations & Factory Floor",
  "Accounts & Finance",
  "Sales & Marketing",
  "Logistics & Warehouse",
  "IT & Software Engineering",
  "Procurement & Quality",
  "Administration & HR",
];

export default function Payroll() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState(getWorkers());
  const [payrollHistory, setPayrollHistory] = useState(getPayrollDisbursements());
  const [business, setBusiness] = useState(getBusiness());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Add Worker Modal State
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [wName, setWName] = useState("");
  const [wDesignation, setWDesignation] = useState("Operations Specialist");
  const [wDept, setWDept] = useState(DEPARTMENTS[0]);
  const [wSalary, setWSalary] = useState(28000);
  const [wPhone, setWPhone] = useState("");
  const [wEmail, setWEmail] = useState("");
  const [wBank, setWBank] = useState("");
  const [wUpi, setWUpi] = useState("");

  // Single Disburse Modal State
  const [selectedWorkerForPay, setSelectedWorkerForPay] = useState(null);
  const [payBonus, setPayBonus] = useState(0);
  const [payDeductions, setPayDeductions] = useState(0);
  const [payMonth, setPayMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [payNote, setPayNote] = useState("");

  // Toast Notification
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setWorkers(getWorkers());
      setPayrollHistory(getPayrollDisbursements());
      setBusiness(getBusiness());
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString("en-IN")}`;
  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  // Calculated Metrics
  const activeWorkers = workers.filter((w) => w.status === "Active");
  const totalMonthlyPayrollLiability = activeWorkers.reduce(
    (s, w) => s + Number(w.monthlySalary || 0),
    0
  );

  const currentMonthStr = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const currentMonthPaid = payrollHistory
    .filter((p) => p.month === currentMonthStr)
    .reduce((s, p) => s + Number(p.netAmount || 0), 0);

  const pendingPayrollDue = Math.max(0, totalMonthlyPayrollLiability - currentMonthPaid);

  // Filtered Workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      (w.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.designation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || w.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddWorkerSubmit = (e) => {
    e.preventDefault();
    if (!wName) return;

    addWorker({
      name: wName,
      designation: wDesignation,
      department: wDept,
      monthlySalary: Number(wSalary),
      phone: wPhone,
      email: wEmail,
      bankAccount: wBank,
      upiId: wUpi,
      status: "Active",
    });

    setWName("");
    setWPhone("");
    setWEmail("");
    setWBank("");
    setWUpi("");
    setShowAddWorkerModal(false);
    showToast(`Worker ${wName} added to payroll roster!`);
  };

  const handleDisburseSingleSalary = (e) => {
    e.preventDefault();
    if (!selectedWorkerForPay) return;

    const res = disburseSalary({
      workerId: selectedWorkerForPay.id,
      month: payMonth,
      bonus: Number(payBonus) || 0,
      deductions: Number(payDeductions) || 0,
      note: payNote,
    });

    setSelectedWorkerForPay(null);
    setPayBonus(0);
    setPayDeductions(0);
    setPayNote("");
    showToast(`Salary disbursed for ${res.workerName} (${formatCurrency(res.netAmount)})!`);
  };

  const handleBatchDisburseAll = () => {
    if (activeWorkers.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to disburse salary for all ${activeWorkers.length} active workers (Total: ${formatLakhs(
          totalMonthlyPayrollLiability
        )})?`
      )
    ) {
      const results = disburseAllSalaries({ month: currentMonthStr });
      showToast(`Batch payroll completed: ${results.length} workers paid!`);
    }
  };

  const handleExportPayrollCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "FinTwin Payroll & Salary Disbursal Statement",
        `Business Name,${business.name || "My Enterprise"}`,
        `Export Date,${new Date().toISOString().slice(0, 10)}`,
        "",
        "Transaction ID,Worker Name,Designation,Department,Month,Base Salary,Bonus,Deductions,Net Paid,Date,Reference ID",
        ...payrollHistory.map((p) =>
          [
            p.id,
            `"${p.workerName}"`,
            `"${p.designation}"`,
            `"${p.department}"`,
            `"${p.month}"`,
            p.baseSalary,
            p.bonus,
            p.deductions,
            p.netAmount,
            p.disbursedDate,
            p.referenceId,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34d399",
            fontWeight: 600,
            fontSize: 13.5,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Role Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
              Workers & Salary Payroll Hub
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              📊 Accountant Workspace
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>
            Manage workers, calibrate monthly compensation, and disburse salaries directly into the financial ledger
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportPayrollCsv}
            disabled={payrollHistory.length === 0}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            className="btn btn-emerald"
            onClick={handleBatchDisburseAll}
            disabled={activeWorkers.length === 0}
            title="Disburse salaries for all active workers"
          >
            <Send size={14} />
            <span>Batch Payroll ({formatLakhs(totalMonthlyPayrollLiability)})</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddWorkerModal(true)}
          >
            <Plus size={15} />
            <span>+ Add Worker</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid-4">
        {/* Total Active Workers */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Worker Roster</span>
            <div className="card-icon-wrap">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#60a5fa" }}>
              {activeWorkers.length}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>{workers.length} Total on payroll records</span>
          </div>
        </div>

        {/* Total Monthly Payroll */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Monthly Payroll Burn</span>
            <div className="card-icon-wrap amber">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#fbbf24" }}>
              {formatLakhs(totalMonthlyPayrollLiability)}
            </span>
          </div>
          <div className="kpi-trend negative">
            <span>Fixed monthly salary commitments</span>
          </div>
        </div>

        {/* Disbursed This Month */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Paid This Month</span>
            <div className="card-icon-wrap emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#34d399" }}>
              {formatLakhs(currentMonthPaid)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>For {currentMonthStr}</span>
          </div>
        </div>

        {/* Pending Salary Due */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Pending Salary Due</span>
            <div className="card-icon-wrap purple">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: pendingPayrollDue > 0 ? "#c4b5fd" : "#34d399" }}>
              {formatLakhs(pendingPayrollDue)}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>{pendingPayrollDue === 0 && activeWorkers.length > 0 ? "All salaries cleared" : "Awaiting disbursement"}</span>
          </div>
        </div>
      </div>

      {/* Main Workers Roster Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap emerald">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="card-title">Employee & Worker Directory</div>
              <div className="card-subtitle">
                Individual compensation, payment accounts, and salary disbursement controls
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: 18 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search by worker name, role, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ maxWidth: 240 }}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Worker Table */}
        {filteredWorkers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <Users size={36} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.6 }} />
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>No workers found</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, maxWidth: 460, margin: "4px auto 18px" }}>
              Add your factory workers, staff specialists, and contractors to track salary liabilities and process 1-click payouts.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddWorkerModal(true)}>
              <Plus size={14} />
              <span>Add First Worker</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Department</th>
                  <th>Monthly Salary</th>
                  <th>Payment Account / UPI</th>
                  <th>Last Disbursed</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Salary Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "var(--radius-full)",
                            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#fff" }}>{w.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{w.designation}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{w.department}</span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                        {formatCurrency(w.monthlySalary)}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {w.upiId ? (
                          <span style={{ color: "#60a5fa" }}>UPI: {w.upiId}</span>
                        ) : w.bankAccount ? (
                          <span>A/C: {w.bankAccount}</span>
                        ) : (
                          <span style={{ color: "var(--text-dim)" }}>Cash / Direct</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: 12, color: w.lastSalaryPaidDate ? "var(--text-secondary)" : "var(--text-dim)" }}>
                        {w.lastSalaryPaidDate || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: w.status === "Active" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                          color: w.status === "Active" ? "#34d399" : "#fbbf24",
                        }}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => setSelectedWorkerForPay(w)}
                          title={`Disburse salary to ${w.name}`}
                        >
                          <Send size={12} />
                          <span>Pay Salary</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "6px 8px", color: "#fb7185" }}
                          onClick={() => {
                            if (window.confirm(`Remove ${w.name} from payroll?`)) {
                              deleteWorker(w.id);
                              showToast(`Removed ${w.name}`);
                            }
                          }}
                          title="Delete Worker"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Disbursement History Table */}
      {payrollHistory.length > 0 && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap purple">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="card-title">Salary Disbursal Ledger</div>
                <div className="card-subtitle">
                  Historical audit trail of all disbursed employee salaries and payment receipts
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Worker Name</th>
                  <th>Department</th>
                  <th>Salary Period</th>
                  <th>Base</th>
                  <th>Bonus / Deduction</th>
                  <th>Net Paid</th>
                  <th>Payment Ref</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#60a5fa" }}>
                        {p.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{p.workerName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.designation}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12 }}>{p.department}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#c4b5fd", fontSize: 12 }}>{p.month}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {formatCurrency(p.baseSalary)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, color: p.bonus > 0 ? "#34d399" : p.deductions > 0 ? "#fb7185" : "var(--text-muted)" }}>
                        {p.bonus > 0 ? `+${formatCurrency(p.bonus)}` : p.deductions > 0 ? `-${formatCurrency(p.deductions)}` : "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {formatCurrency(p.netAmount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>
                        {p.referenceId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.disbursedDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================
          MODAL 1: ADD WORKER / EMPLOYEE
          ================================================================= */}
      {showAddWorkerModal && (
        <div className="modal-backdrop" onClick={() => setShowAddWorkerModal(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div className="card-title-group">
                <div className="card-icon-wrap emerald">
                  <Users size={18} />
                </div>
                <div>
                  <div className="modal-title">Add Worker / Employee</div>
                  <div className="card-subtitle">
                    Register worker details, compensation, and payment accounts
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddWorkerModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWorkerSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Worker Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Amit Verma"
                    value={wName}
                    onChange={(e) => setWName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation / Role</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CNC Machine Operator"
                    value={wDesignation}
                    onChange={(e) => setWDesignation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={wDept}
                    onChange={(e) => setWDept(e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Base Salary (₹ INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 35000"
                    value={wSalary}
                    onChange={(e) => setWSalary(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Mobile Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={wPhone}
                    onChange={(e) => setWPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work / Personal Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="amit@company.com"
                    value={wEmail}
                    onChange={(e) => setWEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Bank Account Number / IFSC</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="HDFC0001234 - 50100234567"
                    value={wBank}
                    onChange={(e) => setWBank(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UPI ID (Instant Disbursal)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="amit@okhdfcbank"
                    value={wUpi}
                    onChange={(e) => setWUpi(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddWorkerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save to Payroll Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================
          MODAL 2: DISBURSE SINGLE SALARY
          ================================================================= */}
      {selectedWorkerForPay && (
        <div className="modal-backdrop" onClick={() => setSelectedWorkerForPay(null)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="card-title-group">
                <div className="card-icon-wrap emerald">
                  <Send size={18} />
                </div>
                <div>
                  <div className="modal-title">Disburse Monthly Salary</div>
                  <div className="card-subtitle">
                    Process compensation payout for {selectedWorkerForPay.name}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedWorkerForPay(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleDisburseSingleSalary}>
              <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Worker:</span>
                  <span style={{ fontWeight: 700, color: "#fff" }}>
                    {selectedWorkerForPay.name} ({selectedWorkerForPay.designation})
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Base Salary:</span>
                  <span style={{ fontWeight: 700, color: "#34d399" }}>
                    {formatCurrency(selectedWorkerForPay.monthlySalary)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Payment Target:</span>
                  <span style={{ fontWeight: 600, color: "#60a5fa", fontSize: 12 }}>
                    {selectedWorkerForPay.upiId || selectedWorkerForPay.bankAccount || "Direct Bank Transfer"}
                  </span>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Salary Month / Period</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Performance Bonus (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={payBonus}
                    onChange={(e) => setPayBonus(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Deductions / TDS / Advance (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={payDeductions}
                    onChange={(e) => setPayDeductions(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Net Payable Amount (₹)</label>
                  <div
                    style={{
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 14px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      fontWeight: 800,
                      color: "#34d399",
                      fontSize: 16,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatCurrency(
                      Math.max(
                        0,
                        Number(selectedWorkerForPay.monthlySalary) +
                          Number(payBonus || 0) -
                          Number(payDeductions || 0)
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Disbursal Note / Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Regular monthly payroll + incentive"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedWorkerForPay(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald">
                  <Send size={14} />
                  <span>Execute Salary Disbursal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
