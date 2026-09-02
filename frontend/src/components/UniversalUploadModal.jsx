import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Database,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Percent,
  Download,
  Copy,
  FileCheck,
} from "lucide-react";
import { parseInvoiceFile, enrichInvoicesWithML } from "../utils/invoiceParser";
import { createInvoices, addExpense } from "../data/financialStore";

const UPLOAD_CATEGORIES = [
  {
    id: "invoices",
    label: "Sales Invoices & Receivables",
    desc: "CSV, Excel (.xlsx/.xls), PDF, or JSON e-invoices",
    icon: FileText,
    badge: "Most Common",
    badgeColor: "#059669",
  },
  {
    id: "expenses",
    label: "Vendor Bills & Operating Expenses",
    desc: "Purchase invoices, utility receipts & recurring bills",
    icon: CreditCard,
    badge: "Burn Tracking",
    badgeColor: "#E11D48",
  },
  {
    id: "bank_aa",
    label: "Bank Statements & Telemetry",
    desc: "OFX, CSV statement feeds & account aggregator",
    icon: Building,
    badge: "Live Telemetry",
    badgeColor: "#0284C7",
  },
  {
    id: "gst",
    label: "GST Portal Data (GSTR-1 / 2B)",
    desc: "Government portal JSON/Excel returns for ITC",
    icon: Percent,
    badge: "Tax Audit",
    badgeColor: "#7C3AED",
  },
];

export default function UniversalUploadModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState("invoices");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setSuccessMessage("");
    try {
      const result = await parseInvoiceFile(file);
      if (result && result.invoices && result.invoices.length > 0) {
        setParsedPreview(result);
      } else {
        alert("Could not extract structured records from this file. Please ensure it has standard columns (Amount, Customer, Due Date).");
      }
    } catch (err) {
      alert("Error parsing file. Supported formats: .csv, .xlsx, .xls, .pdf, .json, .txt");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Download Complete 40-Row Sample CSV Dataset
  const handleDownloadSample = () => {
    const csvContent =
      "Invoice ID,Customer,Amount,Invoice Date,Due Date,Status,Payment Terms,Previous Avg Delay Days,Previous Late Payments,Customer Tenure Months,HSN Code,GST Rate\n" +
      "INV-2026-101,Mehta Heavy Traders,850000,2026-07-20,2026-08-20,Overdue,Net 30,18.5,4,24,8481.80,18%\n" +
      "INV-2026-102,Mehta Heavy Traders,520000,2026-08-01,2026-09-01,Pending,Net 30,18.5,4,24,8481.80,18%\n" +
      "INV-2026-103,Mehta Heavy Traders,430000,2026-08-15,2026-09-15,Pending,Net 30,18.5,4,24,8481.80,18%\n" +
      "INV-2026-104,Sona Global Exports,460000,2026-07-15,2026-08-15,Overdue,Net 30,12.0,2,18,6203.42,12%\n" +
      "INV-2026-105,Sona Global Exports,380000,2026-08-05,2026-09-05,Pending,Net 30,12.0,2,18,6203.42,12%\n" +
      "INV-2026-106,Sona Global Exports,290000,2026-08-20,2026-09-20,Pending,Net 30,12.0,2,18,6203.42,12%\n" +
      "INV-2026-107,Reliance Retail Supply,940000,2026-08-02,2026-09-02,Pending,Net 30,5.2,1,36,8708.29,18%\n" +
      "INV-2026-108,Reliance Retail Supply,680000,2026-08-18,2026-09-18,Pending,Net 30,5.2,1,36,8708.29,18%\n" +
      "INV-2026-109,Krishna Furnishings & Fabrics,320000,2026-08-10,2026-09-10,Pending,Net 30,3.0,0,14,5407.52,5%\n" +
      "INV-2026-110,Krishna Furnishings & Fabrics,210000,2026-08-22,2026-09-22,Pending,Net 30,3.0,0,14,5407.52,5%\n" +
      "INV-2026-111,Anand Auto Agencies,190000,2026-07-28,2026-08-28,Overdue,Net 30,14.2,3,10,8708.99,18%\n" +
      "INV-2026-112,Anand Auto Agencies,145000,2026-08-12,2026-09-12,Pending,Net 30,14.2,3,10,8708.99,18%\n" +
      "INV-2026-113,Tata Motors CV Hub,1250000,2026-08-01,2026-09-30,Pending,Net 60,4.0,0,48,8704.23,28%\n" +
      "INV-2026-114,Tata Motors CV Hub,780000,2026-08-14,2026-10-14,Pending,Net 60,4.0,0,48,8704.23,28%\n" +
      "INV-2026-115,Larsen & Toubro Infra,1650000,2026-07-10,2026-09-10,Pending,Net 60,8.5,1,40,7308.90,18%\n" +
      "INV-2026-116,Larsen & Toubro Infra,920000,2026-08-05,2026-10-05,Pending,Net 60,8.5,1,40,7308.90,18%\n" +
      "INV-2026-117,Bajaj Auto Industrial,540000,2026-08-08,2026-09-08,Pending,Net 30,2.5,0,30,8711.20,18%\n" +
      "INV-2026-118,Bajaj Auto Industrial,380000,2026-08-24,2026-09-24,Pending,Net 30,2.5,0,30,8711.20,18%\n" +
      "INV-2026-119,Godrej Consumer Goods,410000,2026-08-06,2026-09-06,Pending,Net 30,1.8,0,28,3401.11,18%\n" +
      "INV-2026-120,Godrej Consumer Goods,360000,2026-08-25,2026-09-25,Pending,Net 30,1.8,0,28,3401.11,18%\n" +
      "INV-2026-121,Apollo Tyres Logistics,620000,2026-08-11,2026-09-11,Pending,Net 30,6.0,1,22,4011.20,28%\n" +
      "INV-2026-122,Apollo Tyres Logistics,480000,2026-08-26,2026-09-26,Pending,Net 30,6.0,1,22,4011.20,28%\n" +
      "INV-2026-123,Mahindra Aerospace Division,890000,2026-07-25,2026-09-25,Pending,Net 60,3.2,0,32,8803.30,18%\n" +
      "INV-2026-124,Hero MotoCorp Suppliers,340000,2026-08-03,2026-09-03,Pending,Net 30,4.5,0,16,8714.10,18%\n" +
      "INV-2026-125,Havells Electricals Network,470000,2026-08-16,2026-09-16,Pending,Net 30,2.0,0,20,8536.50,18%\n" +
      "INV-2026-126,JSW Steel Processing,1150000,2026-07-18,2026-08-18,Overdue,Net 30,16.0,3,15,7208.10,18%\n" +
      "INV-2026-127,JSW Steel Processing,720000,2026-08-19,2026-09-19,Pending,Net 30,16.0,3,15,7208.10,18%\n" +
      "INV-2026-128,Blue Star Precision Cooling,280000,2026-08-09,2026-09-09,Pending,Net 30,1.5,0,25,8415.10,28%\n" +
      "INV-2026-129,Thermax Energy Systems,610000,2026-08-13,2026-09-13,Pending,Net 30,7.0,1,19,8402.11,18%\n" +
      "INV-2026-130,Kirloskar Brothers Engines,530000,2026-08-07,2026-09-07,Pending,Net 30,5.0,0,26,8413.70,18%\n" +
      "INV-2026-131,Mehta Heavy Traders,620000,2026-06-15,2026-07-15,Paid,Net 30,18.0,4,24,8481.80,18%\n" +
      "INV-2026-132,Tata Motors CV Hub,890000,2026-06-01,2026-08-01,Paid,Net 60,3.5,0,48,8704.23,28%\n" +
      "INV-2026-133,Reliance Retail Supply,710000,2026-06-18,2026-07-18,Paid,Net 30,4.8,1,36,8708.29,18%\n" +
      "INV-2026-134,Larsen & Toubro Infra,1400000,2026-05-20,2026-07-20,Paid,Net 60,7.0,1,40,7308.90,18%\n" +
      "INV-2026-135,Bajaj Auto Industrial,450000,2026-06-25,2026-07-25,Paid,Net 30,2.0,0,30,8711.20,18%\n" +
      "INV-2026-136,Godrej Consumer Goods,390000,2026-06-10,2026-07-10,Paid,Net 30,1.2,0,28,3401.11,18%\n" +
      "INV-2026-137,Apollo Tyres Logistics,510000,2026-06-14,2026-07-14,Paid,Net 30,5.5,1,22,4011.20,28%\n" +
      "INV-2026-138,Krishna Furnishings & Fabrics,280000,2026-06-22,2026-07-22,Paid,Net 30,2.5,0,14,5407.52,5%\n" +
      "INV-2026-139,Anand Auto Agencies,160000,2026-06-05,2026-07-05,Paid,Net 30,13.0,3,10,8708.99,18%\n" +
      "INV-2026-140,Sona Global Exports,410000,2026-06-12,2026-07-12,Paid,Net 30,11.5,2,18,6203.42,12%\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nexfin_cash_recovery_master_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Load Sample Test Invoices into preview
  const handleLoadSamplePreview = async () => {
    setIsProcessing(true);
    const sampleInvoices = [
      {
        id: "INV-DEMO-101",
        customer: "Tata Motors CV Hub",
        amount: 450000,
        invoiceDate: "2026-08-15",
        dueDate: "2026-09-15",
        status: "Pending",
        previousAvgDelay: 5.2,
        previousLatePayments: 1,
      },
      {
        id: "INV-DEMO-102",
        customer: "Reliance Retail Supply",
        amount: 780000,
        invoiceDate: "2026-08-20",
        dueDate: "2026-09-20",
        status: "Pending",
        previousAvgDelay: 14.5,
        previousLatePayments: 3,
      },
      {
        id: "INV-DEMO-103",
        customer: "Mahindra Auto Hub",
        amount: 320000,
        invoiceDate: "2026-08-10",
        dueDate: "2026-09-10",
        status: "Pending",
        previousAvgDelay: 1.8,
        previousLatePayments: 0,
      },
      {
        id: "INV-DEMO-104",
        customer: "Larsen & Toubro Infra",
        amount: 1250000,
        invoiceDate: "2026-08-01",
        dueDate: "2026-09-30",
        status: "Pending",
        previousAvgDelay: 22.0,
        previousLatePayments: 5,
      },
      {
        id: "INV-DEMO-105",
        customer: "Bajaj Auto Industrial",
        amount: 290000,
        invoiceDate: "2026-08-25",
        dueDate: "2026-09-25",
        status: "Paid",
        previousAvgDelay: 0.0,
        previousLatePayments: 0,
      },
    ];

    const enriched = await enrichInvoicesWithML(sampleInvoices);

    setParsedPreview({
      format: "AI-Enriched MSME Test Dataset (ML Model v2.0)",
      invoices: enriched,
      fileName: "sample_msme_invoices.csv",
    });
    setIsProcessing(false);
  };

  const handleConfirmIngestion = () => {
    if (!parsedPreview?.invoices) return;

    let invoiceCount = 0;
    let expenseCount = 0;
    const invoicesToCreate = [];

    parsedPreview.invoices.forEach((item) => {
      const isExpense =
        activeCategory === "expenses" ||
        String(item.type || "").toLowerCase().includes("expense") ||
        String(item.type || "").toLowerCase().includes("recurring") ||
        String(item.type || "").toLowerCase().includes("payroll") ||
        String(item.type || "").toLowerCase().includes("liability") ||
        String(item.category || "").toLowerCase().match(/payroll|salary|rent|utility|utilities|power|saas|software|materials|freight|maintenance|misc/i);

      if (isExpense) {
        const isRecurring =
          String(item.type || "").toLowerCase().includes("recurring") ||
          String(item.frequency || "").toLowerCase().includes("monthly") ||
          String(item.category || "").toLowerCase().match(/payroll|salary|rent|lease|power|utility|utilities|software|saas|security|internet/i);

        addExpense({
          category: item.category || "General Expense",
          description: item.description || item.customer || "Operational Expense",
          amount: Number(item.amount) || 0,
          date: item.invoiceDate || new Date().toISOString().slice(0, 10),
          recurring: isRecurring,
          dayOfMonth: Number(item.dayOfMonth || 1),
          gstRate: parseFloat(String(item.gstRate || "18").replace("%", "").trim()) || 18,
        });
        expenseCount++;
      } else {
        invoicesToCreate.push({
          ...item,
          gstRate: parseFloat(String(item.gstRate || "18").replace("%", "").trim()) || 18,
        });
        invoiceCount++;
      }
    });

    if (invoicesToCreate.length > 0) {
      createInvoices(invoicesToCreate);
    }

    if (invoiceCount > 0 && expenseCount > 0) {
      setSuccessMessage(`✓ Master Sync Complete! Ingested ${invoiceCount} Invoices & ${expenseCount} Expenses across all modules!`);
    } else if (expenseCount > 0) {
      setSuccessMessage(`✓ Successfully ingested ${expenseCount} expense records into your Digital Twin!`);
    } else {
      setSuccessMessage(`✓ Successfully ingested ${invoiceCount} invoices! Cash runway and AI delay radar updated.`);
    }

    setParsedPreview(null);
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 1600);
  };

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;
  const totalParsedValue =
    parsedPreview?.invoices?.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    ) || 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          color: "#0F172A",
          animation: "scaleUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(248, 250, 252, 0.85)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#0F172A" }}>
                Universal Financial Data Ingestion
              </h2>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0, marginTop: 1 }}>
                Upload business invoices, bank statements, or ERP CSV/Excel exports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "rgba(15, 23, 42, 0.05)",
              border: "none",
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Success Banner */}
          {successMessage && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid #10B981",
                borderRadius: "12px",
                padding: "14px 18px",
                color: "#059669",
                fontSize: "13px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {!parsedPreview ? (
            <>
              {/* Category Selector Tabs */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  1. Select Ingestion Category
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {UPLOAD_CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: active ? "#FFFFFF" : "#F8FAFC",
                          border: active
                            ? `2px solid ${cat.badgeColor}`
                            : "1px solid rgba(226, 232, 240, 0.9)",
                          boxShadow: active
                            ? "0 4px 14px rgba(15, 23, 42, 0.08)"
                            : "none",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Icon size={16} color={cat.badgeColor} />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0F172A",
                              }}
                            >
                              {cat.label}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            lineHeight: 1.3,
                          }}
                        >
                          {cat.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    2. Upload File or Spreadsheet
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284C7",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Download size={13} />
                      <span>Download Sample CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSamplePreview}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#059669",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Try Sample Data</span>
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${
                      dragActive ? "#059669" : "rgba(203, 213, 225, 0.9)"
                    }`,
                    background: dragActive ? "rgba(16, 185, 129, 0.05)" : "#F8FAFC",
                    borderRadius: "14px",
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf,.json,.txt,.tsv"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <Upload size={22} />
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0F172A",
                      marginBottom: 4,
                    }}
                  >
                    {isProcessing
                      ? "⚡ Processing OCR & Extracting Records..."
                      : "Drop your files here, or click to browse"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      marginBottom: 12,
                    }}
                  >
                    Supports CSV, Excel (.xlsx/.xls), PDF Invoices, JSON, Tally XML & Text files
                  </div>

                  <button
                    type="button"
                    className="btn btn-emerald btn-sm"
                    style={{ pointerEvents: "none" }}
                  >
                    Select File From Device
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Parsed Ingestion Preview Stage */
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#F8FAFC",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    File Parsed: {parsedPreview.fileName}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#059669",
                      marginTop: 2,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {parsedPreview.invoices.length} Records Extracted ({formatLakhs(totalParsedValue)})
                  </div>
                </div>

                <button
                  onClick={() => setParsedPreview(null)}
                  style={{
                    fontSize: 12,
                    color: "#E11D48",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Choose Different File
                </button>
              </div>

              {/* Table Preview */}
              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  marginBottom: 16,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12.5,
                    textAlign: "left",
                  }}
                >
                  <thead
                    style={{
                      background: "rgba(15, 23, 42, 0.03)",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <tr>
                      <th style={{ padding: "8px 12px", color: "#64748B", fontWeight: 700 }}>
                        Customer / Entity
                      </th>
                      <th style={{ padding: "8px 12px", color: "#64748B", fontWeight: 700 }}>
                        Amount
                      </th>
                      <th style={{ padding: "8px 12px", color: "#64748B", fontWeight: 700 }}>
                        Due Date
                      </th>
                      <th style={{ padding: "8px 12px", color: "#64748B", fontWeight: 700 }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.invoices.slice(0, 8).map((inv, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderTop: "1px solid rgba(226, 232, 240, 0.8)",
                        }}
                      >
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                          {inv.customer || "General Entry"}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            fontWeight: 800,
                            color: "#059669",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {formatLakhs(inv.amount)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#64748B" }}>
                          {inv.dueDate || "Standard (30d)"}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            className={`status-badge ${
                              inv.status === "Paid" ? "paid" : "pending"
                            }`}
                          >
                            {inv.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setParsedPreview(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-emerald"
                  onClick={handleConfirmIngestion}
                  style={{ padding: "9px 22px" }}
                >
                  <Sparkles size={16} />
                  <span>Ingest & Compute Digital Twin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

