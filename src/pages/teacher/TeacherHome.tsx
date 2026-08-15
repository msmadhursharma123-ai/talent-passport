import { useEffect, useState } from "react";

import {
  getCurrentTeacher,
} from "../../services/identityService";

import {
  getTeacherAssignmentsByTeacher,
} from "../../domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import type {
  TeacherAssignment,
} from "../../domains/teacherIntelligence/types/TeacherAssignment";

import type {
  TeacherDailyLog,
} from "../../domains/teacherIntelligence/types/TeacherDailyLog";

import {
  getTeacherDailyLogsByAssignments,
} from "../../domains/teacherIntelligence/repository/TeacherDailyLogRepository";

import {
  getLectureFeedbackRadarFast,
} from "../../domains/teacherIntelligence/repository/TeacherFeedbackAnalyticsRepository";



interface ClassroomDashboardData {

  classroom: string;

  latestTopic: string;

  studentsFilledFeedback: string;

  feedbackRemaining: number;

  completelyUnderstood: string;

  partiallyUnderstood: string;

  didNotUnderstand: string;

  classHealthScore: number;

  classHealthStatus: string;

  studentsRequiringAttention: string;

  mostDifficultConcept: string;

  studentsWhoDidNotUnderstand: string;

  teachingRecommendation: string;

}



export default function TeacherHome() {

  const [dashboardData, setDashboardData] =
    useState<ClassroomDashboardData[]>([]);

const [loading, setLoading] =
useState(true);

const [teacherAssignments,setTeacherAssignments] =
useState<TeacherAssignment[]>([]);

const [loadingClassrooms,setLoadingClassrooms] =
useState<string[]>([]);

const [teacherName, setTeacherName] =
useState("Teacher");

  useEffect(() => {

    loadDashboard();

  }, []);



 async function loadDashboard() {

  try {

    const teacher = getCurrentTeacher();

    if (!teacher) {
      setLoading(false);
      return;
    }

    setTeacherName(
      teacher.teacherName || "Teacher"
    );

    const assignments =
      await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

    /*
     =========================================================
     FAST FIRST PAINT
     ---------------------------------------------------------
     The old implementation waited for every classroom's
     daily-log query AND radar query before it rendered the
     classroom table.

     We now:
       1. Resolve assignments once.
       2. Render classroom columns immediately.
       3. Fetch all logs in one request.
       4. Build classroom groups.
       5. Calculate radars in parallel.

     This keeps the existing classroom-level behaviour while
     removing the serial N × (logs + radar) waterfall.
     =========================================================
    */

    const activeAssignments =
      assignments.filter(
        (assignment) =>
          assignment.isActive !== false
      );

    const classroomGroups =
      new Map<
        string,
        TeacherAssignment[]
      >();

    for (
      const assignment of activeAssignments
    ) {

      const classroom =
        `${assignment.className}-${assignment.sectionName}`;

      const group =
        classroomGroups.get(classroom) ?? [];

      group.push(assignment);

      classroomGroups.set(
        classroom,
        group
      );

    }

    const classroomEntries =
      Array.from(
        classroomGroups.entries()
      );

    const allAssignedClassrooms =
      classroomEntries.map(
        ([classroom]) => classroom
      );

    /*
     Render the classroom headers immediately.
     Metrics are allowed to arrive afterwards.
    */
    setTeacherAssignments(
      classroomEntries.map(
        ([, group]) => group[0]
      )
    );

    setLoadingClassrooms(
      allAssignedClassrooms
    );

    setDashboardData([]);

    /*
     The page shell/table can now paint without waiting
     for analytics.
    */
    setLoading(false);

    const assignmentIds =
      activeAssignments
        .map((assignment) => assignment.id)
        .filter(
          (id): id is string =>
            Boolean(id)
        );

    if (assignmentIds.length === 0) {
      return;
    }

    /*
     ONE database request for all teacher logs.
    */
    const allLogs =
      await getTeacherDailyLogsByAssignments(
        assignmentIds
      );

    const logsByAssignment =
      new Map<string, TeacherDailyLog[]>();

    for (const log of allLogs) {

      const assignmentId =
        log.teacherAssignmentUuid;

      const existing =
        logsByAssignment.get(
          assignmentId
        ) ?? [];

      existing.push(log);

      logsByAssignment.set(
        assignmentId,
        existing
      );

    }

    /*
     Keep the existing rule:
       - If at least one classroom has a log,
         show only classrooms that have been used.
       - If none has a log, keep all assigned classrooms.

     Unlike the old implementation, a classroom can now have
     multiple subject assignments and ANY of those assignments
     can make the classroom "used".
    */
    const usedEntries =
      classroomEntries.filter(
        ([, group]) =>
          group.some(
            (assignment) =>
              (logsByAssignment.get(
                assignment.id!
              ) ?? []).length > 0
          )
      );

    const entriesToAnalyse =
      usedEntries.length > 0
        ? usedEntries
        : classroomEntries;

    setTeacherAssignments(
      entriesToAnalyse.map(
        ([, group]) => group[0]
      )
    );

    const classroomNames =
      entriesToAnalyse.map(
        ([classroom]) => classroom
      );

    setLoadingClassrooms(
      classroomNames
    );

    /*
     Find the newest lecture across all subject
     assignments belonging to each classroom.
    */
    const radarJobs =
      entriesToAnalyse.map(
        async ([classroom, group]) => {

          const classroomLogs =
            group
              .flatMap(
                (assignment) =>
                  logsByAssignment.get(
                    assignment.id!
                  ) ?? []
              )
              .filter(
                (log) => Boolean(log.id)
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.logDate ||
                    b.createdAt ||
                    ""
                  ).getTime() -
                  new Date(
                    a.logDate ||
                    a.createdAt ||
                    ""
                  ).getTime()
              );

          if (
            classroomLogs.length === 0
          ) {
            return {
              classroom,
              data: null,
            };
          }

          const latestLecture =
            classroomLogs[0];

          try {

            const radar =
              await getLectureFeedbackRadarFast(
                latestLecture.id
              );

            return {
              classroom,
              latestLecture,
              radar,
            };

          } catch (error) {

            /*
             A single broken classroom must never
             blank the entire Teacher Home.
            */
            console.error(
              "TEACHER HOME CLASSROOM RADAR FAILED",
              classroom,
              error
            );

            return {
              classroom,
              latestLecture,
              radar: null,
            };

          }

        }
      );

    const radarResults =
      await Promise.all(
        radarJobs
      );

    const classroomData:
      ClassroomDashboardData[] = [];

    for (
      const result of radarResults
    ) {

      if (
        !result.radar ||
        !result.latestLecture
      ) {
        continue;
      }

      const radar =
        result.radar;

      const totalStudents =
        radar.totalStudents || 0;

      const percentageBase =
        totalStudents > 0
          ? totalStudents
          : 1;

      const completelyPercentage =
        Math.round(
          (
            radar.completelyUnderstood /
            percentageBase
          ) * 100
        );

      const partiallyPercentage =
        Math.round(
          (
            radar.partiallyUnderstood /
            percentageBase
          ) * 100
        );

      const didNotPercentage =
        Math.round(
          (
            radar.didNotUnderstand /
            percentageBase
          ) * 100
        );

      const difficultConcept =
        radar.commonConcepts?.length > 0
          ? radar.commonConcepts[0].concept
          : "-";

      const studentsAttention =
        radar.studentsRequiringAttention
          ?.length > 0
          ? radar.studentsRequiringAttention
              .map(
                (student: any) =>
                  student.studentName
              )
              .join(", ")
          : "-";

      const studentsNotUnderstood =
        radar.studentsRequiringAttention
          ?.length > 0
          ? radar.studentsRequiringAttention
              .filter(
                (student: any) =>
                  student
                    .understandingLevel
                    ?.toLowerCase()
                    .includes("did")
              )
              .map(
                (student: any) =>
                  student.studentName
              )
              .join(", ")
          : "-";

      classroomData.push({

        classroom:
          result.classroom,

        latestTopic:
          result.latestLecture.topicName,

        studentsFilledFeedback:
          `${
            radar.totalStudents -
            radar.pendingStudentsCount
          } / ${radar.totalStudents}`,

        feedbackRemaining:
          radar.pendingStudentsCount,

        completelyUnderstood:
          `${radar.completelyUnderstood} (${completelyPercentage}%)`,

        partiallyUnderstood:
          `${radar.partiallyUnderstood} (${partiallyPercentage}%)`,

        didNotUnderstand:
          `${radar.didNotUnderstand} (${didNotPercentage}%)`,

        classHealthScore:
          radar.classroomHealthScore.score,

        classHealthStatus:
          radar.classroomHealthScore.status,

        studentsRequiringAttention:
          studentsAttention,

        mostDifficultConcept:
          difficultConcept,

        studentsWhoDidNotUnderstand:
          studentsNotUnderstood,

        teachingRecommendation:
          radar.teachingRecommendation,

      });

    }

    setDashboardData(
      classroomData
    );

  }

  catch (error) {

    console.error(
      "TEACHER HOME DASHBOARD ERROR",
      error
    );

    /*
     Do not destroy already-rendered assignment
     headers if analytics fail.
    */

  }

}

const classroomColumns =
  teacherAssignments.map(
    (assignment) => ({
      classroom:
        `${assignment.className}-${assignment.sectionName}`,
    })
  );

  function getDashboardItem(
  classroom: string
) {

  return dashboardData.find(
    (item) =>
      item.classroom === classroom
  );

}

   return (
    <div
      className="teacher-home"
      style={{
        minHeight: "100vh",
        padding: "28px",
        background: `
          radial-gradient(
            circle at 94% 7%,
            rgba(249, 115, 22, 0.075) 0,
            rgba(249, 115, 22, 0.075) 120px,
            transparent 121px
          ),
          radial-gradient(
            circle at 8% 92%,
            rgba(37, 99, 235, 0.045) 0,
            rgba(37, 99, 235, 0.045) 150px,
            transparent 151px
          ),
          #F8FAFC
        `,
      }}
    >
      <style>{`
        /* MOBILE/TABLET ONLY. Desktop remains exactly as existing inline styles. */
        .teacher-home-swipe-cue { display: none; }

        @media (max-width: 1024px) {
          .teacher-home {
            padding: 16px !important;
            overflow-x: hidden !important;
          }

          .teacher-home-hero {
            padding: 20px 22px !important;
            margin-bottom: 16px !important;
            border-radius: 20px !important;
          }

          .teacher-home-hero-content {
            gap: 12px !important;
            align-items: center !important;
          }

          .teacher-home-hero-content > div:first-child {
            min-width: 0 !important;
            flex: 1 1 auto !important;
          }

          .teacher-home-hero-content > div:first-child > div:first-child {
            font-size: 8px !important;
            line-height: 1.15 !important;
            letter-spacing: 1.2px !important;
            margin-bottom: 5px !important;
          }

          .teacher-home-hero-content h1 {
            font-size: 22px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.3px !important;
          }

          .teacher-home-hero-content p {
            font-size: 11px !important;
            line-height: 1.35 !important;
            margin: 6px 0 0 !important;
          }

          .teacher-home-badge {
            width: 60px !important;
            height: 60px !important;
            border-radius: 15px !important;
          }

          .teacher-home-badge > div:first-child {
            font-size: 19px !important;
            margin-bottom: 1px !important;
          }

          .teacher-home-badge > div:last-child {
            font-size: 5px !important;
            line-height: 1.1 !important;
            letter-spacing: .5px !important;
          }

          .teacher-home-table-card {
            padding: 16px !important;
            border-radius: 20px !important;
          }

          .teacher-home-section-head {
            margin-bottom: 8px !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }

          .teacher-home-section-head > div:first-child > div:first-child {
            font-size: 8px !important;
            letter-spacing: 1.1px !important;
            margin-bottom: 3px !important;
          }

          .teacher-home-section-head h2 {
            font-size: 18px !important;
            line-height: 1.12 !important;
          }

          .teacher-home-section-head p {
            font-size: 10px !important;
            line-height: 1.3 !important;
            margin: 4px 0 0 !important;
          }

          .teacher-home-section-head > div:last-child {
            display: none !important;
          }

          .teacher-home-swipe-cue {
            display: block !important;
            font-size: 8px !important;
            line-height: 1.2 !important;
            font-weight: 800 !important;
            color: #9A3412 !important;
            background: #FFF7ED !important;
            border: 1px solid #FED7AA !important;
            border-radius: 8px !important;
            padding: 5px 7px !important;
            margin: 0 0 6px !important;
          }

          .teacher-home-table-scroll {
            border-radius: 11px !important;
            -webkit-overflow-scrolling: touch !important;
          }

          .teacher-home-table-scroll table {
            min-width: 620px !important;
          }

          .teacher-home-table-scroll th,
          .teacher-home-table-scroll td {
            padding: 6px 7px !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
          }

          .teacher-home-table-scroll th:first-child,
          .teacher-home-table-scroll td:first-child {
            width: 135px !important;
            min-width: 135px !important;
            max-width: 135px !important;
            position: sticky !important;
            left: 0 !important;
            z-index: 2 !important;
          }

          .teacher-home-table-scroll thead th:first-child {
            z-index: 3 !important;
          }

          .teacher-home-table-scroll th:not(:first-child) {
            min-width: 110px !important;
            font-size: 10px !important;
          }

          .teacher-home-table-card > div:last-child {
            gap: 5px !important;
            margin-top: 8px !important;
          }

          .teacher-home-table-card > div:last-child > div {
            padding: 4px 7px !important;
            gap: 4px !important;
            font-size: 8px !important;
          }

          .teacher-home-plan {
            margin-top: 16px !important;
            padding: 17px !important;
            border-radius: 20px !important;
          }

          .teacher-home-plan > div:last-child > div:first-child {
            font-size: 8px !important;
            letter-spacing: 1.1px !important;
            margin-bottom: 3px !important;
          }

          .teacher-home-plan h2 {
            font-size: 18px !important;
            line-height: 1.12 !important;
          }

          .teacher-home-plan p {
            font-size: 10px !important;
            line-height: 1.3 !important;
            margin: 4px 0 9px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 7px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div {
            min-width: 0 !important;
            padding: 9px !important;
            border-radius: 11px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div > div:first-child {
            font-size: 8px !important;
            margin-bottom: 3px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div > div:last-child {
            font-size: 9px !important;
            line-height: 1.25 !important;
          }
        }

        @media (max-width: 600px) {
          .teacher-home {
            padding: 12px !important;
          }

          .teacher-home-hero {
            padding: 15px 16px !important;
            margin-bottom: 12px !important;
            border-radius: 16px !important;
          }

          .teacher-home-hero-content {
            gap: 7px !important;
          }

          .teacher-home-hero-content > div:first-child > div:first-child {
            font-size: 6px !important;
            letter-spacing: .8px !important;
            margin-bottom: 3px !important;
          }

          .teacher-home-hero-content h1 {
            font-size: 18px !important;
            line-height: 1.08 !important;
          }

          .teacher-home-hero-content p {
            font-size: 9px !important;
            line-height: 1.3 !important;
            margin-top: 5px !important;
          }

          .teacher-home-badge {
            width: 48px !important;
            height: 48px !important;
            border-radius: 12px !important;
          }

          .teacher-home-badge > div:first-child {
            font-size: 13px !important;
            margin-bottom: 0 !important;
          }

          .teacher-home-badge > div:last-child {
            font-size: 3.7px !important;
            line-height: 1 !important;
            letter-spacing: .25px !important;
          }

          .teacher-home-table-card {
            padding: 12px !important;
            border-radius: 16px !important;
          }

          .teacher-home-section-head {
            margin-bottom: 5px !important;
          }

          .teacher-home-section-head > div:first-child > div:first-child {
            font-size: 6px !important;
            letter-spacing: .8px !important;
            margin-bottom: 2px !important;
          }

          .teacher-home-section-head h2 {
            font-size: 15px !important;
            line-height: 1.1 !important;
          }

          .teacher-home-section-head p {
            font-size: 8.5px !important;
            line-height: 1.28 !important;
            margin-top: 3px !important;
          }

          .teacher-home-swipe-cue {
            font-size: 6.5px !important;
            padding: 4px 6px !important;
            margin-bottom: 4px !important;
          }

          .teacher-home-table-scroll {
            border-radius: 9px !important;
          }

          .teacher-home-table-scroll table {
            min-width: 500px !important;
          }

          .teacher-home-table-scroll th,
          .teacher-home-table-scroll td {
            padding: 6px 6px !important;
            font-size: 7.8px !important;
            line-height: 1.15 !important;
          }

          .teacher-home-table-scroll th:first-child,
          .teacher-home-table-scroll td:first-child {
            width: 108px !important;
            min-width: 108px !important;
            max-width: 108px !important;
          }

          .teacher-home-table-scroll th:not(:first-child) {
            min-width: 88px !important;
            font-size: 8px !important;
          }

          .teacher-home-table-card > div:last-child {
            margin-top: 5px !important;
            gap: 3px !important;
          }

          .teacher-home-table-card > div:last-child > div {
            padding: 3px 5px !important;
            font-size: 6px !important;
          }

          .teacher-home-plan {
            margin-top: 12px !important;
            padding: 13px !important;
            border-radius: 16px !important;
          }

          .teacher-home-plan > div:last-child > div:first-child {
            font-size: 6px !important;
            letter-spacing: .8px !important;
            margin-bottom: 2px !important;
          }

          .teacher-home-plan h2 {
            font-size: 15px !important;
            line-height: 1.1 !important;
          }

          .teacher-home-plan p {
            font-size: 8.5px !important;
            line-height: 1.28 !important;
            margin: 3px 0 9px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 5px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div {
            padding: 9px !important;
            border-radius: 10px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div > div:first-child {
            font-size: 6.5px !important;
            margin-bottom: 2px !important;
          }

          .teacher-home-plan > div:last-child > div:last-child > div > div:last-child {
            font-size: 8px !important;
            line-height: 1.22 !important;
          }
        }
      `}</style>

      {/* ======================================================
          CLASSROOM INTELLIGENCE HERO
         ====================================================== */}

      <div
        className="teacher-home-hero"
        style={{
          position: "relative",
          overflow: "hidden",

          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 72%, #FFF7ED 100%)",

          border: "1px solid #E2E8F0",
          borderRadius: "28px",

          padding: "34px 38px",
          marginBottom: "24px",

          boxShadow:
            "0 12px 32px rgba(15, 23, 42, 0.055)",
        }}
      >
        {/* Decorative orange circle */}

        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.055)",
            right: -60,
            top: -105,
            pointerEvents: "none",
          }}
        />

        {/* Decorative small circle */}

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.04)",
            right: 190,
            top: -55,
            pointerEvents: "none",
          }}
        />

        {/* Decorative blue circle */}

        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.035)",
            right: 245,
            bottom: -115,
            pointerEvents: "none",
          }}
        />

        <div
          className="teacher-home-hero-content"
          style={{
            position: "relative",
            zIndex: 1,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "30px",
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "2.2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              CLASSROOM INTELLIGENCE OVERVIEW
            </div>

        <h1
style={{
    margin: 0,
    color: "#0F172A",
    fontSize: "34px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.7px",
}}
>
Welcome Back, {teacherName}!
</h1>

            <p
              style={{
                color: "#64748B",
                margin: "13px 0 0",
                fontSize: "19px",
                fontWeight: 500,
                lineHeight: 1.65,
              }}
            >
              Here is your classroom intelligence summary for yesterday&apos;s
              latest lecture.
            </p>
          </div>

          {/* Hero badge */}

          <div
            className="teacher-home-badge"
            style={{
              width: "106px",
              height: "106px",
              flexShrink: 0,

              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",

              background:
                "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

              border: "1px solid #FED7AA",
              borderRadius: "26px",

              boxShadow:
                "0 10px 24px rgba(249, 115, 22, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "33px",
                marginBottom: "7px",
              }}
            >
              📊
            </div>

            <div
              style={{
                color: "#F97316",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1.3px",
                textAlign: "center",
              }}
            >
              CLASSROOM
              <br />
              INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          LOADING
         ====================================================== */}

      {loading && (
        <div
          style={{
            marginBottom: "18px",

            display: "inline-flex",
            alignItems: "center",
            gap: "9px",

            padding: "9px 14px",

            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            borderRadius: "999px",

            color: "#C2410C",

            fontSize: "15px",
            fontWeight: 800,
            letterSpacing: "0.4px",
          }}
        >
          <span>●</span>
          Loading All Metrics...
        </div>
      )}

      {/* ======================================================
          CLASSROOM INTELLIGENCE TABLE
         ====================================================== */}

      <div
        className="teacher-home-table-card"
        style={{
          background: "#FFFFFF",

          padding: "24px",

          borderRadius: "26px",
          border: "1px solid #E2E8F0",

          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.05)",

          overflow: "hidden",
        }}
      >
        {/* Section title */}

        <div
          className="teacher-home-section-head"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",

            marginBottom: "22px",
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                marginBottom: "7px",
              }}
            >
              CLASSROOM PERFORMANCE
            </div>

            <h2
              style={{
                margin: 0,

                color: "#0F172A",

                fontSize: "25px",
                fontWeight: 800,
                letterSpacing: "-0.3px",
              }}
            >
              Classroom Intelligence Summary
            </h2>

            <p
              style={{
                margin: "7px 0 0",

                color: "#64748B",

                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              Compare learning response and classroom health across your active
              classes.
            </p>
          </div>

          <div
            style={{
              color: "#94A3B8",

              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "1.3px",

              whiteSpace: "nowrap",
            }}
          >
            ACADEMIC INTELLIGENCE LEDGER
          </div>
        </div>

        {/* TABLE */}

        <div className="teacher-home-swipe-cue">Swipe left or right to compare classrooms →</div>

        <div
          className="teacher-home-table-scroll"
          style={{
            overflowX: "auto",

            border: "1px solid #E2E8F0",
            borderRadius: "18px",

            background: "#FFFFFF",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "16px 18px",

                    background:
                      "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)",

                    color: "#C2410C",

                    fontWeight: 800,
                    fontSize: "10px",
                    letterSpacing: "1px",

                    textAlign: "left",

                    borderBottom: "1px solid #E2E8F0",
                    borderRight: "1px solid #E2E8F0",

                    minWidth: "235px",
                  }}
                >
                  METRICS
                </th>

                {classroomColumns.map(
                  (item: any, index) => (
                    <th
                      key={item.classroom}
                      style={{
                        ...tableHeaderStyle,

                        background:
                          index % 4 === 0
                            ? "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)"
                            : index % 4 === 1
                            ? "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)"
                            : index % 4 === 2
                            ? "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)"
                            : "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",

                        color:
                          index % 4 === 0
                            ? "#C2410C"
                            : index % 4 === 1
                            ? "#1D4ED8"
                            : index % 4 === 2
                            ? "#15803D"
                            : "#7C3AED",
                      }}
                    >
                      {item.classroom}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {renderTableRow(
                "Latest Topic",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.latestTopic ?? "-"
                )
              )}

              {renderTableRow(
                "Students Filled Feedback",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.studentsFilledFeedback ??
                    "-"
                )
              )}

              {renderTableRow(
                "Feedback Remaining",

                classroomColumns.map(
                  (item) => {
                    const data =
                      getDashboardItem(
                        item.classroom
                      );

                    return data
                      ? String(
                          data.feedbackRemaining
                        )
                      : "-";
                  }
                )
              )}

              {renderTableRow(
                "Completely Understood",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.completelyUnderstood ??
                    "-"
                )
              )}

              {renderTableRow(
                "Partially Understood",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.partiallyUnderstood ??
                    "-"
                )
              )}

              {renderTableRow(
                "Didn't Understand",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.didNotUnderstand ?? "-"
                )
              )}

              {renderTableRow(
                "Class Health Score",

                classroomColumns.map(
                  (item) => {
                    const data =
                      getDashboardItem(
                        item.classroom
                      );

                    if (
                      !data ||
                      data.classHealthStatus ===
                        "No Data"
                    ) {
                      return "-";
                    }

                    return `${data.classHealthScore} /100 — ${data.classHealthStatus}`;
                  }
                )
              )}

              {renderTableRow(
                "Most Difficult Concept",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )?.mostDifficultConcept ??
                    "-"
                )
              )}

              {renderTableRow(
                "Students Requiring Attention",

                classroomColumns.map(
                  (item) =>
                    getDashboardItem(
                      item.classroom
                    )
                      ?.studentsRequiringAttention ??
                    "-"
                )
              )}
            </tbody>
          </table>
        </div>

        {/* HEALTH LEGEND */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",

            marginTop: "18px",

            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              ...legendPillStyle,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#15803D",
            }}
          >
            <span>●</span>
            Good (70-100)
          </div>

          <div
            style={{
              ...legendPillStyle,
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#B45309",
            }}
          >
            <span>●</span>
            Average (40-69)
          </div>

          <div
            style={{
              ...legendPillStyle,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
            }}
          >
            <span>●</span>
            Needs Attention (0-39)
          </div>
        </div>
      </div>

      {/* ======================================================
          TOMORROW'S TEACHING PLAN
         ====================================================== */}

      <div
        className="teacher-home-plan"
        style={{
          position: "relative",
          overflow: "hidden",

          marginTop: "24px",

          background:
            "linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 72%, #FFF7ED 100%)",

          padding: "26px",

          borderRadius: "26px",
          border: "1px solid #FED7AA",

          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.045)",
        }}
      >
        {/* Decoration */}

        <div
          style={{
            position: "absolute",

            width: "150px",
            height: "150px",

            borderRadius: "50%",

            background:
              "rgba(249, 115, 22, 0.045)",

            right: "-40px",
            top: "-70px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: "#F97316",

              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "1.8px",

              marginBottom: "7px",
            }}
          >
            NEXT CLASS PREPARATION
          </div>

          <h2
            style={{
              margin: 0,

              color: "#0F172A",

              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.3px",
            }}
          >
            Tomorrow&apos;s Teaching Plan
          </h2>

          <p
            style={{
              margin: "7px 0 20px",

              color: "#64748B",

              fontSize: "16px",
              lineHeight: 1.5,
            }}
          >
            Classroom recommendations generated from the latest learning
            response.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
            }}
          >
            {dashboardData.map(
              (item) => (
                <div
                  key={item.classroom}
                  style={{
                    padding: "17px 18px",

                    background:
                      "rgba(255, 255, 255, 0.86)",

                    border:
                      "1px solid #FFEDD5",

                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#F97316",

                      fontSize: "13px",
                      fontWeight: 800,
                      letterSpacing:
                        "1.1px",

                      marginBottom: "7px",
                    }}
                  >
                    {item.classroom}
                  </div>

                  <div
                    style={{
                      color: "#334155",

                      fontSize: "17px",
                      fontWeight: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    {
                      item.teachingRecommendation
                    }
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE STYLES
   ============================================================ */

const tableHeaderStyle = {
  padding: "16px 18px",

  color: "#0F172A",

  fontWeight: 800,
  fontSize: "20px",

  textAlign: "center" as const,

  borderBottom: "1px solid #E2E8F0",
  borderRight: "1px solid #E2E8F0",

  minWidth: "210px",
};

const metricColumnStyle = {
  padding: "14px 18px",

  fontWeight: 700,

  background: "#FFFFFF",

  color: "#334155",

  fontSize: "16px",

  borderBottom: "1px solid #EEF2F7",
  borderRight: "1px solid #E2E8F0",

  width: "235px",

  textAlign: "left" as const,

  verticalAlign: "middle" as const,
};

const tableCellStyle = {
  padding: "14px 18px",

  borderBottom: "1px solid #EEF2F7",
  borderRight: "1px solid #EEF2F7",

  textAlign: "center" as const,

  color: "#475569",

  fontSize: "16px",

  verticalAlign: "middle" as const,

  lineHeight: 1.5,

  background: "#FFFFFF",
};

const legendPillStyle = {
  display: "inline-flex",

  alignItems: "center",

  gap: "7px",

  padding: "7px 11px",

  borderRadius: "999px",

  fontSize: "14px",

  fontWeight: 700,
};

/* ============================================================
   TABLE ROW
   ============================================================ */

function renderTableRow(
  metricName: string,
  values: string[]
) {
  return (
    <tr>
      <td style={metricColumnStyle}>
        {metricName === "Latest Topic"
          ? "📖 Latest Topic"
          : metricName ===
            "Students Filled Feedback"
          ? "👥 Students Response"
          : metricName ===
            "Feedback Remaining"
          ? "⏳ Feedback Remaining"
          : metricName ===
            "Completely Understood"
          ? "😊 Understood"
          : metricName ===
            "Partially Understood"
          ? "😐 Partially Understood"
          : metricName ===
            "Didn't Understand"
          ? "☹️ Didn't Understand"
          : metricName ===
            "Class Health Score"
          ? "🛡️ Class Health Score"
          : metricName ===
            "Most Difficult Concept"
          ? "⚠️ Most Difficult Concept"
          : metricName ===
            "Students Requiring Attention"
          ? "👤 Students Requiring Attention"
          : metricName}
      </td>

      {values.map(
        (value, index) => (
          <td
            key={index}
            style={{
              ...tableCellStyle,

              color:
                metricName ===
                "Completely Understood"
                  ? "#16A34A"
                  : metricName ===
                    "Partially Understood"
                  ? "#D97706"
                  : metricName ===
                    "Didn't Understand"
                  ? "#DC2626"
                  : metricName ===
                    "Most Difficult Concept"
                  ? "#1D4ED8"
                  : metricName ===
                    "Students Requiring Attention"
                  ? "#DC2626"
                  : "#475569",

              fontWeight:
                metricName ===
                  "Completely Understood" ||
                metricName ===
                  "Partially Understood" ||
                metricName ===
                  "Didn't Understand"
                  ? 800
                  : 500,
            }}
          >
            {value || "-"}
          </td>
        )
      )}
    </tr>
  );
}

/* ============================================================
   HEALTH SCORE ROW
   Kept because it exists in the current build.
   ============================================================ */

function renderHealthScoreRow(
  dashboardData: ClassroomDashboardData[]
) {
  return (
    <tr>
      <td style={metricColumnStyle}>
        🛡️ Class Health Score
      </td>

      {dashboardData.map(
        (item, index) => (
          <td
            key={index}
            style={tableCellStyle}
          >
            <div
              style={{
                fontSize: "23px",
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {item.classHealthScore}

              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#64748B",
                }}
              >
                {" "}
                /100
              </span>
            </div>

            <div
              style={{
                marginTop: "9px",

                display: "inline-block",

                padding: "5px 10px",

                borderRadius: "999px",

                fontWeight: 800,
                fontSize: "13px",

                background: item.classHealthStatus
                  .toLowerCase()
                  .includes("good")
                  ? "#DCFCE7"
                  : item.classHealthStatus
                      .toLowerCase()
                      .includes("average")
                  ? "#FEF3C7"
                  : "#FEE2E2",

                color: item.classHealthStatus
                  .toLowerCase()
                  .includes("good")
                  ? "#15803D"
                  : item.classHealthStatus
                      .toLowerCase()
                      .includes("average")
                  ? "#B45309"
                  : "#DC2626",
              }}
            >
              {item.classHealthStatus}



</div>
          </td>
        )
      )}
    </tr>
  );
}