import { useEffect, useState } from "react";

import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

import TeacherHome from "./TeacherHome";

import TeacherDailyLogPage from "../../domains/teacherIntelligence/pages/TeacherDailyLogPage";

import TeachingJournalPage from "../../domains/teacherIntelligence/pages/TeachingJournalPage";

import MyClassroomPage from "../../domains/teacherIntelligence/pages/MyClassroomPage";

import ExamPreparationPage from "../../domains/teacherIntelligence/pages/ExamPreparationPage";
import PlannersPage from "../../domains/planners/pages/PlannersPage";
import UnitTestPlannerPage from "../../domains/planners/pages/UnitTestPlannerPage";
import ExamPaperPlannerPage from "../../domains/planners/pages/ExamPaperPlannerPage";

import SchoolPostFeed from "../../domains/schoolIntelligence/components/SchoolPostFeed";

import {
  getCurrentTeacher
} from "../../services/identityService";

import {
  getSchoolFeatureKeys,
  TEACHER_FEATURES
} from "../../data/schoolFeatureAccessRepository";

interface Props {
  onLogout: () => void;
}

export default function TeacherLayout({ onLogout }: Props) {
  const [activePage, setActivePage] = useState("dashboard");
  const [enabledTabs, setEnabledTabs] = useState<string[] | null>(null);

  useEffect(() => {
    const plannerKeys = ["planners", "unit-test-planner", "exam-paper-planner"];
    void (async () => {
      const identity = getCurrentTeacher();

      if (!identity?.schoolUuid) {
        setEnabledTabs(Array.from(new Set([...TEACHER_FEATURES.map(feature => feature.key), ...plannerKeys])));
        return;
      }

      const keys = await getSchoolFeatureKeys(
        identity.schoolUuid,
        "teacher"
      );

      setEnabledTabs(Array.from(new Set([...keys, ...plannerKeys])));

      if (keys.length > 0 && !keys.includes(activePage)) {
        setActivePage(keys[0]);
      }
    })();
  }, []);

  if (enabledTabs === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F6FA", display: "grid", placeItems: "center", color: "#64748B", fontWeight: 700 }}>
        Loading Teacher Portal...
      </div>
    );
  }

  const activePageEnabled =
    enabledTabs.includes(activePage);

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
          enabledPages={enabledTabs}
        />

        <div className="teacher-layout-main">
          <TeacherHeader onLogout={onLogout} />

          <main className="teacher-layout-content">
            {/* School announcements and polls remain above the active teacher feature. */}
            <SchoolPostFeed audience="teacher" />

            {!activePageEnabled ? (
              <div style={{ padding: 32 }}>
                <div style={{ maxWidth: 680, margin: "0 auto", background: "white", border: "1px solid #E2E8F0", borderRadius: 20, padding: 32, boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#F97316", textTransform: "uppercase" }}>School Portal Configuration</div>
                  <h2 style={{ margin: "10px 0 8px", color: "#143B73" }}>Teacher modules are restricted</h2>
                  <p style={{ margin: 0, color: "#64748B", lineHeight: 1.6 }}>
                    Your school administrator has not enabled the selected Teacher Portal module. Please use one of the enabled modules from the sidebar.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activePage === "dashboard" && <TeacherHome />}
                {activePage === "daily-log" && <TeacherDailyLogPage />}
                {activePage === "teaching-journal" && <TeachingJournalPage />}
                {activePage === "my-classroom" && <MyClassroomPage />}
                {activePage === "exam-preparation" && <ExamPreparationPage />}
                {activePage === "planners" && <PlannersPage />}
                {activePage === "unit-test-planner" && <UnitTestPlannerPage />}
                {activePage === "exam-paper-planner" && <ExamPaperPlannerPage />}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
