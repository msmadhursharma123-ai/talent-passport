import React from "react";

export const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

export const activeBadge = {
  background: "#DCFCE7",
  color: "#166534",
};

export const pendingBadge = {
  background: "#FEF3C7",
  color: "#92400E",
};

export const suspendedBadge = {
  background: "#FEE2E2",
  color: "#B91C1C",
};

export const archivedBadge = {
  background: "#E2E8F0",
  color: "#475569",
};

export const studentBadge = {
  background: "#DBEAFE",
  color: "#1D4ED8",
};

export const teacherBadge = {
  background: "#F3E8FF",
  color: "#7E22CE",
};

export const partnerBadge = {
  background: "#FEF3C7",
  color: "#B45309",
};

export const adminBadge = {
  background: "#E0F2FE",
  color: "#075985",
};