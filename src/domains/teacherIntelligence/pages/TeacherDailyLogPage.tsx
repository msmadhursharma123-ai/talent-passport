import { useState, useEffect } from "react";

import TeacherDailyLogDialog from "../dialogs/TeacherDailyLogDialog";

import {
  saveTeacherDailyLog,
} from "../viewmodels/TeacherDailyLogViewModel";

import { getCurrentTeacher }
from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import {
loadTodaysTeacherLogsByAssignment,
} from "../viewmodels/TeacherDailyLogViewModel";

import {
  getTeacherDailyLogsByAssignments,
} from "../repository/TeacherDailyLogRepository";

function getIndiaCalendarDateKey(value?: unknown): string {
  const source = value === undefined ? new Date() : value;
  const parsed = source instanceof Date ? source : new Date(String(source));
  if (Number.isNaN(parsed.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function toIndiaCalendarDateKey(value?: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return getIndiaCalendarDateKey(raw);
}

export default function TeacherDailyLogPage() {
  const [openDialog, setOpenDialog] =
    useState(false);

  const [isPublishing, setIsPublishing] =
    useState(false);

  const [logs, setLogs] = useState<any[]>([]);

const [logsLoading, setLogsLoading] =
useState(true);

useEffect(() => {

fetchLogs();

}, []);

async function fetchLogs() {
  setLogsLoading(true);

  try {
    const teacher = getCurrentTeacher();

    if (!teacher) {
      setLogs([]);
      return;
    }

    const assignments =
      await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

    /* ==========================================================
       IMPORTANT REGRESSION FIX

       A teacher can have multiple subject assignments for the
       same classroom. We must NEVER pick only the first
       class-section assignment when fetching lecture records.

       Teacher Home / Teaching Journal may aggregate by classroom,
       but Teacher Daily Log must read ALL assignment UUIDs because
       a published lecture belongs to its exact assignment UUID.
       ========================================================== */

    const assignmentIds = assignments
      .map((assignment) => assignment.id)
      .filter((id): id is string => Boolean(id));

    if (assignmentIds.length === 0) {
      setLogs([]);
      return;
    }

    /*
       ONE bulk query instead of:
       assignment 1 -> today logs -> historical logs
       assignment 2 -> today logs -> historical logs
       ...

       This both fixes multi-subject classroom visibility and
       keeps the page fast.
    */
    const allHistoricalLogs =
      await getTeacherDailyLogsByAssignments(
        assignmentIds
      );

    const today = getIndiaCalendarDateKey();

    const todayLogs = allHistoricalLogs.filter(
      (log: any) => {
        const logDateKey = toIndiaCalendarDateKey(log.logDate);
        const createdDateKey = toIndiaCalendarDateKey(log.createdAt);

        if (logDateKey === today) return true;

        // Compatibility fallback for historical timestamp-style rows.
        return logDateKey !== today && createdDateKey === today;
      }
    );

    todayLogs.sort(
      (a: any, b: any) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );

    setLogs(todayLogs);

    /* ==========================================================
       DETERMINE CLASSROOMS ALREADY USED
       ========================================================== */

  } catch (error) {
    console.error(
      "DAILY LOG PAGE LOAD ERROR",
      error
    );

    setLogs([]);
  } finally {
    setLogsLoading(false);
  }
}

async function handleSave(
  data: Record<string, unknown>
) {
  setIsPublishing(true);

  try {
    await saveTeacherDailyLog(data);

    /* Primary publication has succeeded. */
    setOpenDialog(false);

    /* Secondary UI refreshes cannot change the publish result. */
    await Promise.allSettled([
      fetchLogs(),
    ]);
  } catch (error) {
    console.error(
      "TEACHER DAILY LOG PUBLISH FAILED",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to publish today's lecture. Please try again."
    );
  } finally {
    setIsPublishing(false);
  }
}

  return (
    <div
      className="tp-compact-page"
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
          DAILY LOG HERO
         ====================================================== */}

      <div
        className="tp-page-hero"
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

            background:
              "rgba(249, 115, 22, 0.055)",

            right: -60,
            top: -105,

            pointerEvents: "none",
          }}
        />

        {/* Small orange circle */}

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",

            background:
              "rgba(249, 115, 22, 0.04)",

            right: 190,
            top: -55,

            pointerEvents: "none",
          }}
        />

        {/* Blue lower circle */}

        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",

            background:
              "rgba(37, 99, 235, 0.035)",

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
              CLASSROOM LECTURE LOGGING INTERFACE
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
              DAILY LESSON PUBLISHING CENTER
            </h1>

            <p
              style={{
                color: "#64748B",

                margin: "13px 0 0",

                fontSize: "16px",
                fontWeight: 500,

                lineHeight: 1.65,

                maxWidth: "760px",
              }}
            >
              Publish today's lecture details for parents, students and
              classroom intelligence surveys.
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
                fontSize: "30px",
                marginBottom: "7px",
              }}
            >
              📚
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
              DAILY
              <br />
              LOG
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TODAY'S LECTURE SUBMISSION
         ====================================================== */}

      <div
        className="tp-publish-card"
        style={{
          position: "relative",
          overflow: "hidden",

          background: "#FFFFFF",

          border: "1px solid #E2E8F0",
          borderRadius: "26px",

          padding: "26px 28px",
          marginBottom: "24px",

          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",

            width: "130px",
            height: "130px",

            borderRadius: "50%",

            background:
              "rgba(249, 115, 22, 0.045)",

            right: "-35px",
            top: "-65px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,

            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",

            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",

                fontSize: "10px",
                fontWeight: 800,

                letterSpacing: "1.8px",

                marginBottom: "7px",
              }}
            >
              LECTURE PUBLISHING
            </div>

            <h2
              style={{
                margin: 0,

                color: "#0F172A",

                fontSize: "22px",
                fontWeight: 800,

                letterSpacing: "-0.3px",
              }}
            >
              Today's Lecture Submission
            </h2>

            <p
              style={{
                color: "#64748B",

                margin: "7px 0 0",

                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Publish today's lesson coverage, homework status and classroom
              activity.
            </p>
          </div>

          <button
            onClick={() =>
              setOpenDialog(true)
            }
            style={buttonStyle}
          >
            + Publish Today's Lecture
          </button>
        </div>
      </div>

      {/* ======================================================
          TODAY'S PUBLISHED LECTURE RECORDS
         ====================================================== */}

      <div
        className="tp-records-card"
        style={{
          background: "#FFFFFF",

          border: "1px solid #E2E8F0",
          borderRadius: "26px",

          padding: "24px",

          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.05)",

          marginBottom: "24px",
        }}
      >
        {/* Section heading */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",

            gap: "20px",

            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",

                fontSize: "10px",
                fontWeight: 800,

                letterSpacing: "1.8px",

                marginBottom: "7px",
              }}
            >
              TODAY'S CLASSROOM ACTIVITY
            </div>

            <h2
              style={{
                margin: 0,

                color: "#0F172A",

                fontSize: "22px",
                fontWeight: 800,

                letterSpacing: "-0.3px",
              }}
            >
              Today's Published Lecture Records
            </h2>

            <p
              style={{
                margin: "7px 0 0",

                color: "#64748B",

                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Lectures published today across your active classrooms.
            </p>
          </div>

          <div
            style={{
              color: "#94A3B8",

              fontSize: "10px",
              fontWeight: 800,

              letterSpacing: "1.3px",

              whiteSpace: "nowrap",
            }}
          >
            DAILY LECTURE LEDGER
          </div>
        </div>

        {/* LOADING */}

        {logsLoading &&
          Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              style={{
                background:
                  "linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)",

                padding: "18px 20px",

                borderRadius: "17px",

                marginBottom: "12px",

                border:
                  "1px solid #E2E8F0",
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 8px 0",

                  color: "#64748B",

                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                Loading Today's Lecture...
              </h2>

              <p
                style={{
                  margin: 0,

                  color: "#94A3B8",

                  fontSize: "13px",
                }}
              >
                Fetching today's classroom records...
              </p>
            </div>
          ))}

        {/* EMPTY STATE */}

        {!logsLoading &&
          logs.length === 0 && (
            <div
              style={{
                padding: "30px",

                background:
                  "linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 100%)",

                border:
                  "1px solid #FED7AA",

                borderRadius: "18px",

                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "30px",

                  marginBottom: "10px",
                }}
              >
                📖
              </div>

              <h3
                style={{
                  margin:
                    "0 0 7px",

                  color: "#0F172A",

                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                No Lecture Published Today.
              </h3>

              <p
                style={{
                  margin: 0,

                  color: "#64748B",

                  fontSize: "13px",
                }}
              >
                Publish your first lecture for today's classes.
              </p>
            </div>
          )}

        {/* PUBLISHED LOGS */}

        {logs.map(
          (log: any, index) => (
            <div
              key={log.id}
              className="tp-record-item"
              style={{
                position: "relative",
                overflow: "hidden",

                background:
                  index % 3 === 0
                    ? "linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 72%)"
                    : index % 3 === 1
                    ? "linear-gradient(135deg, #F5F9FF 0%, #FFFFFF 72%)"
                    : "linear-gradient(135deg, #F2FCF7 0%, #FFFFFF 72%)",

                padding: "19px 20px",

                borderRadius: "18px",

                marginBottom: "12px",

                border:
                  index % 3 === 0
                    ? "1px solid #FED7AA"
                    : index % 3 === 1
                    ? "1px solid #BFDBFE"
                    : "1px solid #BBF7D0",

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",

                gap: "18px",

                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 1,

                  flex: 1,

                  minWidth: "300px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",

                    alignItems: "center",

                    padding:
                      "5px 9px",

                    borderRadius:
                      "999px",

                    background:
                      "#FFFFFF",

                    border:
                      "1px solid #E2E8F0",

                    color:
                      index % 3 === 0
                        ? "#C2410C"
                        : index % 3 === 1
                        ? "#1D4ED8"
                        : "#15803D",

                    fontSize: "9px",
                    fontWeight: 800,

                    letterSpacing:
                      "1px",

                    marginBottom:
                      "10px",
                  }}
                >
                  CLASS {log.className}
                  {" • "}
                  SECTION{" "}
                  {log.sectionName}
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 10px 0",

                    color: "#0F172A",

                    fontSize: "16px",
                    fontWeight: 800,

                    letterSpacing:
                      "-0.2px",
                  }}
                >
                  {log.topicName}
                </h2>

                <div
                  style={{
                    display: "flex",

                    gap: "8px",

                    flexWrap: "wrap",

                    marginBottom:
                      "10px",
                  }}
                >
                  <div style={recordMetaPillStyle}>
                    📖 Page {log.pageFrom} to Page {log.pageTo}
                  </div>

                  <div style={recordMetaPillStyle}>
                    📝 Homework:{" "}
                    <strong>
                      {log.homeworkGiven
                        ? "YES"
                        : "NO"}
                    </strong>
                  </div>

                  <div style={recordMetaPillStyle}>
                    🎯 Activity:{" "}
                    <strong>
                      {log.activityConducted
                        ? "YES"
                        : "NO"}
                    </strong>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,

                    color: "#64748B",

                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  <strong
                    style={{
                      color:
                        "#334155",
                    }}
                  >
                    Teacher Notes:
                  </strong>{" "}
                  {log.teacherNotes ||
                    "No Notes"}
                </p>
              </div>

              <div
                style={{
                  display:
                    "inline-flex",

                  alignItems:
                    "center",

                  gap: "7px",

                  background:
                    "#F0FDF4",

                  padding:
                    "8px 12px",

                  borderRadius:
                    "999px",

                  fontSize:
                    "10px",

                  border:
                    "1px solid #BBF7D0",

                  fontWeight:
                    800,

                  color:
                    "#15803D",

                  whiteSpace:
                    "nowrap",
                }}
              >
                ● ACTIVE SURVEY PUBLISHED
              </div>
            </div>
          )
        )}
      </div>

      {/* ======================================================
          EXISTING DIALOG — FUNCTIONALITY UNCHANGED
         ====================================================== */}

      <TeacherDailyLogDialog
        open={openDialog}
        submitting={isPublishing}
        onClose={() => {
          if (!isPublishing) {
            setOpenDialog(false);
          }
        }}
        onSave={handleSave}
      />

      {isPublishing && !openDialog && (
        <div
          className="tp-publish-progress"
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 17px",
            background: "#FFFFFF",
            border: "1px solid #FED7AA",
            borderRadius: "16px",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.14)",
          }}
        >
          <div className="tp-publish-spinner" />
          <div>
            <div style={{ color: "#0F172A", fontSize: "12px", fontWeight: 800 }}>
              Publishing lecture...
            </div>
            <div style={{ marginTop: "2px", color: "#64748B", fontSize: "10px", fontWeight: 600 }}>
              Updating today's classroom records. Kindly wait.
            </div>
          </div>
        </div>
      )}
    
<style>{`
.tp-mobile-swipe-hint { display: none; }

.tp-publish-spinner {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border: 3px solid #FFEDD5;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: tpPublishSpin .75s linear infinite;
}
@keyframes tpPublishSpin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .tp-compact-page { padding: 16px !important; overflow-x: hidden !important; box-sizing: border-box !important; }

  .tp-page-hero { padding: 20px 22px !important; margin-bottom: 16px !important; border-radius: 20px !important; }
  .tp-page-hero > div:last-child { gap: 12px !important; align-items: center !important; }
  .tp-page-hero > div:last-child > div:first-child { min-width: 0 !important; flex: 1 1 auto !important; }
  .tp-page-hero > div:last-child > div:first-child > div:first-child { font-size: 8px !important; line-height: 1.15 !important; letter-spacing: 1.2px !important; margin-bottom: 5px !important; }
  .tp-page-hero h1 { font-size: 22px !important; line-height: 1.08 !important; letter-spacing: -.3px !important; }
  .tp-page-hero p { font-size: 11px !important; line-height: 1.35 !important; margin: 6px 0 0 !important; }
  .tp-page-hero > div:last-child > div:last-child { width: 60px !important; height: 60px !important; min-width: 60px !important; border-radius: 15px !important; }
  .tp-page-hero > div:last-child > div:last-child > div:first-child { font-size: 19px !important; margin-bottom: 1px !important; }
  .tp-page-hero > div:last-child > div:last-child > div:last-child { font-size: 5px !important; line-height: 1.1 !important; letter-spacing: .5px !important; }

  .tp-publish-card, .tp-records-card { padding: 16px !important; margin-bottom: 16px !important; border-radius: 20px !important; }
  .tp-publish-card > div:last-child { gap: 10px !important; }
  .tp-publish-card > div:last-child > div:first-child > div:first-child,
  .tp-records-card > div:first-child > div:first-child > div:first-child,
  .tp-publish-card h2, .tp-records-card h2 { font-size: 18px !important; line-height: 1.12 !important; }
  .tp-publish-card p, .tp-records-card p { font-size: 10px !important; line-height: 1.3 !important; margin-top: 4px !important; }
  .tp-publish-card button { padding: 9px 13px !important; min-height: 0 !important; font-size: 9px !important; border-radius: 10px !important; }

  .tp-records-card > div:first-child { margin-bottom: 10px !important; gap: 8px !important; }
  .tp-record-item { padding: 11px 12px !important; margin-bottom: 8px !important; border-radius: 13px !important; gap: 9px !important; }
  .tp-record-item > div:first-child { min-width: 0 !important; }
  .tp-record-item h2 { font-size: 13px !important; margin-bottom: 6px !important; }
  .tp-record-item > div:first-child > div:first-child { padding: 3px 6px !important; margin-bottom: 6px !important; font-size: 7px !important; }
  .tp-record-item > div:first-child > div:nth-child(3) { gap: 5px !important; margin-bottom: 6px !important; }
  .tp-record-item > div:first-child > div:nth-child(3) > div { padding: 4px 6px !important; font-size: 8px !important; }
  .tp-record-item > div:last-child { padding: 5px 8px !important; font-size: 7px !important; }

}

@media (max-width: 600px) {
  .tp-compact-page { padding: 12px !important; }

  .tp-page-hero { padding: 15px 16px !important; margin-bottom: 12px !important; border-radius: 16px !important; }
  .tp-page-hero > div:last-child { gap: 7px !important; }
  .tp-page-hero > div:last-child > div:first-child > div:first-child { font-size: 6px !important; letter-spacing: .8px !important; margin-bottom: 3px !important; }
  .tp-page-hero h1 { font-size: 18px !important; line-height: 1.08 !important; }
  .tp-page-hero p { font-size: 9px !important; line-height: 1.3 !important; margin-top: 5px !important; }
  .tp-page-hero > div:last-child > div:last-child { width: 48px !important; height: 48px !important; min-width: 48px !important; border-radius: 12px !important; }
  .tp-page-hero > div:last-child > div:last-child > div:first-child { font-size: 13px !important; margin-bottom: 0 !important; }
  .tp-page-hero > div:last-child > div:last-child > div:last-child { font-size: 3.7px !important; line-height: 1 !important; letter-spacing: .25px !important; }

  .tp-publish-card, .tp-records-card { padding: 12px !important; margin-bottom: 12px !important; border-radius: 16px !important; }
  .tp-publish-card > div:last-child { display: grid !important; grid-template-columns: 1fr auto !important; align-items: end !important; gap: 8px !important; }
  .tp-publish-card h2, .tp-records-card h2 { font-size: 15px !important; }
  .tp-publish-card p, .tp-records-card p { font-size: 8.5px !important; line-height: 1.3 !important; }
  .tp-publish-card button { padding: 8px 10px !important; font-size: 8px !important; }

  .tp-records-card > div:first-child > div:last-child { display: none !important; }
  .tp-record-item { padding: 9px 10px !important; margin-bottom: 7px !important; border-radius: 12px !important; }
  .tp-record-item h2 { font-size: 11px !important; }
  .tp-record-item > div:first-child > div:nth-child(3) > div { font-size: 7px !important; padding: 3px 5px !important; }
  .tp-record-item p { font-size: 8px !important; }
  .tp-record-item > div:last-child { font-size: 6px !important; padding: 4px 6px !important; }

}
`}</style>
</div>
  );
}


const cardStyle = {
  background: "#FFFFFF",

  padding: "24px",

  borderRadius: "20px",

  border: "1px solid #E2E8F0",

  boxShadow:
    "0 8px 24px rgba(15, 23, 42, 0.045)",
} as const;


const buttonStyle = {
  padding: "13px 20px",

  border: "1px solid #F97316",

  borderRadius: "12px",

  background:
    "linear-gradient(135deg, #F97316 0%, #FB8C24 100%)",

  color: "#FFFFFF",

  cursor: "pointer",

  fontWeight: 800,

  fontSize: "12px",

  boxShadow:
    "0 8px 18px rgba(249, 115, 22, 0.18)",

  whiteSpace: "nowrap",
} as const;


const recordMetaPillStyle = {
  display: "inline-flex",

  alignItems: "center",

  padding: "6px 9px",

  borderRadius: "9px",

  background: "rgba(255, 255, 255, 0.82)",

  border: "1px solid #E2E8F0",

  color: "#475569",

  fontSize: "11px",

  fontWeight: 600,
} as const;


