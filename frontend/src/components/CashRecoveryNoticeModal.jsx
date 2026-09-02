import React, { useState } from "react";
import {
  X,
  Send,
  Copy,
  Check,
  Scale,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  FileText,
  Mail,
  AlertTriangle,
  IndianRupee,
  Clock,
  Printer,
  Percent,
} from "lucide-react";

export default function CashRecoveryNoticeModal({
  isOpen,
  onClose,
  mode = "legal_recovery", // "legal_recovery" | "early_discount"
  invoice,
  business,
  discountPercentage = 2.0,
  settlementDays = 7,
}) {
  const [copied, setCopied] = useState(false);
  const [noticeTier, setNoticeTier] = useState("tier2"); // "tier1" | "tier2" | "tier3"
  const [editableEmail, setEditableEmail] = useState(invoice?.customerEmail || "accounts@" + (invoice?.customer ? invoice.customer.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com" : "client.com"));
  const [customDiscount, setCustomDiscount] = useState(discountPercentage);
  const [customDays, setCustomDays] = useState(settlementDays);

  if (!isOpen || !invoice) return null;

  const bizName = business?.name || "Our Enterprise";
  const bizGstin = business?.gstin || "27AADCO1234E1Z5";
  const udyamNumber = business?.udyamNumber || "UDYAM-MH-12-0048912";
  const customerName = invoice.customer || "Valued Corporate Buyer";
  const invoiceNumber = invoice.invoiceNumber || invoice.id || "INV-2026-001";
  const invoiceDate = invoice.date || "2026-06-15";
  const dueDate = invoice.dueDate || "2026-07-30";
  const amount = Number(invoice.amount || 0);
  const overdueDays = Math.max(1, Number(invoice.overdueDays || 18));

  // MSMED Act Section 16 Interest Calculation (3x RBI Bank Rate ~ 20.25% p.a. compounded monthly)
  const annualInterestRate = 20.25;
  const monthlyRate = annualInterestRate / 12 / 100;
  const monthsOverdue = overdueDays / 30;
  const compoundInterest = Math.round(amount * (Math.pow(1 + monthlyRate, monthsOverdue) - 1));
  const totalClaimableAmount = amount + compoundInterest;

  // Early Payment Discount Calculations
  const discountAmount = Math.round(amount * (customDiscount / 100));
  const netDiscountedAmount = amount - discountAmount;

  // Generate Notice Content based on Mode & Tier
  let subject = "";
  let emailBody = "";

  if (mode === "legal_recovery") {
    if (noticeTier === "tier1") {
      subject = `Statutory Payment Reminder: Invoice #${invoiceNumber} [${bizName}]`;
      emailBody = `Dear Accounts Team at ${customerName},

Greetings from ${bizName}.

We are writing to follow up regarding our outstanding Tax Invoice #${invoiceNumber} dated ${invoiceDate} for the principal amount of ₹${amount.toLocaleString("en-IN")}, which became due on ${dueDate} (${overdueDays} days overdue).

As a registered MSME under Udyam Registration #${udyamNumber}, we request you to kindly clear this pending invoice at the earliest to ensure compliance with the statutory 45-day settlement timeframe stipulated under the MSMED Act 2006.

Invoice Summary:
• Invoice Number: #${invoiceNumber}
• Invoice Date: ${invoiceDate}
• Due Date: ${dueDate}
• Principal Amount Due: ₹${amount.toLocaleString("en-IN")}
• Bank Account / RTGS Details: Shared in attachment

Please confirm when the NEFT/RTGS disbursal has been initiated. Thank you for your continued cooperation.

Warm regards,
Finance & Accounts Desk
${bizName}
Udyam Reg: ${udyamNumber} | GSTIN: ${bizGstin}`;
    } else if (noticeTier === "tier2") {
      subject = `FORMAL DEMAND NOTICE: Statutory Interest Notice for Overdue Invoice #${invoiceNumber} [MSMED Act Sec 15/16]`;
      emailBody = `To: The Head of Accounts & Finance, ${customerName}

FORMAL STATUTORY DEMAND NOTICE UNDER SECTION 15 & 16 OF THE MSMED ACT, 2006

Dear Sir / Madam,

This is a formal notice regarding unpaid Tax Invoice #${invoiceNumber} amounting to ₹${amount.toLocaleString("en-IN")}, issued by ${bizName} (Udyam Reg: ${udyamNumber}) on ${invoiceDate}, which remains unsettled and is now ${overdueDays} days past the agreed due date (${dueDate}).

Please note the applicable statutory provisions:
1. Under Section 15 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006, buyers are legally obligated to make payment within 45 days from the date of acceptance.
2. Under Section 16 of the MSMED Act, failure to make payment attracts mandatory COMPOUND INTEREST with monthly rests at THREE TIMES THE BANK RATE notified by the Reserve Bank of India (currently 20.25% p.a.).
3. Under Section 43B(h) of the Income Tax Act, overdue liabilities beyond the statutory timeline cannot be claimed as tax-deductible business expenses for the financial year.

STATUTORY CLAIM COMPUTATION:
• Principal Invoice Amount: ₹${amount.toLocaleString("en-IN")}
• Delay Period: ${overdueDays} Days
• Statutory Penal Interest Accrued (Sec 16 @ 20.25% p.a.): ₹${compoundInterest.toLocaleString("en-IN")}
• TOTAL STATUTORY PAYABLE: ₹${totalClaimableAmount.toLocaleString("en-IN")}

You are hereby called upon to remit the total outstanding amount of ₹${totalClaimableAmount.toLocaleString("en-IN")} within 7 business days from the receipt of this notice to avoid escalation to the Micro and Small Enterprises Facilitation Council (MSEFC).

Sincerely,
Authorized Signatory / Legal Accounts
${bizName}
Udyam Reg: ${udyamNumber} | GSTIN: ${bizGstin}`;
    } else {
      subject = `FINAL PRE-LITIGATION NOTICE: Impending MSEFC Legal Filing on MSME Samadhaan Portal for #${invoiceNumber}`;
      emailBody = `FINAL PRE-CONCILIATION LEGAL NOTICE BEFORE FILING WITH THE MICRO & SMALL ENTERPRISES FACILITATION COUNCIL (MSEFC)

To:
The Board of Directors / Chief Financial Officer
${customerName}

Reference: Unpaid Tax Invoice #${invoiceNumber} (Principal: ₹${amount.toLocaleString("en-IN")}, Overdue by ${overdueDays} Days)

Dear Sir / Madam,

Despite repeated reminders and formal statutory demand notices, your enterprise has failed to discharge its payment liability towards ${bizName} (MSME Udyam Reg #${udyamNumber}) for goods/services supplied and accepted under Invoice #${invoiceNumber}.

Take notice that the total claimable liability, including statutory compound penal interest under Section 16 of the MSMED Act 2006 at 3x the RBI Bank Rate, now stands at ₹${totalClaimableAmount.toLocaleString("en-IN")}.

We hereby give you a FINAL NOTICE OF SEVEN (7) DAYS to remit the sum of ₹${totalClaimableAmount.toLocaleString("en-IN")} into our designated bank account. 

Failing payment within 7 days, we shall formally file a conciliation case against ${customerName} on the Ministry of MSME's official SAMADHAAN portal (MSEFC) under Section 18 of the MSMED Act 2006, and report the delayed liability under Section 43B(h) of the Income Tax Act to statutory tax authorities.

Yours faithfully,
For ${bizName}
Managing Director / Authorized Signatory
Udyam Reg: ${udyamNumber} | GSTIN: ${bizGstin}`;
    }
  } else {
    // Early Settlement Discount Mode
    subject = `Early Settlement Incentive: Save ₹${discountAmount.toLocaleString("en-IN")} (${customDiscount}%) on Invoice #${invoiceNumber}`;
    emailBody = `Dear Accounts & Treasury Team at ${customerName},

Greetings from ${bizName}.

In appreciation of our continued commercial partnership, we are pleased to offer an exclusive **Early Payment Cash Discount of ${customDiscount}%** on our upcoming Tax Invoice #${invoiceNumber} (Original Amount: ₹${amount.toLocaleString("en-IN")}).

PROMPT PAYMENT INCENTIVE DETAILS:
• Invoice Number: #${invoiceNumber}
• Original Invoice Payable: ₹${amount.toLocaleString("en-IN")}
• Early Payment Discount (${customDiscount}%): - ₹${discountAmount.toLocaleString("en-IN")}
• NET DISCOUNTED AMOUNT PAYABLE: ₹${netDiscountedAmount.toLocaleString("en-IN")}
• Offer Validity: Settle within the next ${customDays} days (Before ${new Date(Date.now() + customDays * 86400000).toISOString().slice(0, 10)})

By initiating this early settlement, ${customerName} saves ₹${discountAmount.toLocaleString("en-IN")} directly while strengthening our supply chain collaboration.

Kindly confirm if your treasury can schedule the discounted remittance of ₹${netDiscountedAmount.toLocaleString("en-IN")}. We will immediately issue a matching credit note for the cash discount.

Best regards,
Commercial & Accounts Desk
${bizName}
GSTIN: ${bizGstin} | Udyam Reg: ${udyamNumber}`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendViaGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(editableEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const handleSendViaMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(editableEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

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
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "820px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: "20px 26px 16px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: mode === "legal_recovery" ? "linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)" : "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: mode === "legal_recovery" ? "rgba(225, 29, 72, 0.12)" : "rgba(16, 185, 129, 0.12)",
                color: mode === "legal_recovery" ? "#E11D48" : "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mode === "legal_recovery" ? <Scale size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    background: mode === "legal_recovery" ? "rgba(225, 29, 72, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    color: mode === "legal_recovery" ? "#E11D48" : "#059669",
                  }}
                >
                  {mode === "legal_recovery" ? "MSMED Act Statutory Demand" : "Early Payment Cash Discount Offer"}
                </span>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
                  Invoice #{invoiceNumber} • {customerName}
                </span>
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "3px 0 0", letterSpacing: "-0.3px" }}>
                {mode === "legal_recovery" ? "Statutory Legal Payment Notice & Email Draft" : "Dynamic Early Settlement Proposal"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              width: 32,
              height: 32,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div style={{ padding: "16px 26px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
          {mode === "legal_recovery" ? (
            /* Tier Switcher for Legal Notice */
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Select Notice Tier:</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { id: "tier1", label: "Tier 1: Reminder", desc: "Friendly MSMED Alert" },
                    { id: "tier2", label: "Tier 2: Formal Demand", desc: "Sec 15/16 Penal Interest" },
                    { id: "tier3", label: "Tier 3: Final Pre-Samadhaan", desc: "7-Day Notice for MSEFC" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNoticeTier(t.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        border: noticeTier === t.id ? "1px solid #E11D48" : "1px solid #E2E8F0",
                        background: noticeTier === t.id ? "#E11D48" : "#FFFFFF",
                        color: noticeTier === t.id ? "#FFFFFF" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statutory Interest Accrued Summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Accrued Interest (Sec 16):</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#E11D48" }}>
                  +₹{compoundInterest.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ) : (
            /* Early Discount Configurator */
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Discount %:</span>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.5}
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#059669", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669", minWidth: 42 }}>
                  {customDiscount}%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Pay Within:</span>
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
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

                <div style={{ background: "#FFFFFF", padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0" }}>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>Buyer Saves: </span>
                  <strong style={{ fontSize: "12.5px", color: "#059669" }}>₹{discountAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Email & Notice Draft Preview */}
        <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Recipient & Subject Header Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, alignItems: "center", fontSize: "12.5px" }}>
            <span style={{ fontWeight: 700, color: "#64748B" }}>To:</span>
            <input
              type="email"
              value={editableEmail}
              onChange={(e) => setEditableEmail(e.target.value)}
              placeholder="customer.accounts@company.com"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "12.5px",
                color: "#0F172A",
                background: "#FFFFFF",
                outline: "none",
              }}
            />

            <span style={{ fontWeight: 700, color: "#64748B" }}>Subject:</span>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              {subject}
            </div>
          </div>

          {/* Email Body Draft (Monospace/Formatted preview) */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "16px 18px",
              maxHeight: "300px",
              overflowY: "auto",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#1E293B",
              whiteSpace: "pre-wrap",
            }}
          >
            {emailBody}
          </div>

          {/* Statutory Reference Footnote */}
          {mode === "legal_recovery" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(225, 29, 72, 0.05)",
                border: "1px solid rgba(225, 29, 72, 0.15)",
                fontSize: "11px",
                color: "#9F1239",
              }}
            >
              <ShieldAlert size={15} style={{ color: "#E11D48", flexShrink: 0 }} />
              <span>
                <strong>Statutory Legal Note:</strong> Under Section 16 of the MSMED Act 2006, interest is mandatory and cannot be waived by contracts. Overdue liabilities are disallowable under Section 43B(h) of the Income Tax Act.
              </span>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div
          style={{
            padding: "16px 26px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {mode === "legal_recovery" && (
              <a
                href="https://samadhaan.msme.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0284C7",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                }}
              >
                <span>MSME Samadhaan Official Portal</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleCopy}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                background: "#FFFFFF",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#334155",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} style={{ color: "#059669" }} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            <button
              onClick={handleSendViaMailto}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
              }}
              title="Open default desktop mail app (Outlook, Apple Mail)"
            >
              <Mail size={13} />
              <span>Other Mail App</span>
            </button>

            <button
              onClick={handleSendViaGmail}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                background: mode === "legal_recovery" ? "linear-gradient(135deg, #EA4335 0%, #D93025 100%)" : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                fontSize: "12.5px",
                fontWeight: 800,
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                boxShadow: mode === "legal_recovery" ? "0 4px 14px rgba(234, 67, 53, 0.3)" : "0 4px 14px rgba(16, 185, 129, 0.3)",
              }}
            >
              <Send size={14} />
              <span>Send via Gmail ↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
