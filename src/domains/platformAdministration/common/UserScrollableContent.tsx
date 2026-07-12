import React from "react";

interface UserScrollableContentProps {

  children: React.ReactNode;

}

export default function UserScrollableContent({
  children,
}: UserScrollableContentProps) {

  return (

    <div style={scrollStyle}>

      {children}

    </div>

  );

}

const scrollStyle: React.CSSProperties = {

  overflowY: "auto",

  maxHeight: "70vh",

  paddingRight: 8,

};