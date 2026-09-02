import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  Wallet,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
  Search,
  Filter,
  Layers,
  Landmark,
  Building2,
  ShieldCheck,
  Zap,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Info,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

import ModulePage from "../components/ModulePage";
import { getFinancialData, subscribeFinancialData } from "../data/financialStore";
import {
  FINANCING_DOMAINS,
  FINANCING_SCHEMES,
} from "../data/financingSchemes";
import FinancingSchemeModal from "../components/FinancingSchemeModal";
import LiveMsmeNewsFeed from "../components/LiveMsmeNewsFeed";
import { API_URL } from "../config";

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

export default function Financing() {
  const [storeData, setStoreData] = useState(getFinancialData());
  const [activeDomain, setActiveDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collateralFreeOnly, setCollateralFreeOnly] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Liquidity Gap Input (Defaults to detected liquidity gap or ₹5.00 Lakhs)
  const defaultGap = useMemo(() => {
    const cash = Number(storeData.business?.openingCash || 0);
    const recurring = (storeData.recurringExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const monthlyBurn = recurring > 0 ? recurring : 180000;
    const safetyBuffer = monthlyBurn * 1.5;
    const gap = Math.max(0, Math.round(safetyBuffer - cash));
    return gap > 0 ? gap : 500000;
  }, [storeData]);

  const [customLiquidityGap, setCustomLiquidityGap] = useState(defaultGap);

  useEffect(() => {
    setCustomLiquidityGap(defaultGap);
  }, [defaultGap]);

  useEffect(() => {
    const unsubscribe = subscribeFinancialData((newData) => {
      setStoreData(newData);
    });
    return () => unsubscribe();
  }, []);

  // Compute Active Store Metrics
  const currentCash = Number(storeData.business?.openingCash || 0);
  const totalReceivables = (storeData.invoices || [])
    .filter((inv) => String(inv.status || "").toLowerCase() !== "paid")
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const invoiceCap = Math.round(totalReceivables * 0.85);

  // Filter schemes based on search, domain, and collateral toggle
  const filteredSchemes = useMemo(() => {
    return FINANCING_SCHEMES.filter((scheme) => {
      // Domain filter
      if (activeDomain !== "all" && scheme.domain !== activeDomain) {
        return false;
      }
      // Collateral-free toggle
      if (collateralFreeOnly && scheme.collateralRequired) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = scheme.title.toLowerCase().includes(query);
        const matchesProvider = scheme.provider.toLowerCase().includes(query);
        const matchesCategory = scheme.category.toLowerCase().includes(query);
        const matchesSummary = scheme.summary.toLowerCase().includes(query);
        const matchesTag = scheme.tag.toLowerCase().includes(query);
        return matchesTitle || matchesProvider || matchesCategory || matchesSummary || matchesTag;
      }
      return true;
    });
  }, [activeDomain, collateralFreeOnly, searchQuery]);

  // AI Funding Route Recommendation
  const aiRecommendation = useMemo(() => {
    if (customLiquidityGap <= 0) {
      return {
        route: "No Immediate External Debt Needed",
        rationale: "Your current liquid cash reserves adequately exceed immediate operational safety thresholds.",
        recommendedDomain: "collateral_free",
        primaryAction: "Accelerate standard collections via MSMED Section 15.",
      };
    }
    if (invoiceCap >= customLiquidityGap && customLiquidityGap > 0) {
      return {
        route: "TReDS Invoice Discounting (Without Recourse)",
        rationale: `Your verified receivables of ${formatMoney(totalReceivables)} can unlock ${formatMoney(invoiceCap)} instantly without creating loan liabilities.`,
        recommendedDomain: "instant_treds",
        primaryAction: "Discount accepted corporate invoices on RXIL / M1xchange (~7.8% APR).",
      };
    }
    if (customLiquidityGap <= 2000000) {
      return {
        route: "Pradhan Mantri MUDRA (Tarun) or PSB 59-Min Loan",
        rationale: "Fast-track sovereign credit-linked loans offering 100% collateral-free capital at competitive rates.",
        recommendedDomain: "govt_schemes",
        primaryAction: "Apply on JanSamarth portal for multi-bank in-principle sanction.",
      };
    }
    return {
      route: "CGTMSE Sovereign Guarantee Term Facility / SIDBI",
      rationale: "High-quantum capital deficit covered up to ₹5.00 Crore without personal asset mortgage.",
      recommendedDomain: "govt_banks",
      primaryAction: "Submit DPR on CGTMSE Member Lending Bank portal or PSB 59 Minutes.",
    };
  }, [customLiquidityGap, invoiceCap, totalReceivables]);

  const handleOpenModal = (scheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const getDomainIcon = (domainId) => {
    switch (domainId) {
      case "govt_schemes":
        return <Landmark size={15} />;
      case "govt_banks":
        return <Building2 size={15} />;
      case "private_nbfc":
        return <CreditCard size={15} />;
      case "collateral_free":
        return <ShieldCheck size={15} />;
      case "instant_treds":
        return <Zap size={15} />;
      default:
        return <Layers size={15} />;
    }
  };

  const getTagBadgeStyle = (color) => {
    switch (color) {
      case "emerald":
        return { background: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.25)" };
      case "blue":
        return { background: "rgba(2, 132, 199, 0.12)", color: "#0284C7", border: "1px solid rgba(2, 132, 199, 0.25)" };
      case "purple":
        return { background: "rgba(124, 58, 237, 0.12)", color: "#7C3AED", border: "1px solid rgba(124, 58, 237, 0.25)" };
      case "amber":
        return { background: "rgba(217, 119, 6, 0.12)", color: "#D97706", border: "1px solid rgba(217, 119, 6, 0.25)" };
      default:
        return { background: "rgba(51, 65, 85, 0.1)", color: "#334155", border: "1px solid rgba(51, 65, 85, 0.2)" };
    }
  };

  return (
    <ModulePage
      title="MSME Financing Marketplace & Liquidity Gap Hub"
      description="Live Government Schemes, PSU Bank Credit, Private NBFCs, and TReDS Invoice Discounting with verified direct portal access."
    >
      {/* =========================================================================
          1. LIQUIDITY GAP SOLVER & AI ROUTE ADVISOR
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "24px",
          boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34D399",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Brain size={13} />
                <span>AI Liquidity Gap Telemetry</span>
              </div>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                Connected to Active Enterprise Store
              </span>
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
              Projected Liquidity Deficit: {formatMoney(customLiquidityGap)}
            </h2>

            <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.5, margin: "0 0 16px", maxWidth: 650 }}>
              <strong style={{ color: "#38BDF8" }}>NexFin AI Recommendation: </strong>
              {aiRecommendation.rationale}
            </p>

            {/* Quick Summary Pill Bar */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.06)", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "10.5px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Current Liquid Cash</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#34D399", marginTop: 2 }}>{formatMoney(currentCash)}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.06)", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "10.5px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>TReDS Inflow Capacity</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#38BDF8", marginTop: 2 }}>{formatMoney(invoiceCap)}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.06)", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "10.5px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Recommended Route</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#FBBF24", marginTop: 2 }}>{aiRecommendation.route}</div>
              </div>
            </div>
          </div>

          {/* Custom Liquidity Gap Slider */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "18px 20px",
              width: "100%",
              maxWidth: 320,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                Simulate Target Gap
              </span>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#38BDF8" }}>
                {formatMoney(customLiquidityGap)}
              </span>
            </div>

            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={customLiquidityGap}
              onChange={(e) => setCustomLiquidityGap(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#38BDF8",
                cursor: "pointer",
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", gap: 6 }}>
              {[200000, 500000, 1500000, 5000000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCustomLiquidityGap(preset)}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    background: customLiquidityGap === preset ? "#38BDF8" : "rgba(255,255,255,0.08)",
                    color: customLiquidityGap === preset ? "#0F172A" : "#CBD5E1",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {formatMoney(preset).replace(" ", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DOMAIN CATEGORY TABS & SEARCH / FILTER CONTROLS
          ========================================================================= */}
      <div style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Domain Switcher Tab Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {FINANCING_DOMAINS.map((dom) => {
            const isActive = activeDomain === dom.id;
            return (
              <button
                key={dom.id}
                onClick={() => setActiveDomain(dom.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: isActive ? "1px solid #059669" : "1px solid #E2E8F0",
                  background: isActive ? "linear-gradient(135deg, #059669 0%, #10B981 100%)" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#475569",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.15s ease",
                }}
              >
                {getDomainIcon(dom.id)}
                <span>{dom.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Collateral Toggle Filter Bar */}
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
              minWidth: 240,
              background: "#F8FAFC",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Search size={16} style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search by scheme name, provider (e.g., MUDRA, CGTMSE, SBI, RXIL, Tata)..."
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={collateralFreeOnly}
                onChange={(e) => setCollateralFreeOnly(e.target.checked)}
                style={{ accentColor: "#059669", cursor: "pointer", width: 15, height: 15 }}
              />
              <span>Collateral-Free Only</span>
            </label>

            <span style={{ fontSize: "12px", color: "#94A3B8" }}>
              Showing <strong>{filteredSchemes.length}</strong> options
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN CONTENT: SCHEME CARDS GRID (LEFT) + LIVE MSME NEWS RADAR (RIGHT)
          ========================================================================= */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Scheme / Loan Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredSchemes.length === 0 ? (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                border: "1px solid #E2E8F0",
              }}
            >
              <Info size={32} style={{ color: "#94A3B8", marginBottom: 12 }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                No financing schemes match your criteria
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                Try resetting your search query or switching domain tabs.
              </p>
            </div>
          ) : (
            filteredSchemes.map((scheme) => {
              const tagStyle = getTagBadgeStyle(scheme.tagColor);

              return (
                <div
                  key={scheme.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: "0 2px 10px -2px rgba(15, 23, 42, 0.04)",
                    padding: "22px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(15, 23, 42, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 10px -2px rgba(15, 23, 42, 0.04)";
                    e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.9)";
                  }}
                >
                  {/* Card Top: Provider & Tag Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            ...tagStyle,
                          }}
                        >
                          {scheme.domainLabel}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 600 }}>
                          {scheme.provider}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.3px" }}>
                        {scheme.title}
                      </h3>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: scheme.tagColor === "emerald" ? "#059669" : "#0284C7",
                        background: scheme.tagColor === "emerald" ? "rgba(16, 185, 129, 0.08)" : "rgba(2, 132, 199, 0.08)",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {scheme.tag}
                    </span>
                  </div>

                  {/* Card Metrics Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: 10,
                      background: "rgba(248, 250, 252, 0.85)",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                        Max Limit
                      </div>
                      <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                        {scheme.maxAmountDisplay}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                        Interest Rate / Cost
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#059669", marginTop: 2 }}>
                        {scheme.interestRate}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                        Disbursal Speed
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0284C7", marginTop: 2 }}>
                        {scheme.processingTime}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                        Collateral
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: scheme.collateralRequired ? "#D97706" : "#059669",
                          marginTop: 2,
                        }}
                      >
                        {scheme.collateralRequired ? "Required" : "Collateral-Free"}
                      </div>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                    {scheme.summary}
                  </p>

                  {/* Action Buttons: View Details Dialog & Direct Official Link */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      paddingTop: 4,
                      borderTop: "1px solid #F1F5F9",
                    }}
                  >
                    <button
                      onClick={() => handleOpenModal(scheme)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <Info size={14} />
                      <span>View Eligibility & Criteria</span>
                    </button>

                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: "12.5px",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                        cursor: "pointer",
                      }}
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Live MSME Policy & Scheme Radar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Live MSME News Radar Component */}
          <LiveMsmeNewsFeed />

          {/* Verification & Compliance Assurance Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} style={{ color: "#059669" }} />
              <strong style={{ fontSize: "13px", color: "#0F172A" }}>
                NexFin Portal Verification Guarantee
              </strong>
            </div>

            <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
              All government schemes and portal links are verified against authentic sovereign domains (<strong>.gov.in</strong>, <strong>.in</strong>) and RBI-licensed financial institutions. NexFin does not charge loan origination fees.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "11.5px", color: "#475569" }}>
              <div>✓ 100% Direct Application without Intermediaries</div>
              <div>✓ MSMED Act 2006 Statutory Protection Synchronized</div>
              <div>✓ Official TReDS Exchanges (RXIL / M1xchange / Invoicemart)</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. DIALOG INSPECTION MODAL (SCHEME DETAILS & VERIFIED REDIRECT)
          ========================================================================= */}
      <FinancingSchemeModal
        scheme={selectedScheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ModulePage>
  );
}