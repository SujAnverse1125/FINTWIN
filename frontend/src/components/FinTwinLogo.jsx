import React from "react";

/**
 * FinTwin Custom Redesigned Brand Mark & Wordmark Logo
 * Symbolizes the dual synchronization between the Physical Enterprise & its AI Digital Twin.
 */
export default function FinTwinLogo({
  size = 32,
  variant = "full", // "full" | "mark-only" | "light" | "white"
  showBadge = true,
  badgeText = "MSME Twin",
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
      {/* Redesigned Twin-Nexus Vector Emblem */}
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
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dark Obsidian Squircle Fill */}
            <linearGradient id="ft_bg_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#101318" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>

            {/* Emerald Gradient (Physical Enterprise / Inflow Node) */}
            <linearGradient id="ft_emerald_grad" x1="8" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Sapphire Cyan Gradient (Digital Twin / Simulation Node) */}
            <linearGradient id="ft_blue_grad" x1="32" y1="32" x2="14" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="ft_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Badge Background */}
          <rect
            width="40"
            height="40"
            rx="11"
            fill="url(#ft_bg_grad)"
          />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="10.25"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.5"
          />

          {/* Upper Emerald Loop: "F" Arch & Physical Liquidity Flow */}
          <path
            d="M12 28V14.5C12 11.5 14.5 9.5 17.5 9.5H21.5C24.5 9.5 26.5 11.5 26.5 14C26.5 16.5 24.5 18 21.5 18H12"
            stroke="url(#ft_emerald_grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lower Sapphire Loop: "Twin" Synchronized Mirror Node */}
          <path
            d="M28 12V25.5C28 28.5 25.5 30.5 22.5 30.5H18.5C15.5 30.5 13.5 28.5 13.5 26C13.5 23.5 15.5 22 18.5 22H28"
            stroke="url(#ft_blue_grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Twin Synchronized Spark / Nexus Point */}
          <path
            d="M20 17.5L21.8 20L20 22.5L18.2 20Z"
            fill="#ffffff"
            filter="url(#ft_glow)"
          />
        </svg>
      </div>

      {/* Typography Wordmark (FinTwin) */}
      {variant !== "mark-only" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: "-0.45px",
              color: isLight ? "#ffffff" : "#121316",
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              lineHeight: 1,
            }}
          >
            FinTwin
          </span>

          {/* Optional Category / MSME Badge */}
          {showBadge && (
            <span
              style={{
                fontSize: `${Math.max(9.5, fontSize * 0.58)}px`,
                fontWeight: 700,
                color: "#059669",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "2px 7px",
                borderRadius: "5px",
                letterSpacing: "0.4px",
                lineHeight: 1.2,
                display: "inline-block",
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
