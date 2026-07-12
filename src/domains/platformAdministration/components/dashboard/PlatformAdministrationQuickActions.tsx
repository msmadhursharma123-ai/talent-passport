import React from "react";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
}

const actions: QuickAction[] = [
  {
    icon: "👨‍🏫",
    title: "Create Teacher",
    description: "Add a new teacher and assign organization, subjects and classes.",
  },
  {
    icon: "🏫",
    title: "Create School Admin",
    description: "Invite and configure a new school administrator.",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Invite Parent",
    description: "Link parents with student accounts.",
  },
  {
    icon: "📤",
    title: "Export Users",
    description: "Download user data for reporting and audits.",
  },
  {
    icon: "🛡️",
    title: "Audit Logs",
    description: "Review platform activity and administrative actions.",
  },
];

export default function PlatformAdministrationQuickActions() {
  return (
    <section>
      <h2 style={headingStyle}>Quick Actions</h2>

      <div style={gridStyle}>
        {actions.map((action) => (
          <button
            key={action.title}
            style={cardStyle}
            type="button"
          >
            <div style={iconStyle}>
              {action.icon}
            </div>

            <h3 style={titleStyle}>
              {action.title}
            </h3>

            <p style={descriptionStyle}>
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Styles
============================================================ */

const headingStyle: React.CSSProperties = {
  margin: "0 0 18px",
  color: "#143B73",
  fontSize: "22px",
  fontWeight: 700,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "20px",
  padding: "24px",
  textAlign: "left",
  cursor: "pointer",
  transition: "0.2s",
  boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
};

const iconStyle: React.CSSProperties = {
  fontSize: "34px",
  marginBottom: "18px",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#143B73",
  fontSize: "18px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: "14px",
  lineHeight: 1.6,
};