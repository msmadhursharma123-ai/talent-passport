import React from "react";

interface HeroBannerProps {
  title: string;
  subtitle: string;
}

export default function HeroBanner({
  title,
  subtitle,
}: HeroBannerProps) {
  return (
    <div style={heroContainer}>
      <div style={eyebrow}>
        TALENT PASSPORT OPERATING SYSTEM
      </div>

      <h1 style={titleStyle}>{title}</h1>

      <p style={subtitleStyle}>{subtitle}</p>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const heroContainer: React.CSSProperties = {
  background:
    "linear-gradient(135deg,#08123B,#132A73)",
  borderRadius: "28px",
  padding: "34px 40px",
  color: "#FFFFFF",
};

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: "#F97316",
  marginBottom: "18px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "54px",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: 0,
  fontSize: "18px",
  color: "#E2E8F0",
  maxWidth: "900px",
  lineHeight: 1.6,
};