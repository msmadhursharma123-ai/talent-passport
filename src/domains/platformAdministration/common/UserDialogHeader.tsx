import React from "react";

interface UserDialogHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export default function UserDialogHeader({
  title,
  subtitle,
  onClose,
}: UserDialogHeaderProps) {
  return (
    <div style={headerStyle}>
      <div>
        <h2 style={titleStyle}>{title}</h2>

        {subtitle && (
          <p style={subtitleStyle}>
            {subtitle}
          </p>
        )}
      </div>

      <button
        style={closeButtonStyle}
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 30px",
  borderBottom: "1px solid #E2E8F0",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  color: "#143B73",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#64748B",
  fontSize: 14,
};

const closeButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  cursor: "pointer",
  fontSize: 18,
};