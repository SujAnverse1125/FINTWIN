import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Mail,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  Zap,
  TrendingUp,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { INDUSTRY_SECTORS } from "../data/sampleData";
import FinTwinLogo from "../components/FinTwinLogo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { currentLang, changeLanguage, supportedLanguages, activeLanguageMeta, t } = useLanguage();
  const canvasRef = useRef(null);

  // Mode: 'register' | 'login'
  const isSignUpRoute = location.pathname.includes("signup");
  const [mode, setMode] = useState(isSignUpRoute ? "register" : "login");
  const [selectedRole, setSelectedRole] = useState("CEO");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(INDUSTRY_SECTORS[0]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("signup")) {
      setMode("register");
    } else if (location.pathname.includes("login")) {
      setMode("login");
    }
  }, [location.pathname]);

  // =========================================================================
  // THE FIRST LIVE ANIMATED FINANCIAL GRAPH (ROBUST, 60FPS, NEVER GETS STUCK)
  // =========================================================================
  useEffect(() => {
    let animId;
    let isRunning = true;
    let step = 0;
    let lastTimestamp = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (currentTimestamp) => {
      if (!isRunning) return;

      const dt = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = currentTimestamp;
      step += dt * 1.8; // Smooth, frame-rate independent speed

      const width = canvas.width || 440;
      const height = canvas.height || 500;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing secondary wave (Cyan ambient sine wave)
      ctx.beginPath();
      ctx.moveTo(0, height * 0.58);
      for (let x = 0; x <= width; x += 6) {
        const y =
          height * 0.58 +
          Math.sin(x * 0.008 + step * 0.8) * 28 +
          Math.cos(x * 0.004 - step * 0.5) * 16;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#38bdf8";
      ctx.stroke();

      // 2. Draw primary financial wave spline (Emerald -> Sky Blue -> Violet)
      ctx.beginPath();
      ctx.moveTo(0, height * 0.48);
      const points = [];
      for (let x = 0; x <= width; x += 6) {
        const y =
          height * 0.48 +
          Math.sin(x * 0.01 + step) * 42 +
          Math.cos(x * 0.006 - step * 0.7) * 22;
        points.push({ x, y });
        ctx.lineTo(x, y);
      }

      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "#059669");
      grad.addColorStop(0.4, "#38bdf8");
      grad.addColorStop(0.8, "#818cf8");
      grad.addColorStop(1, "#c084fc");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
      ctx.stroke();

      // 3. Draw live traveling node along the wave (Robust calculation)
      if (points.length > 2) {
        const progress = (Math.sin(step * 0.4) * 0.5 + 0.5); // 0 to 1 back and forth
        const targetIdx = Math.min(Math.floor(progress * (points.length - 1)), points.length - 1);
        const node = points[targetIdx] || points[Math.floor(points.length / 2)];

        if (node && !isNaN(node.x) && !isNaN(node.y)) {
          // Solid glowing white center
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 18;
          ctx.shadowColor = "#38bdf8";
          ctx.fill();

          // Outer pulsing ring
          const ringRadius = 12 + (Math.sin(step * 4) * 0.5 + 0.5) * 6;
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      window.removeEventListener("resize", resizeCanvas);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your work email address.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(email, password, selectedRole);
      setIsSubmitting(false);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please verify and try again.");
      }
    }, 300);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !name || !company) {
      setError("Please provide your full name, enterprise name, and work email.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = register({
        name,
        email,
        company,
        industry,
        role: selectedRole,
        password: password || "demo123",
      });
      setIsSubmitting(false);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    }, 300);
  };

  const handleQuickDemo = (role = "CFO") => {
    setIsSubmitting(true);
    setTimeout(() => {
      login("demo@fintwin.ai", "demo123", role);
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
        // Dribbble Modern Deep Aurora Mesh + Radial Gradients
        background:
          "radial-gradient(circle at 15% 18%, rgba(139, 92, 246, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 82%, rgba(56, 189, 248, 0.35) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, transparent 65%), linear-gradient(135deg, #070a13 0%, #0d1527 45%, #080d1a 100%)",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* High-Tech Fine Grid Overlay Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Floating Glowing Ambient Light Sphere 1 (Violet Aurora Top-Left) */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          left: "-120px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Floating Glowing Ambient Light Sphere 2 (Cyan/Sapphire Bottom-Right) */}
      <div
        style={{
          position: "absolute",
          bottom: "-140px",
          right: "-140px",
          width: "540px",
          height: "540px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.38) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Floating Glowing Ambient Light Sphere 3 (Emerald Middle-Left) */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "5%",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* =========================================================================
          CUSTOM VECTOR FINANCIAL GRAPHS (EXACT USER SKETCH DESIGN)
          ========================================================================= */}
      
      {/* 1. LEFT BACKGROUND: Stepped Financial Bar / Candlestick Skyline Wireframe */}
      <div
        style={{
          position: "absolute",
          left: "max(12px, calc(50% - 760px))",
          bottom: "8%",
          width: "280px",
          height: "380px",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.85,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="barGradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glowLeft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          <line x1="0" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <line x1="0" y1="180" x2="280" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <line x1="0" y1="260" x2="280" y2="260" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <line x1="0" y1="340" x2="280" y2="340" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Stepped Financial Skyline Bars */}
          {/* Bar 1 */}
          <rect x="15" y="160" width="34" height="180" rx="4" fill="url(#barGradCyan)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#glowLeft)" />
          <line x1="32" y1="130" x2="32" y2="160" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="32" cy="130" r="3" fill="#38BDF8" />

          {/* Bar 2 (Tallest) */}
          <rect x="58" y="70" width="38" height="270" rx="4" fill="url(#barGradPurple)" stroke="#8B5CF6" strokeWidth="1.8" filter="url(#glowLeft)" />
          <line x1="77" y1="40" x2="77" y2="70" stroke="#8B5CF6" strokeWidth="1.5" />
          <circle cx="77" cy="40" r="3.5" fill="#C084FC" />

          {/* Bar 3 */}
          <rect x="105" y="210" width="32" height="130" rx="4" fill="url(#barGradCyan)" stroke="#0284C7" strokeWidth="1.5" />
          
          {/* Bar 4 */}
          <rect x="146" y="120" width="36" height="220" rx="4" fill="url(#barGradEmerald)" stroke="#10B981" strokeWidth="1.5" filter="url(#glowLeft)" />
          <line x1="164" y1="95" x2="164" y2="120" stroke="#10B981" strokeWidth="1.5" />
          <circle cx="164" cy="95" r="3" fill="#34D399" />

          {/* Bar 5 */}
          <rect x="191" y="180" width="34" height="160" rx="4" fill="url(#barGradPurple)" stroke="#A855F7" strokeWidth="1.5" />
          
          {/* Bar 6 */}
          <rect x="234" y="90" width="36" height="250" rx="4" fill="url(#barGradCyan)" stroke="#38BDF8" strokeWidth="1.8" filter="url(#glowLeft)" />
          <line x1="252" y1="60" x2="252" y2="90" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="252" cy="60" r="3" fill="#67E8F9" />

          {/* Connecting Trend Polyline across bar peaks */}
          <path d="M 32 130 L 77 40 L 121 210 L 164 95 L 208 180 L 252 60" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* TOP LEFT ACCENT: Radar / Coordinate Cross Accent */}
      <div
        style={{
          position: "absolute",
          left: "max(30px, calc(50% - 720px))",
          top: "10%",
          width: "120px",
          height: "120px",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.75,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="45" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="60" cy="60" r="28" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1.2" />
          <circle cx="60" cy="60" r="6" fill="#8B5CF6" />
          <line x1="60" y1="5" x2="60" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="5" y1="60" x2="115" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="60" cy="15" r="3" fill="#38BDF8" />
          <circle cx="105" cy="60" r="3" fill="#10B981" />
        </svg>
      </div>

      {/* 2. RIGHT BACKGROUND: X/Y Axis Multi-Curve Trajectory Graph */}
      <div
        style={{
          position: "absolute",
          right: "max(12px, calc(50% - 760px))",
          bottom: "8%",
          width: "300px",
          height: "380px",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.85,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="areaCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="areaEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowRight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* X and Y Coordinate Axes */}
          <path d="M 25 30 L 25 340 L 290 340" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Y-Axis Arrow */}
          <path d="M 20 38 L 25 26 L 30 38" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* X-Axis Arrow */}
          <path d="M 282 335 L 294 340 L 282 345" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Axis Grid Ticks */}
          <line x1="20" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="180" x2="280" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="260" x2="280" y2="260" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Curve 1: Area Fill + Glowing Line (Cyan Inflow Wave) */}
          <path d="M 25 240 C 80 220, 120 120, 180 160 C 230 190, 260 90, 285 60 L 285 340 L 25 340 Z" fill="url(#areaCyan)" />
          <path d="M 25 240 C 80 220, 120 120, 180 160 C 230 190, 260 90, 285 60" fill="none" stroke="#38BDF8" strokeWidth="2.5" filter="url(#glowRight)" strokeLinecap="round" />

          {/* Curve 2: Rising Exponential Forecast (Emerald Green) */}
          <path d="M 25 290 C 90 270, 150 230, 200 140 C 240 70, 265 40, 288 35 L 288 340 L 25 340 Z" fill="url(#areaEmerald)" />
          <path d="M 25 290 C 90 270, 150 230, 200 140 C 240 70, 265 40, 288 35" fill="none" stroke="#10B981" strokeWidth="2.2" filter="url(#glowRight)" strokeLinecap="round" />

          {/* Curve 3: Stressed Shock Trajectory (Amber / Rose Dashed Line) */}
          <path d="M 25 150 C 80 180, 130 280, 190 250 C 240 220, 265 290, 285 310" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />

          {/* Glowing Peak Nodes */}
          <circle cx="285" cy="60" r="5" fill="#38BDF8" filter="url(#glowRight)" />
          <circle cx="288" cy="35" r="5.5" fill="#10B981" filter="url(#glowRight)" />
          <circle cx="180" cy="160" r="4" fill="#67E8F9" />
          <circle cx="200" cy="140" r="4" fill="#34D399" />
          <circle cx="285" cy="310" r="4" fill="#F59E0B" />
        </svg>
      </div>

      {/* TOP RIGHT ACCENT: Glowing Orbit Circle Ring (Matching user's drawn circle 'O') */}
      <div
        style={{
          position: "absolute",
          right: "max(35px, calc(50% - 710px))",
          top: "10%",
          width: "110px",
          height: "110px",
          pointerEvents: "none",
          zIndex: 2,
          opacity: 0.8,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 110 110" fill="none">
          <circle cx="55" cy="55" r="42" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.8" />
          <circle cx="55" cy="55" r="30" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.2" strokeDasharray="5 3" />
          <ellipse cx="55" cy="55" rx="50" ry="18" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1.5" transform="rotate(-25 55 55)" />
          <circle cx="55" cy="55" r="6" fill="#F59E0B" />
          <circle cx="85" cy="32" r="3.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Centered Split-Screen Card (Dribbble Glassmorphism Frame) */}
      <div
        style={{
          width: "100%",
          maxWidth: "1060px",
          minHeight: "650px",
          background: "#ffffff",
          borderRadius: "28px",
          boxShadow:
            "0 32px 100px -10px rgba(0, 0, 0, 0.6), 0 0 50px rgba(139, 92, 246, 0.2), 0 1px 3px rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          display: "flex",
          flexWrap: "wrap",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* =========================================================================
            LEFT COLUMN: THE FIRST LIVE ANIMATED FINANCIAL GRAPH (60FPS CONTINUOUS)
            ========================================================================= */}
        <div
          style={{
            flex: "1 1 450px",
            minHeight: "460px",
            background:
              "radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.75) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(30, 58, 138, 0.95) 0%, transparent 55%), linear-gradient(135deg, #030712 0%, #0c1838 40%, #172554 75%, #1e3a8a 100%)",
            position: "relative",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Live Animated Canvas Wave (Frame-Rate Independent, Never Freezes) */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Ambient Caustic Light Sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 40% 50%, rgba(96, 165, 250, 0.22) 0%, transparent 65%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Top Logo / Brand */}
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              zIndex: 10,
            }}
          >
            <FinTwinLogo size={36} fontSize={18} variant="light" badgeText="AI TWIN" />
          </Link>

          {/* Center: Live Telemetry Card (Pulsing Frosted Pill) */}
          <div
            style={{
              zIndex: 10,
              alignSelf: "flex-start",
              background: "rgba(15, 23, 42, 0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "14px",
              padding: "12px 18px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.22)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#34d399",
              }}
            >
              <Activity size={16} />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Live Inflow Telemetry</div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>
                ₹45.1L Forecasted • 98.4% Confidence
              </div>
            </div>
          </div>

          {/* Bottom-Left: High-Contrast Value Proposition Typography */}
          <div style={{ zIndex: 10, maxWidth: "380px" }}>
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#38bdf8",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={12} />
              <span>MSME Financial Intelligence</span>
            </div>
            <h2
              style={{
                fontSize: "23px",
                fontWeight: 700,
                lineHeight: "1.3",
                margin: 0,
                letterSpacing: "-0.4px",
                color: "#ffffff",
              }}
            >
              Predict cash flow, eliminate payment delays & stress-test your business with AI
            </h2>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: CLEAN MINIMALIST AUTHENTICATION FORM (EXACT MATCH)
            ========================================================================= */}
        <div
          style={{
            flex: "1 1 480px",
            padding: "44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          {/* Top Language Selector Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
              🌐 Language / भाषा:
            </span>
            <select
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#0f172a",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {supportedLanguages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.flag} {l.name} ({l.englishName})
                </option>
              ))}
            </select>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 6px 0",
                letterSpacing: "-0.5px",
              }}
            >
              {mode === "login" ? "Welcome back!" : "Create your account"}
            </h1>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.4" }}>
              {mode === "login"
                ? "Manage conversations and AI support in one place."
                : "Your enterprise digital twin for real-time liquidity & GST compliance."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Sign Up Fields */}
            {mode === "register" && (
              <>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "5px",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13.5px",
                      outline: "none",
                      color: "#111827",
                      background: "#ffffff",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "5px",
                    }}
                  >
                    Enterprise Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Precision Engineering"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13.5px",
                      outline: "none",
                      color: "#111827",
                      background: "#ffffff",
                    }}
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "5px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13.5px",
                  outline: "none",
                  color: "#111827",
                  background: "#ffffff",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Password
                </label>
                {mode === "login" && (
                  <span
                    onClick={() => handleQuickDemo("CEO")}
                    style={{ fontSize: "11.5px", color: "#0284c7", fontWeight: 600, cursor: "pointer" }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="*******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13.5px",
                    outline: "none",
                    color: "#111827",
                    background: "#ffffff",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role Selection Chips */}
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                Select Workspace Role:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["CEO", "CFO", "Accountant"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: selectedRole === role ? "1px solid #111827" : "1px solid #e5e7eb",
                      background: selectedRole === role ? "#111827" : "#f9fafb",
                      color: selectedRole === role ? "#ffffff" : "#4b5563",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Black Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: "4px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
              }}
            >
              {isSubmitting
                ? "Verifying..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "18px 0",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#f3f4f6" }} />
            <span style={{ padding: "0 12px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#f3f4f6" }} />
          </div>

          {/* Social / Alternative Login Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleQuickDemo(selectedRole)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("CEO")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>⚡ 1-Click Demo Login</span>
            </button>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6b7280" }}>
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    navigate("/signup");
                  }}
                  style={{
                    color: "#111827",
                    fontWeight: 700,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    navigate("/login");
                  }}
                  style={{
                    color: "#111827",
                    fontWeight: 700,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
