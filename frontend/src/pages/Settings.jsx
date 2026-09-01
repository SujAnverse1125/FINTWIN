import React, { useState, useEffect } from "react";
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Database,
  Save,
  Trash2,
  Globe,
  Languages,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import {
  getBusiness,
  updateBusinessProfile,
  clearAllData,
  subscribeFinancialData,
} from "../data/financialStore";
import { INDUSTRY_SECTORS } from "../data/sampleData";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Settings() {
  const { user } = useAuth();
  const { currentLang, changeLanguage, t, supportedLanguages, activeLanguageMeta } =
    useLanguage();

  const [business, setBusiness] = useState(getBusiness());
  const [name, setName] = useState(business.name || user?.company || "My Enterprise");
  const [industry, setIndustry] = useState(business.industry || "Manufacturing & Trade");
  const [gstin, setGstin] = useState(business.gstin || user?.gstin || "");
  const [currency, setCurrency] = useState(business.currency || "INR");
  const [openingCash, setOpeningCash] = useState(business.openingCash || 0);
  const [minCashReserve, setMinCashReserve] = useState(business.minCashReserve || 0);
  const [targetRunwayDays, setTargetRunwayDays] = useState(business.targetRunwayDays || 60);

  const [notification, setNotification] = useState("");

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      const b = getBusiness();
      setBusiness(b);
      setName(b.name || user?.company || "My Enterprise");
      setIndustry(b.industry || "Manufacturing & Trade");
      setGstin(b.gstin || user?.gstin || "");
      setOpeningCash(b.openingCash || 0);
      setMinCashReserve(b.minCashReserve || 0);
      setTargetRunwayDays(b.targetRunwayDays || 60);
    });
    return unsub;
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateBusinessProfile({
      name,
      industry,
      gstin,
      currency,
      openingCash: Number(openingCash),
      minCashReserve: Number(minCashReserve),
      targetRunwayDays: Number(targetRunwayDays),
    });

    setNotification("Business parameters saved and synchronized with Database!");
    setTimeout(() => setNotification(""), 3500);
  };

  const handleLanguageChange = (e) => {
    const langId = e.target.value;
    const langObj = supportedLanguages.find((l) => l.id === langId);
    changeLanguage(langId);
    setNotification(`Language switched to ${langObj?.name || langId}!`);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your financial records and start fresh?")) {
      clearAllData();
      setNotification("All financial records cleared. Ready for your live data!");
      setTimeout(() => setNotification(""), 3500);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Notice */}
      {notification && (
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
          <span>{notification}</span>
        </div>
      )}

      {/* =================================================================
          1. COMPANY PROFILE & FINANCIAL PARAMETERS (NOW AT TOP)
          ================================================================= */}
      <div className="grid-12" id="profile">
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <Building size={18} />
              </div>
              <div>
                <div className="card-title">{t("companyProfile", "Company Profile & Financial Targets")}</div>
                <div className="card-subtitle">
                  Configure digital twin baseline parameters & legal identity
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Legal Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Precision Technologies"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <select
                  className="form-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {INDUSTRY_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">GSTIN (GST Identification Number)</label>
                <input
                  type="text"
                  className="form-input"
                  value={gstin}
                  placeholder="e.g. 27AABCA1234F1Z8"
                  onChange={(e) => setGstin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>
            </div>

            <div className="grid-3" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Opening Cash Balance (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={openingCash}
                  placeholder="0"
                  onChange={(e) => setOpeningCash(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min. Safety Reserve Target (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={minCashReserve}
                  placeholder="0"
                  onChange={(e) => setMinCashReserve(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Runway (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={targetRunwayDays}
                  placeholder="60"
                  onChange={(e) => setTargetRunwayDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary">
                <Save size={15} /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Data Administration */}
        <div className="col-span-4 glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-wrap rose">
                  <Database size={18} />
                </div>
                <div>
                  <div className="card-title">Data Administration</div>
                  <div className="card-subtitle">Manage stored invoices & ledger</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Clear all active records (invoices, expenses, worker ledger) to restart simulations with fresh uploaded datasets.
              </p>
            </div>
          </div>

          <div style={{ paddingTop: 24, borderTop: "1px solid var(--border-subtle)", marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleClearData}
            >
              <Trash2 size={15} /> Reset Digital Twin Ledger
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================
          2. REGIONAL LANGUAGE & LOCALIZATION (CLEAN DROPDOWN SELECTOR)
          ================================================================= */}
      <div className="glass-card" style={{ border: "1px solid rgba(139, 92, 246, 0.35)", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(59, 130, 246, 0.03) 100%)" }}>
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap purple">
              <Globe size={18} />
            </div>
            <div>
              <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{t("languageOption", "Regional Language & Localization")}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(139, 92, 246, 0.2)",
                    color: "#7c3aed",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  {supportedLanguages.length} Indian Languages Supported
                </span>
              </div>
              <div className="card-subtitle">
                {t("languageSub", "Choose your preferred Indian regional language for financial dashboards & reports")}
              </div>
            </div>
          </div>
        </div>

        {/* Clean Language Dropdown Selector + Active Preview Card */}
        <div className="grid-2" style={{ marginTop: 16, alignItems: "center" }}>
          {/* Dropdown Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
              Select System Language
            </label>
            <div style={{ position: "relative" }}>
              <select
                className="form-select"
                value={currentLang}
                onChange={handleLanguageChange}
                style={{
                  height: 48,
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "0 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(139, 92, 246, 0.4)",
                  background: "#ffffff",
                  color: "#0f172a",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flag} {lang.name} ({lang.englishName}) — {lang.region}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: 6, display: "block" }}>
              Applies across Dashboard, Invoices, Risk Radar, and AI Copilot.
            </span>
          </div>

          {/* Active Language Preview Pill */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              boxShadow: "0 4px 16px rgba(139, 92, 246, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                Active Locale
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: "24px" }}>{activeLanguageMeta.flag}</span>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                    {activeLanguageMeta.name} ({activeLanguageMeta.englishName})
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#7c3aed", fontWeight: 600 }}>
                    {activeLanguageMeta.region} • {activeLanguageMeta.sub}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669",
              }}
              title="Active & Synchronized"
            >
              <Check size={16} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}