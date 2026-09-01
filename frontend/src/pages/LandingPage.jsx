import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Users,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart3,
  Lock,
  Flame,
  UserCheck,
  Sliders,
  ArrowUpRight,
  Building2,
  MapPin,
  FileCheck2,
  Briefcase,
  Printer,
  QrCode,
  FileText,
  Search,
  Command,
  X,
  Filter,
  Calendar,
  Database,
  ExternalLink,
  Play,
  Check,
  Globe,
  Bell,
  RefreshCw,
  PieChart,
  DollarSign,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FinTwinLogo from "../components/FinTwinLogo";
import InteractiveSandbox from "../components/InteractiveSandbox";

// 3D Card Videos (AWS CloudFront video loops)
const CARD_VIDEOS = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4"
];

// FinTwin Digital Twin Smart Card Editions
const CARD_DETAILS = [
  {
    number: "4892 8820 9104 7712",
    name: "FINTWIN • CORE TWIN",
    tier: "AUTONOMOUS LIQUIDITY",
    cvv: "891",
    subtitle: "AI Cash Flow & Runway Twin",
    metric: "₹24.8L Active Liquidity",
    route: "/cash-flow",
    badge: "99.4% CASH FIDELITY",
    accent: "#0284c7",
  },
  {
    number: "5124 7733 4120 9035",
    name: "GROWTH MSME • CAPITAL",
    tier: "DYNAMIC TREASURY",
    cvv: "409",
    subtitle: "Predictive Invoice Discounting",
    metric: "₹14.2L Inflow Velocity",
    route: "/invoices",
    badge: "ML DELAY ESTIMATOR",
    accent: "#d97706",
  },
  {
    number: "4441 1223 5567 2468",
    name: "TITANIUM • PREDICTIVE",
    tier: "FINANCIAL SHOCK SIMULATOR",
    cvv: "764",
    subtitle: "Synthetic Stress Testing Engine",
    metric: "45-Day Scenario Safe",
    route: "/simulator",
    badge: "ZERO-SURPRISE TWIN",
    accent: "#059669",
  },
  {
    number: "5375 2234 8891 7713",
    name: "GSTIN SMART • COMPLIANCE",
    tier: "AUTOMATED RECONCILER",
    cvv: "255",
    subtitle: "ITC Reclaim & Tax Digital Twin",
    metric: "₹3.4L Claimable ITC",
    route: "/gst",
    badge: "100% RECONCILED",
    accent: "#7c3aed",
  },
  {
    number: "4154 9904 7831 5124",
    name: "ENTERPRISE • FINANCING",
    tier: "INSTANT CREDIT LINE",
    cvv: "382",
    subtitle: "Pre-approved Collateral Free",
    metric: "₹50.0L Pre-approved",
    route: "/financing",
    badge: "INSTANT DISBURSAL",
    accent: "#db2777",
  },
];

// Authentic Indian MSME Vendor Case Studies
const INDIAN_VENDOR_STORIES = [
  {
    id: "manufacturing",
    tabTitle: "Auto-Ancillary",
    tabStat: "₹42L Saved",
    name: "Rajesh Patil",
    role: "Managing Director",
    company: "Omkar Precision Tooling",
    location: "Pune MIDC (Bhosari Hub), Maharashtra",
    industry: "Auto-Ancillary & CNC Machining",
    image: "/stories/vendor_manufacturing.jpg",
    metricValue: "₹42.5L",
    metricLabel: "Working Capital Unlocked via TReDS",
    runwayGain: "+24 Days Runway",
    quote:
      "Before FinTwin, our cash was tied up in 60-day OEM payment cycles. The Digital Twin predicted our liquidity dip 3 weeks ahead and routed verified invoices into TReDS discounting at 8.1%.",
    badges: ["TReDS (RXIL) Active", "MSME Udyam Verified", "ISO 9001:2015"],
    gstin: "27AADCO1234E1Z5 • Verified via Account Aggregator",
    stepper: ["e-Invoice Ingested", "TReDS Discounting", "Working Capital Credited"],
    hudDay: 18,
    hudTotalDays: 90,
    hudText: "Liquidity Dip Predicted: Route to TReDS",
  },
  {
    id: "textile",
    tabTitle: "Textile Weaving",
    tabStat: "₹28.4L Recovered",
    name: "Ananya Mehra",
    role: "Director of Finance",
    company: "Vardhman TexFab Exports",
    location: "Surat Textile Hub, Gujarat",
    industry: "Textile Export & Weaving",
    image: "/stories/vendor_textile.jpg",
    metricValue: "₹28.4L",
    metricLabel: "Recovered via MSMED Section 15",
    runwayGain: "Zero Default Risk",
    quote:
      "FinTwin automatically alerts corporate buyers 10 days before the statutory 45-day deadline, eliminating bad debts.",
    badges: ["MSME Samadhaan Ready", "e-Way Bill Reconciled", "100% GSTR-2B"],
    gstin: "24AAACV8912 • Verified via Account Aggregator",
    stepper: ["e-Way Ingested", "10-Day Statutory Alert", "Settlement Cleared"],
    hudDay: 35,
    hudTotalDays: 45,
    hudText: "Day 35 Alert: Corporate Buyer Notified",
  },
  {
    id: "electronics",
    tabTitle: "IoT Devices",
    tabStat: "100% GSTR-2B",
    name: "Karthik Sundaram",
    role: "Founder & CTO",
    company: "Deccan Microtronics Ltd",
    location: "Peenya Industrial Area, Bengaluru",
    industry: "Consumer Electronics & IoT",
    image: "/stories/vendor_electronics.jpg",
    metricValue: "94.8%",
    metricLabel: "Runway Forecasting Accuracy",
    runwayGain: "74-Day Safe Horizon",
    quote:
      "Component lead times can be brutal. FinTwin simulates the cash impact of buffer semiconductor inventory before we raise POs, keeping our cash flow positive during production ramp-ups.",
    badges: ["RBI Account Aggregator", "BOM Shock Simulator", "Pre-approved ₹50L"],
    gstin: "29AABCU9603R1ZM • Verified via Account Aggregator",
    stepper: ["PO Raised", "BOM Shock Sim", "Cash Flow Stabilized"],
    hudDay: 74,
    hudTotalDays: 90,
    hudText: "Safe Horizon: Buffer Inventory Cleared",
  },
  {
    id: "pharma",
    tabTitle: "Pharma Formulations",
    tabStat: "0 Defaults",
    name: "Vikram Singhania",
    role: "Head of Supply Chain",
    company: "Apex Healthcare Formulations",
    location: "Sanand Industrial Estate, Ahmedabad",
    industry: "Pharma Formulations & APIs",
    image: "/stories/vendor_pharma.jpg",
    metricValue: "₹12.8L",
    metricLabel: "Unclaimed ITC Tax Credits Reclaimed",
    runwayGain: "Zero GST Penalties",
    quote:
      "FinTwin cross-matches our purchase registers against vendor GSTR-2B filings automatically. We no longer lose input tax credits due to supplier filing oversights.",
    badges: ["Automated GSTR-2B Match", "e-Invoice AI OCR", "256-bit AES"],
    gstin: "24AABCA1234F1Z6 • Verified via Account Aggregator",
    stepper: ["Purchase Register", "GSTR-2B Cross-Match", "ITC Reclaimed"],
    hudDay: 12,
    hudTotalDays: 20,
    hudText: "Filing Deadline Alert: Reclaiming ITC",
  },
];

// Navigation Index Sections
const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "printer-stage", label: "Live Ingestion" },
  { id: "corridors", label: "Industrial Hubs" },
  { id: "vendors", label: "MSME Stories" },
  { id: "sandbox", label: "Cash Simulator" },
  { id: "features", label: "Architecture" },
  { id: "pricing", label: "Pricing Plans" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [activeSection, setActiveSection] = useState("hero");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCriteria, setActiveCriteria] = useState("All");

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Active Hero Dashboard Tab
  const [heroDashTab, setHeroDashTab] = useState("cashflow");

  // 3D Cylinder Carousel State & Refs
  const cardCount = 5;
  const cardsRefs = useRef([]);
  const frameId = useRef(0);
  const progress = useRef(0);

  // Mouse coords for 6DOF parallax tilt
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [metrics, setMetrics] = useState({
    cardW: 320,
    cardH: 200,
  });

  // Selected vendor story
  const [activeVendorTab, setActiveVendorTab] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  // Auto-cycle vendor tabs
  useEffect(() => {
    if (!isAutoCycling) return;
    
    const interval = setInterval(() => {
      setActiveVendorTab((prev) => (prev + 1) % INDIAN_VENDOR_STORIES.length);
    }, 6000); // 6 seconds per tab
    
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  // Scroll-Scrubbed Thermal Receipt Printer State
  const printerTrackRef = useRef(null);
  const [printProgress, setPrintProgress] = useState(0);
  const targetPrintProgress = useRef(0);
  const currentPrintProgress = useRef(0);
  const [isPrintingActive, setIsPrintingActive] = useState(false);

  // Sandbox State
  const [sandboxRev, setSandboxRev] = useState(18);
  const [sandboxBurn, setSandboxBurn] = useState(12);
  const [sandboxDelay, setSandboxDelay] = useState(25);

  // Live sandbox calculations
  const monthlyCashInflow = sandboxRev * (1 - (sandboxDelay / 90) * 0.4);
  const netMonthlyCashflow = monthlyCashInflow - sandboxBurn;
  const simulatedRunway =
    sandboxBurn > 0 ? Math.max(0, Math.round((14 / sandboxBurn) * 30)) : 120;
  const cashTrapped = (sandboxRev * (sandboxDelay / 30)).toFixed(1);

  // Scroll State
  const [hasScrolled, setHasScrolled] = useState(false);

  // Phone Mockup Active Card Switch State
  const [activePhoneCard, setActivePhoneCard] = useState(0);

  // Auto-switch cards inside the phone mockup every 2.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoneCard((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll Spy & Parallax Hook
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };

    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasScrolled(scrollY > 180);
      if (scrollY < 1200) {
        progress.current += scrollY * 0.000008;
      }

      if (printerTrackRef.current) {
        const rect = printerTrackRef.current.getBoundingClientRect();
        const trackHeight = printerTrackRef.current.offsetHeight - window.innerHeight;
        if (trackHeight > 0) {
          const scrollFraction = -rect.top / trackHeight;
          const clamped = Math.max(0, Math.min(1, scrollFraction));
          targetPrintProgress.current = clamped;
          setIsPrintingActive(clamped > 0.02 && clamped < 0.98);
        }
      }

      const scrollPosition = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec) {
          const top = sec.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let cardW = 270;
      if (w < 768) {
        cardW = 220;
      } else if (w < 1200) {
        cardW = 250;
      }
      const cardH = Math.round(cardW / 1.5925);

      setMetrics({ cardW, cardH });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 60fps render loop for 3D Carousel
  const renderLoop = () => {
    progress.current += 0.0016;

    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

    const diff = targetPrintProgress.current - currentPrintProgress.current;
    if (Math.abs(diff) > 0.001) {
      currentPrintProgress.current += diff * 0.12;
      setPrintProgress(currentPrintProgress.current);
    }

    const cards = cardsRefs.current;
    const { cardH } = metrics;

    const continuousProgress = progress.current;
    const roundedIndex = Math.round(continuousProgress);
    const diffFromRound = continuousProgress - roundedIndex;

    const easedDiff =
      (Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2)) / 2;
    const virtualActiveIndex = roundedIndex + easedDiff;

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      if (absOffset > 2.8) {
        card.style.visibility = "hidden";
        continue;
      } else {
        card.style.visibility = "visible";
      }

      const gap = 20;

      let y = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);
        const targetY = cardH * 0.72 + gap;
        y = -sign * (easedT * targetY);
        z = 220 + easedT * (120 - 220);
        rot = easedT * 110;
      } else if (absOffset <= 2) {
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);
        const yStart = cardH * 0.72 + gap;
        const zStart = 120;
        const rotStart = 110;
        const zEnd = -40;
        const rotEnd = 160;

        const yEnd = cardH * 1.25 + gap;
        const currentY = yStart + easedT * (yEnd - yStart);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);
        const zStart = -40;
        const rotStart = 160;
        const zEnd3 = -180;
        const rotEnd3 = 185;

        const yEnd2 = cardH * 1.25 + gap;
        const yEnd3 = cardH * 1.5 + gap;

        const currentY = yEnd2 + easedT * (yEnd3 - yEnd2);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = -sign * rot;
      const centerFactor = Math.max(0, 1 - absOffset);

      const maxTiltY = 10;
      const maxTiltX = 8;

      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = localCardRotation + activeTiltX;
      const totalRotY = activeTiltY;

      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = absOffset > 1.8 ? "0.4" : "1";
      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-2deg)`;
    }
  };

  useEffect(() => {
    let animId;
    const loop = () => {
      renderLoop();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [metrics]);

  const activeVendor = INDIAN_VENDOR_STORIES[activeVendorTab];

  // Thermal Printer Visibility thresholds
  const receiptHeight = Math.max(40, printProgress * 520);
  const isHeaderVisible = printProgress > 0.05;
  const isVendorVisible = printProgress > 0.18;
  const isInvoiceMetaVisible = printProgress > 0.35;
  const isItemsVisible = printProgress > 0.52;
  const isTaxSummaryVisible = printProgress > 0.70;
  const isStatutoryVisible = printProgress > 0.85;
  const isBarcodeVisible = printProgress > 0.94;

  const thicknessLayers = [-2, -1, 0, 1, 2];

  const COMMAND_ITEMS = [
    {
      title: "Tata Motors CV Hub (₹4,51,350)",
      desc: "Due in 2 days • TReDS eligible for instant 24h auction",
      category: "Invoices",
      icon: <CheckCircle2 size={14} color="#10b981" />,
      action: () => {
        setIsCommandOpen(false);
        navigate("/invoices");
      },
    },
    {
      title: "Section 15 MSMED 45-Day Statutory Notice",
      desc: "Auto-send 10-day notice to Reliance Retail Ltd",
      category: "Compliance",
      icon: <ShieldCheck size={14} color="#0284c7" />,
      action: () => {
        setIsCommandOpen(false);
        navigate("/invoices");
      },
    },
    {
      title: "What-If Shock Simulator: +15 Days Delay",
      desc: "Simulate OEM payment deferral across Tier-1 vendors",
      category: "Simulator",
      icon: <Flame size={14} color="#dc2626" />,
      action: () => {
        setIsCommandOpen(false);
        navigate("/simulator");
      },
    },
  ];

  const filteredCommandItems = COMMAND_ITEMS.filter((item) => {
    if (activeCriteria !== "All" && item.category !== activeCriteria) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.desc.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <style>{`
        @keyframes float-pill-glow {
          0%, 100% { transform: translateY(0px); box-shadow: 0 4px 16px rgba(5, 150, 105, 0.12); }
          50% { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(5, 150, 105, 0.22); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* =========================================================================
          FIXED AMBIENT BACKGROUND LAYER (Spans entire page)
          ========================================================================= */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Architectural Grid SVG */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", top: 0, left: 0, opacity: 0.5 }}>
          <defs>
            <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(180, 109, 75, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-grid)" />
        </svg>

        {/* Network SVG (Left edge) */}
        <svg style={{ position: "absolute", left: "-5%", top: "10%", width: "40%", height: "80%", opacity: 0.15 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.5" />
          <path d="M0,80 Q30,100 60,60 T100,20" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="1" fill="var(--accent-emerald)" />
          <circle cx="25" cy="35" r="1" fill="var(--accent-emerald)" />
          <circle cx="60" cy="60" r="1" fill="var(--accent-emerald)" />
        </svg>

        {/* Ambient Floating Colors */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(180, 109, 75, 0.06) 0%, transparent 70%)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "30%", right: "-10%", width: "45vw", height: "45vw", background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)", filter: "blur(80px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(217, 119, 6, 0.05) 0%, transparent 70%)", filter: "blur(90px)", borderRadius: "50%" }} />

        {/* Floating Background Sticky Notes (Parallax Fixed) */}
        <div style={{ position: "absolute", top: "15%", right: "12%", width: 80, height: 80, background: "#FEF08A", transform: "rotate(12deg)", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", opacity: 0.7 }} />
        <div style={{ position: "absolute", top: "45%", left: "8%", width: 90, height: 90, background: "#A7F3D0", transform: "rotate(-8deg)", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", opacity: 0.7 }} />
        <div style={{ position: "absolute", bottom: "25%", right: "15%", width: 100, height: 100, background: "#FDE68A", transform: "rotate(-15deg)", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", opacity: 0.8 }} />
        <div style={{ position: "absolute", bottom: "5%", left: "25%", width: 80, height: 80, background: "#BFDBFE", transform: "rotate(20deg)", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", opacity: 0.7 }} />
      </div>

      {/* =========================================================================
          FLOATING ACRYLIC HEADER (APPEARS ON SCROLL)
          ========================================================================= */}
      <header
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: hasScrolled ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-120px)",
          opacity: hasScrolled ? 1 : 0,
          pointerEvents: hasScrolled ? "auto" : "none",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          width: "calc(100% - 32px)",
          maxWidth: "1280px",
          height: "56px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px 0 18px",
          borderRadius: "16px",
          background: "rgba(245, 246, 241, 0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.85)",
          boxShadow: "0 12px 32px rgba(30, 40, 30, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
        }}
      >
        {/* Brand Monogram & Name */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <FinTwinLogo size={30} fontSize={17} badgeText="MSME Twin" />
        </Link>

        {/* Segmented Navigation Menu */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: 4,
            background: "rgba(0, 0, 0, 0.04)",
            padding: "4px 5px",
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
          className="desktop-nav"
        >
          {SECTIONS.filter((s) => ["hero", "printer-stage", "vendors", "sandbox", "features"].includes(s.id)).map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isCurrent ? "var(--bg-card)" : "transparent",
                  boxShadow: isCurrent ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{sec.label}</span>
                {isCurrent && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "1px",
                      background: "#059669",
                      display: "inline-block",
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button
            onClick={() => setIsCommandOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              color: "#4b5563",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Search size={13} color="#6b7280" />
            <kbd
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "4px",
                padding: "1px 5px",
                color: "#18181b",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: "10px",
                background: "#121316",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  color: "#4b5563",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: "10px",
                  background: "#121316",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <span>Deploy Twin</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* =========================================================================
          COMMAND PALETTE MODAL
          ========================================================================= */}
      {isCommandOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(18, 19, 22, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
          }}
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.18)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <Search size={18} color="#71717a" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything (e.g. 'Extract Tata Motors invoices due in 15 days')..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "#121316",
                  background: "transparent",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                style={{ background: "transparent", border: "none", color: "#71717a", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto", padding: "8px" }}>
              {filteredCommandItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={item.action}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f4f5f0")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      marginTop: 2,
                      padding: 6,
                      borderRadius: "6px",
                      background: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#121316" }}>{item.title}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#71717a", background: "rgba(0,0,0,0.04)", padding: "1px 6px", borderRadius: "4px" }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#52525b", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FINYON-INSPIRED LUXURY HERO MASTER CARD SECTION (3-COLUMN OVERLAP)
          ========================================================================= */}
      <section
        id="hero"
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "32px",
          paddingBottom: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "transparent",
          zIndex: 1, // Stay above fixed bg
        }}
      >
        {/* Floating Side-Margin Badges (Glassmorphism) */}
        <div
          className="desktop-nav"
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            transformOrigin: "center left",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            padding: "8px 18px",
            borderRadius: "14px",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            zIndex: 5,
          }}
        >
          <Lock size={12} color="#D97706" /> Account Aggregator Verified
        </div>

        <div
          className="desktop-nav"
          style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%) rotate(90deg)",
            transformOrigin: "center right",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            padding: "8px 18px",
            borderRadius: "14px",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            zIndex: 5,
          }}
        >
          <BarChart3 size={12} color="#10B981" /> 45-Day Statutory MSMED Watch
        </div>

        {/* Floating Top Navigation Pill */}
        <div
          style={{
            width: "calc(100% - 48px)",
            maxWidth: "1140px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "48px",
            padding: "16px 32px",
            borderRadius: "9999px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid var(--border-subtle)",
            zIndex: 20,
          }}
        >
          {/* Left: Brand */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <FinTwinLogo size={34} fontSize={18} badgeText="MSME Twin" />
          </Link>

          {/* Center: Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 36 }} className="desktop-nav">
            <a href="#hero" style={{ textDecoration: "none", fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>Technology</a>
            <a href="#printer-stage" style={{ textDecoration: "none", fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>MSME Rules</a>
            <a href="#sandbox" style={{ textDecoration: "none", fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>Simulator</a>
            <a href="#vendors" style={{ textDecoration: "none", fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>Case Studies</a>
            <a href="#features" style={{ textDecoration: "none", fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)" }}>Architecture</a>
          </nav>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link to="/login" style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }} className="desktop-nav">
              Sign In
            </Link>
            <Link
              to="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 24px",
                borderRadius: "9999px",
                background: "#121316",
                color: "#ffffff",
                fontSize: "14.5px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              }}
            >
              <span>Deploy Twin <ArrowRight size={14} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }}/></span>
            </Link>
          </div>
        </div>

        {/* Master Hero Grid Container (3 Columns) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1600px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "720px",
            zIndex: 10,
            zoom: 0.85, // Scales the entire hero grid down by 15%
          }}
        >
          {/* CENTER COLUMN: The Dominant Glassmorphism Card */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1100px",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(24px)",
              borderRadius: "36px",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.06)",
              padding: "64px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            {/* LEFT COLUMN: Social Proof Overlay Card (Pinned to center card) */}
            <div
              className="desktop-nav"
              style={{
                position: "absolute",
                left: "-220px", // Exact 80px overlap, perfectly responsive
                top: "50%",
                transform: "translateY(-50%)",
                width: "300px",
                background: "#1A1E1C",
                borderRadius: "24px",
                padding: "20px",
                color: "#ffffff",
                boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
                zIndex: 20,
              }}
            >
              <div style={{ width: "100%", height: "240px", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
                <img src="/stories/vendor_manufacturing.jpg" alt="Vikram S." style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Spotlight: Vikram S.,</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>Sanand Industrial Estate.</div>
              
              <div style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 }}>₹12.8L</div>
              <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.7)", marginTop: "8px", lineHeight: 1.4 }}>
                GSTR-2B ITC Reclaimed.<br/>Zero Penalties.
              </div>

              <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: 8, background: "#ffffff", padding: "10px 16px", borderRadius: "999px", color: "#121316", width: "fit-content" }}>
                <ShieldCheck size={16} color="#10B981" />
                <div style={{ fontSize: "10px", fontWeight: 700, lineHeight: 1.1 }}>
                  Verified via<br/>Account Aggregator
                </div>
              </div>
            </div>

            {/* Center-Left: 3D Art Panel (Carousel) */}
            <div
              style={{
                position: "relative",
                height: "600px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Full 3D Rotating Cylinder Card Carousel Stage */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "460px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  perspective: "1200px",
                  zIndex: 10,
                }}
              >
                {/* 3D Preserved Cylinder Container */}
                <div
                  style={{
                    position: "absolute",
                    width: `${metrics.cardW}px`,
                    height: `${metrics.cardH}px`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {Array.from({ length: cardCount }).map((_, i) => {
                    const cardDetail = CARD_DETAILS[i % CARD_DETAILS.length];

                    return (
                      <div
                        key={i}
                        ref={(el) => {
                          cardsRefs.current[i] = el;
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: `${metrics.cardW}px`,
                          height: `${metrics.cardH}px`,
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "visible",
                        }}
                      >
                        {thicknessLayers.map((zOffset, layerIdx) => {
                          const isFrontFace = layerIdx === thicknessLayers.length - 1;
                          const isBackFace = layerIdx === 0;
                          const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];
                          const baseBgColor = "#1A1A24"; // Slightly softer dark for light theme

                          if (!isFrontFace && !isBackFace) {
                            return (
                              <div
                                key={layerIdx}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  borderRadius: "16px",
                                  border: "1px solid #52525b",
                                  pointerEvents: "none",
                                  overflow: "hidden",
                                  backgroundColor: "#3f3f46",
                                  transform: `translateZ(${zOffset}px)`,
                                }}
                              />
                            );
                          }

                          if (isFrontFace) {
                            return (
                              <div
                                key={layerIdx}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  borderRadius: "16px",
                                  border: "1px solid rgba(255, 255, 255, 0.25)",
                                  pointerEvents: "none",
                                  overflow: "hidden",
                                  backgroundColor: baseBgColor,
                                  transform: `translateZ(${zOffset}px)`,
                                  backfaceVisibility: "hidden",
                                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), 0 25px 50px rgba(0,0,0,0.6)",
                                }}
                              >
                                <video
                                  src={videoSrc}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "16px",
                                    opacity: 0.8,
                                  }}
                                />

                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    padding: "16px 18px",
                                    color: "#ffffff",
                                    height: "100%",
                                    width: "100%",
                                    zIndex: 10,
                                    background: "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                                    <div
                                      style={{
                                        fontSize: "8.5px",
                                        fontWeight: 800,
                                        letterSpacing: "1px",
                                        padding: "3px 7px",
                                        borderRadius: "4px",
                                        background: "rgba(0, 0, 0, 0.45)",
                                        backdropFilter: "blur(8px)",
                                        border: "1px solid rgba(255, 255, 255, 0.2)",
                                        color: cardDetail.accent,
                                      }}
                                    >
                                      {cardDetail.tier}
                                    </div>
                                    <span style={{ fontSize: "10.5px", fontWeight: 700, opacity: 0.85 }}>{cardDetail.cvv}</span>
                                  </div>

                                  <div>
                                    <div style={{ fontSize: "13.5px", fontWeight: 800, letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>
                                      {cardDetail.number}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                                      <span style={{ fontSize: "9px", fontWeight: 700, opacity: 0.9 }}>{cardDetail.name}</span>
                                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#34d399" }}>{cardDetail.metric}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={layerIdx}
                              style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "16px",
                                border: "1px solid #3f3f46",
                                backgroundColor: "#18181b",
                                transform: `translateZ(${zOffset}px) rotateY(180deg)`,
                                backfaceVisibility: "hidden",
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Floating 3D Token 1: Fidelity Pill */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 0,
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                    fontWeight: 800,
                    fontSize: "10px",
                    transform: "translateZ(50px)",
                    animation: "float-subtle 3s ease-in-out infinite",
                    zIndex: 25,
                  }}
                >
                  99.4% Cash Fidelity
                </div>

                {/* Floating 3D Token 2: Emerald Arrow Token */}
                <div
                  style={{
                    position: "absolute",
                    top: 100,
                    right: -20,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #34d399 0%, #059669 100%)",
                    border: "2px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 10px 20px rgba(5, 150, 105, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    transform: "rotate(15deg) translateZ(80px)",
                    animation: "float-subtle 3.5s ease-in-out infinite 0.5s",
                    zIndex: 25,
                  }}
                >
                  <ArrowUpRight size={20} strokeWidth={3} />
                </div>

                {/* Floating 3D Token 3: MSMED Checkmark */}
                <div
                  style={{
                    position: "absolute",
                    top: 190,
                    right: -10,
                    width: "54px",
                    height: "54px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #f1f5f9 100%)",
                    border: "2px solid #ffffff",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                    transform: "rotate(-10deg) translateZ(100px)",
                    animation: "float-subtle 4s ease-in-out infinite 1s",
                    zIndex: 25,
                  }}
                >
                  <Check size={18} strokeWidth={3} color="#059669" />
                  <span style={{ fontSize: "6.5px", fontWeight: 800 }}>MSMED 45D</span>
                </div>

                {/* Floating 3D Token 4: Dark Obsidian Rupee Coin */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 60,
                    left: 10,
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #334155 0%, #0f172a 100%)",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "18px",
                    transform: "rotate(8deg) translateZ(60px)",
                    animation: "float-subtle 3.2s ease-in-out infinite 1.5s",
                    zIndex: 25,
                  }}
                >
                  ₹
                </div>
              </div>

              {/* Panel Bottom Telemetry Pill */}
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 600,
                  zIndex: 30,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap size={12} color="#F59E0B" fill="#F59E0B"/> Live TReDS Auction Match Active</span>
                <span style={{ color: "#34d399", fontWeight: 800 }}>8.1% p.a.</span>
              </div>
            </div>

            {/* Center-Right: Typography & Actions */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h1
                style={{
                  fontSize: "clamp(3.2rem, 5vw, 4.6rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  color: "#2D2620", // Deep walnut
                  margin: "0 0 24px 0",
                  textWrap: "balance",
                }}
              >
                Finance made simple for Indian MSMEs
              </h1>

              <p
                style={{
                  fontSize: "16.5px",
                  lineHeight: 1.65,
                  color: "#4B5563",
                  margin: "0 0 40px 0",
                  maxWidth: "92%",
                }}
              >
                Whether you're managing cash runway, enforcing 45-day statutory MSMED settlements, or seeking collateral-free TReDS discounting, FinTwin is here to help.
              </p>

              {/* Action CTAs */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "56px", flexWrap: "wrap" }}>
                <Link
                  to="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 36px",
                    borderRadius: "9999px",
                    background: "#B46D4B", // Bronze pill
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 8px 24px rgba(180, 109, 75, 0.3)",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span>Deploy Your Digital Twin <ArrowRight size={16} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }}/></span>
                </Link>

                <a
                  href="#printer-stage"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 28px",
                    borderRadius: "9999px",
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    color: "var(--text-primary)",
                    fontSize: "15px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <span>Try Invoice Printer <ArrowRight size={16} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }}/></span>
                </a>
              </div>

              {/* Bottom Metrics Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "40px",
                  paddingTop: "32px",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>Simulated Liquidity</span>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>₹128+ Cr</div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>Enterprises</span>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>240+</div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>Compliance</span>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>(0)</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Mini Cash Flow Simulator Overlay Card (Pinned to center card) */}
            <div
              className="desktop-nav"
              style={{
                position: "absolute",
                right: "-220px", // Exact 80px overlap, perfectly responsive
                top: "50%",
                transform: "translateY(-50%)",
                width: "300px",
                background: "#ffffff",
                borderRadius: "24px",
                padding: "32px 28px",
                boxShadow: "0 32px 64px rgba(0,0,0,0.1)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "24px", lineHeight: 1.1 }}>
                Mini Cash Flow Simulator
              </div>

              {/* Mini Burn Slider */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
                  <span>Monthly Operating Burn</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="40"
                  value={sandboxBurn}
                  onChange={(e) => setSandboxBurn(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#EF4444", height: "6px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "6px" }}>
                  <span>&lt;0</span>
                  <span>₹{sandboxBurn},000</span>
                </div>
              </div>

              {/* Mini Delay Slider */}
              <div style={{ marginBottom: "32px", position: "relative" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Average Debtor Delay</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>{sandboxDelay} Days</div>
                
                <div style={{ position: "relative" }}>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={sandboxDelay}
                    onChange={(e) => setSandboxDelay(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#F59E0B", height: "6px", position: "relative", zIndex: 2 }}
                  />
                  {/* 45 Day Marker */}
                  <div style={{ position: "absolute", left: `${((45 - 5) / (90 - 5)) * 100}%`, top: -6, bottom: -6, width: 2, borderLeft: "2px dashed #F59E0B", zIndex: 1, opacity: 0.5 }}>
                    <span style={{ position: "absolute", bottom: -14, left: -24, fontSize: "8px", fontWeight: 700, color: "#F59E0B", whiteSpace: "nowrap" }}>
                      45 Days (MSMED Limit)
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "12px" }}>
                  <span>0</span>
                  <span>10k</span>
                </div>
              </div>

              {/* Projected Runway Gauge */}
              {(() => {
                const miniRunway = Math.max(0, 90 - sandboxDelay - (sandboxBurn * 1.5));
                const healthPercent = Math.min(100, Math.max(0, (miniRunway / 60) * 100));
                const isDanger = miniRunway < 20;

                return (
                  <div style={{ background: isDanger ? "#EF4444" : "#10B981", borderRadius: "14px", padding: "20px", color: "#ffffff", textAlign: "center", transition: "background 0.3s ease" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, marginBottom: "12px" }}>Projected Safe Runway</div>
                    
                    <div style={{ position: "relative", height: "8px", background: "rgba(255,255,255,0.3)", borderRadius: "4px", overflow: "visible", marginBottom: "12px" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${healthPercent}%`, background: "#ffffff", borderRadius: "4px", transition: "width 0.3s ease" }} />
                      <div style={{ position: "absolute", left: `${healthPercent}%`, top: "50%", transform: "translate(-50%, -50%)", width: 16, height: 16, background: "#ffffff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "left 0.3s ease" }} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600 }}>
                      <span>0</span>
                      <span>Gauge</span>
                      <span>70</span>
                    </div>
                  </div>
                );
              })()}

              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "center", marginTop: "20px", fontWeight: 500, lineHeight: 1.4 }}>
                Avoid the 45-day<br/>MSMED default risk.
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 2: SCROLL TO FEED CONSENTED GST TAX INVOICE
          (CLEAN, STRUCTURED THREE-COLUMN DIGITAL DASHBOARD MATCHING IMAGE_5.PNG)
          ========================================================================= */}
      <section
        id="printer-stage"
        ref={printerTrackRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "180vh",
          padding: "60px 24px",
          background: "transparent",
          zIndex: 1, // Stay above fixed bg
        }}
      >
        <div
          style={{
            position: "sticky",
            top: "70px",
            maxWidth: "1380px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Main Top Header across all columns */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.7rem)", fontWeight: 800, letterSpacing: "-0.6px", color: "var(--text-primary)", margin: 0, transition: "color 0.3s ease" }}>
              Active Flow: Consented GST Tax Invoice Stream
            </h2>
            <p style={{ color: "#4b5563", fontSize: "14.5px", maxWidth: "780px", margin: "8px auto 0", lineHeight: 1.5, fontWeight: 500 }}>
              FinTwin ingests consented line items, verifies MSMED-45-day statutory deadlines, forecasts liquidity gaps, and simulates cash flow shocks in real-time.
            </p>
          </div>

          {/* 3-Column Structured Grid: Left (Problems) | Center (Invoice Printout) | Right (Solutions) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.08fr 340px 1.08fr",
              gap: "24px",
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* =========================================================================
                LEFT COLUMN: THE GROUND REALITY & PROBLEM STATEMENT
                ========================================================================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", paddingRight: "10px" }}>
              {/* Header with Red Dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="anim-pulse" style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#b91c1c", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(255,255,255,0.9)" }}>
                  THE GROUND REALITY & PROBLEM STATEMENT
                </span>
              </div>

              {/* Organic Stack of Sticky Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
                
                {/* Row 1 */}
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div className="sticky-note sticky-yellow tape-top" style={{ flex: 1, transform: "rotate(-3deg)" }}>
                    <img src="/story/vegetable_vendor.jpg" alt="Vendor" style={{ width: "26px", height: "26px", borderRadius: "2px", objectFit: "cover", position: "absolute", top: -8, right: 10, border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: "rotate(5deg)" }} />
                    Big Institutional guys delay payments (60+ days)! My cash flow is dead.
                  </div>
                  <div className="sticky-note sticky-pink tape-corner" style={{ flex: 1.1, transform: "rotate(2deg)", marginTop: "15px" }}>
                    <span style={{ position: "absolute", top: -14, left: -14, color: "#dc2626", fontSize: 28, fontWeight: "bold" }} className="anim-blink">!</span>
                    <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: "20px", opacity: 0.8 }}>💳</span>
                    Forced into 36% p.a. debt trap! This loan-shark debt is killer.
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginLeft: "10px" }}>
                  <span style={{ fontSize: 32, fontWeight: "bold", opacity: 0.6, transform: "rotate(-15deg)" }}>?</span>
                  <div className="sticky-note sticky-sand tape-top" style={{ flex: 1, transform: "rotate(1deg)" }}>
                    Working capital... just evaporates.
                  </div>
                  <div className="sticky-note sticky-yellow tape-corner" style={{ flex: 1.1, transform: "rotate(-2deg)" }}>
                    <img src="/story/retail_owner.jpg" alt="Owner" style={{ width: "26px", height: "26px", borderRadius: "2px", objectFit: "cover", position: "absolute", top: -8, right: -5, border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: "rotate(-4deg)" }} />
                    Suppliers and rent won't wait.
                  </div>
                  <span style={{ fontSize: 28, fontWeight: "bold", opacity: 0.6, transform: "rotate(15deg)", color: "#ef4444" }}>?</span>
                </div>

                {/* Row 3 */}
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-end", marginTop: "-5px" }}>
                  <div className="sticky-note sticky-yellow tape-top" style={{ flex: 1, transform: "rotate(-4deg)", marginLeft: "25px" }}>
                    Suppliers and Zero predictability.
                  </div>
                  <div className="sticky-note sticky-sand tape-corner" style={{ flex: 1.2, transform: "rotate(3deg)" }}>
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: "18px", opacity: 0.7 }}>🔒</span>
                    Banks demand high property collateral.
                  </div>
                </div>

                {/* Row 4 */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "10px" }}>
                  <div className="sticky-note sticky-pink tape-top" style={{ flex: 1.2, transform: "rotate(-1deg)" }}>
                    Unmonitored 45-day statutory payment delays.
                  </div>
                  <span style={{ color: "#dc2626", fontSize: 28, fontWeight: "bold", marginTop: "10px" }} className="anim-blink">!</span>
                  <div className="sticky-note sticky-pink tape-corner" style={{ flex: 1, transform: "rotate(2deg)" }}>
                    Black-box credit rejections.
                  </div>
                  <div className="sticky-note sticky-sand tape-top" style={{ flex: 0.9, transform: "rotate(-3deg)", marginTop: "20px" }}>
                    Vendor GST filing mismatches.
                  </div>
                </div>

                {/* Row 5 */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "5px", paddingLeft: "15px" }}>
                  <div className="sticky-note sticky-yellow tape-top" style={{ flex: 1, transform: "rotate(1deg)", padding: "18px 24px", fontSize: "18px" }}>
                    Unclaimed Input Tax Credits (ITC).
                  </div>
                  <span style={{ color: "#dc2626", fontSize: 32, fontWeight: "bold", background: "#fee2e2", padding: "0 10px", borderRadius: "8px", border: "2px solid #fca5a5", transform: "rotate(-5deg)" }} className="anim-pulse">!</span>
                </div>

              </div>
            </div>


            {/* =========================================================================
                CENTRAL COLUMN: PROCESS / GST TAX INVOICE PRINTED RECEIPT
                (EXACTLY MATCHING IMAGE_5.PNG)
                ========================================================================= */}
            <div
              style={{
                position: "relative",
                width: "340px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Dark Status Bar Chassis */}
              <div
                className="printer-chassis"
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "16px 20px 10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div
                      className={isPrintingActive ? "anim-pulse" : ""}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: printProgress >= 0.99 ? "#10b981" : printProgress <= 0.01 ? "#f59e0b" : "#3b82f6",
                        boxShadow: `0 0 12px ${printProgress >= 0.99 ? "#10b981" : printProgress <= 0.01 ? "#f59e0b" : "#3b82f6"}`
                      }}
                    />
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      color: printProgress >= 0.99 ? "#10b981" : printProgress <= 0.01 ? "#f59e0b" : "#3b82f6",
                      textTransform: "uppercase"
                    }}>
                      {printProgress >= 0.99 ? "PRINT COMPLETE" : printProgress <= 0.01 ? "AWAITING FEED" : "PRINTING FEED..."}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                    {Math.round(printProgress * 100)}% FEED
                  </span>
                </div>
                <div className="printer-paper-slot" />
              </div>

              {/* Large, Perfectly Clean and Clear Rendering of GST Tax Invoice from image_5.png */}
              <div style={{ width: "315px", position: "relative", overflow: "hidden", marginTop: "-5px", zIndex: 10 }}>
                <div
                  className="printer-paper-stream"
                  style={{
                    position: "relative",
                    width: "100%",
                    color: "#0a0a0a",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    lineHeight: 1.4,
                    paddingBottom: "10px",
                    transform: `translateY(${-100 + printProgress * 100}%)`,
                    transition: "transform 0.1s ease-out",
                  }}
                >
                <div style={{ padding: "16px 18px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Header Title & Reg */}
                  <div style={{ textAlign: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "10px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "-0.2px", color: "#000000" }}>
                      GST TAX INVOICE
                    </div>
                    <div style={{ fontSize: "8.5px", color: "#475569", marginTop: 2, letterSpacing: "0.5px" }}>
                      RSKE IONAR TEE. 28228-09-23-22-2022
                    </div>
                  </div>

                  {/* Supplier & Buyer Details */}
                  <div style={{ borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px", fontSize: "9px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: "#000" }}>SUPPLIER:</span>
                      <span style={{ color: "#334155" }}>OMKAR PRECISION PUNE</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontWeight: 700, color: "#000" }}>BUYER:</span>
                      <span style={{ color: "#334155" }}>TATA MOTORS CV HUB</span>
                    </div>
                  </div>

                  {/* Dates & MSME Deadline */}
                  <div style={{ borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px", fontSize: "9px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>INN NO: 09/26-27/0891</span>
                      <span>DATE: 28-AUG-2026</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#dc2626", fontWeight: 700, marginTop: 3 }}>
                      <span>DUE (45-DAY MSME):</span>
                      <span>12-OCT-2026</span>
                    </div>
                  </div>

                  {/* Item Table */}
                  <div style={{ borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderBottom: "1px solid #e2e8f0", paddingBottom: 2 }}>
                      <span>ITEM</span>
                      <span>QTY</span>
                      <span>AMOUNT</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <div>CNC Engine Bracket</div>
                      <div>450</div>
                      <div style={{ fontWeight: 700 }}>33,82,500</div>
                    </div>
                  </div>

                  {/* Totals Area */}
                  <div style={{ borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
                      <span>TAXABLE VALUE:</span>
                      <span>+3,52,560.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 900, marginTop: 4, color: "#000" }}>
                      <span>TOTAL INVOICE:</span>
                      <span>44,51,350.00</span>
                    </div>
                  </div>

                  {/* MSME Act Footer Text */}
                  <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "4px", fontSize: "7.5px", lineHeight: 1.3, color: "#334155" }}>
                    <strong>MSMED ACT 2006 (SEC 06-15 NOTICE):</strong> Buyer required to clear payment within 45 days.
                  </div>

                  {/* Verification Section */}
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px", color: "#059669", marginBottom: 6 }}>
                      <span style={{ fontSize: "13px" }}>✓</span>
                      <span>FINTWIN TWIN SYNC: VERIFIED & TReDS ELIGIBLE</span>
                    </div>
                    <div
                      style={{
                        height: "32px",
                        width: "90%",
                        margin: "0 auto",
                        background: "repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 9px)",
                      }}
                    />
                  </div>
                </div>

                {/* Perforated Bottom Edge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "8px",
                    background: "#ffffff",
                    clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
                  }}
                />
              </div>
              </div>
            </div>

            {/* =========================================================================
                RIGHT COLUMN: THE FINTWIN DIGITAL TWIN SOLUTION
                ========================================================================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", paddingLeft: "10px" }}>
              {/* Header with Green Dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="anim-pulse" style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#047857", letterSpacing: "0.8px", textTransform: "uppercase", textShadow: "0 1px 3px rgba(255,255,255,0.9)" }}>
                  THE FINTWIN DIGITAL TWIN SOLUTION
                </span>
              </div>

              {/* Organic Stack of Sticky Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
                
                {/* Row 1 */}
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div className="sticky-note sticky-green tape-corner" style={{ flex: 1.1, transform: "rotate(3deg)" }}>
                    <span style={{ position: "absolute", top: -14, right: -10, fontSize: 24, opacity: 0.9 }}>📈</span>
                    <img src="/story/empowered_owner.jpg" alt="Anand Sharma" style={{ width: "26px", height: "26px", borderRadius: "2px", objectFit: "cover", position: "absolute", bottom: -8, left: 10, border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: "rotate(-5deg)" }} />
                    Seamlessly ingest consented GST e-invoices & bank streams.
                  </div>
                  <div className="sticky-note sticky-yellow tape-top" style={{ flex: 1, transform: "rotate(-2deg)", marginTop: "15px" }}>
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: "20px" }}>😊</span>
                    Finally, a live cash flow digital twin for my business!
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginLeft: "10px" }}>
                  <span style={{ fontSize: 32, fontWeight: "bold", opacity: 0.8, transform: "rotate(15deg)", color: "#10b981" }}>✓</span>
                  <div className="sticky-note sticky-blue tape-top" style={{ flex: 1, transform: "rotate(-1deg)" }}>
                    Forecasts liquidity dips 3 weeks ahead. Life saver.
                  </div>
                  <div className="sticky-note sticky-green tape-corner" style={{ flex: 1.1, transform: "rotate(2deg)" }}>
                    <img src="/story/retail_owner.jpg" alt="Partner" style={{ width: "26px", height: "26px", borderRadius: "2px", objectFit: "cover", position: "absolute", top: -8, right: -5, border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transform: "rotate(4deg)" }} />
                    Runs what-if delay shocks automatically.
                  </div>
                </div>

                {/* Row 3 - Options */}
                <div className="sticky-note sticky-grey tape-top" style={{ transform: "rotate(-1deg)", margin: "5px 20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#111", marginBottom: 8 }}>
                    Transparent Working Capital Options:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                    <div style={{ background: "#ecfdf5", border: "2px dashed #10b981", borderRadius: "4px", padding: "8px 6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#047857" }}>Non-Debt</div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#059669" }}>0% APR</div>
                    </div>
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "4px", padding: "8px 6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#0284c7" }}>TReDS 24H</div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#0284c7" }}>8.1% p.a.</div>
                    </div>
                    <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>Credit Line</div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#475569" }}>11.5% p.a.</div>
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "10px" }}>
                  <div className="sticky-note sticky-green tape-corner" style={{ flex: 1.2, transform: "rotate(1deg)" }}>
                    <span style={{ fontSize: "20px", position: "absolute", right: -10, top: -10 }}>😊</span>
                    Zero Hidden Costs. Clear upfront!
                  </div>
                  <span style={{ color: "#0284c7", fontSize: 28, fontWeight: "bold", marginTop: "10px" }} className="anim-pulse">⚡</span>
                  <div className="sticky-note sticky-yellow tape-top" style={{ flex: 1.5, transform: "rotate(-2deg)" }}>
                    Explainable AI (Transparent Decisions).
                    User Control: Inspect & Override Ledger Data. ✍️
                  </div>
                </div>

                {/* Row 5 */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "5px", paddingRight: "15px" }}>
                  <span style={{ color: "#10b981", fontSize: 32, fontWeight: "bold", background: "#dcfce7", padding: "0 10px", borderRadius: "8px", border: "2px solid #86efac", transform: "rotate(5deg)" }}>✓</span>
                  <div className="sticky-note sticky-green tape-top" style={{ flex: 1, transform: "rotate(-1deg)", padding: "18px 24px", fontSize: "18px" }}>
                    100% GST-2B ITC Reclaimed.
                    Zero Compliance Leakages.
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: LUXURY MSME VENDOR CASE STUDIES (MAGAZINE SPREAD)
          ========================================================================= */}
      <section
        id="vendors"
        style={{
          padding: "100px 24px",
          background: "transparent",
          position: "relative",
          zIndex: 1, // Stay above fixed bg
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--accent-emerald)" }}>
              Real MSME Impact
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.8px", marginTop: 8, color: "var(--text-primary)" }}>
              How Indian Enterprise Leaders Use FinTwin
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "620px", margin: "8px auto 0", lineHeight: 1.6 }}>
              From automotive manufacturing to export textiles, discover how MSME CFOs and founders maintain positive liquidity.
            </p>
          </div>

          {/* Sector Selector Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            {INDIAN_VENDOR_STORIES.map((v, idx) => {
              const isSelected = activeVendorTab === idx;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVendorTab(idx);
                    setIsAutoCycling(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 24px",
                    borderRadius: "9999px",
                    background: isSelected ? "var(--accent-emerald)" : "transparent",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--accent-emerald)" : "rgba(0,0,0,0.08)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 4px 14px rgba(28, 103, 88, 0.3)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontWeight: isSelected ? 700 : 600 }}>{v.tabTitle}</span>
                  <span style={{ opacity: isSelected ? 0.9 : 0.6, fontSize: "12.5px" }}>({v.tabStat})</span>
                </button>
              );
            })}
          </div>

          {/* Luxury Split Master Card */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              background: "#ffffff",
              border: "1px solid rgba(180, 109, 75, 0.2)",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(45, 38, 32, 0.08)",
            }}
          >
            {/* Left Column: Full-Bleed Industrial Photo with Gradient Overlay */}
            <div style={{ position: "relative", minHeight: "420px", background: "#09090b" }}>
              <img
                src={activeVendor.image}
                alt={activeVendor.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.9) 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 28, left: 28, right: 180, color: "#ffffff" }}>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{activeVendor.name}</div>
                <div style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                  {activeVendor.role} • {activeVendor.company}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
                  <MapPin size={13} color="#34d399" />
                  <span>{activeVendor.location}</span>
                </div>
              </div>

              {/* Frosted Glass HUD Widget (Radar) */}
              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  right: 28,
                  width: "145px",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "16px",
                  padding: "16px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  zIndex: 10,
                }}
              >
                {/* Circular Radar */}
                <div style={{ position: "relative", width: "72px", height: "72px", marginBottom: "12px" }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="4" />
                    <circle
                      cx="36"
                      cy="36"
                      r="32"
                      fill="none"
                      stroke="var(--accent-emerald)"
                      strokeWidth="4"
                      strokeDasharray="201"
                      strokeDashoffset={201 - (201 * activeVendor.hudDay) / activeVendor.hudTotalDays}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  {/* Radar Pulse Dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      transform: `rotate(${(activeVendor.hudDay / activeVendor.hudTotalDays) * 360}deg)`,
                      transition: "transform 0.8s ease-out",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "0px",
                        left: "50%",
                        width: "10px",
                        height: "10px",
                        background: "var(--accent-emerald)",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        boxShadow: "0 0 12px var(--accent-emerald)",
                      }}
                    />
                  </div>
                  {/* Inner Text */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>{activeVendor.hudDay}</span>
                    <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", textTransform: "uppercase" }}>days</span>
                  </div>
                </div>
                {/* HUD Text */}
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>
                  {activeVendor.hudText}
                </div>
              </div>
            </div>

            {/* Right Column: Luxury Card Content */}
            <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Header Title & GSTIN Badge */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#2D2620", marginBottom: 12 }}>Data & Proof Engine</h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    <Lock size={12} />
                    <span>GSTIN: {activeVendor.gstin.split(" • ")[0]} • {activeVendor.gstin.split(" • ")[1]}</span>
                  </div>
                </div>

                {/* 3-Stage Progress Stepper */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, position: "relative", padding: "0 10px" }}>
                  <div style={{ position: "absolute", top: 9, left: 30, right: 30, height: 2, background: "linear-gradient(90deg, var(--accent-emerald) 50%, rgba(0,0,0,0.06) 50%)", zIndex: 0 }} />
                  {activeVendor.stepper.map((step, idx) => {
                    const isActive = idx <= 1;
                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1, width: "33%" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: isActive ? "var(--accent-emerald)" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #ffffff", boxShadow: isActive ? (idx === 1 ? "0 0 0 2px var(--accent-emerald), 0 0 12px rgba(28, 103, 88, 0.4)" : "0 0 0 2px var(--accent-emerald)") : "none" }}>
                          {isActive && idx === 0 && <Check size={10} color="#ffffff" strokeWidth={4} />}
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--text-primary)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Highlighted Metric Box */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f8faf6 0%, #f0fdf4 100%)",
                    padding: "24px 28px",
                    borderRadius: "16px",
                    border: "1px solid rgba(5, 150, 105, 0.15)",
                    marginBottom: 24,
                    boxShadow: "0 4px 16px rgba(5, 150, 105, 0.04)",
                  }}
                >
                  <div style={{ fontSize: "38px", fontWeight: 800, color: "var(--accent-emerald)", letterSpacing: "-1px", lineHeight: 1 }}>
                    {activeVendor.metricValue}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{activeVendor.metricLabel}</span>
                    <span style={{ fontSize: "11px", color: "#047857", fontWeight: 700, padding: "4px 10px", background: "rgba(5, 150, 105, 0.1)", borderRadius: "6px" }}>
                      {activeVendor.runwayGain}
                    </span>
                  </div>
                </div>

                {/* Editorial Quote */}
                <blockquote
                  style={{
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                    fontStyle: "italic",
                    fontFamily: "'Georgia', serif",
                    margin: "0 0 auto",
                    position: "relative",
                  }}
                >
                  "{activeVendor.quote}"
                </blockquote>
              </div>

              {/* Bottom Card Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 24,
                  marginTop: 32,
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Sector: {activeVendor.industry} <br/> <span style={{ opacity: 0.7 }}>{activeVendor.location.split(',')[0]}</span>
                </span>
                <Link
                  to="/signup"
                  className="magnetic-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: "#B46D4B", // Bronze button
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ffffff",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    boxShadow: "0 8px 24px rgba(180, 109, 75, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(180, 109, 75, 0.4)";
                    e.currentTarget.querySelector('svg').style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(180, 109, 75, 0.3)";
                    e.currentTarget.querySelector('svg').style.transform = "translateX(0)";
                  }}
                >
                  <span>Build your twin</span>
                  <ArrowRight size={14} style={{ transition: "transform 0.2s ease" }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INTERACTIVE LIVE SANDBOX (NEW DYNAMIC COMPONENT)
          ========================================================================= */}
      <InteractiveSandbox />

      {/* =========================================================================
          SECTION 6: BENTO GRID ARCHITECTURE (AROUNDA / OUTROWD STYLE)
          ========================================================================= */}
      <section
        id="features"
        style={{
          padding: "100px 24px",
          background: "transparent",
          position: "relative",
          zIndex: 1, // Stay above fixed bg
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--accent-emerald)" }}>
              Core Digital Twin Architecture
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.8px", marginTop: 8, color: "#2D2620" }}>
              Engineered Specifically for the Indian MSME Ecosystem
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "620px", margin: "8px auto 0" }}>
              Direct integrations with Account Aggregators, GSTN e-Invoice portals, and RBI-regulated TReDS auction exchanges.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* Bento Card 1 */}
            <div
              className="glass-card interactive"
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "22px",
                padding: "32px 28px",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 16px 40px rgba(45, 38, 32, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 24px 48px rgba(45, 38, 32, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(45, 38, 32, 0.05)";
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(28, 103, 88, 0.12)",
                    border: "1px solid rgba(28, 103, 88, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-emerald)",
                    marginBottom: 20,
                  }}
                >
                  <Activity size={22} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#2D2620", margin: "0 0 8px" }}>
                  90-Day Cash Flow Bridge
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
                  Reconcile opening cash, expected receivables velocity, and committed burn into an automated daily liquidity bridge.
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(180, 109, 75, 0.15)", fontSize: "12px", fontWeight: 700, color: "var(--accent-emerald)" }}>
                Active Machine Learning Model →
              </div>
            </div>

            {/* Bento Card 2 */}
            <div
              className="glass-card interactive"
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "22px",
                padding: "32px 28px",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 16px 40px rgba(45, 38, 32, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 24px 48px rgba(45, 38, 32, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(45, 38, 32, 0.05)";
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(122, 156, 174, 0.15)",
                    border: "1px solid rgba(122, 156, 174, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-dusty-blue)",
                    marginBottom: 20,
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#2D2620", margin: "0 0 8px" }}>
                  Section 15 MSMED Sentinel
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
                  Automatically calculate 45-day statutory compound interest and dispatch pre-deadline notices to corporate buyers.
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(180, 109, 75, 0.15)", fontSize: "12px", fontWeight: 700, color: "var(--accent-dusty-blue)" }}>
                Govt. MSME Act 2006 Rule →
              </div>
            </div>

            {/* Bento Card 3 */}
            <div
              className="glass-card interactive"
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "22px",
                padding: "32px 28px",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 16px 40px rgba(45, 38, 32, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 24px 48px rgba(45, 38, 32, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(45, 38, 32, 0.05)";
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(199, 129, 80, 0.15)",
                    border: "1px solid rgba(199, 129, 80, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-burnt-ochre)",
                    marginBottom: 20,
                  }}
                >
                  <Zap size={22} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#2D2620", margin: "0 0 8px" }}>
                  1-Click TReDS Auctioning
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
                  Route verified GST e-Invoices into RXIL, M1xchange & Invoicemart for competitive 24-hour institutional discounting.
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(180, 109, 75, 0.15)", fontSize: "12px", fontWeight: 700, color: "var(--accent-burnt-ochre)" }}>
                RBI-Regulated Exchanges →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: DEEP WALNUT CONVERSION FOOTER
          ========================================================================= */}
      <footer
        style={{
          background: "#2D2620", // Warm Espresso
          color: "#ffffff",
          padding: "80px 24px 40px",
        }}
      >
        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
              paddingBottom: "48px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>Ready to deploy your Financial Twin?</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                Join over 240+ verified Indian manufacturing, export, and healthcare enterprises.
              </div>
            </div>

            <Link
              to="/signup"
              className="magnetic-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 36px",
                borderRadius: "9999px",
                background: "#B46D4B", // Bronze Button
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(180, 109, 75, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(180, 109, 75, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(180, 109, 75, 0.3)";
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "32px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>© 2026 FinTwin Technologies India Pvt Ltd. All rights reserved.</div>
            <div style={{ display: "flex", gap: 18 }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>MSMED Section 15 Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
