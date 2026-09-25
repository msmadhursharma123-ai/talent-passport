import React from "react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onLogout: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header style={headerStyle}>
      <div style={titleSectionStyle}>
        <h1 style={titleStyle}>{title}</h1>

        {subtitle && (
          <p style={subtitleStyle}>{subtitle}</p>
        )}
      </div>

      <div style={rightSectionStyle}>
        <button
          type="button"
          style={notificationButtonStyle}
          title="Notifications"
          aria-label="Notifications"
        >
          🔔
        </button>

        <button
          type="button"
          style={logoutButtonStyle}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "20px 32px",
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
};

const titleSectionStyle: React.CSSProperties = {
  minWidth: 0,
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "28px",
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "6px",
  marginBottom: 0,
  color: "#64748B",
  fontSize: "14px",
  overflowWrap: "anywhere",
};

const rightSectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexShrink: 0,
};

const notificationButtonStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  minWidth: "42px",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  cursor: "pointer",
  fontSize: "18px",
};

const logoutButtonStyle: React.CSSProperties = {
  background: "#DC2626",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 18px",
  minHeight: "42px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};
