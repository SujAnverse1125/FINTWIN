import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AiCopilotModal from "./AiCopilotModal";
import QuickActionModal from "./QuickActionModal";
import CommandSearchModal from "./CommandSearchModal";
import UniversalUploadModal from "./UniversalUploadModal";
import {
  LayoutDashboard,
  Wallet,
  Plus,
  Percent,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AppLayout({ children }) {
  const location = useLocation();
  const { t } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`main-content-wrapper ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Topbar
          onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="page-container">{children}</main>
      </div>

      {/* Floating AI Copilot Trigger (Desktop only - mobile uses bottom nav) */}
      {!isAiCopilotOpen && (
        <button
          className="floating-copilot-btn desktop-only"
          onClick={() => setIsAiCopilotOpen(true)}
          title={t("askAi", "Ask FinTwin AI")}
        >
          <Sparkles size={17} />
          <span className="copilot-btn-text">{t("askAi", "Ask FinTwin AI")}</span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <Link
          to="/dashboard"
          className={`mobile-nav-item ${isActive("/dashboard") ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          <span>{t("dashboard", "Dashboard")}</span>
        </Link>

        <Link
          to="/cash-flow"
          className={`mobile-nav-item ${isActive("/cash-flow") ? "active" : ""}`}
        >
          <Wallet size={20} />
          <span>{t("cashFlow", "Cash Flow")}</span>
        </Link>

        {/* Center Quick Add Action */}
        <button
          className="mobile-nav-item mobile-nav-fab"
          onClick={() => setIsQuickActionOpen(true)}
          title={t("quickAdd", "Quick Add")}
        >
          <div className="mobile-fab-circle">
            <Plus size={22} />
          </div>
          <span>{t("Add", "Add")}</span>
        </button>

        <Link
          to="/gst"
          className={`mobile-nav-item ${isActive("/gst") ? "active" : ""}`}
        >
          <Percent size={20} />
          <span>{t("gst", "GST Tax")}</span>
        </Link>

        <Link
          to="/payroll"
          className={`mobile-nav-item ${isActive("/payroll") ? "active" : ""}`}
        >
          <UserCheck size={20} />
          <span>{t("payroll", "Payroll")}</span>
        </Link>

        <button
          className={`mobile-nav-item ${isAiCopilotOpen ? "active" : ""}`}
          onClick={() => setIsAiCopilotOpen(true)}
          title="AI Copilot"
        >
          <Sparkles size={20} style={{ color: "#c4b5fd" }} />
          <span>{t("AI Twin", "AI Twin")}</span>
        </button>
      </nav>

      {/* Floating AI Copilot Drawer */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />

      {/* Command Search Modal */}
      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Universal Financial Upload Ingestion Modal */}
      <UniversalUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
