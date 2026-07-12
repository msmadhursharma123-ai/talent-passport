import React from "react";

interface UserInfoPanelProps {

  title: string;

  children: React.ReactNode;

}

export default function UserInfoPanel({

  title,

  children,

}: UserInfoPanelProps) {

  return (

    <aside style={panelStyle}>

      <h3 style={titleStyle}>
        {title}
      </h3>

      <div style={contentStyle}>
        {children}
      </div>

    </aside>

  );

}

const panelStyle: React.CSSProperties = {

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: 16,

  padding: 24,

  display: "flex",

  flexDirection: "column",

  gap: 20,

};

const titleStyle: React.CSSProperties = {

  margin: 0,

  color: "#143B73",

  fontSize: 18,

  fontWeight: 700,

};

const contentStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 16,

};