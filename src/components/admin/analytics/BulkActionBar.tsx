import React from "react";

interface BulkActionBarProps {
  selectedCount: number;
  onAllocate: () => void;
  onClear: () => void;
  onExport?: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onAllocate,
  onClear,
  onExport,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 24,
        padding: "18px 22px",
        borderRadius: 18,
        background:
          "linear-gradient(135deg,#143B73 0%, #1E4F94 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        boxShadow: "0 10px 25px rgba(20,59,115,.18)",
      }}
    >
      <div>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          ✓ {selectedCount} Student{selectedCount > 1 ? "s" : ""} Selected
        </div>

        <div
          style={{
            color: "rgba(255,255,255,.75)",
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Perform bulk actions for the selected students.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onAllocate}
          style={primaryButton}
        >
          🎯 Allocate Leads
        </button>

        {onExport && (
          <button
            onClick={onExport}
            style={secondaryButton}
          >
            📄 Export CSV
          </button>
        )}

        <button
          onClick={onClear}
          style={dangerButton}
        >
          ✕ Clear Selection
        </button>
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  background: "#FFFFFF",
  color: "#143B73",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const secondaryButton: React.CSSProperties = {
  background: "rgba(255,255,255,.15)",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,.25)",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};

const dangerButton: React.CSSProperties = {
  background: "#EF4444",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};