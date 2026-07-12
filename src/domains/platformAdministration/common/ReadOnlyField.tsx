import React from "react";

interface ReadOnlyFieldProps {

  label: string;

  value: React.ReactNode;

}

export default function ReadOnlyField({

  label,

  value,

}: ReadOnlyFieldProps) {

  return (

    <div style={containerStyle}>

      <label style={labelStyle}>
        {label}
      </label>

      <div style={valueStyle}>
        {value}
      </div>

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 8,

};

const labelStyle: React.CSSProperties = {

  color: "#64748B",

  fontSize: 13,

};

const valueStyle: React.CSSProperties = {

  padding: "10px 14px",

  border: "1px solid #E2E8F0",

  borderRadius: 10,

  background: "#F8FAFC",

};