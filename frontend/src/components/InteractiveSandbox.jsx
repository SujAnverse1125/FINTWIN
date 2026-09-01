import React, { useState, useEffect } from 'react';
import { ArrowRight, Lightbulb, Activity, Zap } from 'lucide-react';

export default function InteractiveSandbox() {
  const [revenue, setRevenue] = useState(18.0);
  const [burn, setBurn] = useState(12.0);
  const [delay, setDelay] = useState(25);
  const [isShock, setIsShock] = useState(false);

  // Trigger shock animation
  useEffect(() => {
    let interval;
    if (isShock) {
      interval = setInterval(() => {
        setDelay((prev) => {
          if (prev < 60) return prev + 1;
          clearInterval(interval);
          return 60;
        });
      }, 20);
    } else {
      interval = setInterval(() => {
        setDelay((prev) => {
          if (prev > 25) return prev - 1;
          clearInterval(interval);
          return 25;
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isShock]);

  // Derived metrics
  const cashTrapped = ((revenue * delay) / 30).toFixed(1);
  const netFlow = (revenue - burn).toFixed(2);
  const runway = Math.max(0, 60 - delay);
  const healthPercent = Math.min(100, Math.max(0, (runway / 60) * 100));

  // SVG Curve Math
  // Container: width 400, height 120
  // Zero buffer line is at Y=80
  const dipY = 40 + (delay * 0.8); // As delay goes up, curve dips lower (higher Y)
  const isZeroBuffer = dipY > 80;
  
  return (
    <section style={{ padding: "100px 24px", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--text-secondary)" }}>
            Interactive MSME Sandbox
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.8px", marginTop: 8, color: "var(--text-primary)" }}>
            Simulate Your Cash Flow In Real-Time
          </h2>
        </div>

        {/* Main Container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 24,
            background: "#ffffff",
            padding: 12,
            borderRadius: "24px",
            border: "1px solid #E5E0D8",
            boxShadow: "0 12px 48px rgba(0,0,0,0.04)",
          }}
        >
          
          {/* Left Column (Inputs) */}
          <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Card 1: Revenue */}
            <div style={{ border: "1px solid #E5E0D8", borderRadius: "16px", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Monthly Revenue Invoiced</span>
                <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(5, 150, 105, 0.1)", color: "#047857", padding: "4px 8px", borderRadius: "4px" }}>Healthy Inflow</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                ₹{revenue.toFixed(2)} Lakhs
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#115E59" }}
              />
            </div>

            {/* Card 2: Burn */}
            <div style={{ border: "1px solid #E5E0D8", borderRadius: "16px", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Monthly Operating Burn</span>
                <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(225, 29, 72, 0.1)", color: "#BE123C", padding: "4px 8px", borderRadius: "4px" }}>
                  {Math.round((burn / revenue) * 100)}% Burn
                </span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                ₹{burn.toFixed(2)} Lakhs
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={burn}
                onChange={(e) => setBurn(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#BE123C" }}
              />
            </div>

            {/* Card 3: Delay */}
            <div style={{ border: "1px solid #E5E0D8", borderRadius: "16px", padding: 20, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Average Debtor Collection Delay</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                {delay} Days
              </div>
              <div style={{ position: "relative", paddingTop: 10, paddingBottom: 24 }}>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={delay}
                  onChange={(e) => {
                    setDelay(Number(e.target.value));
                    setIsShock(false);
                  }}
                  style={{ width: "100%", accentColor: "#D97706", position: "relative", zIndex: 2 }}
                />
                {/* 45 Day Marker */}
                <div style={{ position: "absolute", left: `${((45 - 5) / (90 - 5)) * 100}%`, top: 0, bottom: 0, width: 2, borderLeft: "2px dashed #D97706", zIndex: 1, opacity: 0.5 }}>
                  <span style={{ position: "absolute", bottom: 0, left: 4, fontSize: "10px", fontWeight: 700, color: "#D97706", whiteSpace: "nowrap" }}>
                    45 Days (MSMED Limit)
                  </span>
                </div>
              </div>
            </div>

            {/* Shock Button */}
            <button
              onClick={() => setIsShock(!isShock)}
              style={{
                background: isShock ? "#451A03" : "#121316",
                color: isShock ? "#FCD34D" : "#ffffff",
                border: isShock ? "1px solid #D97706" : "1px solid transparent",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.3s ease",
                boxShadow: isShock ? "0 0 24px rgba(217, 119, 6, 0.4)" : "none",
              }}
            >
              <Zap size={16} fill={isShock ? "#FCD34D" : "none"} />
              {isShock ? "Delay Shock Active (60 Days)" : "Simulate 60-Day Corporate Delay Shock"}
            </button>
            
          </div>

          {/* Right Column (Output Engine) */}
          <div
            style={{
              background: "#1A1E1C",
              borderRadius: "20px",
              padding: "32px 32px",
              display: "flex",
              flexDirection: "column",
              color: "#ffffff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                AUTONOMOUS TWIN OUTPUT
              </div>
              <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "6px" }}>
                Live Sandbox
              </div>
            </div>

            {/* Runway & Gauge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: "64px", fontWeight: 800, color: runway > 10 ? "#FEF3C7" : "#FECDD3", lineHeight: 1, letterSpacing: "-2px", textShadow: runway > 10 ? "0 0 32px rgba(254, 243, 199, 0.3)" : "0 0 32px rgba(254, 205, 211, 0.3)" }}>
                  {runway} Days
                </div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
                  Projected Safe Cash Runway
                </div>
              </div>
              
              {/* Circular Gauge */}
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke={runway > 10 ? "#10B981" : "#EF4444"}
                    strokeWidth="6"
                    strokeDasharray="226"
                    strokeDashoffset={226 - (226 * healthPercent) / 100}
                    strokeLinecap="round"
                    style={{ transition: "all 0.5s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>
                  {Math.round(healthPercent)}%
                </div>
              </div>
            </div>

            {/* 90-Day Wave Graph */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                <span>Live 90-Day Liquidity Wave Graph</span>
                <span style={{ color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                  <Activity size={12} /> Recovery Curve
                </span>
              </div>
              
              <div style={{ position: "relative", height: 120, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {/* Zero Buffer Threshold */}
                <div style={{ position: "absolute", top: 80, left: 0, right: 0, borderTop: "1px dashed #EF4444", opacity: 0.6 }} />
                <span style={{ position: "absolute", top: 66, right: 0, fontSize: "10px", color: "#EF4444" }}>Zero Buffer</span>

                {/* SVG Curve */}
                <svg width="100%" height="120" preserveAspectRatio="none" viewBox="0 0 400 120" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="waveGradFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isZeroBuffer ? "#EF4444" : "#10B981"} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={isZeroBuffer ? "#EF4444" : "#10B981"} stopOpacity="0" />
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  
                  {/* Background Grid */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Fill Area */}
                  <path
                    d={`M 0 60 C 50 20, 100 ${dipY}, 200 ${dipY} C 300 ${dipY}, 350 30, 400 30 L 400 120 L 0 120 Z`}
                    fill="url(#waveGradFill)"
                    style={{ transition: "d 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                  
                  {/* Crisp Line */}
                  <path
                    d={`M 0 60 C 50 20, 100 ${dipY}, 200 ${dipY} C 300 ${dipY}, 350 30, 400 30`}
                    fill="none"
                    stroke={isZeroBuffer ? "#EF4444" : "#10B981"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transition: "d 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease" }}
                  />

                  {/* Data Points */}
                  <circle cx="0" cy="60" r="4" fill="#1A1E1C" stroke={isZeroBuffer ? "#EF4444" : "#10B981"} strokeWidth="2" />
                  <circle cx="200" cy={dipY} r="4" fill="#1A1E1C" stroke={isZeroBuffer ? "#EF4444" : "#10B981"} strokeWidth="2" style={{ transition: "cy 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease" }} />
                  <circle cx="400" cy="30" r="4" fill="#1A1E1C" stroke={isZeroBuffer ? "#EF4444" : "#10B981"} strokeWidth="2" />
                </svg>

                <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                  <span>30 Days</span>
                  <span>60 Days</span>
                  <span>90 Days</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "14px" }}>
                Cash Trapped: <span style={{ color: "#FBBF24", fontWeight: 700 }}>₹{cashTrapped}L</span>
              </span>
              <span style={{ fontSize: "14px" }}>
                Net Cash Flow: <span style={{ color: "#10B981", fontWeight: 700 }}>+{netFlow}L/mo</span>
              </span>
            </div>

            {/* Algorithmic Pill */}
            <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "12px", marginTop: 24, fontSize: "12px", color: "#FDE68A", display: "flex", alignItems: "center", gap: 8 }}>
              <Lightbulb size={14} />
              TReDS Instant Discounting: Unlocks ₹{cashTrapped}L in 24h at 8.1% p.a.
            </div>

            {/* CTA */}
            <button
              style={{
                width: "100%",
                background: "var(--accent-emerald)",
                color: "#ffffff",
                border: "none",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                marginTop: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(28, 103, 88, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Deploy Production Twin for Your GSTIN <ArrowRight size={16} />
            </button>
            
          </div>
        </div>
      </div>
    </section>
  );
}
