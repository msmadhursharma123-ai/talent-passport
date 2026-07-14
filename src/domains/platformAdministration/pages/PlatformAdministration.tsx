import React, { useState } from "react";

import PlatformAdministrationHero from "../components/dashboard/PlatformAdministrationHero";
import PlatformAdministrationStatistics from "../components/dashboard/PlatformAdministrationStatistics";
import PlatformAdministrationQuickActions from "../components/dashboard/PlatformAdministrationQuickActions";
import PlatformAdministrationModules from "../components/dashboard/PlatformAdministrationModules";
import PlatformAdministrationRecentActivity from "../components/dashboard/PlatformAdministrationRecentActivity";

import UniversalUserRegistry from "./UniversalUserRegistry";

import TeacherRegistry
from "../teacher/TeacherRegistry";
import SchoolAdminRegistry
from "../teacher/SchoolAdminRegistry";

type PlatformAdministrationPage =
  | "dashboard"
  | "registry"
  | "teachers"
  | "schools"
  | "partners"
  | "parents";

export default function PlatformAdministration() {
  const [activePage, setActivePage] =
    useState<PlatformAdministrationPage>(
      "dashboard"
    );

  if (activePage === "registry") {
    return (
      <UniversalUserRegistry />
    );
  }

if (activePage === "teachers") {

    return <TeacherRegistry />;

}

if (activePage === "schools") {

    return <SchoolAdminRegistry />;

}

  return (
    <div style={pageStyle}>
      <PlatformAdministrationHero />

      <PlatformAdministrationStatistics />

      <PlatformAdministrationQuickActions />

      <PlatformAdministrationModules

    onOpenRegistry={() =>

        setActivePage("registry")

    }

    onOpenTeacherManagement={() =>

        setActivePage("teachers")

    }

    onOpenSchoolAdministration={() =>

        setActivePage("schools")

    }

/>

      <PlatformAdministrationRecentActivity />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  padding: "8px",
};