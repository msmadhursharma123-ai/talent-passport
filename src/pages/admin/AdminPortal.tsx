import { useState } from "react";

import AdminDashboard from "../AdminDashboard";
import CompetitionEntries from "./CompetitionEntries";
import AdminAnalytics from "./AdminAnalytics";

/* ============================================================
   ADMIN PORTAL

   Responsibilities

   • Admin navigation
   • Module switching
   • Layout container

   No Repository
   No Service
   No Supabase
============================================================ */

type AdminTab =
  | "dashboard"
  | "entries"
  | "analytics"
  | "settings";

interface AdminPortalProps {

  onLogout: () => void;

}

const TABS: ReadonlyArray<{

  key: AdminTab;

  label: string;

}> = [

  {
    key: "dashboard",
    label: "Dashboard"
  },

  {
    key: "entries",
    label: "Competition Entries"
  },

  {
    key: "analytics",
    label: "Analytics"
  },

  {
    key: "settings",
    label: "Settings"
  }

];

export default function AdminPortal({

  onLogout

}: AdminPortalProps) {

const [activeTab, setActiveTab] =
  useState<AdminTab>("dashboard");

  return (

    <div>

      {/* HEADER */}

      <div style={headerStyle}>

        <h2 style={titleStyle}>

          Admin Command Center

        </h2>

        <button

          onClick={onLogout}

          style={logoutButtonStyle}

        >

          Logout

        </button>

      </div>

      {/* NAVIGATION */}

      <div style={navigationStyle}>

       {TABS.map((tab) => (
  <button
    key={tab.key}
    onClick={() => setActiveTab(tab.key)}
    style={
      activeTab === tab.key
        ? activePill
        : inactivePill
    }
  >
    {tab.label}
  </button>
))}
      </div>

      {/* CONTENT */}

      {activeTab === "dashboard" && (

        <AdminDashboard />

      )}

      {activeTab === "entries" && (

        <CompetitionEntries />

      )}

      {activeTab === "analytics" && (

        <AdminAnalytics />

      )}

      {activeTab === "settings" && (

        <div style={settingsStyle}>

          Settings Module

        </div>

      )}

    </div>

  );

}

/* ============================================================
   STYLES
============================================================ */

const headerStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  padding: "20px 40px",

  background: "white",

  borderBottom: "1px solid #E5E7EB"

};

const titleStyle: React.CSSProperties = {

  color: "#143B73",

  margin: 0

};

const logoutButtonStyle: React.CSSProperties = {

  background: "#DC2626",

  color: "white",

  border: "none",

  padding: "12px 20px",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: 600

};

const navigationStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "center",

  gap: "12px",

  padding: "20px",

  background: "#F8FAFC",

  borderBottom: "1px solid #E5E7EB",

  flexWrap: "wrap"

};

const settingsStyle: React.CSSProperties = {

  padding: "40px"

};

const activePill: React.CSSProperties = {

  background: "#F97316",

  color: "white",

  border: "none",

  padding: "14px 24px",

  borderRadius: "14px",

  fontWeight: 700,

  cursor: "pointer",

  boxShadow:

    "0 4px 12px rgba(249,115,22,0.30)"

};

const inactivePill: React.CSSProperties = {

  background: "#E5E7EB",

  color: "#475569",

  border: "none",

  padding: "14px 24px",

  borderRadius: "14px",

  fontWeight: 600,

  cursor: "pointer"

};