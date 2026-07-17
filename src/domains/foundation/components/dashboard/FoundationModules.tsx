import React from "react";

interface FoundationModule {
  title: string;
  description: string;
  icon: string;
  status: "Ready" | "Coming Soon";
  enabled: boolean;
}

interface FoundationModulesProps {
  onOpenModule?: (moduleTitle: string) => void;
}

const FOUNDATION_MODULES: FoundationModule[] = [
  {
    title: "Organizations",
    description:
      "Manage schools and future organizations onboarded to the Talent Passport Platform.",
    icon: "🏫",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Boards",
    description:
      "Configure education boards including CBSE, ICSE, IB and future boards.",
    icon: "📘",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Academic Years",
    description:
      "Create and manage academic sessions used across every organization.",
    icon: "📅",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Classes",
    description:
      "Maintain platform-wide class definitions for every organization.",
    icon: "🏛",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Sections",
    description:
      "Manage sections belonging to classes within organizations.",
    icon: "🧩",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Subjects",
    description:
      "Manage academic subjects for every section.",
    icon: "📚",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Chapters",
    description:
      "Organize every subject into structured chapters that define the academic syllabus.",
    icon: "📖",
    status: "Ready",
    enabled: true,
  },

  {
    title: "Topics",
    description:
      "Break each chapter into measurable learning topics for instruction and assessment.",
    icon: "📝",
    status: "Ready",
    enabled: true,
  },

  {
  title: "Sub Topics",
  description:
    "Manage the smallest learning units under every topic. Sub Topics power lesson planning, assessments and AI learning intelligence.",
  icon: "📖",
  status: "Ready",
  enabled: true,
},

  {
    title: "Curriculum",
    description:
      "Manage the complete academic hierarchy and learning structure across the platform.",
    icon: "🧠",
    status: "Ready",
    enabled: true,
  },

{
    title: "Academic Explorer",
    description:
      "Browse the complete academic hierarchy of Talent Passport OS.",
    icon: "🎓",
    status: "Ready",
    enabled: true,
},

];

export default function FoundationModules({
  onOpenModule,
}: FoundationModulesProps) {
  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>
          Foundation Modules
        </h2>

        <p style={descriptionStyle}>
          Every master configuration inside Talent Passport Platform
          begins here. These modules become the single source of truth
          consumed by every portal.
        </p>
      </div>

      <div style={gridStyle}>
        {FOUNDATION_MODULES.map((module) => (
          <div
            key={module.title}
            style={{
              ...cardStyle,
              ...(module.enabled
                ? enabledCardStyle
                : disabledCardStyle),
            }}
          >
            <div style={topRowStyle}>
              <div style={iconContainerStyle}>
                {module.icon}
              </div>

              <span
                style={
                  module.enabled
                    ? readyBadgeStyle
                    : soonBadgeStyle
                }
              >
                {module.status}
              </span>
            </div>

            <h3 style={titleStyle}>
              {module.title}
            </h3>

            <p style={moduleDescriptionStyle}>
              {module.description}
            </p>

          <button
  disabled={!module.enabled}
  style={
    module.enabled
      ? openButtonStyle
      : disabledButtonStyle
  }
  onClick={() =>
    module.enabled &&
    onOpenModule?.(module.title)
  }
>
              {module.enabled
                ? "Open Module →"
                : "Coming Soon"}
            </button>
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
  fontSize: "24px",
  fontWeight: 700,
  color: "#143B73",
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#64748B",
  fontSize: "15px",
  lineHeight: 1.6,
  maxWidth: "760px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px,1fr))",
  gap: "22px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "20px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
  transition: "all .2s ease",
};

const enabledCardStyle: React.CSSProperties = {
  cursor: "pointer",
};

const disabledCardStyle: React.CSSProperties = {
  opacity: 0.7,
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const iconContainerStyle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  background: "#EEF4FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "22px",
  fontWeight: 700,
};

const moduleDescriptionStyle: React.CSSProperties = {
  marginTop: "14px",
  marginBottom: "24px",
  color: "#64748B",
  fontSize: "14px",
  lineHeight: 1.7,
  flex: 1,
};

const readyBadgeStyle: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#15803D",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const soonBadgeStyle: React.CSSProperties = {
  background: "#FEF3C7",
  color: "#B45309",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const openButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#143B73",
  color: "#FFFFFF",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const disabledButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#E2E8F0",
  color: "#64748B",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "not-allowed",
  fontWeight: 600,
  fontSize: "14px",
};