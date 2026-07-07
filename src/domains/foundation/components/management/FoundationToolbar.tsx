import React from "react";

export interface FoundationFilter {
  label: string;
  options: string[];
}

interface FoundationToolbarProps {
  searchPlaceholder: string;

  searchValue?: string;

  onSearchChange?: (
    value: string
  ) => void;

  filters?: FoundationFilter[];

  filterValues?: string[];

  onFilterChange?: (
    index: number,
    value: string
  ) => void;

  primaryActionLabel: string;

  onPrimaryAction?: () => void;
}

export default function FoundationToolbar({
  searchPlaceholder,

  searchValue = "",

  onSearchChange,

  filters = [],

  filterValues = [],

  onFilterChange,

  primaryActionLabel,

  onPrimaryAction,
}: FoundationToolbarProps) {
  return (
    <section style={containerStyle}>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) =>
          onSearchChange?.(
            event.target.value
          )
        }
        style={searchStyle}
      />

      {filters.map(
        (filter, index) => (
          <select
            key={filter.label}
            value={
              filterValues[index] ??
              ""
            }
            onChange={(event) =>
              onFilterChange?.(
                index,
                event.target.value
              )
            }
            style={selectStyle}
          >
            <option value="">
              {filter.label}
            </option>

            {filter.options.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        )
      )}

      <button
        style={buttonStyle}
        onClick={onPrimaryAction}
      >
        {primaryActionLabel}
      </button>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "2fr repeat(auto-fit,minmax(180px,1fr)) auto",
  gap: "16px",
  alignItems: "center",
};

const searchStyle: React.CSSProperties = {
  padding: "14px 16px",
  border: "1px solid #CBD5E1",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  background: "#FFFFFF",
};

const selectStyle: React.CSSProperties = {
  padding: "14px 16px",
  border: "1px solid #CBD5E1",
  borderRadius: "12px",
  fontSize: "14px",
  background: "#FFFFFF",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  background: "#143B73",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  padding: "14px 22px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};