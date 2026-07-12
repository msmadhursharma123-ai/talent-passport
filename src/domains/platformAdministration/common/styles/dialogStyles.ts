import React from "react";

export const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

export const dialogStyle: React.CSSProperties = {
  width: 900,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: 18,
  boxShadow: "0 18px 60px rgba(0,0,0,.18)",
};

export const dialogBodyStyle: React.CSSProperties = {
  padding: 30,
};