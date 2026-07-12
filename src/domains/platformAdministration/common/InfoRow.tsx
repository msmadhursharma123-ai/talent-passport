import React from "react";

interface InfoRowProps {

  label: string;

  value: React.ReactNode;

}

export default function InfoRow({

  label,

  value,

}: InfoRowProps) {

  return (

    <div style={rowStyle}>

      <span style={labelStyle}>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}

const rowStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  padding: "10px 0",

};

const labelStyle: React.CSSProperties = {

  color: "#64748B",

};