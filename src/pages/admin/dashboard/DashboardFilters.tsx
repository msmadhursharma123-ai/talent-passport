import React from "react";

interface DashboardFiltersProps {
  schools: string[];
  classes: string[];

  selectedSchool: string;
  selectedClass: string;

  showIncomplete: boolean;

  onSchoolChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onToggleIncomplete: () => void;
}

export default function DashboardFilters({
  schools,
  classes,
  selectedSchool,
  selectedClass,
  showIncomplete,
  onSchoolChange,
  onClassChange,
  onToggleIncomplete,
}: DashboardFiltersProps) {
  return (
    <div style={containerStyle}>
      <select
        value={selectedSchool}
        onChange={(e) => onSchoolChange(e.target.value)}
        style={selectStyle}
      >
        {schools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>

      <select
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
        style={selectStyle}
      >
        {classes.map((cls) => (
          <option key={cls} value={cls}>
            {cls}
          </option>
        ))}
      </select>

      <button
        onClick={onToggleIncomplete}
        style={
          showIncomplete
            ? activeButton
            : inactiveButton
        }
      >
        {showIncomplete
          ? "Showing Incomplete"
          : "All Registrations"}
      </button>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  padding: "16px 18px",
  background: "linear-gradient(135deg,#FFFFFF,#FBFCFF)",
  border: "1px solid #DCE5F0",
  boxShadow: "0 8px 24px rgba(15,39,71,0.05)",
  borderRadius: "18px",
  alignItems: "center",
  flexWrap: "wrap",
};

const selectStyle: React.CSSProperties = {
  minWidth: "220px",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  fontSize: "15px",
  outline: "none",
};

const activeButton: React.CSSProperties = {
  border: "none",
  background: "#FF6B0B",
  color: "#FFFFFF",
  padding: "14px 22px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 700,
};

const inactiveButton: React.CSSProperties = {
  border: "none",
  background: "#DFE7F1",
  color: "#40516B",
  padding: "14px 22px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 700,
};