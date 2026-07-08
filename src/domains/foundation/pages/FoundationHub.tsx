import React, { useState } from "react";

import FoundationHero from "../components/dashboard/FoundationHero";
import FoundationStatistics from "../components/dashboard/FoundationStatistics";
import FoundationQuickActions from "../components/dashboard/FoundationQuickActions";
import FoundationModules from "../components/dashboard/FoundationModules";
import FoundationRecentActivity from "../components/dashboard/FoundationRecentActivity";

import OrganizationsHub from "./OrganizationsHub";
import BoardsHub from "./BoardsHub";
import AcademicYearsHub from "./AcademicYearsHub";
import CurriculumHub from "./CurriculumHub";
import ClassesHub from "./ClassesHub";
import SectionsHub from "./SectionsHub";
import SubjectsHub from "./SubjectsHub";
import ChaptersHub from "./ChaptersHub";
import TopicsHub from "./TopicsHub";
import SubTopicsHub from "./SubTopicsHub";

export default function FoundationHub() {
  const [activeModule, setActiveModule] =
    useState<string | null>(null);

if (activeModule === "Organizations") {
  return (
    <OrganizationsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Boards") {
  return (
    <BoardsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Academic Years") {
  return (
    <AcademicYearsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Curriculum") {
  return (
    <CurriculumHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Classes") {
  return (
    <ClassesHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Sections") {
  return (
    <SectionsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Subjects") {
  return (
    <SubjectsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Chapters") {
  return (
    <ChaptersHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Topics") {
  return (
    <TopicsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

if (activeModule === "Sub Topics") {
  return (
    <SubTopicsHub
      onBack={() =>
        setActiveModule(null)
      }
    />
  );
}

  return (
    <div style={pageStyle}>
      <FoundationHero />

      <FoundationStatistics />

      <FoundationQuickActions />

      <FoundationModules
        onOpenModule={setActiveModule}
      />

      <FoundationRecentActivity />
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  padding: "8px",
};