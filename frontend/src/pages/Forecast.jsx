import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  getFinancialData,
  subscribeFinancialData,
} from "../data/financialStore";
import {
  generateLocalForecast,
  getCashFlowSummary,
} from "../engines/digitalTwin";

export default function Forecast() {
  const [horizonDays, setHorizonDays] = useState(90);
  const [forecast, setForecast] = useState(generateLocalForecast(90));
  const [summary, setSummary] = useState(getCashFlowSummary());

  useEffect(() => {
    const unsub = subscribeFinancialData(() => {
      setForecast(generateLocalForecast(horizonDays));
      setSummary(getCashFlowSummary());
    });
    return unsub;
  }, [horizonDays]);

  const handleHorizonChange = (days) => {
    setHorizonDays(days);
    setForecast(generateLocalForecast(days));
  };

  const formatLakhs = (amt) => `₹${(Number(amt || 0) / 100000).toFixed(2)}L`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Metric Row */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Forecast Horizon</span>
            <div className="card-icon-wrap">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#7A9CAE" }}>
              {horizonDays} Days
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>Probabilistic Forward Model</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Breach Risk Horizon</span>
            <div className="card-icon-wrap amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#C78150" }}>
              {forecast.breachDay}
            </span>
          </div>
          <div className="kpi-trend neutral">
            <span>Under Worst-Case Delay Stress</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Lowest Projected Buffer</span>
            <div className="card-icon-wrap rose">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: forecast.lowestProjectedCash >= 0 ? "#1C6758" : "#C07F7F" }}>
              {formatLakhs(forecast.lowestProjectedCash)}
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>Peak Working Capital Stress Point</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Twin AI Confidence Score</span>
            <div className="card-icon-wrap emerald">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: "#1C6758" }}>
              94.8%
            </span>
          </div>
          <div className="kpi-trend positive">
            <span>Trained on MSME Payment Cycles</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart with Horizon Controls */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-wrap purple">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="card-title">Probabilistic Cash Runway Simulation</div>
              <div className="card-subtitle">
                Confidence envelopes: P10 Worst-Case (Delayed Collections), P50 Expected, P90 Accelerated
              </div>
            </div>
          </div>

          <div className="tabs-container">
            <button
              className={`tab-btn ${horizonDays === 30 ? "active" : ""}`}
              onClick={() => handleHorizonChange(30)}
            >
              30 Days
            </button>
            <button
              className={`tab-btn ${horizonDays === 60 ? "active" : ""}`}
              onClick={() => handleHorizonChange(60)}
            >
              60 Days
            </button>
            <button
              className={`tab-btn ${horizonDays === 90 ? "active" : ""}`}
              onClick={() => handleHorizonChange(90)}
            >
              90 Days
            </button>
          </div>
        </div>

        <div style={{ height: 320, width: "100%", marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.timeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8BA896" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8BA896" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C6758" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1C6758" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C07F7F" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C07F7F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#998F7C" fontSize={11} tickLine={false} interval={9} />
              <YAxis
                stroke="#998F7C"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(245, 242, 238, 0.97)",
                  border: "1px solid rgba(28, 103, 88, 0.2)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#2D2620",
                }}
                formatter={(val) => [`₹${(Number(val) / 100000).toFixed(2)}L`, ""]}
              />
              <Area
                type="monotone"
                dataKey="bestCase"
                stroke="#8BA896"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBest)"
                name="P90 (Best-Case)"
              />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#1C6758"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExpected)"
                name="P50 (Expected)"
              />
              <Area
                type="monotone"
                dataKey="worstCase"
                stroke="#C07F7F"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorWorst)"
                name="P10 (Stress Deficit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(28,103,88,0.12) 0%, rgba(122,156,174,0.08) 100%)",
          border: "1px solid rgba(28,103,88,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div className="card-icon-wrap purple" style={{ width: 42, height: 42, flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Digital Twin AI Runway Advisory
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: 6, lineHeight: 1.6 }}>
              {forecast.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}