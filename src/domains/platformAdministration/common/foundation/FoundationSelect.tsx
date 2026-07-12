import React from "react";

interface Option {
  label: string;
  value: string;
}

interface FoundationSelectProps {

  label?: string;

  value: string;

  options: Option[];

  placeholder?: string;

  required?: boolean;

  disabled?: boolean;

  onChange: (value: string) => void;

}

export default function FoundationSelect({

  label,

  value,

  options,

  placeholder = "Select",

  required = false,

  disabled = false,

  onChange,

}: FoundationSelectProps) {

  return (

    <div style={containerStyle}>

      {label && (

        <label style={labelStyle}>

          {label}

          {required && (
            <span style={requiredStyle}>
              *
            </span>
          )}

        </label>

      )}

      <select

        value={value}

        disabled={disabled}

        style={selectStyle}

        onChange={(e) =>
          onChange(e.target.value)
        }

      >

        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>

        ))}

      </select>

    </div>

  );

}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#1E3A5F",
};

const requiredStyle: React.CSSProperties = {
  color: "#DC2626",
  marginLeft: 4,
};

const selectStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  padding: "0 14px",
  fontSize: 14,
  background: "#FFFFFF",
};