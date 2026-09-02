import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  CreditCard,
  Plus,
  Calendar,
  IndianRupee,
  Building,
  User,
  Wallet,
  Flame,
  TrendingUp,
  Sparkles,
  Percent,
  CheckCircle2,
  Users,
  Clock,
} from "lucide-react";

import {
  getBusiness,
  updateBusinessProfile,
  addInvoice,
  addExpense,
  addCustomer,
  getCustomers,
  subscribeFinancialData,
} from "../data/financialStore";
import { INDUSTRY_SECTORS } from "../data/sampleData";

export default function QuickActionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("cash"); // 'cash' | 'burn' | 'invoice' | 'expense' | 'customer'
  const [business, setBusiness] = useState(getBusiness());
  const [customers, setCustomers] = useState(getCustomers());
  const [notification, setNotification] = useState("");

  // 1. Cash Balance State
  const [openingCash, setOpeningCash] = useState(business.openingCash || "");
  const [minReserve, setMinReserve] = useState(business.minCashReserve || "");
  const [targetRunway, setTargetRunway] = useState(business.targetRunwayDays || 60);

  // 2. Monthly Burn & Revenue Target State
  const [monthlyBurn, setMonthlyExpenses] = useState(business.monthlyExpenses || "");
  const [monthlyRevenue, setMonthlyRevenue] = useState(business.monthlyRevenue || "");

  // 3. Invoice Form State
  const [invCustomer, setInvCustomer] = useState(customers[0]?.name || "");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invStatus, setInvStatus] = useState("Pending");
  const [invGstRate, setInvGstRate] = useState(18);

  // 4. Expense Form State
  const [expCategory, setExpCategory] = useState("Payroll & Salaries");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expRecurring, setExpRecurring] = useState(true);
  const [expGstRate, setExpGstRate] = useState(18);

  // 5. Customer Form State
  const [custName, setCustName] = useState("");
  const [custIndustry, setCustIndustry] = useState("Manufacturing & Trade");
  const [custTerms, setCustTerms] = useState(30);
  const [custDelay, setCustDelay] = useState(5);
  const [custRisk, setCustRisk] = useState("Medium Risk");

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      const b = getBusiness();
      setBusiness(b);
      setCustomers(getCustomers());
      if (!openingCash && b.openingCash) setOpeningCash(b.openingCash);
      if (!monthlyBurn && b.monthlyExpenses) setMonthlyExpenses(b.monthlyExpenses);
      if (!monthlyRevenue && b.monthlyRevenue) setMonthlyRevenue(b.monthlyRevenue);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification("");
      onClose();
    }, 1200);
  };

  // Submit Handlers
  const handleSaveCash = (e) => {
    e.preventDefault();
    updateBusinessProfile({
      openingCash: Number(openingCash) || 0,
      minCashReserve: Number(minReserve) || 0,
      targetRunwayDays: Number(targetRunway) || 60,
    });
    showToast("Liquid cash balance updated and synchronized with AI Twin!");
  };

  const handleSaveBurnAndRev = (e) => {
    e.preventDefault();
    updateBusinessProfile({
      monthlyExpenses: Number(monthlyBurn) || 0,
      monthlyRevenue: Number(monthlyRevenue) || 0,
    });
    showToast("Monthly burn rate and revenue baseline updated!");
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!invAmount) return;

    const finalCustomer = newCustomerName ? newCustomerName.trim() : (invCustomer || "General Enterprise Client");

    addInvoice({
      customer: finalCustomer,
      amount: Number(invAmount),
      dueDate: invDueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: invStatus,
      gstRate: Number(invGstRate),
      source: "quick_add",
    });

    setInvAmount("");
    setNewCustomerName("");
    showToast(`Invoice for ${finalCustomer} created!`);
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!expAmount) return;

    addExpense({
      category: expCategory,
      description: expDesc || expCategory,
      amount: Number(expAmount),
      recurring: expRecurring,
      gstRate: Number(expGstRate),
    });

    setExpAmount("");
    setExpDesc("");
    showToast(`${expRecurring ? "Recurring liability" : "Expense"} of ₹${expAmount} recorded!`);
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!custName) return;

    addCustomer({
      name: custName,
      industry: custIndustry,
      paymentTermsDays: Number(custTerms),
      avgDelayDays: Number(custDelay),
      creditScore: custRisk,
    });

    setCustName("");
    showToast(`Customer ${custName} added to risk ledger!`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="card-title-group">
            <div className="card-icon-wrap emerald">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="modal-title">Quick Input & AI Telemetry Hub</div>
              <div className="card-subtitle">
                Enter your baseline business parameters to feed the AI & ML engines
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Feedback notice */}
        {notification && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#34d399",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Selector (Touch & Scroll friendly) */}
        <div className="tabs-container" style={{ marginBottom: 20, overflowX: "auto", background: "#F1F5F9", padding: "4px", borderRadius: "10px", border: "1px solid #CBD5E1" }}>
          {[
            { id: "cash", label: "Liquid Cash", icon: Wallet },
            { id: "burn", label: "Monthly Burn", icon: Flame },
            { id: "invoice", label: "+ Invoice", icon: FileText },
            { id: "expense", label: "+ Expense", icon: CreditCard },
            { id: "customer", label: "+ Client", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${active ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  minWidth: 110,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#0F172A" : "#64748B",
                  fontWeight: active ? 800 : 600,
                  fontSize: "12.5px",
                  border: active ? "1px solid #CBD5E1" : "1px solid transparent",
                  boxShadow: active ? "0 2px 6px rgba(15, 23, 42, 0.08)" : "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={14} style={{ color: active ? "#0284C7" : "#94A3B8" }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =================================================================
            TAB 1: LIQUID CASH BALANCE
            ================================================================= */}
        {activeTab === "cash" && (
          <form onSubmit={handleSaveCash}>
            <div style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.2)", marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
                <strong style={{ color: "#0284C7" }}>Why this matters: </strong>
                Your current liquid bank cash is the starting anchor for the 90-day probabilistic runway calculation and insolvency early-warning radar.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Liquid Bank Cash (₹ INR)</label>
              <div style={{ position: "relative" }}>
                <IndianRupee size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. 500000"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Min. Safety Reserve Target (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 200000"
                  value={minReserve}
                  onChange={(e) => setMinReserve(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Runway Buffer (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 60"
                  value={targetRunway}
                  onChange={(e) => setTargetRunway(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Update Digital Twin
              </button>
            </div>
          </form>
        )}

        {/* =================================================================
            TAB 2: MONTHLY BURN & REVENUE BASELINE
            ================================================================= */}
        {activeTab === "burn" && (
          <form onSubmit={handleSaveBurnAndRev}>
            <div style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
                <strong style={{ color: "#D97706" }}>AI Burn Calibration: </strong>
                If you haven't uploaded detailed expense bills yet, entering your estimated monthly burn rate allows the ML engine to forecast your cash burn velocity immediately.
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Estimated Monthly Burn / Outflows (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 350000"
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Monthly Inflows / Revenue (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn btn-emerald">
                Update Burn Baseline
              </button>
            </div>
          </form>
        )}

        {/* =================================================================
            TAB 3: QUICK INVOICE
            ================================================================= */}
        {activeTab === "invoice" && (
          <form onSubmit={handleCreateInvoice}>
            <div className="form-group">
              <label className="form-label">Client / Customer</label>
              {customers.length > 0 && !newCustomerName ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="form-select"
                    value={invCustomer}
                    onChange={(e) => setInvCustomer(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.industry || "Client"})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setNewCustomerName("New Client")}
                  >
                    + New Name
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Client Name"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  {customers.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setNewCustomerName("")}
                    >
                      Pick Existing
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Invoice Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 150000"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Slab</label>
                <select
                  className="form-select"
                  value={invGstRate}
                  onChange={(e) => setInvGstRate(Number(e.target.value))}
                >
                  <option value={18}>18% GST (Standard)</option>
                  <option value={12}>12% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={28}>28% GST</option>
                  <option value={0}>0% (Exempt)</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={invStatus}
                  onChange={(e) => setInvStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Invoice & Predict Delay
              </button>
            </div>
          </form>
        )}

        {/* =================================================================
            TAB 4: LOG EXPENSE
            ================================================================= */}
        {activeTab === "expense" && (
          <form onSubmit={handleCreateExpense}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                >
                  <option value="Payroll & Salaries">Payroll & Salaries</option>
                  <option value="Raw Materials">Raw Materials & Inventory</option>
                  <option value="Facility & Rent">Facility Rent</option>
                  <option value="Utilities & Power">Utilities & Power</option>
                  <option value="Logistics & Freight">Logistics & Freight</option>
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Equipment & Capex">Equipment Maintenance</option>
                  <option value="General & Misc">General & Misc</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 45000"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Warehouse monthly rent & maintenance"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
              <input
                type="checkbox"
                id="quickExpRecurring"
                checked={expRecurring}
                onChange={(e) => setExpRecurring(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent-blue)" }}
              />
              <label htmlFor="quickExpRecurring" style={{ fontSize: 13, cursor: "pointer", color: "var(--text-primary)" }}>
                Monthly recurring fixed liability (adds to baseline burn rate)
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                Record Expense
              </button>
            </div>
          </form>
        )}

        {/* =================================================================
            TAB 5: ADD CUSTOMER
            ================================================================= */}
        {activeTab === "customer" && (
          <form onSubmit={handleCreateCustomer}>
            <div className="form-group">
              <label className="form-label">Client / Entity Legal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Horizon Precision Works Pvt Ltd"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <select
                  className="form-select"
                  value={custIndustry}
                  onChange={(e) => setCustIndustry(e.target.value)}
                >
                  {INDUSTRY_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Terms (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="30"
                  value={custTerms}
                  onChange={(e) => setCustTerms(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Expected Payment Delay (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="5"
                  value={custDelay}
                  onChange={(e) => setCustDelay(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credit Risk Classification</label>
                <select
                  className="form-select"
                  value={custRisk}
                  onChange={(e) => setCustRisk(e.target.value)}
                >
                  <option value="Low Risk">Low Risk (Prompt Payer)</option>
                  <option value="Medium Risk">Medium Risk (Standard)</option>
                  <option value="High Risk">High Risk (Chronic Delays)</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Customer to Ledger
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
