import React from "react";

interface InfoCardProps {

  title: string;

  children: React.ReactNode;

}

export default function InfoCard({

  title,

  children,

}: InfoCardProps) {

  return (

    <div style={cardStyle}>

      <h3 style={titleStyle}>
        {title}
      </h3>

      {children}

    </div>

  );

}

const cardStyle: React.CSSProperties = {

  border: "1px solid #E2E8F0",

  borderRadius: 16,

  padding: 24,

  background: "#FFFFFF",

};

const titleStyle: React.CSSProperties = {

  marginTop: 0,

  color: "#143B73",

};