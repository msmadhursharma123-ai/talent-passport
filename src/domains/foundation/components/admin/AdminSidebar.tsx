import React from "react";
import {
  ADMIN_MODULES,
  type AdminModule,
} from "./adminModules";

interface AdminSidebarProps {
  activeModule: AdminModule;
  onModuleChange: (module: AdminModule) => void;
}

export default function AdminSidebar({
  activeModule,
  onModuleChange,
}: AdminSidebarProps) {
  return (
    <div style={containerStyle}>
      {/* Logo */}
      <div style={logoSection}>
        <h2 style={logoTitle}>Talent Passport</h2>
        <p style={logoSubtitle}>Platform OS</p>
      </div>

      {/* Navigation */}
      <div style={navigationStyle}>
        {ADMIN_MODULES.map((item) => {
          const isActive = activeModule === item.key;

          return (
            <button
              key={item.key}
              disabled={!item.enabled}
              onClick={() => item.enabled && onModuleChange(item.key)}
              style={{
                ...menuButton,
                ...(isActive ? activeButton : {}),
                ...(item.enabled ? {} : disabledButton),
              }}
            >
              {item.label}

              {!item.enabled && (
                <span style={comingSoonBadge}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        Talent Passport OS
        <br />
        Version 1.0
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const logoSection: React.CSSProperties = {
  padding: "28px 22px",
  borderBottom: "1px solid #E5E7EB",
};

const logoTitle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "22px",
  fontWeight: 700,
};

const logoSubtitle: React.CSSProperties = {
  marginTop: "6px",
  marginBottom: 0,
  color: "#64748B",
  fontSize: "13px",
};

const navigationStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "18px",
  flex: 1,
};

const menuButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 600,
  color: "#334155",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "all 0.2s ease",
};

const activeButton: React.CSSProperties = {
  background: "#143B73",
  color: "#FFFFFF",
};

const disabledButton: React.CSSProperties = {
  opacity: 0.65,
  cursor: "not-allowed",
};

const comingSoonBadge: React.CSSProperties = {
  background: "#E2E8F0",
  color: "#475569",
  fontSize: "11px",
  fontWeight: 700,
  padding: "3px 8px",
  borderRadius: "999px",
};

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid #E5E7EB",
  padding: "20px",
  textAlign: "center",
  color: "#94A3B8",
  fontSize: "12px",
};