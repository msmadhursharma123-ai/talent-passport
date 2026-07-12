import React from "react";

export interface UserRegistryFiltersProps {
  /* Current Values */

  role: string;
  status: string;
  organization: string;

  /* Available Options */

  roles: string[];
  organizations: string[];

  /* Events */

  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;

  onClear: () => void;
}

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Archived", value: "archived" },
];

export default function UserRegistryFilters({
  role,
  status,
  organization,
  roles,
  organizations,
  onRoleChange,
  onStatusChange,
  onOrganizationChange,
  onClear,
}: UserRegistryFiltersProps) {
  return (
    <section style={containerStyle}>
      {/* ======================================================
          ROLE
      ====================================================== */}

      <select
        style={selectStyle}
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option value="">All Roles</option>

        {roles.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <select
        style={selectStyle}
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
      >
        {STATUS_OPTIONS.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>

      {/* ======================================================
          ORGANIZATION
      ====================================================== */}

      <select
        style={selectStyle}
        value={organization}
        onChange={(e) =>
          onOrganizationChange(
            e.target.value,
          )
        }
      >
        <option value="">
          All Organizations
        </option>

        {organizations.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      {/* ======================================================
          RESET
      ====================================================== */}

      <button
        style={buttonStyle}
        onClick={onClear}
      >
        Reset Filters
      </button>
    </section>
  );
}

/* ======================================================
   STYLES
====================================================== */

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "16px",
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "18px",
  marginBottom: "24px",
};

const selectStyle: React.CSSProperties = {
  minWidth: "190px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  fontSize: "14px",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  marginLeft: "auto",
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 600,
};