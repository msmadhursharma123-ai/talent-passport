import React from "react";

interface FoundationEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function FoundationEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: FoundationEmptyStateProps) {
  return (
    <section style={containerStyle}>
      <div style={iconContainerStyle}>
        🏛
      </div>

      <h2 style={titleStyle}>
        {title}
      </h2>

      <p style={descriptionStyle}>
        {description}
      </p>

      {actionLabel && (
        <button
          style={buttonStyle}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
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
  padding: "64px 32px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  minHeight: "320px",
};

const iconContainerStyle: React.CSSProperties = {
  width: "84px",
  height: "84px",
  borderRadius: "50%",
  background: "#EEF4FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "40px",
  marginBottom: "24px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "26px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: "32px",
  maxWidth: "560px",
  color: "#64748B",
  lineHeight: 1.7,
  fontSize: "15px",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  padding: "14px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};