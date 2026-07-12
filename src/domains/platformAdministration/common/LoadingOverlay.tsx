import React from "react";

interface LoadingOverlayProps {

  loading: boolean;

  message?: string;

}

export default function LoadingOverlay({

  loading,

  message = "Loading...",

}: LoadingOverlayProps) {

  if (!loading) {

    return null;

  }

  return (

    <div style={overlayStyle}>

      <div style={cardStyle}>

        <div style={spinnerStyle} />

        <p>{message}</p>

      </div>

    </div>

  );

}

const overlayStyle: React.CSSProperties = {

  position: "fixed",

  inset: 0,

  background: "rgba(255,255,255,.7)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

};

const cardStyle: React.CSSProperties = {

  background: "#FFFFFF",

  padding: 30,

  borderRadius: 16,

  textAlign: "center",

};

const spinnerStyle: React.CSSProperties = {

  width: 42,

  height: 42,

  borderRadius: "50%",

  border: "4px solid #CBD5E1",

  borderTopColor: "#143B73",

  margin: "0 auto 16px",

};