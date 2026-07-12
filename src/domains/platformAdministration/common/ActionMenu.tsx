import React from "react";

interface Action {

  label: string;

  onClick: () => void;

  danger?: boolean;

}

interface ActionMenuProps {

  actions: Action[];

}

export default function ActionMenu({

  actions,

}: ActionMenuProps) {

  return (

    <div style={containerStyle}>

      {actions.map((action) => (

        <button

          key={action.label}

          onClick={action.onClick}

          style={{

            ...buttonStyle,

            color: action.danger
              ? "#DC2626"
              : "#334155",

          }}

        >

          {action.label}

        </button>

      ))}

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  display: "flex",

  gap: 8,

  alignItems: "center",

};

const buttonStyle: React.CSSProperties = {

  background: "#FFFFFF",

  border: "1px solid #CBD5E1",

  borderRadius: 8,

  padding: "6px 12px",

  cursor: "pointer",

  fontSize: 13,

  fontWeight: 600,

};