import React from "react";

interface UserFormProps {

  children: React.ReactNode;

}

export default function UserForm({
  children,
}: UserFormProps) {

  return (

    <form style={formStyle}>

      {children}

    </form>

  );

}

const formStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 28,

  width: "100%",

};