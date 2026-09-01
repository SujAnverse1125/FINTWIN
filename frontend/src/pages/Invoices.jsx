import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Check,
  Send,
  Sparkles,
  Filter,
  FileSpreadsheet,
  FileCode,
  File,
  Cpu,
  ArrowRight,
  ExternalLink,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  X,
  Paperclip,
  Mic,
  Zap,
  Undo2,
  Redo2,
  MoveHorizontal,
  Edit3,
  HelpCircle
} from "lucide-react";

import {
  getInvoices,
  getCustomers,
  addInvoice,
  createInvoices,
  updateInvoiceStatus,
  deleteInvoice,
  subscribeFinancialData,
} from "../data/financialStore";
import { parseInvoiceFile } from "../utils/invoiceParser";

// Default Indian Corporate Buyers with real payment track records
const INITIAL_DEMO_BUYERS = [
  {
    id: "CUST-001",
    name: "Tata Motors CV Hub",
    industry: "Auto-Ancillary OEM",
    location: "Pune MIDC, MH",
    gstin: "27AAACT2727Q1ZW",
    rating: "AAA",
    onTimeScore: 98,
    avatar: "🚗",
    clearedCount: "12/12 Invoices Cleared",
    invoices: [
      {
        id: "INV-26-891",
        amount: 451350,
        day: 9,
        span: 2,
        status: "TReDS Ready",
        type: "treds",
        label: "₹4.51L • TReDS Ready (8.1%)",
        dueText: "Due in 2 days",
      },
      {
        id: "INV-26-720",
        amount: 382000,
        day: 2,
        span: 2,
        status: "Paid",
        type: "paid",
        label: "₹3.82L • Settled",
        dueText: "Paid on Dec 2",
      },
    ],
  },
  {
    id: "CUST-002",
    name: "Mahindra Auto Hub",
    industry: "Commercial Vehicles",
    location: "Chakan Industrial, MH",
    gstin: "27AABCM4512Q1ZX",
    rating: "AA+",
    onTimeScore: 94,
    avatar: "🚜",
    clearedCount: "8/10 Invoices Cleared",
    invoices: [
      {
        id: "INV-26-844",
        amount: 820000,
        day: 4,
        span: 3,
        status: "Scheduled",
        type: "scheduled",
        label: "₹8.20L • Scheduled Due",
        dueText: "Due on Dec 7",
      },
    ],
  },
  {
    id: "CUST-003",
    name: "Reliance Retail Supply",
    industry: "Retail & FMCG Logistics",
    location: "Navi Mumbai, MH",
    gstin: "27AABCR9914Q1ZY",
    rating: "AAA",
    onTimeScore: 86,
    avatar: "🛍️",
    clearedCount: "5/8 Invoices Cleared",
    invoices: [
      {
        id: "INV-26-612",
        amount: 1240000,
        day: 8,
        span: 4,
        status: "Pending",
        type: "pending",
        label: "₹12.4L • Sec 15 Audit",
        dueText: "35 days elapsed",
      },
      {
        id: "INV-26-903",
        amount: 540000,
        day: 15,
        span: 2,
        status: "Scheduled",
        type: "scheduled",
        label: "₹5.40L • Due Dec 16",
        dueText: "Due in 8 days",
      },
    ],
  },
  {
    id: "CUST-004",
    name: "Larsen & Toubro Infra",
    industry: "Heavy Infrastructure",
    location: "Powai Mumbai, MH",
    gstin: "27AAACL0112Q1ZK",
    rating: "AAA",
    onTimeScore: 99,
    avatar: "🏗️",
    clearedCount: "14/14 Invoices Cleared",
    invoices: [
      {
        id: "INV-26-940",
        amount: 1480000,
        day: 3,
        span: 3,
        status: "Paid",
        type: "paid",
        label: "₹14.8L • Settled",
        dueText: "Cleared Dec 5",
      },
    ],
  },
  {
    id: "CUST-005",
    name: "Bajaj Auto Industrial",
    industry: "2-Wheeler Ancillary",
    location: "Waluj Aurangabad, MH",
    gstin: "27AAACB1102Q1ZQ",
    rating: "AA",
    onTimeScore: 92,
    avatar: "⚙️",
    clearedCount: "9/10 Invoices Cleared",
    invoices: [
      {
        id: "INV-26-995",
        amount: 625000,
        day: 14,
        span: 3,
        status: "Scheduled",
        type: "scheduled",
        label: "₹6.25L • Scheduled",
        dueText: "Due Dec 16",
      },
    ],
  },
];

// 16 Calendar Days
const TIMELINE_DAYS = [
  { dayName: "Mon", dayNum: 1, isWeekend: false },
  { dayName: "Tue", dayNum: 2, isWeekend: false },
  { dayName: "Wed", dayNum: 3, isWeekend: false },
  { dayName: "Thu", dayNum: 4, isWeekend: false },
  { dayName: "Fri", dayNum: 5, isWeekend: false },
  { dayName: "Sat", dayNum: 6, isWeekend: true },
  { dayName: "Sun", dayNum: 7, isWeekend: true },
  { dayName: "Mon", dayNum: 8, isWeekend: false },
  { dayName: "Tue", dayNum: 9, isWeekend: false, isToday: true },
  { dayName: "Wed", dayNum: 10, isWeekend: false },
  { dayName: "Thu", dayNum: 11, isWeekend: false },
  { dayName: "Fri", dayNum: 12, isWeekend: false },
  { dayName: "Sat", dayNum: 13, isWeekend: true },
  { dayName: "Sun", dayNum: 14, isWeekend: true },
  { dayName: "Mon", dayNum: 15, isWeekend: false },
  { dayName: "Tue", dayNum: 16, isWeekend: false },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(getInvoices());
  const [customers, setCustomers] = useState(getCustomers());
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" or "table"
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [notification, setNotification] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // ==========================================
  // DRAG & DROP + UNDO / REDO STATE
  // ==========================================
  const [demoBuyers, setDemoBuyers] = useState(INITIAL_DEMO_BUYERS);
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredDropCell, setHoveredDropCell] = useState(null); // { buyerId, dayNum }
  const [pendingConfirmation, setPendingConfirmation] = useState(null); // change details to confirm

  // Multi-Format Upload State
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);

  // New Invoice Form
  const [newCustomer, setNewCustomer] = useState(
    customers[0]?.name || "Tata Motors CV Hub"
  );
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setInvoices(getInvoices());
      setCustomers(getCustomers());
    });
    return unsub;
  }, []);

  // Keyboard shortcut listener for Undo (Ctrl+Z) & Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyStack, redoStack, demoBuyers]);

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  // ==========================================
  // UNDO & REDO HANDLERS
  // ==========================================
  const handleUndo = () => {
    if (historyStack.length === 0) {
      showNotice("Nothing to undo.");
      return;
    }
    const previousState = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [JSON.parse(JSON.stringify(demoBuyers)), ...prev]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setDemoBuyers(previousState);
    showNotice("↺ Undid last schedule change!");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      showNotice("Nothing to redo.");
      return;
    }
    const nextState = redoStack[0];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(demoBuyers))]);
    setRedoStack((prev) => prev.slice(1));
    setDemoBuyers(nextState);
    showNotice("↻ Redid schedule change!");
  };

  // ==========================================
  // DRAG AND DROP HANDLERS
  // ==========================================
  const handleDragStart = (e, buyerId, invoice) => {
    const payload = {
      buyerId,
      invoiceId: invoice.id,
      amount: invoice.amount,
      oldDay: invoice.day,
      span: invoice.span,
      label: invoice.label,
      status: invoice.status,
      type: invoice.type,
    };
    setDraggedItem(payload);
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, buyerId, dayNum) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!hoveredDropCell || hoveredDropCell.buyerId !== buyerId || hoveredDropCell.dayNum !== dayNum) {
      setHoveredDropCell({ buyerId, dayNum });
    }
  };

  const handleDragLeave = () => {
    setHoveredDropCell(null);
  };

  const handleDrop = (e, targetBuyerId, targetDayNum) => {
    e.preventDefault();
    setHoveredDropCell(null);

    let data = draggedItem;
    if (!data) {
      try {
        data = JSON.parse(e.dataTransfer.getData("application/json"));
      } catch (err) {
        return;
      }
    }

    if (!data) return;

    const sourceBuyer = demoBuyers.find((b) => b.id === data.buyerId);
    const targetBuyer = demoBuyers.find((b) => b.id === targetBuyerId);

    if (!sourceBuyer || !targetBuyer) return;

    // Check if anything actually changed
    if (data.buyerId === targetBuyerId && data.oldDay === targetDayNum) {
      return;
    }

    // Set up change confirmation request
    setPendingConfirmation({
      invoiceId: data.invoiceId,
      sourceBuyerId: data.buyerId,
      sourceBuyerName: sourceBuyer.name,
      targetBuyerId: targetBuyerId,
      targetBuyerName: targetBuyer.name,
      oldDay: data.oldDay,
      newDay: targetDayNum,
      amount: data.amount,
      label: data.label,
      span: data.span,
      status: data.status,
      type: data.type,
    });
  };

  // Confirm schedule modification
  const handleConfirmScheduleChange = () => {
    if (!pendingConfirmation) return;

    const {
      invoiceId,
      sourceBuyerId,
      targetBuyerId,
      oldDay,
      newDay,
      sourceBuyerName,
      targetBuyerName,
    } = pendingConfirmation;

    // Save current state to history stack for Undo
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(demoBuyers))]);
    setRedoStack([]); // Clear redo stack upon new action

    // Update demoBuyers immutably
    setDemoBuyers((prev) => {
      return prev.map((buyer) => {
        // If moving out of source buyer
        if (buyer.id === sourceBuyerId && sourceBuyerId !== targetBuyerId) {
          return {
            ...buyer,
            invoices: buyer.invoices.filter((inv) => inv.id !== invoiceId),
          };
        }

        // If moving within the same buyer
        if (buyer.id === sourceBuyerId && sourceBuyerId === targetBuyerId) {
          return {
            ...buyer,
            invoices: buyer.invoices.map((inv) => {
              if (inv.id === invoiceId) {
                // If moved before Day 9 (Today), mark as Paid, else Scheduled
                const isPast = newDay < 9;
                return {
                  ...inv,
                  day: newDay,
                  status: isPast ? "Paid" : inv.type === "treds" ? "TReDS Ready" : "Scheduled",
                  type: isPast ? "paid" : inv.type === "treds" ? "treds" : "scheduled",
                  label: `${formatLakhs(inv.amount)} • ${isPast ? "Settled" : "Scheduled (Dec " + newDay + ")"}`,
                  dueText: isPast ? `Paid on Dec ${newDay}` : `Due on Dec ${newDay}`,
                };
              }
              return inv;
            }),
          };
        }

        // If moving into target buyer from a different buyer
        if (buyer.id === targetBuyerId && sourceBuyerId !== targetBuyerId) {
          const invObj = pendingConfirmation;
          const isPast = newDay < 9;
          const movedInvoice = {
            id: invObj.invoiceId,
            amount: invObj.amount,
            day: newDay,
            span: invObj.span,
            status: isPast ? "Paid" : "Scheduled",
            type: isPast ? "paid" : "scheduled",
            label: `${formatLakhs(invObj.amount)} • ${isPast ? "Settled" : "Scheduled (Dec " + newDay + ")"}`,
            dueText: isPast ? `Paid on Dec ${newDay}` : `Due on Dec ${newDay}`,
          };
          return {
            ...buyer,
            invoices: [...buyer.invoices, movedInvoice],
          };
        }

        return buyer;
      });
    });

    setPendingConfirmation(null);
    setDraggedItem(null);
    showNotice(
      `✓ Successfully updated schedule: Moved from Dec ${oldDay} to Dec ${newDay}!`
    );
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newAmount) return;

    addInvoice({
      customer: newCustomer,
      amount: Number(newAmount),
      dueDate:
        newDueDate ||
        new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: newStatus,
    });

    setNewAmount("");
    setShowCreateModal(false);
    showNotice("GST Invoice created successfully!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const result = await parseInvoiceFile(file);
      if (result && result.invoices && result.invoices.length > 0) {
        setParsedPreview(result);
      } else {
        showNotice("Could not extract invoices from file.");
      }
    } catch (err) {
      showNotice("Error processing invoice file.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview?.invoices) return;
    createInvoices(parsedPreview.invoices);
    setParsedPreview(null);
    setShowUploadModal(false);
    showNotice(`Successfully ingested ${parsedPreview.invoices.length} invoices!`);
  };

  return (
    <div
      style={{
        backgroundColor: "transparent",
        minHeight: "100vh",
        padding: "20px 24px 40px",
        fontFamily: "'Inter', sans-serif",
        color: "#121316",
      }}
    >
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 28,
            zIndex: 10000,
            background: "#121316",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* =========================================================================
          TOP NAVIGATION BAR & CONTROLS (WITH UNDO / REDO)
          ========================================================================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Left Segmented Pill Navigation */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.05)",
            padding: "4px",
            borderRadius: "14px",
            gap: "4px",
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <button
            onClick={() => setViewMode("timeline")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: 600,
              background: viewMode === "timeline" ? "#ffffff" : "transparent",
              color: viewMode === "timeline" ? "#121316" : "#64748b",
              boxShadow:
                viewMode === "timeline" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Calendar size={14} />
            <span>Planned Inflows (Timeline)</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: 600,
              background: viewMode === "table" ? "#ffffff" : "transparent",
              color: viewMode === "table" ? "#121316" : "#64748b",
              boxShadow:
                viewMode === "table" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Layers size={14} />
            <span>All Invoices Ledger</span>
          </button>

          {/* Quick Search Capsule */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "10px",
              padding: "4px 10px",
              marginLeft: "4px",
            }}
          >
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search Buyer or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "12px",
                marginLeft: 6,
                width: "140px",
                color: "#121316",
                background: "transparent",
              }}
            />
          </div>
        </div>

        {/* Center-Right: Undo/Redo Group, Avatars & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Undo / Redo Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "10px",
              padding: "2px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              title="Undo (Ctrl+Z)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: historyStack.length > 0 ? "#121316" : "#cbd5e1",
                cursor: historyStack.length > 0 ? "pointer" : "not-allowed",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Undo2 size={13} />
              <span>Undo</span>
            </button>

            <div style={{ width: "1px", height: "16px", background: "#e2e8f0" }} />

            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: redoStack.length > 0 ? "#121316" : "#cbd5e1",
                cursor: redoStack.length > 0 ? "pointer" : "not-allowed",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Redo2 size={13} />
              <span>Redo</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#121316",
              border: "1px solid rgba(0,0,0,0.08)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <Plus size={14} />
            <span>+ Add Invoice</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "10px",
              background: "#121316",
              color: "#ffffff",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Upload size={14} />
            <span>Ingest GST/OCR</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Instructions Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(2, 132, 199, 0.07)",
          border: "1px solid rgba(2, 132, 199, 0.2)",
          padding: "8px 16px",
          borderRadius: "12px",
          marginBottom: "16px",
          fontSize: "12px",
          color: "#0369a1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MoveHorizontal size={15} color="#0284c7" />
          <span>
            <strong>Interactive Drag & Drop:</strong> Drag any invoice pill horizontally across calendar days to re-schedule settlement dates. Changes prompt a confirmation dialog with full Undo (<strong>Ctrl+Z</strong>) and Redo support.
          </span>
        </div>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7" }}>
          {historyStack.length} Change(s) in History
        </span>
      </div>

      {/* =========================================================================
          VIEW MODE: TIMELINE GANTT (WITH DRAG & DROP)
          ========================================================================= */}
      {viewMode === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* MAIN CARD: PLANNED INFLOWS & COLLECTIONS SCHEDULE */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px 28px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    margin: 0,
                    color: "#121316",
                    letterSpacing: "-0.4px",
                  }}
                >
                  Planned Inflows & Collections Schedule
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0" }}>
                  Visual 45-day statutory payment radar and TReDS early liquidity forecast.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#334155",
                  }}
                >
                  <Calendar size={13} />
                  <span>December 15, 2026</span>
                </div>

                <button
                  onClick={() => setViewMode("table")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#059669",
                    cursor: "pointer",
                  }}
                >
                  <span>View all</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            {/* Gantt Calendar Table with Drag & Drop */}
            <div style={{ overflowX: "auto", position: "relative" }}>
              <div style={{ minWidth: "1020px" }}>
                {/* Table Header: Buyer Column Title + 16 Days */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ width: "230px", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                    Corporate Buyers
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns: "repeat(16, 1fr)",
                      gap: "2px",
                    }}
                  >
                    {TIMELINE_DAYS.map((d, idx) => (
                      <div
                        key={idx}
                        style={{
                          textAlign: "center",
                          fontSize: "11px",
                          fontWeight: d.isToday ? 700 : 500,
                          color: d.isToday ? "#0284c7" : d.isWeekend ? "#cbd5e1" : "#64748b",
                          background: d.isToday ? "rgba(2, 132, 199, 0.08)" : "transparent",
                          borderRadius: "6px",
                          padding: "4px 0",
                        }}
                      >
                        <div style={{ fontSize: "10px", color: d.isToday ? "#0284c7" : "#94a3b8" }}>{d.dayName}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700 }}>{d.dayNum}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows: Corporate Buyers with Drag & Drop drop zones */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                  {/* Active Day Indicator (Vertical Blue Dashed Line on Day 9) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "calc(230px + ((8 + 0.5) / 16) * (100% - 230px))",
                      top: 0,
                      bottom: 0,
                      width: "2px",
                      borderLeft: "2px dashed #0284c7",
                      pointerEvents: "none",
                      zIndex: 20,
                    }}
                  />

                  {demoBuyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #f8fafc",
                        position: "relative",
                        minHeight: "56px",
                      }}
                    >
                      {/* Left Column: Buyer Identity (Isolated, Never Overlapped) */}
                      <div
                        style={{
                          width: "230px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          paddingRight: "12px",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        >
                          {buyer.avatar}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#121316",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {buyer.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>{buyer.industry.split(" ")[0]}</span>
                            <span>•</span>
                            <span style={{ color: "#059669", fontWeight: 700 }}>{buyer.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Timeline Grid: Droppable Day Slots */}
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          height: "44px",
                          display: "grid",
                          gridTemplateColumns: "repeat(16, 1fr)",
                          gap: "2px",
                        }}
                      >
                        {/* Interactive Droppable Day Cells */}
                        {TIMELINE_DAYS.map((d, dIdx) => {
                          const isHovered =
                            hoveredDropCell &&
                            hoveredDropCell.buyerId === buyer.id &&
                            hoveredDropCell.dayNum === d.dayNum;

                          return (
                            <div
                              key={dIdx}
                              onDragOver={(e) => handleDragOver(e, buyer.id, d.dayNum)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, buyer.id, d.dayNum)}
                              style={{
                                height: "100%",
                                background: isHovered
                                  ? "rgba(2, 132, 199, 0.2)"
                                  : d.isWeekend
                                  ? "repeating-linear-gradient(45deg, #f8fafc, #f8fafc 4px, #f1f5f9 4px, #f1f5f9 8px)"
                                  : "#ffffff",
                                borderRadius: "6px",
                                border: isHovered
                                  ? "2px dashed #0284c7"
                                  : d.isToday
                                  ? "1px solid rgba(2, 132, 199, 0.25)"
                                  : "1px solid #f8fafc",
                                transition: "background 0.12s, border 0.12s",
                              }}
                            />
                          );
                        })}

                        {/* Draggable Invoice Pills */}
                        {buyer.invoices.map((inv, iIdx) => {
                          const leftPct = ((inv.day - 1) / 16) * 100;
                          const widthPct = (inv.span / 16) * 100;

                          let pillBg = "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)";
                          let pillShadow = "0 4px 12px rgba(109, 40, 217, 0.25)";

                          if (inv.type === "paid") {
                            pillBg = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                            pillShadow = "0 4px 12px rgba(5, 150, 105, 0.25)";
                          } else if (inv.type === "treds") {
                            pillBg = "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)";
                            pillShadow = "0 6px 16px rgba(2, 132, 199, 0.3)";
                          } else if (inv.type === "pending") {
                            pillBg = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                            pillShadow = "0 4px 12px rgba(217, 119, 6, 0.25)";
                          }

                          return (
                            <div
                              key={iIdx}
                              draggable
                              onDragStart={(e) => handleDragStart(e, buyer.id, inv)}
                              onClick={() => setSelectedInvoice({ ...inv, buyer: buyer.name, gstin: buyer.gstin })}
                              title="Click to view details or drag horizontally to change date"
                              style={{
                                position: "absolute",
                                left: `calc(${leftPct}% + 4px)`,
                                width: `calc(${widthPct}% - 8px)`,
                                top: "6px",
                                height: "32px",
                                borderRadius: "16px",
                                background: pillBg,
                                color: "#ffffff",
                                boxShadow: pillShadow,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0 10px",
                                fontSize: "11px",
                                fontWeight: 600,
                                zIndex: 10,
                                cursor: "grab",
                                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
                                e.currentTarget.style.zIndex = "30";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.zIndex = "10";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                <MoveHorizontal size={11} style={{ opacity: 0.75, flexShrink: 0 }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {inv.label}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: "8.5px",
                                  background: "rgba(255,255,255,0.3)",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                  flexShrink: 0,
                                  fontWeight: 700,
                                  marginLeft: 4,
                                }}
                              >
                                {inv.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              BOTTOM 3-COLUMN GRID: PRIORITY DUE NOTICES, BUYER HEALTH & AI COPILOT
              ========================================================================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
              alignItems: "stretch",
            }}
          >
            {/* CARD 1: PRIORITY CASH INFLOWS & DUE NOTICES (Sunny Yellow Outcrowd Event) */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#121316" }}>
                    Urgent Inflows & Due Notices
                  </h3>
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600, cursor: "pointer" }}>
                    View all ↗
                  </span>
                </div>

                {/* Highlighted Active Yellow Event Card */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
                    borderRadius: "14px",
                    padding: "16px",
                    color: "#713f12",
                    boxShadow: "0 6px 18px rgba(234, 179, 8, 0.2)",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#422006" }}>
                        Tata Motors CV Hub (₹4,51,350)
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#713f12", marginTop: 2 }}>
                        TReDS 24hr settlement ready at 8.1% APR
                      </div>
                    </div>
                    <span
                      style={{
                        background: "rgba(0,0,0,0.08)",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      • Due in 2 days
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      🕒 Due Dec 11
                    </div>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      📅 45-Day Sec 15
                    </div>
                  </div>
                </div>

                {/* Secondary Cards */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    border: "1px solid #f1f5f9",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                    Reliance Retail (₹12,40,000)
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: 2 }}>
                    Section 15 MSMED 45-Day statutory notice trigger
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                    L&T Infrastructure (₹14,80,000)
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: 2 }}>
                    100% GSTR-2B ITC reconciled & approved
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: BUYER HEALTH & VERIFICATION PIPELINE */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#121316" }}>
                  Buyer Settlement Pipeline
                </h3>
                <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600, cursor: "pointer" }}>
                  View all ↗
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {demoBuyers.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid #f1f5f9",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        marginBottom: 8,
                      }}
                    >
                      {b.avatar}
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#121316" }}>{b.name}</div>
                    <div style={{ fontSize: "10.5px", color: "#64748b", margin: "2px 0 8px" }}>
                      {b.onTimeScore}% On-Time • {b.rating}
                    </div>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "5px",
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#059669",
                      }}
                    >
                      {b.clearedCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: FIN-TWIN AI LIQUIDITY COPILOT */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)",
                    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.35)",
                    margin: "0 auto 12px",
                  }}
                />

                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 4px 0", color: "#121316" }}>
                  Welcome, Finance Team
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px 0" }}>
                  What liquidity action shall we execute today?
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                  <button
                    onClick={() => showNotice("Routed ₹4.51L Tata Motors invoice to TReDS auction!")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: "7px",
                      background: "#f1f5f9",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <Zap size={12} color="#0284c7" />
                    <span>Discount TReDS</span>
                  </button>

                  <button
                    onClick={() => showNotice("Generated Section 15 MSMED 45-day statutory notice!")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: "7px",
                      background: "#f1f5f9",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <ShieldCheck size={12} color="#059669" />
                    <span>Send 45-Day Notice</span>
                  </button>

                  <button
                    onClick={() => showNotice("Compiled comprehensive GSTR-2B cash flow report!")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: "7px",
                      background: "#f1f5f9",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <FileText size={12} color="#8b5cf6" />
                    <span>Get Reports</span>
                  </button>
                </div>
              </div>

              {/* Natural Language Prompt Input */}
              <div
                style={{
                  width: "100%",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <input
                  type="text"
                  placeholder="Ask anything about invoices or delays..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && aiPrompt) {
                      showNotice(`FinTwin AI: Analyzing "${aiPrompt}" against GSTR-2B ledger.`);
                      setAiPrompt("");
                    }
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "12px",
                    color: "#121316",
                    marginBottom: 8,
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      padding: "3px 6px",
                      borderRadius: "5px",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Paperclip size={10} />
                    <span>Attach file</span>
                  </button>

                  <button
                    onClick={() => {
                      if (aiPrompt) {
                        showNotice(`FinTwin AI: Analyzing "${aiPrompt}".`);
                        setAiPrompt("");
                      }
                    }}
                    style={{
                      background: "#121316",
                      color: "#ffffff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE: TABLE LEDGER
          ========================================================================= */}
      {viewMode === "table" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.03)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>All Customer Invoices</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                Complete GST tax invoice ledger with payment status controls.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["all", "pending", "overdue", "paid"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeTab === tab ? "#121316" : "#f1f5f9",
                    color: activeTab === tab ? "#ffffff" : "#64748b",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 12px" }}>Invoice ID</th>
                  <th style={{ padding: "10px 12px" }}>Buyer / Customer</th>
                  <th style={{ padding: "10px 12px" }}>Amount</th>
                  <th style={{ padding: "10px 12px" }}>Due Date</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#121316" }}>{inv.id}</td>
                    <td style={{ padding: "12px" }}>{inv.customer}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatLakhs(inv.amount)}</td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{inv.dueDate}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background:
                            inv.status === "Paid"
                              ? "rgba(16,185,129,0.1)"
                              : inv.status === "Overdue"
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(245,158,11,0.1)",
                          color:
                            inv.status === "Paid"
                              ? "#059669"
                              : inv.status === "Overdue"
                              ? "#dc2626"
                              : "#d97706",
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            updateInvoiceStatus(inv.id, "Paid");
                            showNotice(`Marked ${inv.id} as Paid!`);
                          }}
                          title="Mark as Paid"
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          ✓ Settle
                        </button>
                        <button
                          onClick={() => {
                            deleteInvoice(inv.id);
                            showNotice(`Deleted ${inv.id}`);
                          }}
                          style={{
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#fee2e2",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRM SCHEDULE MODIFICATION (DRAG & DROP CONFIRMATION)
          ========================================================================= */}
      {pendingConfirmation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(18, 19, 22, 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => {
            setPendingConfirmation(null);
            setDraggedItem(null);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "26px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "rgba(2, 132, 199, 0.12)",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoveHorizontal size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#121316" }}>
                  Confirm Schedule Adjustment
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Verify the invoice settlement date modification.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #e2e8f0",
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: "12px", color: "#64748b" }}>Buyer & Invoice</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#121316", marginTop: 2 }}>
                {pendingConfirmation.sourceBuyerName}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#059669", marginTop: 2 }}>
                {formatLakhs(pendingConfirmation.amount)} ({pendingConfirmation.invoiceId})
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid #e2e8f0",
                  fontSize: "12.5px",
                }}
              >
                <div>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "10.5px" }}>Original Date</span>
                  <strong style={{ color: "#dc2626" }}>December {pendingConfirmation.oldDay}, 2026</strong>
                </div>
                <ArrowRight size={16} color="#64748b" />
                <div>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "10.5px" }}>New Date</span>
                  <strong style={{ color: "#059669" }}>December {pendingConfirmation.newDay}, 2026</strong>
                </div>
              </div>

              {pendingConfirmation.newDay < 9 && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    color: "#059669",
                    marginTop: 12,
                    fontWeight: 600,
                  }}
                >
                  ✓ Moving before today (Dec 9) will automatically mark this invoice as <strong>Settled / Paid</strong>.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleConfirmScheduleChange}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  background: "#121316",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Confirm & Update Schedule
              </button>
              <button
                onClick={() => {
                  setPendingConfirmation(null);
                  setDraggedItem(null);
                }}
                style={{
                  padding: "11px 18px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INVOICE INSPECTION / MANUAL EDIT & TReDS
          ========================================================================= */}
      {selectedInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>Invoice Details</div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", marginBottom: 16 }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Buyer / Customer</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#121316", marginTop: 2 }}>
                {selectedInvoice.buyer}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>GSTIN: {selectedInvoice.gstin || "27AAACT2727Q1ZW"}</div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Amount</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                    {formatLakhs(selectedInvoice.amount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Settlement Date</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0284c7" }}>
                    December {selectedInvoice.day}, 2026
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  showNotice(`Initiated TReDS discounting for ${selectedInvoice.id} at 8.1% interest!`);
                  setSelectedInvoice(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#121316",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⚡ Discount on TReDS (24h)
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW INVOICE
          ========================================================================= */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0" }}>Create GST Tax Invoice</h3>
            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Buyer / Customer</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    marginTop: 4,
                  }}
                >
                  {demoBuyers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Invoice Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 450000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#121316",
                    color: "#ffffff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INGEST GST / OCR FILE UPLOAD
          ========================================================================= */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0" }}>
              Universal Invoicing OCR & File Ingestion
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
              Upload PDF Tax Invoices, e-Way bills, Tally / Zoho CSV exports, or scanned receipts.
            </p>

            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "28px",
                textAlign: "center",
                background: "#f8fafc",
                cursor: "pointer",
                marginBottom: 16,
              }}
              onClick={() => document.getElementById("file-upload-input").click()}
            >
              <Upload size={24} color="#64748b" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: "13px", fontWeight: 600 }}>Click to upload or drag & drop</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 4 }}>
                Supports PDF, Excel (.xlsx), CSV, JSON, PNG, JPG
              </div>
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,.json,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>

            {isProcessingFile && (
              <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: 600, textAlign: "center", marginBottom: 12 }}>
                ⚡ Processing OCR & Extracting GST Line Items...
              </div>
            )}

            {parsedPreview && (
              <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", marginBottom: 16 }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669" }}>
                  ✓ Found {parsedPreview.invoices.length} valid invoice records!
                </div>
                <button
                  onClick={handleConfirmImport}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#059669",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "12px",
                    border: "none",
                    marginTop: 8,
                    cursor: "pointer",
                  }}
                >
                  Confirm & Sync into Radar
                </button>
              </div>
            )}

            <button
              onClick={() => setShowUploadModal(false)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "7px",
                background: "#f1f5f9",
                border: "none",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}