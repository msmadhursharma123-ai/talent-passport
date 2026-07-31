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
  position: "relative",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 88% 18%, rgba(255,126,31,0.12) 0 58px, transparent 59px), radial-gradient(circle at 76% 100%, rgba(43,102,246,0.10) 0 82px, transparent 83px), linear-gradient(135deg,#FFFDF9 0%,#FFFFFF 62%,#FFF8F1 100%)",
  border: "1px solid #DCE5F0",
  boxShadow: "0 10px 30px rgba(15,39,71,0.06)",
  borderRadius: "24px",
  padding: "30px 34px",
  color: "#0B1F3A",
  marginBottom: "18px",
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
  fontSize: "38px",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: 0,
  fontSize: "18px",
  color: "#DFE7F1",
  maxWidth: "900px",
  lineHeight: 1.6,
};