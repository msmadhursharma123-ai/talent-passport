import React from "react";

interface FoundationDialogProps {
  open: boolean;

  title: string;

  subtitle?: string;

  children: React.ReactNode;

  saveLabel?: string;

  cancelLabel?: string;

  saving?: boolean;

  onSave?: () => void;

  onClose: () => void;
}

export default function FoundationDialog({
  open,
  title,
  subtitle,
  children,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saving = false,
  onSave,
  onClose,
}: FoundationDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>
              {title}
            </h2>

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

        {/* ============================================================
            CONTENT
        ============================================================ */}

        <div style={contentStyle}>
          {children}
        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div style={footerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onClose}
            disabled={saving}
          >
            {cancelLabel}
          </button>

          <button
            style={saveButtonStyle}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "24px",
};

const dialogStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "760px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: "18px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 20px 40px rgba(15,23,42,0.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "28px 32px",
  borderBottom: "1px solid #E2E8F0",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "26px",
  color: "#143B73",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#64748B",
  lineHeight: 1.6,
};

const closeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "22px",
  color: "#64748B",
};

const contentStyle: React.CSSProperties = {
  padding: "32px",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "14px",
  padding: "24px 32px",
  borderTop: "1px solid #E2E8F0",
};

const cancelButtonStyle: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  color: "#334155",
  borderRadius: "12px",
  padding: "12px 20px",
  cursor: "pointer",
  fontWeight: 600,
};

const saveButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  borderRadius: "12px",
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: 600,
};