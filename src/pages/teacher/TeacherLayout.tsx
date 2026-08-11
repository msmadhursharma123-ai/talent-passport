import { useState } from "react";

import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

import TeacherHome from "./TeacherHome";

import TeacherDailyLogPage from "../../domains/teacherIntelligence/pages/TeacherDailyLogPage";

import TeachingJournalPage from "../../domains/teacherIntelligence/pages/TeachingJournalPage";

import MyClassroomPage from "../../domains/teacherIntelligence/pages/MyClassroomPage";

import ExamPreparationPage from "../../domains/teacherIntelligence/pages/ExamPreparationPage";

import SchoolPostFeed from "../../domains/schoolIntelligence/components/SchoolPostFeed";

interface Props {
  onLogout: () => void;
}

export default function TeacherLayout({ onLogout }: Props) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <>
      <style>{`
        /*
         * TEACHER PORTAL RESPONSIVE SHELL
         *
         * Desktop:
         *   Sidebar | Header + Page
         *
         * Tablet / Mobile:
         *   Horizontal Sidebar
         *   Header
         *   School Post Feed
         *   Active Page
         *
         * The important part is that the 100%-width responsive sidebar
         * must not remain beside the main area. Otherwise it consumes the
         * entire row and leaves the main content with ~0px width.
         */
        .teacher-layout-shell {
          display: flex;
          flex-direction: row;
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          background: #F5F6FA;
          box-sizing: border-box;
        }

        .teacher-layout-main {
          flex: 1 1 auto;
          min-width: 0;
          width: auto;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }

        .teacher-layout-content {
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          box-sizing: border-box;
        }

        @media (max-width: 1024px) {
          .teacher-layout-shell {
            flex-direction: column;
            width: 100%;
            min-width: 0;
            min-height: 100vh;
          }

          .teacher-layout-main {
            width: 100%;
            min-width: 0;
            flex: 1 1 auto;
            overflow: visible;
          }

          .teacher-layout-content {
            width: 100%;
            min-width: 0;
            flex: 1 1 auto;
            overflow-x: hidden;
            overflow-y: visible;
          }
        }

        @media (max-width: 600px) {
          .teacher-layout-shell {
            width: 100%;
            min-width: 0;
          }

          .teacher-layout-main,
          .teacher-layout-content {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>

      <div className="teacher-layout-shell">
        <TeacherSidebar
          activePage={activePage}
          onNavigate={setActivePage}
        />

        <div className="teacher-layout-main">
          <TeacherHeader onLogout={onLogout} />

          <main className="teacher-layout-content">
            {/* School announcements and polls remain above the active teacher feature. */}
            <SchoolPostFeed audience="teacher" />

            {activePage === "dashboard" && <TeacherHome />}

            {activePage === "daily-log" && <TeacherDailyLogPage />}

            {activePage === "teaching-journal" && <TeachingJournalPage />}

            {activePage === "my-classroom" && <MyClassroomPage />}

            {activePage === "exam-preparation" && <ExamPreparationPage />}
          </main>
        </div>
      </div>
    </>
  );
}
