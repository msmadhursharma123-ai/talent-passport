import React from "react";

export default function UserRegistryActions() {
  return (
    <section style={containerStyle}>
      <div style={leftStyle}>
        <select style={selectStyle}>
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Name A–Z</option>
          <option>Name Z–A</option>
          <option>Recently Active</option>
        </select>

        <button style={secondaryButton}>
          Export CSV
        </button>

        <button style={secondaryButton}>
          Export Excel
        </button>
      </div>

      <div style={rightStyle}>
        <button style={secondaryButton}>
          Bulk Actions
        </button>

        <button style={primaryButton}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const leftStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const rightStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginLeft: "auto",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  minWidth: "180px",
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButton: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 600,
};