import React from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  IndianRupee,
  Building2,
  Percent,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function FinancingSchemeModal({ scheme, isOpen, onClose }) {
  if (!isOpen || !scheme) return null;

  const getTagColorStyle = (color) => {
    switch (color) {
      case "emerald":
        return { bg: "rgba(16, 185, 129, 0.12)", text: "#059669", border: "rgba(16, 185, 129, 0.3)" };
      case "blue":
        return { bg: "rgba(2, 132, 199, 0.12)", text: "#0284c7", border: "rgba(2, 132, 199, 0.3)" };
      case "purple":
        return { bg: "rgba(124, 58, 237, 0.12)", text: "#7c3aed", border: "rgba(124, 58, 237, 0.3)" };
      case "amber":
        return { bg: "rgba(217, 119, 6, 0.12)", text: "#d97706", border: "rgba(217, 119, 6, 0.3)" };
      default:
        return { bg: "rgba(51, 65, 85, 0.12)", text: "#334155", border: "rgba(51, 65, 85, 0.3)" };
    }
  };

  const tagStyle = getTagColorStyle(scheme.tagColor);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        background: "rgba(15, 23, 42, 0.65)",
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
          maxWidth: "760px",
          maxHeight: "90vh",
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
            padding: "24px 28px 20px",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  background: tagStyle.bg,
                  color: tagStyle.text,
                  border: `1px solid ${tagStyle.border}`,
                }}
              >
                {scheme.domainLabel}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
                {scheme.provider}
              </span>
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.4px",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {scheme.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(241, 245, 249, 0.9)",
              border: "1px solid #E2E8F0",
              width: 36,
              height: 36,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(241, 245, 249, 0.9)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Key Parameters 4-Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Max Funding Limit
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
                {scheme.maxAmountDisplay}
              </div>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Estimated Rate / Cost
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#059669", marginTop: 4 }}>
                {scheme.interestRate}
              </div>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Disbursal Speed
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0284C7", marginTop: 4 }}>
                {scheme.processingTime}
              </div>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Collateral Status
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: scheme.collateralRequired ? "#D97706" : "#059669",
                  marginTop: 4,
                }}
              >
                {scheme.collateralType}
              </div>
            </div>
          </div>

          {/* Scheme Summary */}
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
              Scheme & Financing Overview
            </div>
            <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6, margin: 0 }}>
              {scheme.summary}
            </p>
          </div>

          {/* Eligibility Checklist */}
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={16} style={{ color: "#059669" }} />
              <span>Eligibility & Qualifying Criteria</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scheme.eligibility.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "12.5px", color: "#475569" }}>
                  <span style={{ color: "#059669", fontWeight: 800 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div
            style={{
              background: "rgba(248, 250, 252, 0.8)",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={15} style={{ color: "#0284C7" }} />
              <span>Required Documentation Checklist</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 6 }}>
              {scheme.documentsRequired.map((docItem, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "#475569" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0284C7" }} />
                  <span>{docItem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Advantages */}
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={16} style={{ color: "#D97706" }} />
              <span>Key Advantages for MSMEs</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {scheme.keyBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(240, 253, 244, 0.6)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: "12px",
                    color: "#065F46",
                    fontWeight: 600,
                  }}
                >
                  ✓ {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer with Direct Verified Redirect */}
        <div
          style={{
            padding: "18px 28px",
            borderTop: "1px solid rgba(226, 232, 240, 0.8)",
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} style={{ color: "#059669" }} />
            <div style={{ fontSize: "11.5px", color: "#64748B" }}>
              Verified Official Portal:{" "}
              <strong style={{ color: "#0F172A" }}>{scheme.portalName}</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                background: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 22px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                fontSize: "13px",
                fontWeight: 800,
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.28)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span>Apply on Official Portal</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
