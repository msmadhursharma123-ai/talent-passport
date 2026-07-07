import React from "react";

interface FoundationManagementHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;

  showBackButton?: boolean;

  onBack?: () => void;
}

export default function FoundationManagementHeader({
  title,
  subtitle,
  badge,
  showBackButton = false,
  onBack,
}: FoundationManagementHeaderProps) {
  return (
    <section style={containerStyle}>
    <>
  {showBackButton && (
    <button
      style={backButtonStyle}
      onClick={onBack}
    >
      ← Back to Foundation Hub
    </button>
  )}

  <div>
    <div style={titleRowStyle}>
      <h1 style={titleStyle}>
        {title}
      </h1>

      {badge && (
        <span style={badgeStyle}>
          {badge}
        </span>
      )}
    </div>

    <p style={subtitleStyle}>
      {subtitle}
    </p>
  </div>
</>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "32px",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "34px",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "14px",
  marginBottom: 0,
  color: "#64748B",
  lineHeight: 1.7,
  maxWidth: "760px",
  fontSize: "15px",
};

const badgeStyle: React.CSSProperties = {
  background: "#DBEAFE",
  color: "#1D4ED8",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const backButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#143B73",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  marginBottom: "18px",
  padding: 0,
};