import { useState } from "react";

import AdminDashboard from "../AdminDashboard";
import CompetitionEntries from "./CompetitionEntries";
import AdminAnalytics from "./AdminAnalytics";
import AdminShell from "../../domains/foundation/components/admin/AdminShell";
import AdminHeader from "../../domains/foundation/components/admin/AdminHeader";
import AdminSidebar from "../../domains/foundation/components/admin/AdminSidebar";
import FoundationHub
from "../../domains/foundation/pages/FoundationHub";
import PlatformAdministration
from "../../domains/platformAdministration/pages/PlatformAdministration";

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

import {
  type AdminModule,
} from "../../domains/foundation/components/admin/adminModules";

interface AdminPortalProps {
  onLogout: () => void;
}



export default function AdminPortal({
  onLogout,
}: AdminPortalProps) {
const [activeModule, setActiveModule] =
  useState<AdminModule>("dashboard");

const renderModule = () => {
  switch (activeModule) {
    case "dashboard":
      return <AdminDashboard />;

    case "foundation":
      return <FoundationHub />;

      
    case "competitions":
      return <CompetitionEntries />;

    case "analytics":
      return <AdminAnalytics />;

case "users":
  return <PlatformAdministration />;

    case "settings":
      return (
        <div style={settingsStyle}>
          Platform Settings
        </div>
      );

    default:
      return (
        <div style={settingsStyle}>
          Coming Soon
        </div>
      );
  }
};

  return (
 <AdminShell
  sidebar={
    <AdminSidebar
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    />
  }
  header={
    <AdminHeader
      title="Talent Passport Platform"
      subtitle="Platform Administration & Foundation Management"
      onLogout={onLogout}
    />
  }
>
  {renderModule()}
</AdminShell>
  );
}

/* ============================================================
   STYLES
============================================================ */

const settingsStyle: React.CSSProperties = {
  padding: "24px",
};

