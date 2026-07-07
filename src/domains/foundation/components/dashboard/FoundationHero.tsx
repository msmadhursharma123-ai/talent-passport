import React from "react";

export default function FoundationHero() {
  return (
    <section style={containerStyle}>
      <div>
        <h1 style={titleStyle}>
          🏛 Foundation Hub
        </h1>

        <h2 style={headingStyle}>
          Single Source of Truth
        </h2>

        <p style={descriptionStyle}>
          Manage organizations, boards,
          academic years, classes,
          sections, subjects and
          curriculum from one central
          platform. Every portal
          consumes Foundation Hub as
          the master configuration
          source.
        </p>
      </div>

      <div style={statusCard}>
        <span style={statusBadge}>
          Platform CMS
        </span>

        <h3 style={statusTitle}>
          Foundation Status
        </h3>

        <p style={statusDescription}>
          Foundation Hub will become
          the master configuration
          center for Talent Passport
          Platform.
        </p>
      </div>
    </section>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "32px",
  marginBottom: "32px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "36px",
  margin: 0,
  color: "#143B73",
};

const headingStyle: React.CSSProperties = {
  marginTop: "14px",
  color: "#1E293B",
};

const descriptionStyle: React.CSSProperties = {
  maxWidth: "720px",
  lineHeight: 1.7,
  color: "#64748B",
};

const statusCard: React.CSSProperties = {
  minWidth: "320px",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "24px",
};

const statusBadge: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#15803D",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const statusTitle: React.CSSProperties = {
  marginTop: "18px",
};

const statusDescription: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};