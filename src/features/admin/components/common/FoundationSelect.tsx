import React from "react";

export interface FoundationSelectOption {
  value: string;
  label: string;
}

interface FoundationSelectProps {
  label: string;

  value: string;

  options: FoundationSelectOption[];

  placeholder?: string;

  onChange: (
    value: string
  ) => void;

  required?: boolean;

  disabled?: boolean;
}

export default function FoundationSelect({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
  required = false,
  disabled = false,
}: FoundationSelectProps) {
  return (
    <label style={labelStyle}>
      {label}
      {required ? " *" : ""}

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={selectStyle}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </label>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  outline: "none",
  background: "#FFFFFF",
};