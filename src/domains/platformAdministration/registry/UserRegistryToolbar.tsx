import React from "react";

export interface UserRegistryToolbarProps {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  onCreateUser: () => void;

  onRefresh?: () => void;

  onExport?: () => void;
}

export default function UserRegistryToolbar({
  search,
  onSearchChange,
  onCreateUser,
  onRefresh,
  onExport,
}: UserRegistryToolbarProps) {
  return (
    <section style={containerStyle}>
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <input
        placeholder="Search by name, email, phone or ID..."
        value={search}
        style={searchStyle}
        onChange={(e) =>
          onSearchChange(
            e.target.value,
          )
        }
      />

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div style={actionsStyle}>
        <button
          style={secondaryButtonStyle}
          onClick={() =>
            onRefresh?.()
          }
        >
          Refresh
        </button>

        <button
          style={secondaryButtonStyle}
          onClick={() =>
            onExport?.()
          }
        >
          Export
        </button>

        <button
          style={primaryButtonStyle}
          onClick={onCreateUser}
        >
          + Create User
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
  gap: "20px",
  flexWrap: "wrap",
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "18px",
};

const searchStyle: React.CSSProperties = {
  flex: 1,
  minWidth: "320px",
  maxWidth: "520px",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 700,
};