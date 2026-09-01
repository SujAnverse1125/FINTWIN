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
import { parseInvoiceFile } from "../utils/invoiceParser";
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

  // Download Sample CSV Template
  const handleDownloadSample = () => {
    const csvContent =
      "Invoice ID,Customer,Amount,Invoice Date,Due Date,Status\n" +
      "INV-2026-001,Tata Motors CV Hub,450000,2026-08-15,2026-09-15,Pending\n" +
      "INV-2026-002,Reliance Retail Supply,780000,2026-08-20,2026-09-20,Pending\n" +
      "INV-2026-003,Mahindra Auto Hub,320000,2026-08-10,2026-09-10,Pending\n" +
      "INV-2026-004,Larsen & Toubro Infra,1250000,2026-08-01,2026-09-30,Pending\n" +
      "INV-2026-005,Bajaj Auto Industrial,290000,2026-08-25,2026-09-25,Paid\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "FinTwin_Sample_Invoices_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Load Sample Test Invoices into preview
  const handleLoadSamplePreview = () => {
    const sampleInvoices = [
      {
        id: "INV-DEMO-101",
        customer: "Tata Motors CV Hub",
        amount: 450000,
        invoiceDate: "2026-08-15",
        dueDate: "2026-09-15",
        status: "Pending",
        predictedDelayDays: 4,
        riskScore: "Low",
      },
      {
        id: "INV-DEMO-102",
        customer: "Reliance Retail Supply",
        amount: 780000,
        invoiceDate: "2026-08-20",
        dueDate: "2026-09-20",
        status: "Pending",
        predictedDelayDays: 14,
        riskScore: "Medium",
      },
      {
        id: "INV-DEMO-103",
        customer: "Mahindra Auto Hub",
        amount: 320000,
        invoiceDate: "2026-08-10",
        dueDate: "2026-09-10",
        status: "Pending",
        predictedDelayDays: 2,
        riskScore: "Low",
      },
      {
        id: "INV-DEMO-104",
        customer: "Larsen & Toubro Infra",
        amount: 1250000,
        invoiceDate: "2026-08-01",
        dueDate: "2026-09-30",
        status: "Pending",
        predictedDelayDays: 18,
        riskScore: "High",
      },
      {
        id: "INV-DEMO-105",
        customer: "Bajaj Auto Industrial",
        amount: 290000,
        invoiceDate: "2026-08-25",
        dueDate: "2026-09-25",
        status: "Paid",
        predictedDelayDays: 0,
        riskScore: "Low",
      },
    ];

    setParsedPreview({
      format: "Pre-Populated MSME Test Data",
      invoices: sampleInvoices,
      fileName: "sample_msme_invoices.csv",
    });
  };

  const handleConfirmIngestion = () => {
    if (!parsedPreview?.invoices) return;

    if (activeCategory === "expenses") {
      parsedPreview.invoices.forEach((item) => {
        addExpense({
          category: "Vendor Purchase",
          description: `${item.customer || "Vendor Bill"} (Imported)`,
          amount: Number(item.amount) || 0,
          date: item.invoiceDate || new Date().toISOString().slice(0, 10),
          recurring: false,
          gstRate: 18,
        });
      });
      setSuccessMessage(`✓ Successfully ingested ${parsedPreview.invoices.length} expense records into your Digital Twin!`);
    } else {
      createInvoices(parsedPreview.invoices);
      setSuccessMessage(`✓ Successfully ingested ${parsedPreview.invoices.length} invoices! Cash runway and AI delay radar updated.`);
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

