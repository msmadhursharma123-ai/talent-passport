import { useState } from "react";

import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

import TeacherHome from "./TeacherHome";

import TeacherDailyLogPage from "../../domains/teacherIntelligence/pages/TeacherDailyLogPage";

import TeachingJournalPage from "../../domains/teacherIntelligence/pages/TeachingJournalPage";

import MyClassroomPage from "../../domains/teacherIntelligence/pages/MyClassroomPage";

interface Props {
  onLogout: () => void;
}

export default function TeacherLayout({
  onLogout,
}: Props) {
  const [activePage, setActivePage] =
    useState("dashboard");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F8F7F4",
      }}
    >
      <TeacherSidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TeacherHeader
          onLogout={onLogout}
        />

        {activePage ===
          "dashboard" && (
          <TeacherHome />
        )}

        {activePage ===
          "daily-log" && (
          <TeacherDailyLogPage />
        )}

        {activePage ===
          "teaching-journal" && (
          <TeachingJournalPage />
        )}

        {activePage ===
          "my-classroom" && (
          <MyClassroomPage />
        )}
      </div>
    </div>
  );
}