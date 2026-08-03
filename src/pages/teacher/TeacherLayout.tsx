import { useState } from "react";

import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

import TeacherHome from "./TeacherHome";

import TeacherDailyLogPage from "../../domains/teacherIntelligence/pages/TeacherDailyLogPage";

import TeachingJournalPage from "../../domains/teacherIntelligence/pages/TeachingJournalPage";

import MyClassroomPage from "../../domains/teacherIntelligence/pages/MyClassroomPage";

import ExamPreparationPage
from "../../domains/teacherIntelligence/pages/ExamPreparationPage";

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
      className="teacher-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6FA",
      }}
    >
      <TeacherSidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div
        className="teacher-layout-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <TeacherHeader
          onLogout={onLogout}
        />

        <div
          className="teacher-layout-content"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
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

{activePage ===
"exam-preparation" && (
<ExamPreparationPage />
          )}
        </div>
      </div>
    
<style>{`
@media (max-width: 1024px) {
 .teacher-layout { flex-direction:column !important; height:100dvh; min-height:100dvh !important; overflow:hidden; }
 .teacher-layout-main { min-width:0 !important; flex:1 !important; overflow:hidden !important; }
 .teacher-layout-content { min-width:0 !important; overflow-x:hidden !important; }
}
`}</style>
</div>
  );
}