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
          }}
        >
          Logout
        </button>

      </div>

      <div
  style={{
    display: "flex",
    gap: "12px",
    padding: "20px 40px",
    background: "#F8FAFC",
    borderBottom:
      "1px solid #E5E7EB",
  }}
>

  <button
    onClick={() =>
      setActiveTab(
        "dashboard"
      )
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
  >
    Competition Entries
  </button>

  <button
    onClick={() =>
      setActiveTab(
        "analytics"
      )
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
  >
    Settings
  </button>

</div>

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