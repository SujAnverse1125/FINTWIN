import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";

export default function HealthMonitorCard({ health, onForecastClick }) {
  const navigate = useNavigate();

  if (!health) return null;

  const score = Math.min(100, Math.max(0, Number(health.score) || 0));
  const radius = 28;
  const circumference = 2 * Math.PI * radius; // ~175.93
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const getStatusBg = () => {
    if (health.status === "Healthy") return "rgba(16, 185, 129, 0.05)";
    if (health.status === "Moderate") return "rgba(245, 158, 11, 0.05)";
    if (health.status === "Critical") return "rgba(244, 63, 94, 0.05)";
    return "rgba(2, 132, 199, 0.05)";
  };

  const getStatusBorder = () => {
    if (health.status === "Healthy") return "rgba(16, 185, 129, 0.22)";
    if (health.status === "Moderate") return "rgba(245, 158, 11, 0.25)";
    if (health.status === "Critical") return "rgba(244, 63, 94, 0.25)";
    return "rgba(2, 132, 199, 0.22)";
  };

  const getIconBg = () => {
    if (health.status === "Healthy") return "#E6F7F2";
    if (health.status === "Moderate") return "#FEF3C7";
    if (health.status === "Critical") return "#FFE4E6";
    return "#E0F2FE";
  };

  const getIconColor = () => {
    if (health.status === "Healthy") return "#059669";
    if (health.status === "Moderate") return "#D97706";
    if (health.status === "Critical") return "#E11D48";
    return "#0284C7";
  };

  const handleLinkClick = (e) => {
    if (onForecastClick) {
      e.preventDefault();
      onForecastClick();
    } else {
      navigate("/cash-flow");
    }
  };

  return (
    <div
      className="health-monitor-banner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "20px 24px",
        borderRadius: 16,
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${getStatusBg()} 100%)`,
        border: `1px solid ${getStatusBorder()}`,
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        backdropFilter: "blur(12px)",
        flexWrap: "wrap",
      }}
    >
      {/* Left: Indicator Icon, Tag, Headline, Diagnostics, Action */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1, minWidth: 280 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: getIconBg(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Activity size={22} style={{ color: getIconColor() }} className="anim-pulse" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Category Tag */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: getIconColor(),
            }}
          >
            {health.tag || "GST HEALTH"}
          </div>

          {/* Main Headline */}
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {health.headline}
          </h2>

          {/* Subtitle / Diagnostic Summary */}
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: 0,
              marginTop: 2,
              lineHeight: 1.5,
              maxWidth: 620,
            }}
          >
            {health.description}
          </p>

          {/* Action Link */}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleLinkClick}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = getIconColor())}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            >
              <span>View 90-day forecast</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Radial Score Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid rgba(226, 232, 240, 0.9)",
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120,
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          flexShrink: 0,
        }}
      >
        {/* Radial Circular Progress Gauge */}
        <div style={{ position: "relative", width: 68, height: 68 }}>
          <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: "rotate(-90deg)" }}>
            {/* Background Track */}
            <circle
              cx="34"
              cy="34"
              r={radius}
              stroke="rgba(226, 232, 240, 0.8)"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Dynamic Animated Value Ring */}
            <circle
              cx="34"
              cy="34"
              r={radius}
              stroke={health.color || "#10B981"}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease",
              }}
            />
          </svg>

          {/* Center Text (Score + Label) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: 7.5,
                fontWeight: 800,
                color: "var(--text-muted)",
                letterSpacing: "0.6px",
                marginTop: 2,
              }}
            >
              SCORE
            </span>
          </div>
        </div>

        {/* Status Text Under Ring */}
        <div style={{ marginTop: 6, textAlign: "center" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "var(--text-muted)",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            FINANCIAL HEALTH
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: health.color || "#10B981",
              marginTop: 1,
            }}
          >
            {health.status || "Healthy"}
          </div>
        </div>
      </div>
    </div>
  );
}
