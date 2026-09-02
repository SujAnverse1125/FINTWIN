import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  CreditCard,
  QrCode,
  Building2,
  ArrowRight,
  RefreshCw,
  FileCode,
  Terminal,
  Send,
  AlertCircle,
  Database,
  Lock,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  DollarSign,
  Wallet,
} from "lucide-react";

import {
  getFinancialData,
  updateInvoiceStatus,
  updateBusinessProfile,
  createInvoices,
} from "../data/financialStore";

export default function SetuSandboxModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("aa_consent"); // "aa_consent" | "upi_qr" | "penny_drop" | "api_console"
  const [copiedKey, setCopiedKey] = useState(null);

  // Playground 1: Account Aggregator (AA) State
  const [aaStep, setAaStep] = useState(1); // 1: Config, 2: Mobile OTP, 3: Decrypted Data & Sync
  const [customerName, setCustomerName] = useState("Mehta Heavy Tooling Pvt Ltd");
  const [mobileNumber, setMobileNumber] = useState("9820123456");
  const [aaHandle, setAaHandle] = useState("9820123456@setu-aa");
  const [selectedFips, setSelectedFips] = useState(["HDFC Bank Ltd", "State Bank of India"]);
  const [customBalanceLakhs, setCustomBalanceLakhs] = useState(38.5); // ₹38.5L
  const [otpInput, setOtpInput] = useState("7492");
  const [isConsentLoading, setIsConsentLoading] = useState(false);
  const [isSyncSuccess, setIsSyncSuccess] = useState(false);

  // Playground 2: UPI Dynamic QR State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [isUpiSimulating, setIsUpiSimulating] = useState(false);
  const [upiPaymentDone, setUpiPaymentDone] = useState(false);
  const [lastUtr, setLastUtr] = useState("");

  // Playground 3: KYC & Penny Drop State
  const [verifyType, setVerifyType] = useState("bank"); // "bank" | "gstin"
  const [bankAcc, setBankAcc] = useState("50200012345678");
  const [ifscCode, setIfscCode] = useState("HDFC0000240");
  const [gstinInput, setGstinInput] = useState("27AADCM9921E1Z3");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Playground 4: API Console State
  const [apiEndpoint, setApiEndpoint] = useState("aa_initiate");

  const storeData = getFinancialData();
  const invoices = (storeData.invoices || []).filter((i) => i.status !== "Paid");

  useEffect(() => {
    if (invoices.length > 0 && (!selectedInvoiceId || !invoices.some(i => (i.id || i.invoiceNumber) === selectedInvoiceId))) {
      setSelectedInvoiceId(invoices[0].id || invoices[0].invoiceNumber);
    }
  }, [invoices, selectedInvoiceId]);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // AA Consent Handlers
  const handleInitiateConsent = (e) => {
    if (e) e.preventDefault();
    setIsConsentLoading(true);
    setTimeout(() => {
      setIsConsentLoading(false);
      setAaStep(2);
    }, 700);
  };

  const handleApproveConsent = () => {
    setIsConsentLoading(true);
    setTimeout(() => {
      setIsConsentLoading(false);
      setAaStep(3);
    }, 850);
  };

  const handleSyncToDigitalTwin = () => {
    const verifiedBalance = Math.round(Number(customBalanceLakhs || 38.5) * 100000);
    updateBusinessProfile({
      openingCash: verifiedBalance,
    });
    setIsSyncSuccess(true);
    setTimeout(() => setIsSyncSuccess(false), 4500);
  };

  const handleResetAaFlow = () => {
    setAaStep(1);
    setIsSyncSuccess(false);
    setOtpInput("7492");
  };

  // UPI Simulation Handlers
  const selectedInvoice = storeData.invoices?.find(
    (i) => (i.id || i.invoiceNumber) === selectedInvoiceId
  ) || invoices[0] || { id: "INV-2026-088", customer: "Mehta Heavy Tooling", amount: 1250000 };

  const handleSimulateUpiPayment = () => {
    setIsUpiSimulating(true);
    setTimeout(() => {
      const utr = `UTR-SETU-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setLastUtr(utr);
      setIsUpiSimulating(false);
      setUpiPaymentDone(true);
      if (selectedInvoice?.id || selectedInvoice?.invoiceNumber) {
        updateInvoiceStatus(selectedInvoice.id || selectedInvoice.invoiceNumber, "Paid");
      }
    }, 1200);
  };

  const handleResetUpi = () => {
    setUpiPaymentDone(false);
    setLastUtr("");
  };

  // KYC Verification Handler
  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (verifyType === "bank") {
        setVerifyResult({
          status: "SUCCESS",
          accountNumber: bankAcc,
          ifsc: ifscCode,
          bankName: ifscCode.startsWith("HDFC") ? "HDFC Bank Ltd" : ifscCode.startsWith("SBIN") ? "State Bank of India" : ifscCode.startsWith("ICIC") ? "ICICI Bank Ltd" : "Axis Bank Ltd",
          accountHolderName: customerName.toUpperCase(),
          nameMatchScore: 99.2,
          accountExists: true,
          verificationId: `SETU-VRF-${Math.floor(100000 + Math.random() * 900000)}`,
          pennyAmountDeposited: "₹1.00 (IMPS Active)",
          utr: `524810${Math.floor(100000 + Math.random() * 900000)}`,
        });
      } else {
        setVerifyResult({
          status: "ACTIVE",
          gstin: gstinInput,
          legalName: customerName.toUpperCase(),
          tradeName: customerName.replace("Pvt Ltd", "Corp").replace("Ltd", "Enterprises").toUpperCase(),
          registrationDate: "2018-07-01",
          constitutionOfBusiness: "Private Limited Company",
          filingStatusGstr3b: "Compliant (GSTR-3B Filed on time)",
          taxpayerType: "Regular Taxpayer",
          stateJurisdiction: "Maharashtra (Ward 4 / Range II)",
          eInvoiceApplicable: true,
        });
      }
    }, 900);
  };

  // Navigation action handlers
  const handleNavigateToCashFlow = () => {
    onClose();
    navigate("/cash-flow");
  };

  const handleNavigateToDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  const handleNavigateToInvoices = () => {
    onClose();
    navigate("/invoices");
  };

  // API Console Snippets
  const getApiConsoleData = () => {
    switch (apiEndpoint) {
      case "aa_initiate":
        return {
          method: "POST",
          url: "https://sandbox.setu.co/api/v2/consents",
          headers: {
            "x-client-id": "nexfin_sandbox_live_8912",
            "x-client-secret": "sec_sandbox_k82m9x0119za",
            "x-product-instance-id": "inst_aa_fiu_sahamat_991",
            "Content-Type": "application/json",
          },
          body: {
            consentHandler: aaHandle,
            consentMode: "VIEW",
            fetchType: "PERIODIC",
            consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
            fipTypes: ["DEPOSIT", "SAVINGS"],
            fips: selectedFips,
            dataRange: { from: "2025-09-01", to: "2026-09-01" },
            callbackUrl: "https://nexfin.app/api/webhooks/setu/aa",
          },
          response: {
            id: "con_setu_989127419",
            status: "PENDING",
            url: "https://sandbox.setu.co/consent/con_setu_989127419",
            expiresOn: "2026-09-03T18:30:00Z",
          },
        };

      case "upi_create":
        return {
          method: "POST",
          url: "https://sandbox.setu.co/api/v2/payment-links",
          headers: {
            "x-client-id": "nexfin_sandbox_live_8912",
            "x-client-secret": "sec_sandbox_k82m9x0119za",
            "x-product-instance-id": "inst_upi_deeplink_771",
            "Content-Type": "application/json",
          },
          body: {
            amount: { value: Number(selectedInvoice?.amount || 1250000) * 100, currency: "INR" },
            billerBillID: selectedInvoice?.id || selectedInvoice?.invoiceNumber || "INV-2026-088",
            transactionNote: `Settlement for Invoice #${selectedInvoice?.id || selectedInvoice?.invoiceNumber || "INV-2026-088"}`,
            expiryDate: new Date(Date.now() + 86400000).toISOString(),
            settlementOption: "DIRECT_TO_ACCOUNT",
          },
          response: {
            id: "plink_setu_88491290",
            status: "ACTIVE",
            upiLink: `upi://pay?pa=nexfin@icici&pn=NexFin+MSME&am=${selectedInvoice?.amount || 1250000}&tr=${selectedInvoice?.id || selectedInvoice?.invoiceNumber}`,
            shortUrl: "https://setu.to/pl/88491290",
          },
        };

      case "penny_drop":
        return {
          method: "POST",
          url: "https://sandbox.setu.co/api/v2/verify/bank-account",
          headers: {
            "x-client-id": "nexfin_sandbox_live_8912",
            "x-client-secret": "sec_sandbox_k82m9x0119za",
            "x-product-instance-id": "inst_verify_penny_331",
            "Content-Type": "application/json",
          },
          body: {
            accountNumber: bankAcc,
            ifsc: ifscCode,
            name: customerName,
          },
          response: {
            status: "SUCCESS",
            verificationId: "vrf_setu_99214810",
            accountHolderName: customerName.toUpperCase(),
            nameMatchScore: 99.2,
            utr: "524810992812",
          },
        };

      default:
        return {};
    }
  };

  const consoleData = getApiConsoleData();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "980px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.35)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: "20px 28px 16px",
            borderBottom: "1px solid #E2E8F0",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "#FFFFFF",
            borderTopLeftRadius: "22px",
            borderTopRightRadius: "22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#38BDF8",
                    letterSpacing: "0.5px",
                  }}
                >
                  Setu API Sandbox (Pine Labs)
                </span>
                <span style={{ fontSize: "11.5px", color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}></span>
                  Node v2.4 • 42ms Live
                </span>
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 0", letterSpacing: "-0.4px" }}>
                Setu Open Banking & Account Aggregator Simulation Studio
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              width: 34,
              height: 34,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sandbox Navigation Tabs (Clean Wrapped / No Clipping) */}
        <div
          style={{
            padding: "12px 28px 0",
            borderBottom: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "aa_consent", label: "1. Account Aggregator (AA)", icon: Smartphone, badge: "Sahamati" },
            { id: "upi_qr", label: "2. Setu UPI DeepLink & QR", icon: QrCode, badge: "Instant UTR" },
            { id: "penny_drop", label: "3. KYC & Penny Drop", icon: ShieldCheck, badge: "IMPS Match" },
            { id: "api_console", label: "4. Live API Console (cURL)", icon: Terminal, badge: "Swagger" },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 16px",
                  borderTopLeftRadius: "10px",
                  borderTopRightRadius: "10px",
                  border: active ? "1px solid #CBD5E1" : "1px solid transparent",
                  borderBottom: active ? "2px solid #0284C7" : "none",
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#0F172A" : "#64748B",
                  fontSize: "12.5px",
                  fontWeight: active ? 800 : 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={15} style={{ color: active ? "#0284C7" : "#94A3B8" }} />
                <span>{t.label}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "4px",
                    background: active ? "rgba(2, 132, 199, 0.1)" : "#E2E8F0",
                    color: active ? "#0284C7" : "#64748B",
                  }}
                >
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            PLAYGROUND 1: ACCOUNT AGGREGATOR (AA)
            ========================================================================= */}
        {activeTab === "aa_consent" && (
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Clickable Step Progression Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F1F5F9", padding: "10px 16px", borderRadius: "12px", flexWrap: "wrap", gap: 8 }}>
              {[
                { step: 1, label: "1. Configure Consent Request" },
                { step: 2, label: "2. Mobile App OTP Approval" },
                { step: 3, label: "3. Verified Ingestion & Twin Sync" },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setAaStep(s.step)}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "12px",
                    fontWeight: aaStep === s.step ? 800 : 700,
                    color: aaStep >= s.step ? "#0F172A" : "#94A3B8",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: aaStep > s.step ? "#10B981" : aaStep === s.step ? "#0284C7" : "#CBD5E1",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {aaStep > s.step ? <Check size={12} /> : s.step}
                  </div>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Step 1: Config */}
            {aaStep === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
                <form onSubmit={handleInitiateConsent} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      Step 1: Enter Customer / Debtor Details for AA Consent
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
                      Sends a consent artifact to the customer's RBI-licensed Account Aggregator handle.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Company / Debtor Name:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mehta Heavy Tooling Pvt Ltd"
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#0F172A",
                        background: "#FFFFFF",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Mobile Number:</label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          setAaHandle(`${e.target.value}@setu-aa`);
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#0F172A",
                          background: "#FFFFFF",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Verified Bank Balance (₹ Lakhs):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={customBalanceLakhs}
                        onChange={(e) => setCustomBalanceLakhs(Number(e.target.value))}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#059669",
                          background: "#FFFFFF",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>AA VPA Handle:</label>
                    <input
                      type="text"
                      value={aaHandle}
                      disabled
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        fontSize: "12.5px",
                        background: "#F8FAFC",
                        color: "#64748B",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Select FIP Banks to Query:</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["HDFC Bank Ltd", "State Bank of India", "ICICI Bank Ltd", "Axis Bank Ltd"].map((bank) => {
                        const checked = selectedFips.includes(bank);
                        return (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => {
                              setSelectedFips((prev) =>
                                checked ? prev.filter((b) => b !== bank) : [...prev, bank]
                              );
                            }}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              border: checked ? "1px solid #0284C7" : "1px solid #E2E8F0",
                              background: checked ? "rgba(2, 132, 199, 0.08)" : "#FFFFFF",
                              color: checked ? "#0284C7" : "#64748B",
                              cursor: "pointer",
                            }}
                          >
                            {checked ? "✓ " : "+ "}
                            {bank}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isConsentLoading}
                    style={{
                      padding: "11px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                      marginTop: 4,
                    }}
                  >
                    {isConsentLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                    <span>Trigger Setu AA Consent Request (Proceed to Step 2) →</span>
                  </button>
                </form>

                {/* Info Card */}
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <ShieldCheck size={16} style={{ color: "#0284C7" }} />
                      <span>How Setu Retrieves Financial Data:</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                      1. <strong>Consent Initiation</strong>: NexFin sends a digitally signed request via Setu's FIU client.
                      <br />
                      2. <strong>Citizen Approval</strong>: The buyer receives a secure OTP via their Account Aggregator app (Sahamati/OneMoney).
                      <br />
                      3. <strong>Encrypted Fetch</strong>: Bank statements are fetched and decrypted into verified cash velocity & balance data.
                    </p>
                  </div>

                  <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px", fontSize: "11.5px" }}>
                    <div style={{ color: "#64748B" }}>Consent Mode: <strong>VIEW ONLY</strong></div>
                    <div style={{ color: "#64748B", marginTop: 3 }}>Fetch Type: <strong>PERIODIC_12M</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Mobile Phone Consent Mockup */}
            {aaStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0", gap: 14 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", textAlign: "center" }}>
                  Step 2: Simulate User Receiving Mobile Consent & OTP Notification
                </div>

                <div
                  style={{
                    width: "360px",
                    background: "#FFFFFF",
                    borderRadius: "28px",
                    border: "8px solid #0F172A",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Phone Header */}
                  <div style={{ background: "#0F172A", color: "#FFFFFF", padding: "8px 16px 12px", textAlign: "center" }}>
                    <div style={{ width: 40, height: 4, background: "#334155", borderRadius: 2, margin: "0 auto 8px" }} />
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8" }}>Setu AA Consent Gateway</div>
                  </div>

                  {/* Phone Body */}
                  <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0F172A" }}>
                        Consent Request for {customerName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: 2 }}>
                        NexFin FIU is requesting read-only bank statement telemetry
                      </div>
                    </div>

                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px", fontSize: "11px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                        <span>Target Banks:</span>
                        <strong>{selectedFips.join(", ")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginTop: 4 }}>
                        <span>Data Period:</span>
                        <strong>12 Months Statement</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginTop: 4 }}>
                        <span>Consent Handle:</span>
                        <strong>{aaHandle}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>Enter Received OTP:</label>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        style={{
                          textAlign: "center",
                          fontSize: "16px",
                          fontWeight: 800,
                          letterSpacing: "4px",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #0284C7",
                          background: "#F0F9FF",
                          color: "#0F172A",
                        }}
                      />
                      <span style={{ fontSize: "10px", color: "#059669", textAlign: "center", fontWeight: 600 }}>
                        Auto-filled test sandbox OTP (7492)
                      </span>
                    </div>

                    <button
                      onClick={handleApproveConsent}
                      disabled={isConsentLoading}
                      style={{
                        padding: "11px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#10B981",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {isConsentLoading ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
                      <span>Approve & Fetch Statements (Proceed to Step 3)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Decrypted Data & Sync */}
            {aaStep === 3 && (
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16, 185, 129, 0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        Bank Telemetry Retrieved & Decrypted Successfully
                      </h4>
                      <p style={{ fontSize: "11.5px", color: "#64748B", margin: 0 }}>
                        Fetched via Setu FIU encrypted session <code>ses_fiu_99120412</code>
                      </p>
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Account Holder:</span>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>{customerName}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Verified Liquid Balance:</span>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "#059669" }}>₹{Number(customBalanceLakhs || 38.5).toFixed(2)} Lakhs</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Avg Monthly Inflow:</span>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0284C7" }}>₹14.20 Lakhs</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Cheque/NACH Bounces:</span>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#10B981" }}>0 Bounces (Clean)</div>
                    </div>
                  </div>

                  {/* Sync Trigger Button */}
                  <button
                    onClick={handleSyncToDigitalTwin}
                    style={{
                      padding: "11px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    <TrendingUp size={15} />
                    <span>Sync Live Data to NexFin Digital Twin</span>
                  </button>

                  {/* Post-Sync Next Steps Action Hub */}
                  {isSyncSuccess && (
                    <div style={{ padding: "12px 14px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ color: "#065F46", fontSize: "12.5px", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={16} style={{ color: "#059669" }} />
                        <span>Digital Twin Synchronized! Cash balance updated to ₹{Number(customBalanceLakhs || 38.5).toFixed(2)}L.</span>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={handleNavigateToCashFlow}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#059669",
                            color: "#FFFFFF",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>View Cash Flow Twin →</span>
                        </button>

                        <button
                          onClick={handleNavigateToDashboard}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            background: "#FFFFFF",
                            color: "#0F172A",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <span>Go to Dashboard →</span>
                        </button>

                        <button
                          onClick={handleResetAaFlow}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            background: "#FFFFFF",
                            color: "#475569",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <RotateCcw size={12} />
                          <span>Test Another Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Raw JSON Payload Viewer */}
                <div style={{ background: "#0F172A", borderRadius: "12px", padding: "14px", color: "#38BDF8", fontFamily: "monospace", fontSize: "11px", maxHeight: "280px", overflowY: "auto" }}>
                  <div style={{ color: "#94A3B8", marginBottom: 6 }}>// Setu FIU Decrypted Telemetry:</div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#E2E8F0" }}>
{`{
  "fiu_session_id": "ses_fiu_99120412",
  "account_holder": "${customerName.toUpperCase()}",
  "fip_name": "${selectedFips[0]?.toUpperCase().replace(/ /g, "_") || "HDFC_BANK_LTD"}",
  "account_type": "CURRENT",
  "current_balance": ${Math.round(Number(customBalanceLakhs || 38.5) * 100000)}.00,
  "currency": "INR",
  "transaction_count": 342,
  "credit_turnover_12m": 17040000.00,
  "debit_turnover_12m": 13190000.00,
  "nach_mandate_active": true,
  "risk_rating": "AAA_PRIME"
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PLAYGROUND 2: UPI DEEPLINK & DYNAMIC QR
            ========================================================================= */}
        {activeTab === "upi_qr" && (
          <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Setu Dynamic UPI QR & Payment Links
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
                  Generate instantaneous UPI collection links with automated real-time UTR webhook reconciliation.
                </p>
              </div>

              {/* Clean High-Contrast Dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Select Unpaid Invoice to Collect:</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    handleResetUpi();
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0F172A",
                    background: "#FFFFFF",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {invoices.map((inv) => (
                    <option key={inv.id || inv.invoiceNumber} value={inv.id || inv.invoiceNumber}>
                      #{inv.id || inv.invoiceNumber} • {inv.customer} (₹{(Number(inv.amount || 0) / 100000).toFixed(2)} Lakhs)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Invoice Amount:</span>
                  <strong style={{ color: "#0F172A" }}>₹{Number(selectedInvoice?.amount || 1250000).toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#64748B" }}>Setu UPI Intent:</span>
                  <code style={{ fontSize: "11px", color: "#0284C7" }}>upi://pay?pa=nexfin@icici&pn=NexFin&am={selectedInvoice?.amount || 1250000}</code>
                </div>
              </div>

              <button
                onClick={handleSimulateUpiPayment}
                disabled={isUpiSimulating || upiPaymentDone}
                style={{
                  padding: "11px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: upiPaymentDone ? "#10B981" : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: upiPaymentDone ? "default" : "pointer",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                }}
              >
                {isUpiSimulating ? <RefreshCw size={15} className="spin" /> : upiPaymentDone ? <Check size={15} /> : <Zap size={15} />}
                <span>{upiPaymentDone ? "✓ Payment Settled & Reconciled (UTR Verified)" : "Simulate Customer UPI Payment (PhonePe/GPay) →"}</span>
              </button>

              {upiPaymentDone && (
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ color: "#065F46", fontSize: "12px", fontWeight: 700 }}>
                    <strong>✓ Webhook Dispatched (200 OK):</strong> Invoice #{selectedInvoice.id || selectedInvoice.invoiceNumber} marked as <strong>Paid</strong> in real-time database with verified reference <code>{lastUtr}</code>.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleNavigateToInvoices}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#059669",
                        color: "#FFFFFF",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <span>View Invoices Ledger →</span>
                    </button>
                    <button
                      onClick={handleResetUpi}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#475569",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset & Try Another
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic QR Mockup with High Quality SVG Graphic */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ background: "#FFFFFF", padding: "16px", borderRadius: "14px", border: "1px solid #CBD5E1", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Authentic Setu Styled QR Code SVG */}
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="36" height="36" rx="6" fill="#0F172A" />
                  <rect x="16" y="16" width="24" height="24" rx="4" fill="#FFFFFF" />
                  <rect x="22" y="22" width="12" height="12" rx="2" fill="#0284C7" />

                  <rect x="104" y="10" width="36" height="36" rx="6" fill="#0F172A" />
                  <rect x="110" y="16" width="24" height="24" rx="4" fill="#FFFFFF" />
                  <rect x="116" y="22" width="12" height="12" rx="2" fill="#0284C7" />

                  <rect x="10" y="104" width="36" height="36" rx="6" fill="#0F172A" />
                  <rect x="16" y="110" width="24" height="24" rx="4" fill="#FFFFFF" />
                  <rect x="22" y="116" width="12" height="12" rx="2" fill="#0284C7" />

                  {/* Center Data Grid Nodes */}
                  <rect x="54" y="14" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="70" y="14" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="86" y="14" width="8" height="8" rx="2" fill="#334155" />

                  <rect x="54" y="30" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="70" y="30" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="86" y="30" width="8" height="8" rx="2" fill="#334155" />

                  <rect x="14" y="54" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="30" y="54" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="46" y="54" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="62" y="54" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="78" y="54" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="94" y="54" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="110" y="54" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="126" y="54" width="8" height="8" rx="2" fill="#334155" />

                  {/* Center UPI Shield Badge */}
                  <rect x="55" y="65" width="40" height="24" rx="6" fill="#0F172A" />
                  <text x="75" y="81" fill="#38BDF8" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">UPI</text>

                  <rect x="14" y="86" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="30" y="86" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="110" y="86" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="126" y="86" width="8" height="8" rx="2" fill="#334155" />

                  <rect x="54" y="104" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="70" y="104" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="86" y="104" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="102" y="104" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="118" y="104" width="8" height="8" rx="2" fill="#0284C7" />

                  <rect x="54" y="126" width="8" height="8" rx="2" fill="#0284C7" />
                  <rect x="70" y="126" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="86" y="126" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="102" y="126" width="8" height="8" rx="2" fill="#334155" />
                  <rect x="126" y="126" width="8" height="8" rx="2" fill="#0284C7" />
                </svg>

                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0F172A", marginTop: 8 }}>
                  Invoice #{selectedInvoice?.id || selectedInvoice?.invoiceNumber || "INV-2026-088"}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#059669" }}>
                  ₹{Number(selectedInvoice?.amount || 1250000).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", marginTop: 10 }}>
                Scan with GPay / PhonePe / Paytm
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: 2 }}>
                Instant settlement via Setu DeepLink Gateway
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PLAYGROUND 3: KYC & PENNY DROP
            ========================================================================= */}
        {activeTab === "penny_drop" && (
          <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Setu IMPS Penny Drop & GSTIN Verification
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
                  Verify vendor bank accounts and legal business identities in sub-second API roundtrips.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setVerifyType("bank"); setVerifyResult(null); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: verifyType === "bank" ? "1px solid #0284C7" : "1px solid #E2E8F0",
                    background: verifyType === "bank" ? "rgba(2, 132, 199, 0.08)" : "#FFFFFF",
                    color: verifyType === "bank" ? "#0284C7" : "#64748B",
                    cursor: "pointer",
                  }}
                >
                  Bank Account (Penny Drop)
                </button>
                <button
                  type="button"
                  onClick={() => { setVerifyType("gstin"); setVerifyResult(null); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: verifyType === "gstin" ? "1px solid #0284C7" : "1px solid #E2E8F0",
                    background: verifyType === "gstin" ? "rgba(2, 132, 199, 0.08)" : "#FFFFFF",
                    color: verifyType === "gstin" ? "#0284C7" : "#64748B",
                    cursor: "pointer",
                  }}
                >
                  GSTIN Reverse Lookup
                </button>
              </div>

              {verifyType === "bank" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>Bank Account Number:</label>
                    <input
                      type="text"
                      value={bankAcc}
                      onChange={(e) => setBankAcc(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px", color: "#0F172A", background: "#FFFFFF" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>Bank IFSC Code:</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px", color: "#0F172A", background: "#FFFFFF" }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>Entity GSTIN:</label>
                  <input
                    type="text"
                    value={gstinInput}
                    onChange={(e) => setGstinInput(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px", color: "#0F172A", background: "#FFFFFF" }}
                  />
                </div>
              )}

              <button
                onClick={handleRunVerification}
                disabled={isVerifying}
                style={{
                  padding: "10px 16px",
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
                }}
              >
                {isVerifying ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
                <span>Execute Setu Reverse Verification</span>
              </button>
            </div>

            {/* Results Display */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "18px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
                Setu Verification Telemetry
              </div>
              {verifyResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "11.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748B" }}>Status:</span>
                    <strong style={{ color: "#059669" }}>✓ {verifyResult.status}</strong>
                  </div>
                  {verifyType === "bank" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Registered Name:</span>
                        <strong style={{ color: "#0F172A" }}>{verifyResult.accountHolderName}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Bank:</span>
                        <span>{verifyResult.bankName}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Penny Deposited:</span>
                        <strong style={{ color: "#059669" }}>{verifyResult.pennyAmountDeposited}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Name Match Score:</span>
                        <strong style={{ color: "#0284C7" }}>{verifyResult.nameMatchScore}% Match</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Legal Name:</span>
                        <strong style={{ color: "#0F172A" }}>{verifyResult.legalName}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Trade Name:</span>
                        <span>{verifyResult.tradeName}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>GSTR-3B Filing:</span>
                        <strong style={{ color: "#059669" }}>{verifyResult.filingStatusGstr3b}</strong>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#94A3B8", padding: "30px 0", fontSize: "12px" }}>
                  Click "Execute Setu Reverse Verification" to trigger live API validation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            PLAYGROUND 4: LIVE API CONSOLE (cURL)
            ========================================================================= */}
        {activeTab === "api_console" && (
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { id: "aa_initiate", label: "POST /v2/consents (AA)" },
                  { id: "upi_create", label: "POST /v2/payment-links (UPI)" },
                  { id: "penny_drop", label: "POST /v2/verify/bank-account" },
                ].map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setApiEndpoint(ep.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      border: apiEndpoint === ep.id ? "1px solid #0284C7" : "1px solid #CBD5E1",
                      background: apiEndpoint === ep.id ? "#0284C7" : "#FFFFFF",
                      color: apiEndpoint === ep.id ? "#FFFFFF" : "#334155",
                      cursor: "pointer",
                    }}
                  >
                    {ep.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(JSON.stringify(consoleData, null, 2), "curl")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                }}
              >
                {copiedKey === "curl" ? <Check size={13} style={{ color: "#059669" }} /> : <Copy size={13} />}
                <span>{copiedKey === "curl" ? "Copied Payload!" : "Copy Payload"}</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Request Box */}
              <div style={{ background: "#0F172A", borderRadius: "12px", padding: "14px", color: "#38BDF8", fontFamily: "monospace", fontSize: "11px", overflowY: "auto", maxHeight: "320px" }}>
                <div style={{ color: "#94A3B8", marginBottom: 6 }}>// Request Headers & Body:</div>
                <div style={{ color: "#F59E0B", marginBottom: 6 }}>
                  {consoleData.method} {consoleData.url}
                </div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#E2E8F0" }}>
{JSON.stringify({ headers: consoleData.headers, body: consoleData.body }, null, 2)}
                </pre>
              </div>

              {/* Response Box */}
              <div style={{ background: "#0F172A", borderRadius: "12px", padding: "14px", color: "#10B981", fontFamily: "monospace", fontSize: "11px", overflowY: "auto", maxHeight: "320px" }}>
                <div style={{ color: "#94A3B8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>// Setu Sandbox Response:</span>
                  <span style={{ color: "#10B981", fontWeight: 800 }}>Status: 200 OK</span>
                </div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#E2E8F0" }}>
{JSON.stringify(consoleData.response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
            borderBottomLeftRadius: "22px",
            borderBottomRightRadius: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            Setu API Sandbox v2.4 • Pine Labs India Open Banking Gateway
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Close Sandbox Studio
          </button>
        </div>
      </div>
    </div>
  );
}
