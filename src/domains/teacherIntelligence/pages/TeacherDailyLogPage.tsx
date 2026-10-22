import { useState, useEffect } from "react";

import TeacherDailyLogDialog from "../dialogs/TeacherDailyLogDialog";
import TeacherDailyLogHistory from "../components/TeacherDailyLogHistory";

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
  updateTeacherDailyLog,
  deleteTeacherDailyLog,
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

const [historyRefreshSignal, setHistoryRefreshSignal] = useState(0);
const [editingPublishedLog, setEditingPublishedLog] = useState<any | null>(null);
const [editTopicName, setEditTopicName] = useState("");
const [editConceptsText, setEditConceptsText] = useState("");
const [editPageFrom, setEditPageFrom] = useState("");
const [editPageTo, setEditPageTo] = useState("");
const [editHomeworkGiven, setEditHomeworkGiven] = useState(false);
const [editActivityConducted, setEditActivityConducted] = useState(false);
const [editTeacherNotes, setEditTeacherNotes] = useState("");
const [editSaving, setEditSaving] = useState(false);
const [editError, setEditError] = useState("");

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

async function handleDeletePublishedLog(log: any) {
  const confirmed = window.confirm(
    `Delete the published log for ${log.className} ${log.sectionName} — ${log.topicName}? You can delete it only if no student has submitted feedback. If even one student has responded, deletion will be blocked.`
  );
  if (!confirmed) return;

  try {
    await deleteTeacherDailyLog(String(log.id));
    // Refresh the published-record cards and the history table from the database.
    await fetchLogs();
    setHistoryRefreshSignal((value) => value + 1);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Unable to delete this log. If student feedback exists, deletion is not permitted."
    );
  }
}

function handleEditPublishedLog(log: any) {
  // Edit directly in Today's Published Lecture Records. The History editor
  // remains independent and continues to use the same guarded repository RPC.
  setEditingPublishedLog(log);
  setEditTopicName(String(log.topicName ?? ""));
  setEditConceptsText(Array.isArray(log.conceptsCovered) ? log.conceptsCovered.join("\n") : "");
  setEditPageFrom(log.pageFrom == null ? "" : String(log.pageFrom));
  setEditPageTo(log.pageTo == null ? "" : String(log.pageTo));
  setEditHomeworkGiven(log.homeworkGiven === true);
  setEditActivityConducted(log.activityConducted === true);
  setEditTeacherNotes(String(log.teacherNotes ?? ""));
  setEditError("");
}

function closePublishedLogEditor() {
  if (editSaving) return;
  setEditingPublishedLog(null);
  setEditError("");
}

async function savePublishedLogEdit() {
  if (!editingPublishedLog || editSaving) return;
  const topicName = editTopicName.trim();
  if (!topicName) {
    setEditError("Topic is required.");
    return;
  }

  const pageFrom = editPageFrom.trim() === "" ? null : Number(editPageFrom);
  const pageTo = editPageTo.trim() === "" ? null : Number(editPageTo);
  if (
    (pageFrom !== null && (!Number.isInteger(pageFrom) || pageFrom < 0)) ||
    (pageTo !== null && (!Number.isInteger(pageTo) || pageTo < 0))
  ) {
    setEditError("Page numbers must be zero or a positive whole number.");
    return;
  }
  if (pageFrom !== null && pageTo !== null && pageTo < pageFrom) {
    setEditError("Page to cannot be less than Page from.");
    return;
  }

  // Keep repeated concept entries if the teacher has entered them; the History
  // editor passes its concepts array through without deduplicating it.
  const conceptsCovered = editConceptsText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  setEditSaving(true);
  setEditError("");
  try {
    await updateTeacherDailyLog(String(editingPublishedLog.id), {
      topic_name: topicName,
      concepts_covered: conceptsCovered,
      page_from: pageFrom,
      page_to: pageTo,
      homework_given: editHomeworkGiven,
      activity_conducted: editActivityConducted,
      teacher_notes: editTeacherNotes,
    });
    setEditingPublishedLog(null);
    // Both views refresh from persisted data after the update succeeds.
    await Promise.allSettled([fetchLogs()]);
    setHistoryRefreshSignal((value) => value + 1);
  } catch (error) {
    setEditError(
      error instanceof Error
        ? error.message
        : "Unable to update this log. If student feedback exists, editing is not permitted."
    );
  } finally {
    setEditSaving(false);
  }
}

async function handleHistoryRecordChanged() {
  await fetchLogs();
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "9px",
                }}
              >
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
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleEditPublishedLog(log)}
                  style={{
                    border: "1px solid #BFDBFE",
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    borderRadius: "8px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeletePublishedLog(log)}
                  style={{
                    border: "1px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    borderRadius: "8px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ======================================================
          DAILY LOG HISTORY — ADDITIVE FEATURE
          Existing publishing and dialog flows remain unchanged.
         ====================================================== */}
      <TeacherDailyLogHistory
        refreshSignal={historyRefreshSignal}
        onRecordsChanged={handleHistoryRecordChanged}
      />

      {editingPublishedLog && (
        <div
          role="presentation"
          className="tp-log-dialog-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePublishedLogEditor();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(4px)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-published-log-edit-title"
            className="tp-published-log-edit-dialog tp-log-dialog"
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxSizing: "border-box",
              background: "linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 72%, #FFFCF8 100%)",
              border: "1px solid #E2E8F0",
              borderRadius: "28px",
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.22)",
              padding: "30px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
              <div>
                <div style={{ color: "#F97316", fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", marginBottom: "6px" }}>
                  EDIT PUBLISHED LECTURE
                </div>
                <h2 id="tp-published-log-edit-title" style={{ margin: 0, color: "#0F172A", fontSize: "21px", fontWeight: 800 }}>
                  Update Daily Log
                </h2>
                <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: "12px" }}>
                  Class {editingPublishedLog.className} · Section {editingPublishedLog.sectionName} · {editingPublishedLog.subjectName}
                </p>
              </div>
              <button type="button" onClick={closePublishedLogEditor} disabled={editSaving} aria-label="Close edit dialog" style={{ border: "1px solid #CBD5E1", borderRadius: "9px", background: "#FFFFFF", color: "#334155", padding: "7px 10px", cursor: editSaving ? "not-allowed" : "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "14px" }}>
              <label style={{ display: "grid", gap: "6px", color: "#334155", fontSize: "12px", fontWeight: 700 }}>
                Topic
                <input value={editTopicName} onChange={(event) => setEditTopicName(event.target.value)} maxLength={500} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: "9px", padding: "11px", font: "inherit", color: "#0F172A" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ display: "grid", gap: "6px", color: "#334155", fontSize: "12px", fontWeight: 700 }}>
                  Page from
                  <input type="number" min="0" step="1" value={editPageFrom} onChange={(event) => setEditPageFrom(event.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: "9px", padding: "11px", font: "inherit", color: "#0F172A" }} />
                </label>
                <label style={{ display: "grid", gap: "6px", color: "#334155", fontSize: "12px", fontWeight: 700 }}>
                  Page to
                  <input type="number" min="0" step="1" value={editPageTo} onChange={(event) => setEditPageTo(event.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: "9px", padding: "11px", font: "inherit", color: "#0F172A" }} />
                </label>
              </div>
              <label style={{ display: "grid", gap: "6px", color: "#334155", fontSize: "12px", fontWeight: 700, gridColumn: "1 / -1" }}>
                Concepts / subtopics (one per line)
                <textarea value={editConceptsText} onChange={(event) => setEditConceptsText(event.target.value)} rows={4} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid #CBD5E1", borderRadius: "9px", padding: "11px", font: "inherit", color: "#0F172A" }} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "9px", color: "#334155", fontSize: "13px", fontWeight: 700 }}>
                <input type="checkbox" checked={editHomeworkGiven} onChange={(event) => setEditHomeworkGiven(event.target.checked)} />
                Homework given
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "9px", color: "#334155", fontSize: "13px", fontWeight: 700 }}>
                <input type="checkbox" checked={editActivityConducted} onChange={(event) => setEditActivityConducted(event.target.checked)} />
                Activity conducted
              </label>
              <label style={{ display: "grid", gap: "6px", color: "#334155", fontSize: "12px", fontWeight: 700, gridColumn: "1 / -1" }}>
                Teacher notes
                <textarea value={editTeacherNotes} onChange={(event) => setEditTeacherNotes(event.target.value)} rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid #CBD5E1", borderRadius: "9px", padding: "11px", font: "inherit", color: "#0F172A" }} />
              </label>
            </div>

            {editError && <div role="alert" style={{ marginTop: "14px", border: "1px solid #FECACA", borderRadius: "9px", background: "#FEF2F2", color: "#B91C1C", padding: "11px", fontSize: "12px" }}>{editError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
              <button type="button" onClick={closePublishedLogEditor} disabled={editSaving} style={{ border: "1px solid #CBD5E1", borderRadius: "9px", background: "#FFFFFF", color: "#334155", padding: "10px 15px", fontWeight: 700, cursor: editSaving ? "not-allowed" : "pointer" }}>Cancel</button>
              <button type="button" onClick={() => void savePublishedLogEdit()} disabled={editSaving} style={{ border: "1px solid #EA580C", borderRadius: "9px", background: editSaving ? "#FDBA74" : "#F97316", color: "#FFFFFF", padding: "10px 15px", fontWeight: 800, cursor: editSaving ? "wait" : "pointer" }}>{editSaving ? "Saving..." : "Save Changes"}</button>
            </div>
            <style>{`
              .tp-published-log-edit-dialog{position:relative;overflow-x:hidden;background:linear-gradient(145deg,#fff 0%,#fff 72%,#fffcf8 100%)!important}
              .tp-published-log-edit-dialog:before{content:"";position:absolute;width:220px;height:220px;right:-75px;top:-100px;border-radius:50%;background:rgba(249,115,22,.055);pointer-events:none}
              .tp-published-log-edit-dialog:after{content:"";position:absolute;width:180px;height:180px;left:-90px;bottom:100px;border-radius:50%;background:rgba(37,99,235,.035);pointer-events:none}
              .tp-published-log-edit-dialog h2{font-size:23px!important;line-height:1.2!important;letter-spacing:-.35px}
              .tp-published-log-edit-dialog input:not([type=checkbox]),.tp-published-log-edit-dialog textarea{border-color:#D5DFEB!important;border-radius:10px!important;background:#fff!important;outline:none}
              .tp-published-log-edit-dialog input:focus,.tp-published-log-edit-dialog textarea:focus{border-color:#F97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
              .tp-published-log-edit-dialog input[type=checkbox]{accent-color:#F97316;width:17px;height:17px}
              @media(max-width:1024px){.tp-log-dialog-overlay{padding:14px!important}.tp-published-log-edit-dialog{max-width:600px!important;max-height:94dvh!important;border-radius:20px!important;padding:20px!important}.tp-published-log-edit-dialog h2{font-size:23px!important}.tp-published-log-edit-dialog input,.tp-published-log-edit-dialog textarea{font-size:16px!important}}
              @media(max-width:600px){.tp-log-dialog-overlay{padding:6px!important;align-items:flex-end!important}.tp-published-log-edit-dialog{max-width:none!important;max-height:96dvh!important;border-radius:18px 18px 10px 10px!important;padding:14px!important}.tp-published-log-edit-dialog h2{font-size:19px!important;line-height:1.15!important}.tp-published-log-edit-dialog p{font-size:10px!important}.tp-published-log-edit-dialog input,.tp-published-log-edit-dialog textarea{font-size:16px!important}.tp-published-log-edit-dialog button{font-size:11px!important}}
            `}</style>
          </section>
        </div>
      )}

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
  /* The last child is now the status/actions wrapper; keep the original
     compact styling on the status pill itself, not on the wrapper. */
  .tp-record-item > div:last-child { padding: 0 !important; font-size: inherit !important; }
  .tp-record-item > div:last-child > div:first-child { padding: 5px 8px !important; font-size: 7px !important; }

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
  .tp-record-item > div:last-child { padding: 0 !important; font-size: inherit !important; }
  .tp-record-item > div:last-child > div:first-child { font-size: 6px !important; padding: 4px 6px !important; }

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


