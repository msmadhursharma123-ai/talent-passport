import React from "react";

interface UserFormTitleProps {

  children: React.ReactNode;

}

export default function UserFormTitle({
  children,
}: UserFormTitleProps) {

  return (

    <h3 style={titleStyle}>

      {children}

    </h3>

  );

}

const titleStyle: React.CSSProperties = {

  margin: 0,

  color: "#143B73",

  fontSize: 20,

  fontWeight: 700,

};