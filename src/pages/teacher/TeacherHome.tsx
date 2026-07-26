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

import {
  getTeacherDailyLogsByAssignment,
} from "../../domains/teacherIntelligence/repository/TeacherDailyLogRepository";

import {
  getLectureFeedbackRadar,
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

const teacher =
getCurrentTeacher();

if (!teacher) {
    return;
}

setTeacherName(
    teacher.teacherName || "Teacher"
);

    const assignments =
      await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

    /* ==========================================
       DEDUPLICATE CLASS + SECTION ASSIGNMENTS
       ========================================== */

    const uniqueAssignments =
      assignments.filter(
        (assignment, index, array) => {

          const classroom =
            `${assignment.className}-${assignment.sectionName}`;

          return (
            array.findIndex(
              (item) =>
                `${item.className}-${item.sectionName}` ===
                classroom
            ) === index
          );

        }
      );

    const classroomData:
      ClassroomDashboardData[] = [];

    const allAssignedClassrooms =
      uniqueAssignments.map(
        (assignment) =>
          `${assignment.className}-${assignment.sectionName}`
      );

    const usedClassrooms: string[] = [];

    /* ==========================================
       CHECK EACH ASSIGNED CLASSROOM
       ========================================== */

    for (
      const assignment
      of uniqueAssignments
    ) {

      const classroom =
        `${assignment.className}-${assignment.sectionName}`;

      const logs =
        await getTeacherDailyLogsByAssignment(
          assignment.id!
        );

      /* ========================================
         NO DAILY LOG FOR THIS CLASSROOM

         Do NOT create dashboard analytics here.

         If the teacher has never used Daily Log
         anywhere, we will fall back to ALL
         assigned classrooms after this loop.
         ======================================== */

      if (logs.length === 0) {
        continue;
      }

      /* ========================================
         THIS CLASSROOM HAS BEEN USED
         ======================================== */

      usedClassrooms.push(
        classroom
      );

      const latestLecture =
        logs[0];

      const radar =
        await getLectureFeedbackRadar(
          latestLecture.id
        );

      const totalStudents =
        radar.totalStudents || 1;

      const completelyPercentage =
        Math.round(
          (
            radar.completelyUnderstood /
            totalStudents
          ) * 100
        );

      const partiallyPercentage =
        Math.round(
          (
            radar.partiallyUnderstood /
            totalStudents
          ) * 100
        );

      const didNotPercentage =
        Math.round(
          (
            radar.didNotUnderstand /
            totalStudents
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

        classroom,

        latestTopic:
          latestLecture.topicName,

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

    /* ==========================================
       FINAL DASHBOARD CLASSROOM RULE

       ZERO used classrooms:
       → New teacher
       → Show every assigned classroom

       ONE OR MORE used classrooms:
       → Active teacher
       → Show only classrooms with Daily Logs
       ========================================== */

    if (usedClassrooms.length === 0) {

      setTeacherAssignments(
        uniqueAssignments
      );

      setLoadingClassrooms(
        allAssignedClassrooms
      );

    } else {

      const usedAssignments =
        uniqueAssignments.filter(
          (assignment) => {

            const classroom =
              `${assignment.className}-${assignment.sectionName}`;

            return usedClassrooms.includes(
              classroom
            );

          }
        );

      setTeacherAssignments(
        usedAssignments
      );

      setLoadingClassrooms(
        usedClassrooms
      );

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

  }

  finally {

    setLoading(false);

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
      {/* ======================================================
          CLASSROOM INTELLIGENCE HERO
         ====================================================== */}

      <div
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

        <div
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