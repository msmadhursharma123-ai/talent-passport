import React from "react";

interface UserFormColumnProps {

  children: React.ReactNode;

}

export default function UserFormColumn({
  children,
}: UserFormColumnProps) {

  return (

    <div style={columnStyle}>

      {children}

    </div>

  );

}

const columnStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 18,

  width: "100%",

};