import React from "react";

export default function UserRegistryEmptyState() {
  return (
    <div style={containerStyle}>
      <div style={iconStyle}>👥</div>

      <h2 style={titleStyle}>
        No Users Found
      </h2>

      <p style={descriptionStyle}>
        No users match the selected filters.
        <br />
        Try changing the filters or create your first user.
      </p>

      <button style={buttonStyle}>
        Create User
      </button>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px dashed #CBD5E1",
  borderRadius: "20px",
  padding: "80px 40px",
  textAlign: "center",
};

const iconStyle: React.CSSProperties = {
  fontSize: "56px",
  marginBottom: "18px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 700,
  color: "#143B73",
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "16px",
  color: "#64748B",
  lineHeight: 1.7,
  fontSize: "15px",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "28px",
  background: "#143B73",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};