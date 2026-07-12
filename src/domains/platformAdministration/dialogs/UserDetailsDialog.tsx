import React from "react";

import { PlatformUser } from "../types/platformUser";

interface UserDetailsDialogProps {
  open: boolean;
  user: PlatformUser | null;
  onClose: () => void;
}

export default function UserDetailsDialog({
  open,
  user,
  onClose,
}: UserDetailsDialogProps) {

  if (!open || !user) {
    return null;
  }

  return (
    <div style={backdropStyle}>

      <div style={dialogStyle}>

        <div style={headerStyle}>

          <div>

            <h2 style={titleStyle}>
              User Details
            </h2>

            <p style={subtitleStyle}>
              Platform User Information
            </p>

          </div>

          <button
            onClick={onClose}
            style={closeButtonStyle}
          >
            ✕
          </button>

        </div>

        <div style={bodyStyle}>

          <InfoRow
            label="Full Name"
            value={user.name}
          />

          <InfoRow
            label="Email"
            value={user.email}
          />

          <InfoRow
            label="Role"
            value={user.role}
          />

          <InfoRow
            label="Organization"
            value={user.organization}
          />

          <InfoRow
            label="Status"
            value={user.status}
          />

          <InfoRow
            label="Last Login"
            value={user.lastLogin}
          />

        </div>

        <div style={footerStyle}>

          <button
            style={primaryButtonStyle}
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {

  return (
    <div style={rowStyle}>

      <div style={labelStyle}>
        {label}
      </div>

      <div style={valueStyle}>
        {value}
      </div>

    </div>
  );

}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const dialogStyle: React.CSSProperties = {
  width: 640,
  background: "#fff",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,.18)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "22px 28px",
  borderBottom: "1px solid #ececec",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143D79",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#64748B",
  fontSize: 14,
};

const closeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 22,
};

const bodyStyle: React.CSSProperties = {
  padding: 28,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 0",
  borderBottom: "1px solid #F1F5F9",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "#64748B",
};

const valueStyle: React.CSSProperties = {
  color: "#0F172A",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  padding: 24,
  borderTop: "1px solid #ececec",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#143D79",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};