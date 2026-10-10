import { useEffect, useState } from "react";

import {
  getCurrentTeacher,
} from "../../../services/identityService";

import {
  getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import {
  getTeacherDailyLogsByAssignments,
} from "../repository/TeacherDailyLogRepository";

import {
  getTeacherPendingDoubtLedger,
} from "../repository/TeacherPendingDoubtRepository";

const tableHeaderStyle = {
  padding: "16px 18px",

  color: "#0F172A",

  fontWeight: 800,

  fontSize: "17px",

  textAlign: "center" as const,

  borderBottom:
    "1px solid #E2E8F0",

  borderRight:
    "1px solid #E2E8F0",

  minWidth: "210px",
};


const metricColumnStyle = {
  padding: "14px 18px",

  fontWeight: 700,

  background: "#FFFFFF",

  color: "#334155",

  fontSize: "13px",

  borderBottom:
    "1px solid #EEF2F7",

  borderRight:
    "1px solid #E2E8F0",

  width: "320px",

  minWidth: "320px",

  textAlign: "left" as const,

  verticalAlign: "middle" as const,
};


const tableCellStyle = {
  padding: "14px 18px",

  borderBottom:
    "1px solid #EEF2F7",

  borderRight:
    "1px solid #EEF2F7",

  textAlign: "center" as const,

  color: "#475569",

  fontSize: "13px",

  verticalAlign: "middle" as const,

  lineHeight: 1.5,

  background: "#FFFFFF",
};

export default function TeacherPendingDoubtLedger() {
  const [doubtLedgerClassrooms, setDoubtLedgerClassrooms] = useState<string[]>([]);
  const [pendingDoubtLoading, setPendingDoubtLoading] = useState(true);
  const [pendingDoubts, setPendingDoubts] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
    loadPendingDoubtLedger();
  }, []);

  async function fetchLogs() {
    try {
      const teacher = getCurrentTeacher();

      if (!teacher) {
        setDoubtLedgerClassrooms([]);
        return;
      }

      const assignments = await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

      const allAssignedClassrooms = Array.from(
        new Set(
          assignments
            .map(
              (assignment) =>
                `${assignment.className}-${assignment.sectionName}`
            )
            .filter(Boolean)
        )
      );

      const assignmentIds = assignments
        .map((assignment) => assignment.id)
        .filter((id): id is string => Boolean(id));

      if (assignmentIds.length === 0) {
        setDoubtLedgerClassrooms(allAssignedClassrooms);
        return;
      }

      const allHistoricalLogs = await getTeacherDailyLogsByAssignments(
        assignmentIds
      );

      const usedClassrooms = new Set<string>();

      allHistoricalLogs.forEach((log: any) => {
        if (log.className && log.sectionName) {
          usedClassrooms.add(`${log.className}-${log.sectionName}`);
        }
      });

      const currentPendingDoubts = await getTeacherPendingDoubtLedger();

      currentPendingDoubts.forEach((item: any) => {
        if (item.classroom) {
          usedClassrooms.add(item.classroom);
        }
      });

      setDoubtLedgerClassrooms(
        usedClassrooms.size === 0
          ? allAssignedClassrooms
          : Array.from(usedClassrooms)
      );
    } catch (error) {
      console.error("DAILY LOG PAGE LOAD ERROR", error);
    }
  }

  async function loadPendingDoubtLedger() {
    setPendingDoubtLoading(true);

    try {
      const data = await getTeacherPendingDoubtLedger();
      setPendingDoubts(data);
    } finally {
      setPendingDoubtLoading(false);
    }
  }

  return (
    <div className="tp-pending-doubt-root">
      {/* ======================================================
          SESSION BEYOND THE CLASSROOM
         ====================================================== */}

      <div
        className="tp-doubt-card"
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
        {/* Doubt ledger heading */}

        <div
          className="tp-doubt-heading"
          style={{
            position: "relative",
            overflow: "hidden",

            background:
              "linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 72%, #FFF7ED 100%)",

            border:
              "1px solid #FED7AA",

            borderRadius: "20px",

            padding: "22px 24px",

            marginBottom: "22px",
          }}
        >
          <div
            style={{
              position: "absolute",

              width: "120px",
              height: "120px",

              borderRadius: "50%",

              background:
                "rgba(249, 115, 22, 0.05)",

              right: "-25px",
              top: "-60px",

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

                fontSize: "10px",
                fontWeight: 800,

                letterSpacing: "1.8px",

                marginBottom: "7px",
              }}
            >
              SESSION BEYOND THE CLASSROOM
            </div>

            <h2
              style={{
                margin: 0,

                color: "#0F172A",

                fontSize: "21px",
                fontWeight: 800,

                letterSpacing: "-0.3px",
              }}
            >
              ❌ Day Before Yesterday's Not discussed Doubt Ledger ❌
            </h2>

            <p
              style={{
                margin: "8px 0 0",

                color: "#64748B",

                fontSize: "13px",
                lineHeight: 1.6,

                maxWidth: "850px",
              }}
            >
              These are the difficult concepts that students reported were NOT
              revised during the next classroom lecture.
            </p>
          </div>
        </div>

        {/* TABLE */}

        <div
          className="tp-doubt-table"
          style={{
            overflowX: "auto",

            border:
              "1px solid #E2E8F0",

            borderRadius: "18px",

            background: "#FFFFFF",
          }}
        >
          {pendingDoubtLoading ? (
            <table
              style={{
                width: "100%",

                borderCollapse:
                  "separate",

                borderSpacing: 0,

                minWidth: "950px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding:
                        "16px 18px",

                      background:
                        "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)",

                      color:
                        "#C2410C",

                      fontWeight:
                        800,

                      fontSize:
                        "12px",

                      letterSpacing:
                        "1px",

                      textAlign:
                        "left",

                      borderBottom:
                        "1px solid #E2E8F0",

                      borderRight:
                        "1px solid #E2E8F0",

                      minWidth:
                        "320px",
                    }}
                  >
                    METRICS
                  </th>

                  {doubtLedgerClassrooms.map(
                    (
                      classroom,
                      index
                    ) => (
                      <th
                        key={
                          classroom
                        }
                        style={{
                          ...tableHeaderStyle,

                          background:
                            index %
                              4 ===
                            0
                              ? "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)"
                              : index %
                                  4 ===
                                1
                              ? "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)"
                              : index %
                                  4 ===
                                2
                              ? "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)"
                              : "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",

                          color:
                            index %
                              4 ===
                            0
                              ? "#C2410C"
                              : index %
                                  4 ===
                                1
                              ? "#1D4ED8"
                              : index %
                                  4 ===
                                2
                              ? "#15803D"
                              : "#7C3AED",
                        }}
                      >
                        {classroom}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {renderPendingDoubtRow(
                  "Students Count who had Doubt",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}

                {renderPendingDoubtRow(
                  "Topic that was taught that day",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}

                {renderPendingDoubtRow(
                  "Most difficult common subtopic from that topic",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}

                {renderPendingDoubtRow(
                  "Students Are",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}

                {renderPendingDoubtRow(
                  "Date of this discussion",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}

                {renderPendingDoubtRow(
                  "Status",
                  doubtLedgerClassrooms.map(
                    () => "-"
                  )
                )}
              </tbody>
            </table>
          ) : (
            <table
              style={{
                width: "100%",

                borderCollapse:
                  "separate",

                borderSpacing: 0,

                minWidth: "950px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding:
                        "16px 18px",

                      background:
                        "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)",

                      color:
                        "#C2410C",

                      fontWeight:
                        800,

                      fontSize:
                        "12px",

                      letterSpacing:
                        "1px",

                      textAlign:
                        "left",

                      borderBottom:
                        "1px solid #E2E8F0",

                      borderRight:
                        "1px solid #E2E8F0",

                      minWidth:
                        "320px",
                    }}
                  >
                    METRICS
                  </th>

                  {doubtLedgerClassrooms.map(
                    (
                      classroom,
                      index
                    ) => (
                      <th
                        key={
                          classroom
                        }
                        style={{
                          ...tableHeaderStyle,

                          background:
                            index %
                              4 ===
                            0
                              ? "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)"
                              : index %
                                  4 ===
                                1
                              ? "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)"
                              : index %
                                  4 ===
                                2
                              ? "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)"
                              : "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",

                          color:
                            index %
                              4 ===
                            0
                              ? "#C2410C"
                              : index %
                                  4 ===
                                1
                              ? "#1D4ED8"
                              : index %
                                  4 ===
                                2
                              ? "#15803D"
                              : "#7C3AED",
                        }}
                      >
                        {classroom}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {renderPendingDoubtRow(
                  "Students Count who had Doubt",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return item
                        ? String(
                            item.pendingCount
                          )
                        : "-";
                    }
                  )
                )}

                {renderPendingDoubtRow(
                  "Topic that was taught that day",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return (
                        item?.previousTopic ??
                        "-"
                      );
                    }
                  )
                )}

                {renderPendingDoubtRow(
                  "Most Difficult Concept from that topic",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return (
                        item?.difficultConcept ??
                        "-"
                      );
                    }
                  )
                )}

                {renderPendingDoubtRow(
                  "Students Are",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return (
                        item?.students ??
                        "-"
                      );
                    }
                  )
                )}

                {renderPendingDoubtRow(
                  "Date of this discussion",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return (
                        item?.logDate ??
                        "-"
                      );
                    }
                  )
                )}

                {renderPendingDoubtRow(
                  "Status",

                  doubtLedgerClassrooms.map(
                    (classroom) => {
                      const item = pendingDoubts.find(
                        (row: any) => row.classroom === classroom
                      );

                      return (
                        item?.status ??
                        "-"
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
@media (max-width: 1024px) {
  .tp-pending-doubt-root .tp-doubt-card { padding: 16px !important; margin-bottom: 16px !important; border-radius: 20px !important; }
  .tp-pending-doubt-root .tp-doubt-heading > div:last-child > div:first-child { font-size: 8px !important; letter-spacing: 1.1px !important; margin-bottom: 3px !important; }
  .tp-pending-doubt-root .tp-doubt-card h2 { font-size: 18px !important; line-height: 1.12 !important; }
  .tp-pending-doubt-root .tp-doubt-card p { font-size: 10px !important; line-height: 1.3 !important; margin-top: 4px !important; }
  .tp-pending-doubt-root .tp-doubt-heading { padding: 13px 14px !important; margin-bottom: 10px !important; border-radius: 14px !important; }
  .tp-pending-doubt-root .tp-doubt-table { border-radius: 11px !important; -webkit-overflow-scrolling: touch; }
  .tp-pending-doubt-root .tp-doubt-table table { min-width: 590px !important; }
  .tp-pending-doubt-root .tp-doubt-table th, .tp-pending-doubt-root .tp-doubt-table td { padding: 5px 6px !important; font-size: 8.5px !important; line-height: 1.18 !important; }
  .tp-pending-doubt-root .tp-doubt-table th:first-child, .tp-pending-doubt-root .tp-doubt-table td:first-child { width: 126px !important; min-width: 126px !important; max-width: 126px !important; position: sticky; left: 0; z-index: 2; }
  .tp-pending-doubt-root .tp-doubt-table thead th:first-child { z-index: 3; }
  .tp-pending-doubt-root .tp-doubt-table th:not(:first-child) { min-width: 104px !important; font-size: 9.5px !important; }
}
@media (max-width: 600px) {
  .tp-pending-doubt-root .tp-doubt-card { padding: 12px !important; margin-bottom: 12px !important; border-radius: 16px !important; }
  .tp-pending-doubt-root .tp-doubt-card h2 { font-size: 15px !important; }
  .tp-pending-doubt-root .tp-doubt-card p { font-size: 8.5px !important; line-height: 1.3 !important; }
  .tp-pending-doubt-root .tp-doubt-heading { padding: 10px 11px !important; margin-bottom: 8px !important; border-radius: 12px !important; }
  .tp-pending-doubt-root .tp-doubt-table table { min-width: 560px !important; }
  .tp-pending-doubt-root .tp-doubt-table th, .tp-pending-doubt-root .tp-doubt-table td { padding: 5px !important; font-size: 8px !important; }
  .tp-pending-doubt-root .tp-doubt-table th:first-child, .tp-pending-doubt-root .tp-doubt-table td:first-child { width: 120px !important; min-width: 120px !important; max-width: 120px !important; }
  .tp-pending-doubt-root .tp-doubt-table th:not(:first-child) { min-width: 100px !important; font-size: 9px !important; }
}
`}</style>
    </div>
  );
}

function renderPendingDoubtRow(
  metricName: string,
  values: string[]
) {
  return (
    <tr>
      <td style={metricColumnStyle}>
        {metricName}
      </td>

      {values.map((value, index) => (
        <td
          key={index}
          style={{
            ...tableCellStyle,

            color:
              metricName.includes("Count")
                ? "#EF4444"
                : metricName.includes("Difficult")
                ? "#1E3A8A"
                : metricName === "Students Are"
                ? "#DC2626"
                : metricName === "Status"
                ? "#F59E0B"
                : "#334155",

            fontWeight:
              metricName.includes("Count") ||
              metricName.includes("Difficult")
                ? 700
                : 500,
          }}
        >
          {value || "-"}
        </td>
      ))}
    </tr>
  );
}
