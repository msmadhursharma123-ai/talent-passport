import React from "react";

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  status: "Upcoming";
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    title: "Foundation Hub Initialized",
    description:
      "Foundation Hub is ready. Organization management will become the first active module.",
    time: "Today",
    status: "Upcoming",
  },
  {
    title: "Organization Audit",
    description:
      "New organizations created from Foundation Hub will appear here.",
    time: "Pending",
    status: "Upcoming",
  },
  {
    title: "Curriculum Updates",
    description:
      "Curriculum imports and modifications will be tracked here.",
    time: "Pending",
    status: "Upcoming",
  },
  {
    title: "Platform Configuration",
    description:
      "Changes to boards, academic years, classes and subjects will appear here.",
    time: "Pending",
    status: "Upcoming",
  },
];

export default function FoundationRecentActivity() {
  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Recent Activity</h2>

        <p style={descriptionStyle}>
          Foundation Hub maintains a complete history of master data
          operations performed across the Talent Passport Platform.
        </p>
      </div>

      <div style={timelineStyle}>
        {RECENT_ACTIVITIES.map((activity, index) => (
          <div
            key={index}
            style={activityCardStyle}
          >
            <div style={indicatorStyle} />

            <div style={contentStyle}>
              <div style={topRowStyle}>
                <h3 style={titleStyle}>
                  {activity.title}
                </h3>

                <span style={badgeStyle}>
                  {activity.status}
                </span>
              </div>

              <p style={activityDescriptionStyle}>
                {activity.description}
              </p>

              <p style={timeStyle}>
                {activity.time}
              </p>
            </div>
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
  color: "#64748B",
  fontSize: "15px",
  lineHeight: 1.6,
  maxWidth: "760px",
};

const timelineStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const activityCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "18px",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 4px 10px rgba(15,23,42,0.05)",
};

const indicatorStyle: React.CSSProperties = {
  width: "14px",
  minWidth: "14px",
  height: "14px",
  borderRadius: "50%",
  background: "#143B73",
  marginTop: "8px",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "18px",
  fontWeight: 700,
};

const activityDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  lineHeight: 1.7,
  fontSize: "14px",
};

const badgeStyle: React.CSSProperties = {
  background: "#EEF2FF",
  color: "#3730A3",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const timeStyle: React.CSSProperties = {
  marginTop: "14px",
  marginBottom: 0,
  color: "#94A3B8",
  fontSize: "13px",
  fontWeight: 600,
};