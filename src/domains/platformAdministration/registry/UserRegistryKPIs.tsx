import React from "react";

export interface UserRegistryKPIsProps {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  archivedUsers: number;
  selectedUsers: number;
  pendingUsers?: number;
}

interface KPICard {
  title: string;
  value: number;
  color: string;
}

export default function UserRegistryKPIs({
  totalUsers,
  activeUsers,
  suspendedUsers,
  archivedUsers,
  selectedUsers,
  pendingUsers = 0,
}: UserRegistryKPIsProps) {

  const cards: KPICard[] = [
    {
      title: "Total Users",
      value: totalUsers,
      color: "#143B73",
    },
    {
      title: "Active Users",
      value: activeUsers,
      color: "#16A34A",
    },
    {
      title: "Pending Users",
      value: pendingUsers,
      color: "#F59E0B",
    },
    {
      title: "Suspended Users",
      value: suspendedUsers,
      color: "#DC2626",
    },
    {
      title: "Archived Users",
      value: archivedUsers,
      color: "#6B7280",
    },
    {
      title: "Selected Users",
      value: selectedUsers,
      color: "#2563EB",
    },
  ];

  return (
    <section style={sectionStyle}>
      <div style={gridStyle}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={cardStyle}
          >
            <div style={titleStyle}>
              {card.title}
            </div>

            <div
              style={{
                ...valueStyle,
                color: card.color,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================================================
   STYLES
====================================================== */

const sectionStyle: React.CSSProperties = {
  marginBottom: "28px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  padding: "22px",
  boxShadow:
    "0 4px 12px rgba(15,23,42,0.04)",
  transition: "0.2s ease",
};

const titleStyle: React.CSSProperties = {
  color: "#64748B",
  fontSize: "14px",
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  marginTop: "10px",
  fontSize: "34px",
  fontWeight: 800,
};