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

  const handleLanguageSelect = (langId, langName) => {
    changeLanguage(langId);
    setNotification(`Language switched to ${langName}!`);
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
            background: "linear-gradient(135deg, #10b981, #059669)",
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
          1. REGIONAL LANGUAGE & LOCALIZATION SETTINGS (NEW)
          ================================================================= */}
      <div className="glass-card" style={{ border: "1px solid rgba(139, 92, 246, 0.35)", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)" }}>
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
                    color: "#c4b5fd",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  {supportedLanguages.length} Regional Languages
                </span>
              </div>
              <div className="card-subtitle">
                {t("languageSub", "Choose your preferred Indian regional language for financial dashboards & reports")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {t("currentLanguage", "Active")}:
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{activeLanguageMeta.flag}</span>
              <span>{activeLanguageMeta.name} ({activeLanguageMeta.englishName})</span>
            </span>
          </div>
        </div>

        {/* 10 Regional Language Grid Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          {supportedLanguages.map((lang) => {
            const isSelected = currentLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageSelect(lang.id, lang.name)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.2))"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isSelected
                    ? "1px solid #8b5cf6"
                    : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all var(--transition-fast)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.borderColor = "var(--border-medium)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{lang.flag}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: isSelected ? "#fff" : "var(--text-primary)" }}>
                      {lang.name}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                      ({lang.englishName})
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: isSelected ? "#c4b5fd" : "var(--text-secondary)", fontWeight: 500 }}>
                    {lang.region}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                    {lang.sub}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================
          2. COMPANY PROFILE & FINANCIAL PARAMETERS
          ================================================================= */}
      <div className="grid-12">
        <div className="col-span-8 glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrap emerald">
                <Building size={18} />
              </div>
              <div>
                <div className="card-title">{t("companyProfile", "Company Profile & Financial Targets")}</div>
                <div className="card-subtitle">
                  Configure digital twin baseline parameters
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

            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                <span>{t("saveChanges", "Save Business Parameters")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Data Administration & State Management */}
        <div className="col-span-4 glass-card">
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

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>
                Purge Account Data
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                Clear all your uploaded invoices, expenses, and customer records to start completely fresh.
              </div>
              <button
                className="btn btn-danger btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleClearData}
              >
                <Trash2 size={14} />
                <span>{t("resetData", "Clear All Data")}</span>
              </button>
            </div>

            <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#34d399", marginBottom: 4 }}>
                Account Security & Storage
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Your data is encrypted and synced with the persistent database. When you log out, your session is saved securely.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}