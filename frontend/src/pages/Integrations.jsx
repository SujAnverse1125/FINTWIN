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
} from "lucide-react";

const initialConnectors = [
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
    id: "quickbooks",
    name: "QuickBooks Online",
    category: "Cloud Accounting",
    desc: "Intuit OAuth connector for global billing and multi-currency accounts.",
    status: "Disconnected",
    lastSync: "Never",
    records: "0 Records",
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
  {
    id: "aa",
    name: "RBI Account Aggregator (Setu / Finvu)",
    category: "Open Banking",
    desc: "Live bank statement verification and auto-reconciliation of inflows.",
    status: "Connected",
    lastSync: "Today, 11:00 AM",
    records: "3 Bank Accounts",
  },
];

export default function Integrations() {
  const [connectors, setConnectors] = useState(initialConnectors);
  const [syncingId, setSyncingId] = useState(null);
  const [toast, setToast] = useState("");

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
            background: "linear-gradient(135deg, #1C6758, #059669)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: 13.5,
            boxShadow: "var(--shadow-lg)",
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#1C6758" }}>
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
                border: isConnected
                  ? "1px solid rgba(59,130,246,0.3)"
                  : "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>
                    {c.category}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: isConnected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                      color: isConnected ? "#1C6758" : "var(--text-muted)",
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{c.name}</h3>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                  {c.desc}
                </p>
              </div>

              <div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.02)",
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Last Synced: <strong>{c.lastSync}</strong></span>
                  <span>{c.records}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isConnected ? (
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
    </div>
  );
}
