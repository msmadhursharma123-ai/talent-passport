import React from "react";

interface UserSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {

  label: string;

  required?: boolean;

}

export default function UserSelect({
  label,
  required,
  children,
  ...props
}: UserSelectProps) {

  return (

    <div style={containerStyle}>

      <label style={labelStyle}>

        {label}

        {required && (
          <span style={requiredStyle}>
            *
          </span>
        )}

      </label>

      <select
        {...props}
        style={selectStyle}
      >
        {children}
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
  fontWeight: 600,
  color: "#334155",
};

const requiredStyle: React.CSSProperties = {
  color: "#DC2626",
  marginLeft: 4,
};

const selectStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  fontSize: 14,
  background: "#FFFFFF",
};