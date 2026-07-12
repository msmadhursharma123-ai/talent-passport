import React from "react";

export default function PlatformAdministrationStatistics() {
  const statistics = [
    {
      label: "Active Users",
      value: "1,284",
      color: "#143B73",
    },
    {
      label: "Students",
      value: "1,120",
      color: "#16A34A",
    },
    {
      label: "Teachers",
      value: "84",
      color: "#2563EB",
    },
    {
      label: "School Admins",
      value: "32",
      color: "#EA580C",
    },
    {
      label: "Partners",
      value: "41",
      color: "#7C3AED",
    },
    {
      label: "Platform Admins",
      value: "7",
      color: "#DC2626",
    },
  ];

  return (
    <section>
      <h2 style={headingStyle}>
        Platform Overview
      </h2>

      <div style={gridStyle}>
        {statistics.map((item) => (
          <div
            key={item.label}
            style={cardStyle}
          >
            <p style={labelStyle}>
              {item.label}
            </p>

            <h2
              style={{
                ...valueStyle,
                color: item.color,
              }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const headingStyle: React.CSSProperties = {
  margin: "0 0 18px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#143B73",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: "14px",
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: "38px",
  fontWeight: 800,
};