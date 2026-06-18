import { useState } from "react";

import AdminDashboard from "../AdminDashboard";
import CompetitionEntries from "./CompetitionEntries";

type AdminTab =
  | "dashboard"
  | "entries"
  | "analytics"
  | "settings";

interface Props {
  onLogout: () => void;
}

export default function AdminPortal({
  onLogout,
}: Props) {

  const [activeTab, setActiveTab] =
    useState<AdminTab>(
      "dashboard"
    );

  return (
    <div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "white",
          borderBottom:
            "1px solid #E5E7EB",
        }}
      >

        <h2
          style={{
            color: "#143B73",
            margin: 0,
          }}
        >
          Admin Command Center
        </h2>

        <button
          onClick={onLogout}
          style={{
            background: "#DC2626",
            color: "white",
            border: "none",
            padding:
              "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>

      </div>

      {/* NAVIGATION */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          padding: "20px",
          background: "#F8FAFC",
          borderBottom:
            "1px solid #E5E7EB",
          flexWrap: "wrap",
        }}
      >

        <button
          onClick={() =>
            setActiveTab(
              "dashboard"
            )
          }
          style={
            activeTab ===
            "dashboard"
              ? activePill
              : inactivePill
          }
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "entries"
            )
          }
          style={
            activeTab ===
            "entries"
              ? activePill
              : inactivePill
          }
        >
          Competition Entries
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "analytics"
            )
          }
          style={
            activeTab ===
            "analytics"
              ? activePill
              : inactivePill
          }
        >
          Analytics
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "settings"
            )
          }
          style={
            activeTab ===
            "settings"
              ? activePill
              : inactivePill
          }
        >
          Settings
        </button>

      </div>

      {/* CONTENT */}

      {activeTab ===
        "dashboard" && (
        <AdminDashboard />
      )}

      {activeTab ===
        "entries" && (
        <CompetitionEntries />
      )}

      {activeTab ===
        "analytics" && (
        <div
          style={{
            padding: "40px",
          }}
        >
          Analytics Module
        </div>
      )}

      {activeTab ===
        "settings" && (
        <div
          style={{
            padding: "40px",
          }}
        >
          Settings Module
        </div>
      )}

    </div>
  );
}

const activePill = {
  background: "#F97316",
  color: "white",
  border: "none",
  padding: "14px 24px",
  borderRadius: "14px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow:
    "0 4px 12px rgba(249,115,22,0.30)",
};

const inactivePill = {
  background: "#E5E7EB",
  color: "#475569",
  border: "none",
  padding: "14px 24px",
  borderRadius: "14px",
  fontWeight: 600,
  cursor: "pointer",
};