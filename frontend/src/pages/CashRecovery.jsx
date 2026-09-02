import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Send,
  FileText,
  Copy,
  ExternalLink,
  Sparkles,
  Percent,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  UserCheck,
  Upload,
  Download,
  Check,
} from "lucide-react";

import ModulePage from "../components/ModulePage";
import { getFinancialData, subscribeFinancialData, createInvoices } from "../data/financialStore";
import CashRecoveryNoticeModal from "../components/CashRecoveryNoticeModal";
import UniversalUploadModal from "../components/UniversalUploadModal";
import { parseInvoiceFile } from "../utils/invoiceParser";

function formatMoney(amount) {
  const value = Number(amount || 0);
  const absolute = Math.abs(value);

  if (absolute >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (absolute >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  if (absolute >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CashRecovery() {
  const [storeData, setStoreData] = useState(getFinancialData());
  const [activeTab, setActiveTab] = useState("legal_recovery"); // "legal_recovery" | "early_discount"
  const [searchQuery, setSearchQuery] = useState("");
  const [overdueFilter, setOverdueFilter] = useState("all"); // "all" | "critical_45" | "moderate_15"

  // Early Payment Discount Config (Owner Editable)
  const [globalDiscountRate, setGlobalDiscountRate] = useState(2.0); // 2.0%
  const [globalSettlementWindow, setGlobalSettlementWindow] = useState(7); // 7 days

  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalMode, setModalMode] = useState("legal_recovery");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [demoLoadedNotice, setDemoLoadedNotice] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeFinancialData((newData) => {
      setStoreData(newData);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadDemoRecoveryData = () => {
    const demoInvoices = [
      {
        id: "INV-2026-088",
        customer: "Mehta Heavy Tooling Pvt Ltd",
        amount: 1250000,
        invoiceDate: "2026-05-15",
        dueDate: "2026-06-30",
        status: "Overdue",
        overdueDays: 58,
        gstRate: 18,
        gstin: "27AADCM9921E1Z3",
        customerEmail: "accounts@mehtatooling.com",
      },
      {
        id: "INV-2026-092",
        customer: "Shree Balaji Infrastructure",
        amount: 840000,
        invoiceDate: "2026-05-10",
        dueDate: "2026-06-25",
        status: "Overdue",
        overdueDays: 64,
        gstRate: 18,
        gstin: "24AAACS4120F1Z8",
        customerEmail: "finance@balaji-infra.in",
      },
      {
        id: "INV-2026-075",
        customer: "Apex Global Logistics Corp",
        amount: 520000,
        invoiceDate: "2026-05-25",
        dueDate: "2026-07-10",
        status: "Overdue",
        overdueDays: 49,
        gstRate: 18,
        gstin: "29AAACA5512G1Z9",
        customerEmail: "payables@apexlogistics.com",
      },
      {
        id: "INV-2026-104",
        customer: "Sona Exports & Textiles Ltd",
        amount: 468000,
        invoiceDate: "2026-06-12",
        dueDate: "2026-07-26",
        status: "Overdue",
        overdueDays: 34,
        gstRate: 12,
        gstin: "33AABCS7712H1Z5",
        customerEmail: "accounts@sonaexports.com",
      },
      {
        id: "INV-2026-112",
        customer: "Deccan Precision Fasteners",
        amount: 385000,
        invoiceDate: "2026-06-20",
        dueDate: "2026-08-04",
        status: "Overdue",
        overdueDays: 26,
        gstRate: 18,
        gstin: "36AABCD8821J1Z2",
        customerEmail: "billing@deccanfasteners.com",
      },
      {
        id: "INV-2026-118",
        customer: "Zaveri Pharma Packaging",
        amount: 240000,
        invoiceDate: "2026-06-28",
        dueDate: "2026-08-11",
        status: "Overdue",
        overdueDays: 19,
        gstRate: 12,
        gstin: "24AABCZ1234K1Z0",
        customerEmail: "finance@zaveripack.com",
      },
      {
        id: "INV-2026-125",
        customer: "Krishna Furnishings & Fabrics",
        amount: 304000,
        invoiceDate: "2026-07-08",
        dueDate: "2026-08-21",
        status: "Overdue",
        overdueDays: 9,
        gstRate: 18,
        gstin: "27AABCK4412L1Z4",
        customerEmail: "accounts@krishnafurnishings.in",
      },
      {
        id: "INV-2026-130",
        customer: "Anand Agencies Distribution",
        amount: 156000,
        invoiceDate: "2026-07-12",
        dueDate: "2026-08-24",
        status: "Overdue",
        overdueDays: 6,
        gstRate: 18,
        gstin: "29AABCA8891M1Z7",
        customerEmail: "info@anandagencies.com",
      },
      {
        id: "INV-2026-201",
        customer: "Tata Motors Ancillary Vendor Unit",
        amount: 1450000,
        invoiceDate: "2026-08-05",
        dueDate: "2026-09-25",
        status: "Pending",
        overdueDays: 0,
        gstRate: 18,
        gstin: "27AAACT2210N1Z6",
        customerEmail: "vendor.desk@tatamotors-vendor.com",
        discountEligible: true,
      },
      {
        id: "INV-2026-205",
        customer: "Godrej Appliances Supply Division",
        amount: 920000,
        invoiceDate: "2026-08-12",
        dueDate: "2026-09-20",
        status: "Pending",
        overdueDays: 0,
        gstRate: 18,
        gstin: "27AAACG1120P1Z8",
        customerEmail: "ap.team@godrejappliances.in",
        discountEligible: true,
      },
      {
        id: "INV-2026-210",
        customer: "Mahindra & Mahindra Tier-2 Subcontractor",
        amount: 680000,
        invoiceDate: "2026-08-15",
        dueDate: "2026-09-18",
        status: "Pending",
        overdueDays: 0,
        gstRate: 18,
        gstin: "27AAACM3340Q1Z9",
        customerEmail: "treasury@mahindra-tier2.in",
        discountEligible: true,
      },
      {
        id: "INV-2026-215",
        customer: "Schneider Electric India OEM",
        amount: 450000,
        invoiceDate: "2026-08-20",
        dueDate: "2026-10-05",
        status: "Pending",
        overdueDays: 0,
        gstRate: 18,
        gstin: "29AAACS6650R1Z1",
        customerEmail: "vendor.invoices@se-india.com",
        discountEligible: true,
      },
    ];

    createInvoices(demoInvoices);
    setDemoLoadedNotice(true);
    setTimeout(() => setDemoLoadedNotice(false), 4000);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/nexfin_cash_recovery_master_dataset.csv";
    link.setAttribute("download", "nexfin_cash_recovery_master_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const business = storeData.business || {
    name: "My Enterprise",
    gstin: "27AADCO1234E1Z5",
    udyamNumber: "UDYAM-MH-12-0048912",
  };

  const allInvoices = storeData.invoices || [];

  // 1. Process Overdue Invoices for Legal Recovery (MSMED Act Sec 15/16)
  const overdueInvoices = useMemo(() => {
    return allInvoices
      .filter((inv) => {
        const status = String(inv.status || "").toLowerCase();
        return status === "overdue" || (status !== "paid" && Number(inv.overdueDays || 0) > 0);
      })
      .map((inv) => {
        const amount = Number(inv.amount || 0);
        const overdueDays = Math.max(1, Number(inv.overdueDays || (inv.status === "Overdue" ? 24 : 10)));
        
        // MSMED Act Section 16 Interest: 3x RBI Bank Rate ~ 20.25% p.a. compounded monthly
        const annualRate = 20.25;
        const monthlyRate = annualRate / 12 / 100;
        const monthsOverdue = overdueDays / 30;
        const compoundInterest = Math.round(amount * (Math.pow(1 + monthlyRate, monthsOverdue) - 1));
        const totalClaimable = amount + compoundInterest;

        return {
          ...inv,
          overdueDays,
          compoundInterest,
          totalClaimable,
          isCritical45: overdueDays >= 45,
        };
      })
      .sort((a, b) => b.overdueDays - a.overdueDays);
  }, [allInvoices]);

  // 2. Process Eligible Invoices for Early Payment Cash Discounts
  const eligibleEarlyDiscountInvoices = useMemo(() => {
    return allInvoices
      .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
      .map((inv) => {
        const amount = Number(inv.amount || 0);
        const discountAmount = Math.round(amount * (globalDiscountRate / 100));
        const netPayable = amount - discountAmount;
        return {
          ...inv,
          discountAmount,
          netPayable,
          discountRate: globalDiscountRate,
          settlementDays: globalSettlementWindow,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [allInvoices, globalDiscountRate, globalSettlementWindow]);

  // Metrics Summary
  const totalOverduePrincipal = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalAccruedInterest = overdueInvoices.reduce((sum, inv) => sum + Number(inv.compoundInterest || 0), 0);
  const critical45Count = overdueInvoices.filter((inv) => inv.isCritical45).length;
  const totalAcceleratableCapital = eligibleEarlyDiscountInvoices.reduce((sum, inv) => sum + Number(inv.netPayable || 0), 0);

  // Filtered Overdue Table
  const filteredOverdueInvoices = useMemo(() => {
    return overdueInvoices.filter((inv) => {
      if (overdueFilter === "critical_45" && !inv.isCritical45) return false;
      if (overdueFilter === "moderate_15" && (inv.overdueDays < 15 || inv.overdueDays >= 45)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = (inv.customer || "").toLowerCase().includes(q);
        const matchesInvoice = (inv.invoiceNumber || inv.id || "").toLowerCase().includes(q);
        return matchesCustomer || matchesInvoice;
      }
      return true;
    });
  }, [overdueInvoices, overdueFilter, searchQuery]);

  // Filtered Early Discount Table
  const filteredEarlyInvoices = useMemo(() => {
    if (!searchQuery.trim()) return eligibleEarlyDiscountInvoices;
    const q = searchQuery.toLowerCase();
    return eligibleEarlyDiscountInvoices.filter((inv) => {
      const matchesCustomer = (inv.customer || "").toLowerCase().includes(q);
      const matchesInvoice = (inv.invoiceNumber || inv.id || "").toLowerCase().includes(q);
      return matchesCustomer || matchesInvoice;
    });
  }, [eligibleEarlyDiscountInvoices, searchQuery]);

  const handleOpenNoticeModal = (inv, mode) => {
    setSelectedInvoice(inv);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <ModulePage
      title="MSME Cash Recovery & Legal Settlement Hub"
      description="Enforce MSMED Act statutory 45-day recovery, claim penal interest under Section 16, and offer dynamic early payment cash discounts."
    >
      {/* =========================================================================
          0. DATASET INGESTION & QUICK ACTIONS BAR
          ========================================================================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          background: "#FFFFFF",
          padding: "14px 20px",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              background: "rgba(225, 29, 72, 0.12)",
              color: "#E11D48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Scale size={18} />
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0F172A" }}>
              Cash Recovery & MSMED Legal Datasets
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748B" }}>
              Upload your debtor invoices or load pre-configured MSMED Section 15/16 test scenarios
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {demoLoadedNotice && (
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#059669",
                background: "rgba(16, 185, 129, 0.1)",
                padding: "6px 12px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Check size={13} />
              <span>12 Invoices Loaded!</span>
            </span>
          )}

          <button
            onClick={handleLoadDemoRecoveryData}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              color: "#FFFFFF",
              border: "none",
              fontSize: "12px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <Sparkles size={13} style={{ color: "#38BDF8" }} />
            <span>Load Demo Recovery Dataset</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "#F8FAFC",
              color: "#334155",
              border: "1px solid #CBD5E1",
              fontSize: "12px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <Upload size={13} style={{ color: "#0284C7" }} />
            <span>Upload Invoices / CSV</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#FFFFFF",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              fontSize: "12px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
            }}
            title="Download nexfin_cash_recovery_master_dataset.csv"
          >
            <Download size={13} />
            <span>CSV Template</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          1. TOP METRIC CARDS (4 CARDS)
          ========================================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        {/* Total Overdue Principal */}
        <div className="module-card" style={{ margin: 0, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Overdue Debt
            </span>
            <AlertTriangle size={17} style={{ color: "#E11D48" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: 6, letterSpacing: "-0.5px" }}>
            {formatMoney(totalOverduePrincipal)}
          </div>
          <p style={{ fontSize: "11.5px", color: "#64748B", margin: "3px 0 0" }}>
            Across {overdueInvoices.length} delayed customer invoices
          </p>
        </div>

        {/* Accrued Statutory Interest Claimable */}
        <div className="module-card" style={{ margin: 0, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Accrued MSMED Interest
            </span>
            <Scale size={17} style={{ color: "#0284C7" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0284C7", marginTop: 6, letterSpacing: "-0.5px" }}>
            +{formatMoney(totalAccruedInterest)}
          </div>
          <p style={{ fontSize: "11.5px", color: "#64748B", margin: "3px 0 0" }}>
            Under Section 16 (3x RBI Bank Rate ~ 20.25% p.a.)
          </p>
        </div>

        {/* Critical Defaults (> 45 Days) */}
        <div className="module-card" style={{ margin: 0, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Critical Breaches (&gt;45D)
            </span>
            <ShieldAlert size={17} style={{ color: "#E11D48" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: critical45Count > 0 ? "#E11D48" : "#059669", marginTop: 6, letterSpacing: "-0.5px" }}>
            {critical45Count} Invoices
          </div>
          <p style={{ fontSize: "11.5px", color: "#64748B", margin: "3px 0 0" }}>
            Eligible for immediate MSME Samadhaan conciliation
          </p>
        </div>

        {/* Early Discount Acceleratable Inflow */}
        <div className="module-card" style={{ margin: 0, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Early Discount Inflow
            </span>
            <Sparkles size={17} style={{ color: "#059669" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#059669", marginTop: 6, letterSpacing: "-0.5px" }}>
            {formatMoney(totalAcceleratableCapital)}
          </div>
          <p style={{ fontSize: "11.5px", color: "#64748B", margin: "3px 0 0" }}>
            Acceleratable at {globalDiscountRate}% prompt discount
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. LEGAL & STATUTORY PROTECTIONS BANNER (MSMED ACT & SEC 43B(H))
          ========================================================================= */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "22px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                background: "rgba(225, 29, 72, 0.2)",
                color: "#FDA4AF",
                padding: "2px 7px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Statutory Law Enforcement
            </span>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              MSMED Act 2006 (Sec 15–17) & Income Tax Act Sec 43B(h)
            </span>
          </div>

          <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", margin: "2px 0 4px" }}>
            Protect Your Cash Flow with Legal Compounding Interest & Samadhaan Conciliation
          </div>

          <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: 1.5, maxWidth: 700 }}>
            Corporate buyers must settle within 45 days. Delayed payments legally attract compound interest at 3x the RBI Bank Rate (~20.25% p.a.). Overdue liabilities are disallowable under Income Tax Section 43B(h).
          </p>
        </div>

        <a
          href="https://samadhaan.msme.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
            color: "#FFFFFF",
            fontSize: "12.5px",
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <span>MSME Samadhaan (MSEFC) Portal</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* =========================================================================
          3. DUAL OPERATING TABS SWITCHER
          ========================================================================= */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 }}>
          <button
            onClick={() => setActiveTab("legal_recovery")}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: activeTab === "legal_recovery" ? "1px solid #E11D48" : "1px solid #E2E8F0",
              background: activeTab === "legal_recovery" ? "#FFF1F2" : "#FFFFFF",
              color: activeTab === "legal_recovery" ? "#BE123C" : "#475569",
              fontSize: "13px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Scale size={16} style={{ color: activeTab === "legal_recovery" ? "#E11D48" : "#64748B" }} />
            <span>1. Statutory Legal Recovery (Overdue Invoices)</span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 7px",
                borderRadius: "10px",
                background: activeTab === "legal_recovery" ? "#E11D48" : "#E2E8F0",
                color: activeTab === "legal_recovery" ? "#FFFFFF" : "#475569",
              }}
            >
              {overdueInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("early_discount")}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: activeTab === "early_discount" ? "1px solid #059669" : "1px solid #E2E8F0",
              background: activeTab === "early_discount" ? "#F0FDF4" : "#FFFFFF",
              color: activeTab === "early_discount" ? "#047857" : "#475569",
              fontSize: "13px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Sparkles size={16} style={{ color: activeTab === "early_discount" ? "#059669" : "#64748B" }} />
            <span>2. Early Payment Cash Discounts (Advance Settlement)</span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 7px",
                borderRadius: "10px",
                background: activeTab === "early_discount" ? "#059669" : "#E2E8F0",
                color: activeTab === "early_discount" ? "#FFFFFF" : "#475569",
              }}
            >
              {eligibleEarlyDiscountInvoices.length}
            </span>
          </button>
        </div>

        {/* Search & Sub-Filter Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "#FFFFFF",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
              minWidth: 240,
              background: "#F8FAFC",
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Search size={15} style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search by customer name, invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "12.5px",
                width: "100%",
                color: "#0F172A",
              }}
            />
          </div>

          {activeTab === "legal_recovery" ? (
            /* Overdue Filter Pills */
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[
                { id: "all", label: "All Overdue" },
                { id: "critical_45", label: "Critical (>45 Days)" },
                { id: "moderate_15", label: "15–45 Days" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOverdueFilter(f.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: overdueFilter === f.id ? "1px solid #E11D48" : "1px solid #E2E8F0",
                    background: overdueFilter === f.id ? "#E11D48" : "#F8FAFC",
                    color: overdueFilter === f.id ? "#FFFFFF" : "#475569",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            /* Early Discount Global Configurator */
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Discount %:</span>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.5}
                  value={globalDiscountRate}
                  onChange={(e) => setGlobalDiscountRate(Number(e.target.value))}
                  style={{ width: 90, accentColor: "#059669", cursor: "pointer" }}
                />
                <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#059669", minWidth: 36 }}>
                  {globalDiscountRate}%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Pay Within:</span>
                <select
                  value={globalSettlementWindow}
                  onChange={(e) => setGlobalSettlementWindow(Number(e.target.value))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0F172A",
                    background: "#FFFFFF",
                  }}
                >
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={10}>10 Days</option>
                  <option value={15}>15 Days</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. TAB CONTENT 1: STATUTORY LEGAL RECOVERY TABLE
          ========================================================================= */}
      {activeTab === "legal_recovery" && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Overdue Receivables & Statutory Interest Ledger
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748B", margin: "2px 0 0" }}>
                Auto-calculated compound interest under Section 16 of MSMED Act at 20.25% p.a.
              </p>
            </div>

            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Showing <strong>{filteredOverdueInvoices.length}</strong> overdue records
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 18px" }}>Debtor / Customer</th>
                  <th style={{ padding: "12px 14px" }}>Invoice Ref</th>
                  <th style={{ padding: "12px 14px" }}>Due Date</th>
                  <th style={{ padding: "12px 14px" }}>Days Overdue</th>
                  <th style={{ padding: "12px 14px" }}>Principal</th>
                  <th style={{ padding: "12px 14px" }}>MSMED Interest</th>
                  <th style={{ padding: "12px 14px" }}>Total Legal Due</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOverdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                      <CheckCircle2 size={32} style={{ color: "#059669", marginBottom: 8 }} />
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                        No overdue invoices found
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: 2 }}>
                        All customers are currently compliant within standard payment windows.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOverdueInvoices.map((inv) => (
                    <tr
                      key={inv.id || inv.invoiceNumber}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <strong style={{ color: "#0F172A", display: "block" }}>{inv.customer || "General Debtor"}</strong>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>GSTIN: {inv.gstin || "27AABCT9012F1Z1"}</span>
                      </td>

                      <td style={{ padding: "14px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#334155" }}>
                          #{inv.invoiceNumber || inv.id}
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", color: "#475569" }}>
                        {inv.dueDate || "2026-07-15"}
                      </td>

                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            background: inv.isCritical45 ? "rgba(225, 29, 72, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: inv.isCritical45 ? "#BE123C" : "#B45309",
                          }}
                        >
                          {inv.overdueDays} Days {inv.isCritical45 ? "(45D+ Critical)" : ""}
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0F172A" }}>
                        {formatMoney(inv.amount)}
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 800, color: "#BE123C" }}>
                        +{formatMoney(inv.compoundInterest)}
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 900, color: "#0F172A" }}>
                        {formatMoney(inv.totalClaimable)}
                      </td>

                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenNoticeModal(inv, "legal_recovery")}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "7px",
                            border: "none",
                            background: inv.isCritical45 ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "#0F172A",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Send size={12} />
                          <span>Draft Legal Notice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. TAB CONTENT 2: EARLY PAYMENT CASH DISCOUNT TABLE
          ========================================================================= */}
      {activeTab === "early_discount" && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Early Payment Cash Discount & Working Capital Accelerator
              </h3>
              <p style={{ fontSize: "11.5px", color: "#64748B", margin: "2px 0 0" }}>
                Incentivize prompt buyer settlement by offering {globalDiscountRate}% cash discount within {globalSettlementWindow} days.
              </p>
            </div>

            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 6, fontSize: "11.5px", color: "#047857", fontWeight: 700 }}>
              Active Discount Rate: {globalDiscountRate}%
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 18px" }}>Customer Name</th>
                  <th style={{ padding: "12px 14px" }}>Invoice Ref</th>
                  <th style={{ padding: "12px 14px" }}>Gross Payable</th>
                  <th style={{ padding: "12px 14px" }}>Discount %</th>
                  <th style={{ padding: "12px 14px" }}>Buyer Saves</th>
                  <th style={{ padding: "12px 14px" }}>Net Cash Inflow</th>
                  <th style={{ padding: "12px 14px" }}>Settlement Window</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEarlyInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                      <Info size={32} style={{ color: "#94A3B8", marginBottom: 8 }} />
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                        No pending invoices eligible for prompt discount
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEarlyInvoices.map((inv) => (
                    <tr
                      key={inv.id || inv.invoiceNumber}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <strong style={{ color: "#0F172A", display: "block" }}>{inv.customer || "Corporate Buyer"}</strong>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>Due: {inv.dueDate || "Standard"}</span>
                      </td>

                      <td style={{ padding: "14px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#334155" }}>
                          #{inv.invoiceNumber || inv.id}
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0F172A" }}>
                        {formatMoney(inv.amount)}
                      </td>

                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#047857",
                          }}
                        >
                          {globalDiscountRate}% OFF
                        </span>
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 800, color: "#059669" }}>
                        - {formatMoney(inv.discountAmount)}
                      </td>

                      <td style={{ padding: "14px 14px", fontWeight: 900, color: "#0F172A" }}>
                        {formatMoney(inv.netPayable)}
                      </td>

                      <td style={{ padding: "14px 14px", color: "#475569" }}>
                        Within {globalSettlementWindow} Days
                      </td>

                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenNoticeModal(inv, "early_discount")}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "7px",
                            border: "none",
                            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                          }}
                        >
                          <Send size={12} />
                          <span>Draft Discount Offer</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. NOTICE / PROPOSAL DRAFT MODAL
          ========================================================================= */}
      <CashRecoveryNoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        invoice={selectedInvoice}
        business={business}
        discountPercentage={globalDiscountRate}
        settlementDays={globalSettlementWindow}
      />

      {/* =========================================================================
          7. UNIVERSAL UPLOAD MODAL (CSV / EXCEL / PDF / JSON)
          ========================================================================= */}
      <UniversalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </ModulePage>
  );
}
