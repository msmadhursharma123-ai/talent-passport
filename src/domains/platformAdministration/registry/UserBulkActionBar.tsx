import React from "react";

export interface UserBulkActionBarProps {
  selectedCount: number;

  onActivate: () => void;
  onSuspend: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;

  loading?: boolean;
}

interface BulkAction {
  label: string;
  onClick: () => void;
  style: React.CSSProperties;
}

export default function UserBulkActionBar({
  selectedCount,
  onActivate,
  onSuspend,
  onArchive,
  onDelete,
  onClearSelection,
  loading = false,
}: UserBulkActionBarProps) {

  if (selectedCount === 0) {
    return null;
  }

  const actions: BulkAction[] = [
    {
      label: "Activate",
      onClick: onActivate,
      style: successButton,
    },
    {
      label: "Suspend",
      onClick: onSuspend,
      style: primaryButton,
    },
    {
      label: "Archive",
      onClick: onArchive,
      style: primaryButton,
    },
    {
      label: "Delete",
      onClick: onDelete,
      style: dangerButton,
    },
  ];

  return (
    <section style={containerStyle}>
      <div style={summaryStyle}>
        <strong>{selectedCount}</strong>

        <span>
          user{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div style={actionsStyle}>
        {actions.map((action) => (
          <button
            key={action.label}
            style={action.style}
            disabled={loading}
            onClick={action.onClick}
          >
            {loading
              ? "Processing..."
              : action.label}
          </button>
        ))}

        <button
          style={secondaryButton}
          disabled={loading}
          onClick={onClearSelection}
        >
          Clear Selection
        </button>
      </div>
    </section>
  );
}

/* ======================================================
   STYLES
====================================================== */

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
  padding: "18px 22px",
  marginBottom: "20px",
  borderRadius: "16px",
  background: "#EFF6FF",
  border: "1px solid #BFDBFE",
};

const summaryStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  color: "#1E3A8A",
  fontWeight: 600,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const buttonBase: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const successButton: React.CSSProperties = {
  ...buttonBase,
  background: "#16A34A",
  color: "#FFFFFF",
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#143B73",
  color: "#FFFFFF",
};

const dangerButton: React.CSSProperties = {
  ...buttonBase,
  background: "#DC2626",
  color: "#FFFFFF",
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#FFFFFF",
  color: "#143B73",
  border: "1px solid #CBD5E1",
};