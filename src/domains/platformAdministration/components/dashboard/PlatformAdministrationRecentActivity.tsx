import React from "react";

interface ActivityItem {
  time: string;
  title: string;
  description: string;
}

const activities: ActivityItem[] = [
  {
    time: "10:45 AM",
    title: "Teacher Account Created",
    description: "A new Mathematics teacher was added to ABC Public School.",
  },
  {
    time: "10:10 AM",
    title: "School Administrator Activated",
    description: "Principal account activated successfully.",
  },
  {
    time: "09:35 AM",
    title: "Partner Approved",
    description: "A new talent partner has been approved.",
  },
  {
    time: "09:05 AM",
    title: "User Suspended",
    description: "A student account was temporarily suspended.",
  },
  {
    time: "Yesterday",
    title: "Platform Backup Completed",
    description: "Nightly backup completed successfully.",
  },
];

export default function PlatformAdministrationRecentActivity() {
  return (
    <section>
      <h2 style={headingStyle}>
        Recent Platform Activity
      </h2>

      <div style={cardStyle}>
        {activities.map((activity, index) => (
          <div
            key={index}
            style={{
              ...rowStyle,
              borderBottom:
                index === activities.length - 1
                  ? "none"
                  : "1px solid #E5E7EB",
            }}
          >
            <div style={timeStyle}>
              {activity.time}
            </div>

            <div style={contentStyle}>
              <h3 style={titleStyle}>
                {activity.title}
              </h3>

              <p style={descriptionStyle}>
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Styles
============================================================ */

const headingStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#143B73",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "24px",
  border: "1px solid #E2E8F0",
  overflow: "hidden",
  boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  padding: "22px 28px",
  alignItems: "flex-start",
};

const timeStyle: React.CSSProperties = {
  width: "120px",
  color: "#2563EB",
  fontWeight: 700,
  fontSize: "14px",
  flexShrink: 0,
};

const contentStyle: React.CSSProperties = {
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#143B73",
  fontSize: "17px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: "14px",
};