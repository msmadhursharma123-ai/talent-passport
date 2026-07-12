import React from "react";

export default function PlatformAdministrationHero() {
  return (
    <section style={heroStyle}>
      <p style={eyebrowStyle}>
        TALENT PASSPORT OPERATING SYSTEM
      </p>

      <h1 style={titleStyle}>
        PLATFORM ADMINISTRATION
      </h1>

      <p style={subtitleStyle}>
        User Management, Security, Organizations &
        Platform Governance
      </p>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const heroStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg,#112A66 0%,#1D3D8F 100%)",
  borderRadius: "28px",
  padding: "34px 40px",
  color: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: "#F59E0B",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "52px",
  fontWeight: 800,
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  color: "#D6E4FF",
  lineHeight: 1.5,
};