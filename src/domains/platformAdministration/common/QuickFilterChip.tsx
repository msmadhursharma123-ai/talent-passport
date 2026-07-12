import React from "react";

interface QuickFilterChipProps {

  label: string;

  selected?: boolean;

  onClick?: () => void;

}

export default function QuickFilterChip({

  label,

  selected = false,

  onClick,

}: QuickFilterChipProps) {

  return (

    <button

      onClick={onClick}

      style={{

        ...chipStyle,

        background: selected
          ? "#143B73"
          : "#FFFFFF",

        color: selected
          ? "#FFFFFF"
          : "#334155",

      }}

    >

      {label}

    </button>

  );

}

const chipStyle: React.CSSProperties = {

  padding: "8px 16px",

  borderRadius: 999,

  border: "1px solid #CBD5E1",

  cursor: "pointer",

  fontWeight: 600,

  fontSize: 13,

};