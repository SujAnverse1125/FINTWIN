import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Phone,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  IndianRupee,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateBusinessProfile } from "../data/financialStore";
import { INDUSTRY_SECTORS, EXECUTIVE_ROLES } from "../data/sampleData";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' | 'phone'
  const [selectedRole, setSelectedRole] = useState("CEO"); // 'CEO' | 'CFO' | 'Accountant'
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regGstin, setRegGstin] = useState("");
  const [regIndustry, setRegIndustry] = useState(INDUSTRY_SECTORS[0]);
  const [regOpeningCash, setRegOpeningCash] = useState("");

  const [error, setError] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!identifier) {
      setError(`Please enter your ${loginMethod === "email" ? "work email address" : "mobile phone number"}.`);
      return;
    }
    const res = login(identifier, password, selectedRole);
    if (res.success) {
      navigate("/dashboard");
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if ((!regEmail && !regPhone) || !regName || !regCompany) {
      setError("Please provide your name, company, and either an email or phone number.");
      return;
    }

    const res = register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      company: regCompany,
      industry: regIndustry,
      gstin: regGstin,
      role: selectedRole,
    });

    if (res.success) {
      updateBusinessProfile({
        name: regCompany,
        industry: regIndustry,
        gstin: regGstin,
        openingCash: Number(regOpeningCash) || 0,
      });
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(16, 185, 129, 0.06) 0%, transparent 45%), #07090e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div className="brand-logo-icon" style={{ width: 42, height: 42, fontSize: 18 }}>
          FT
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: "#fff" }}>
            FinTwin
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", letterSpacing: 1, textTransform: "uppercase" }}>
            AI Financial Digital Twin
          </span>
        </div>
      </Link>

      {/* Main Authentication Card */}
      <div
        className="glass-card auth-card"
        style={{
          width: "100%",
          maxWidth: 540,
          background: "rgba(13, 18, 31, 0.92)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.15)",
        }}
      >
        {/* Main Tab Toggle: Sign In vs Register */}
        <div className="tabs-container" style={{ marginBottom: 20 }}>
          <button
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px" }}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px" }}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create Business Account
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fb7185",
              fontSize: 12.5,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        {/* 3 Executive Role Selector */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Select Your Executive Role</span>
            <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>{selectedRole} Mode</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {EXECUTIVE_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`btn ${selectedRole === r.id ? "btn-primary" : "btn-secondary"}`}
                style={{
                  flexDirection: "column",
                  padding: "10px 8px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  border: selectedRole === r.id ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
                }}
                onClick={() => setSelectedRole(r.id)}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{r.id}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2 }}>
                  {r.id === "CEO" ? "Solvency & Strategy" : r.id === "CFO" ? "Cash & Forecast" : "Workers & Payroll"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =================================================================
            1. SIGN IN FORM (EMAIL OR PHONE NUMBER)
            ================================================================= */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit}>
            {/* Sub-toggle for Email vs Phone login */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${loginMethod === "email" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => {
                  setLoginMethod("email");
                  setIdentifier("");
                  setError("");
                }}
              >
                <Mail size={13} />
                <span>Work Email</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${loginMethod === "phone" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => {
                  setLoginMethod("phone");
                  setIdentifier("");
                  setError("");
                }}
              >
                <Phone size={13} />
                <span>Mobile Phone</span>
              </button>
            </div>

            {loginMethod === "email" ? (
              <div className="form-group">
                <label className="form-label">Work Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }}
                  />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="name@company.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone
                    size={15}
                    style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }}
                  />
                  <input
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="+91 98765 43210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
            >
              <span>Sign In as {selectedRole}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* =================================================================
             2. REGISTRATION FORM WITH PHONE & COMPREHENSIVE SECTOR DROPDOWN
             ================================================================= */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Your Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. Rahul Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Work Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="rahul@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business / Enterprise Name</label>
              <div style={{ position: "relative" }}>
                <Building size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g. Paramount Precision Engineering Works"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Exhaustive Industry Sector Dropdown */}
            <div className="form-group">
              <label className="form-label">Industry Sector / Business Domain</label>
              <select
                className="form-select"
                value={regIndustry}
                onChange={(e) => setRegIndustry(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                {INDUSTRY_SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">GSTIN (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 27AABCA1234F1Z8"
                  value={regGstin}
                  onChange={(e) => setRegGstin(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Opening Cash Balance (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500000"
                  value={regOpeningCash}
                  onChange={(e) => setRegOpeningCash(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-emerald btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
            >
              <span>Initialize as {selectedRole}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 16 }}>
        <span>256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>ISO 27001 Certified</span>
        <span>•</span>
        <Link to="/" style={{ color: "#60a5fa" }}>Return to Home</Link>
      </div>
    </div>
  );
}
