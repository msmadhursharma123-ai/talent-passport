import React from "react";

interface UserDialogBodyProps {

  children: React.ReactNode;

}

export default function UserDialogBody({
  children,
}: UserDialogBodyProps) {

  return (

    <div style={bodyStyle}>

      {children}

    </div>

  );

}

const bodyStyle: React.CSSProperties = {

  padding: 32,

  display: "flex",

  flexDirection: "column",

  gap: 28,

};