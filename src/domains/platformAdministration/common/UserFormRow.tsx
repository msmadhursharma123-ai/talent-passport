import React from "react";

interface UserFormRowProps {

  children: React.ReactNode;

}

export default function UserFormRow({
  children,
}: UserFormRowProps) {

  return (

    <div style={rowStyle}>

      {children}

    </div>

  );

}

const rowStyle: React.CSSProperties = {

  display: "grid",

  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",

  gap: 20,

  alignItems: "start",

};