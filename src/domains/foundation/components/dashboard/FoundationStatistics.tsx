import React from "react";

interface StatisticCard {
  title: string;
  value: number;
  subtitle: string;
}

const FOUNDATION_STATISTICS: StatisticCard[] = [
  {
    title: "Organizations",
    value: 0,
    subtitle: "Registered",
  },
  {
    title: "Boards",
    value: 0,
    subtitle: "Configured",
  },
  {
    title: "Subjects",
    value: 0,
    subtitle: "Available",
  },
  {
    title: "Curriculum",
    value: 0,
    subtitle: "Topics",
  },
];

export default function FoundationStatistics() {
  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Platform Overview</h2>

        <p style={descriptionStyle}>
          Foundation Hub powers every portal by providing centralized
          configuration and master data across the Talent Passport Platform.
        </p>
      </div>

      <div style={gridStyle}>
        {FOUNDATION_STATISTICS.map((stat) => (
          <div key={stat.title} style={cardStyle}>
            <div style={accentBarStyle} />

            <p style={titleStyle}>{stat.title}</p>

            <h1 style={valueStyle}>{stat.value}</h1>

            <p style={subtitleStyle}>{stat.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  marginBottom: "40px",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "22px",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "24px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#64748B",
  fontSize: "15px",
  lineHeight: 1.6,
  maxWidth: "700px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
  transition: "all 0.2s ease",
};

const accentBarStyle: React.CSSProperties = {
  height: "5px",
  background: "#143B73",
  borderRadius: "18px 18px 0 0",
  margin: "-24px -24px 22px -24px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: "15px",
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  margin: "14px 0 10px 0",
  color: "#143B73",
  fontSize: "42px",
  fontWeight: 700,
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#94A3B8",
  fontSize: "14px",
  fontWeight: 500,
};