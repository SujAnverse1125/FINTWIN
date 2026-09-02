import React, { useState } from "react";
import {
  Layers,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  ExternalLink,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  Terminal,
  Sparkles,
  QrCode,
} from "lucide-react";

import SetuSandboxModal from "../components/SetuSandboxModal";

const initialConnectors = [
  {
    id: "aa",
    name: "Setu Account Aggregator & Open Banking (Pine Labs)",
    category: "RBI Account Aggregator (AA)",
    desc: "Consent-based 12-month bank telemetry ingestion, statement decryption, and dynamic digital twin synchronization.",
    status: "Connected",
    lastSync: "Today, 11:00 AM",
    records: "3 Bank Accounts Synced",
    isSetu: true,
  },
  {
    id: "setu_upi",
    name: "Setu UPI DeepLink & Dynamic QR Gateway",
    category: "Instant Payments & Settlement",
    desc: "Generate invoice collection deep links with automated real-time UTR webhook reconciliation.",
    status: "Connected",
    lastSync: "Today, 11:45 AM",
    records: "₹12.5L Verified",
    isSetu: true,
  },
  {
    id: "tally",
    name: "Tally Prime XML & ODBC",
    category: "ERP & Accounting",
    desc: "Direct local ledger and sales voucher sync with Tally Prime 3.0+.",
    status: "Connected",
    lastSync: "Today, 10:45 AM",
    records: "142 Vouchers",
  },
  {
    id: "zoho",
    name: "Zoho Books API",
    category: "Cloud Accounting",
    desc: "Real-time webhook sync for invoices, expenses, and payments.",
    status: "Connected",
    lastSync: "Today, 11:20 AM",
    records: "89 Invoices",
  },
  {
    id: "gstn",
    name: "GSTN e-Invoice & GSTR-1 Portal",
    category: "Government Compliance",
    desc: "Automated GST e-invoice IRN verification and B2B invoice sync.",
    status: "Connected",
    lastSync: "Yesterday, 06:15 PM",
    records: "28 IRN Filings",
  },
  {
    id: "razorpay",
    name: "Razorpay / Payment Gateway",
    category: "Payment Gateway",
    desc: "Capture payment link settlements, QR payments, and customer payouts.",
    status: "Connected",
    lastSync: "Today, 09:30 AM",
    records: "₹4.8L Processed",
  },
];

export default function Integrations() {
  const [connectors, setConnectors] = useState(initialConnectors);
  const [syncingId, setSyncingId] = useState(null);
  const [toast, setToast] = useState("");
  const [isSetuModalOpen, setIsSetuModalOpen] = useState(false);

  const handleSyncNow = (id) => {
    setSyncingId(id);
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: "Connected", lastSync: "Just now" }
            : c
        )
      );
      setSyncingId(null);
      setToast("Integration data synchronized successfully!");
      setTimeout(() => setToast(""), 3500);
    }, 1200);
  };

  const handleToggle = (id) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "Connected" ? "Disconnected" : "Connected";
          return {
            ...c,
            status: nextStatus,
            lastSync: nextStatus === "Connected" ? "Just now" : c.lastSync,
          };
        }
        return c;
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Notice */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 85,
            right: 36,
            background: "linear-gradient(135deg, #0284C7, #0369A1)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            fontSize: 13.5,
            boxShadow: "0 10px 25px rgba(2, 132, 199, 0.3)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* =========================================================================
          HERO BANNER: SETU DEVELOPER SANDBOX & SIMULATION STUDIO
          ========================================================================= */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: "20px",
          padding: "26px 30px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 15px 35px -5px rgba(15, 23, 42, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "3px 9px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.4)",
              }}
            >
              Setu API Developer Sandbox • v2.4
            </span>
            <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }}></span>
              Sandbox Live • 42ms
            </span>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#FFFFFF", margin: "4px 0 8px", letterSpacing: "-0.5px" }}>
            Setu Open Banking & Account Aggregator Simulation Studio
          </h2>

          <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0, lineHeight: 1.6, maxWidth: 680 }}>
            Demonstrate real-world <strong>Account Aggregator (AA) consent flows</strong>, <strong>UPI Dynamic QR collections with instant webhook reconciliation</strong>, and <strong>IMPS Penny Drop bank verification</strong> built on Setu (Pine Labs) architecture.
          </p>
        </div>

        <button
          onClick={() => setIsSetuModalOpen(true)}
          style={{
            padding: "13px 24px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
            color: "#FFFFFF",
            border: "none",
            fontSize: "13.5px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(2, 132, 199, 0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <Zap size={16} />
          <span>Launch Setu Developer Sandbox Studio →</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap emerald">
              <Layers size={18} />
            </div>
            <div>
              <div className="card-title">Accounting & Financial Stack Integrations</div>
              <div className="card-subtitle">
                Automated continuous data pipelines from your existing ERP, billing & banking systems
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "#059669", fontWeight: 700 }}>
            <ShieldCheck size={16} />
            <span>End-to-End Encrypted Pipelines</span>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid-3" style={{ gap: 20 }}>
        {connectors.map((c) => {
          const isConnected = c.status === "Connected";
          const isSyncing = syncingId === c.id;

          return (
            <div
              key={c.id}
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: c.isSetu
                  ? "1px solid rgba(2, 132, 199, 0.4)"
                  : isConnected
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: c.isSetu ? "#0284C7" : "var(--text-dim)" }}>
                    {c.category}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: isConnected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                      color: isConnected ? "#059669" : "var(--text-muted)",
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#0F172A" }}>{c.name}</h3>
                <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
                  {c.desc}
                </p>
              </div>

              <div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "#F8FAFC",
                    fontSize: 11.5,
                    color: "#64748B",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Last Synced: <strong>{c.lastSync}</strong></span>
                  <span style={{ fontWeight: 700, color: "#0F172A" }}>{c.records}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {c.isSetu ? (
                    <button
                      onClick={() => setIsSetuModalOpen(true)}
                      style={{
                        width: "100%",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                        color: "#FFFFFF",
                        fontSize: "12.5px",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
                      }}
                    >
                      <Zap size={14} />
                      <span>Open Setu Interactive Sandbox</span>
                    </button>
                  ) : isConnected ? (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        disabled={isSyncing}
                        onClick={() => handleSyncNow(c.id)}
                      >
                        <RefreshCw size={13} className={isSyncing ? "spin-animation" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleToggle(c.id)}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => handleToggle(c.id)}
                    >
                      Connect Integration
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setu Sandbox Modal */}
      <SetuSandboxModal
        isOpen={isSetuModalOpen}
        onClose={() => setIsSetuModalOpen(false)}
      />
    </div>
  );
}
