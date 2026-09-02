import React from "react";

/**
 * NexFin Custom Redesigned Brand Mark & Wordmark Logo
 * Symbolizes next-generation intelligent financial connectivity, liquidity telemetry,
 * and autonomous digital twin intelligence.
 */
export default function FinTwinLogo({
  size = 34,
  variant = "full", // "full" | "mark-only" | "light" | "white"
  showBadge = true,
  badgeText = "AI TWIN",
  fontSize = 18,
  style = {},
}) {
  const isLight = variant === "light" || variant === "white";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 30 ? 10 : 8,
        textDecoration: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Redesigned NexFin Modern Geometric "N-X" Nexus Vector Emblem */}
      <div
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dark Obsidian Squircle Fill with Subtle Emerald Tint */}
            <linearGradient id="nf_bg_grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B111E" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0D1F1A" />
            </linearGradient>

            {/* Neon Emerald Gradient (Inflow & Solvency Stem) */}
            <linearGradient id="nf_emerald_grad" x1="8" y1="6" x2="28" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Electric Cyan/Indigo Gradient (Predictive Intelligence Arc) */}
            <linearGradient id="nf_cyan_grad" x1="36" y1="6" x2="16" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Radiant Spark Filter */}
            <filter id="nf_glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Outer Frame */}
          <rect
            width="44"
            height="44"
            rx="12"
            fill="url(#nf_bg_grad)"
          />
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="11.25"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />

          {/* Left Vertical Ascent Pillar (N-Pillar 1) */}
          <path
            d="M13 32V12"
            stroke="url(#nf_emerald_grad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Dynamic Diagonal Nexus Cross (N-Bridge & X-Crossing) */}
          <path
            d="M13 13.5L31 30.5"
            stroke="url(#nf_emerald_grad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Right Vertical Solvency Pillar (N-Pillar 2) */}
          <path
            d="M31 32V12"
            stroke="url(#nf_cyan_grad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Futuristic Secondary Dynamic Arc (Creating the "X" intersecting nexus) */}
          <path
            d="M31 13.5L24 20.5M20 24.5L13 31.5"
            stroke="url(#nf_cyan_grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Central Synchronized Nexus Diamond Core */}
          <circle
            cx="22"
            cy="22"
            r="3.5"
            fill="#FFFFFF"
            filter="url(#nf_glow)"
          />
          <circle
            cx="22"
            cy="22"
            r="1.8"
            fill="#10B981"
          />
        </svg>
      </div>

      {/* Typography Wordmark (NexFin) */}
      {variant !== "mark-only" && (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "center",
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              lineHeight: 1,
            }}
          >
            <span style={{ color: isLight ? "#FFFFFF" : "#0F172A" }}>Nex</span>
            <span
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Fin
            </span>
          </div>

          {/* Category / AI Twin Pill Badge */}
          {showBadge && (
            <span
              style={{
                fontSize: `${Math.max(9.5, fontSize * 0.55)}px`,
                fontWeight: 800,
                color: "#059669",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.28)",
                padding: "2px 7px",
                borderRadius: "6px",
                letterSpacing: "0.5px",
                lineHeight: 1.2,
                display: "inline-block",
                textTransform: "uppercase",
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { FinTwinLogo as NexFinLogo };
