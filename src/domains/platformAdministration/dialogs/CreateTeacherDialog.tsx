import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateTeacherDialog({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>

        <h2 style={titleStyle}>
          Create Teacher
        </h2>

        <p style={subtitleStyle}>
          Create a teacher account and assign
          the organization and academic structure.
        </p>

        <div style={gridStyle}>

          <input
            placeholder="Full Name"
            style={inputStyle}
          />

          <input
            placeholder="Email Address"
            style={inputStyle}
          />

          <input
            placeholder="Phone Number"
            style={inputStyle}
          />

          <select style={inputStyle}>
            <option>Select Organization</option>
          </select>

          <select style={inputStyle}>
            <option>Select Subject</option>
          </select>

          <select style={inputStyle}>
            <option>Select Class</option>
          </select>

          <select style={inputStyle}>
            <option>Select Section</option>
          </select>

        </div>

        <div style={footerStyle}>

          <button
            style={secondaryButton}
            onClick={onClose}
          >
            Cancel
          </button>

          <button style={primaryButton}>
            Create Teacher
          </button>

        </div>

      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  width: "760px",
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "32px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
};

const subtitleStyle: React.CSSProperties = {
  color: "#64748B",
  marginBottom: "24px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "28px",
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  cursor: "pointer",
};