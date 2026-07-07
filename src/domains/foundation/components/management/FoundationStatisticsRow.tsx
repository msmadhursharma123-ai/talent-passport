import React from "react";

export interface FoundationStatistic {
  title: string;
  value: React.ReactNode;
  subtitle: string;
}

interface FoundationStatisticsRowProps {
  statistics: FoundationStatistic[];
}

export default function FoundationStatisticsRow({
  statistics,
}: FoundationStatisticsRowProps) {
  return (
    <section style={containerStyle}>
      <div style={gridStyle}>
        {statistics.map((stat) => (
          <div
            key={stat.title}
            style={cardStyle}
          >
            <div style={accentBarStyle} />

            <p style={titleStyle}>
              {stat.title}
            </p>

            <h2 style={valueStyle}>
              {stat.value}
            </h2>

            <p style={subtitleStyle}>
              {stat.subtitle}
            </p>
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
  width: "100%",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "24px",
  boxShadow:
    "0 4px 10px rgba(15, 23, 42, 0.05)",
  overflow: "hidden",
};

const accentBarStyle: React.CSSProperties = {
  height: "5px",
  background: "#143B73",
  borderRadius: "18px 18px 0 0",
  margin: "-24px -24px 20px -24px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: "15px",
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  margin: "14px 0",
  color: "#143B73",
  fontSize: "38px",
  fontWeight: 700,
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#94A3B8",
  fontSize: "14px",
  fontWeight: 500,
};