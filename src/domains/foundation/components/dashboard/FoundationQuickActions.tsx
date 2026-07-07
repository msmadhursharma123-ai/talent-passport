import React from "react";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Add Organization",
    description:
      "Register a new school or future organization on the platform.",
    icon: "🏫",
    enabled: true,
  },
  {
    title: "Import Masters",
    description:
      "Bulk import foundation data from CSV or Excel files.",
    icon: "📥",
    enabled: false,
  },
  {
    title: "Export Masters",
    description:
      "Download organizations and master data for reporting.",
    icon: "📤",
    enabled: false,
  },
  {
    title: "Platform Settings",
    description:
      "Configure global Foundation Hub settings.",
    icon: "⚙️",
    enabled: false,
  },
];

export default function FoundationQuickActions() {
  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Quick Actions</h2>

        <p style={descriptionStyle}>
          Frequently used platform actions for Foundation administrators.
        </p>
      </div>

      <div style={gridStyle}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.title}
            disabled={!action.enabled}
            style={{
              ...cardStyle,
              ...(action.enabled
                ? enabledCardStyle
                : disabledCardStyle),
            }}
          >
            <div style={iconStyle}>
              {action.icon}
            </div>

            <h3 style={titleStyle}>
              {action.title}
            </h3>

            <p style={subtitleStyle}>
              {action.description}
            </p>

            <div
              style={
                action.enabled
                  ? readyBadgeStyle
                  : soonBadgeStyle
              }
            >
              {action.enabled
                ? "Available"
                : "Coming Soon"}
            </div>
          </button>
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
  fontSize: "24px",
  fontWeight: 700,
  color: "#143B73",
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#64748B",
  fontSize: "15px",
  lineHeight: 1.6,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "24px",
  background: "#FFFFFF",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  transition: "all .2s ease",
};

const enabledCardStyle: React.CSSProperties = {
  cursor: "pointer",
};

const disabledCardStyle: React.CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.65,
};

const iconStyle: React.CSSProperties = {
  fontSize: "34px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "20px",
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: "14px",
  lineHeight: 1.6,
  flex: 1,
};

const readyBadgeStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "#DCFCE7",
  color: "#15803D",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const soonBadgeStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "#FEF3C7",
  color: "#B45309",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};