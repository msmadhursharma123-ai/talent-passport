import React from "react";

interface UserFormCardProps {

  children: React.ReactNode;

}

export default function UserFormCard({
  children,
}: UserFormCardProps) {

  return (

    <div style={cardStyle}>

      {children}

    </div>

  );

}

const cardStyle: React.CSSProperties = {

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: 16,

  padding: 24,

  display: "flex",

  flexDirection: "column",

  gap: 22,

  boxShadow: "0 4px 12px rgba(15,23,42,.05)",

};