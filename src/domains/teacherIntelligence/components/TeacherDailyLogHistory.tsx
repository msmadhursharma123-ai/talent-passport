import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { getCurrentTeacher } from "../../../services/identityService";
import { getSupabaseClient } from "../../../supabaseClient";
import { downloadOrSharePdfBlob } from "../../../services/platform/nativeDocumentService";
import { getAllTeacherAssignmentsByTeacher } from "../repository/TeacherAssignmentRepository";
import { getTeacherDailyLogsByAssignmentsPaginated, updateTeacherDailyLog, deleteTeacherDailyLog } from "../repository/TeacherDailyLogRepository";
import type { TeacherAssignment } from "../types/TeacherAssignment";
import type { TeacherDailyLog } from "../types/TeacherDailyLog";

type ClassOption = {
  key: string;
  className: string;
  sectionName: string;
  assignmentIds: string[];
};

function dateKey(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
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

function logDateKey(log: Pick<TeacherDailyLog, "logDate" | "createdAt">): string {
  return dateKey(log.logDate) || dateKey(log.createdAt);
}

function todayKey(): string {
  return dateKey(new Date());
}

function initialStartDate(): string {
  const end = new Date();
  end.setDate(end.getDate() - 29);
  return dateKey(end);
}

function displayDate(value: string): string {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function pdfText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function classLabel(value: Pick<ClassOption, "className" | "sectionName">): string {
  return `Class ${value.className}${value.sectionName ? ` · Section ${value.sectionName}` : ""}`;
}

type TeacherDailyLogHistoryProps = {
  refreshSignal?: number;
  onRecordsChanged?: () => void | Promise<void>;
};

export default function TeacherDailyLogHistory({
  refreshSignal = 0,
  onRecordsChanged,
}: TeacherDailyLogHistoryProps) {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [selectedClassKey, setSelectedClassKey] = useState("");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(todayKey);
  const [history, setHistory] = useState<TeacherDailyLog[] | null>(null);
  const [crossQuestionFeedbackByLog, setCrossQuestionFeedbackByLog] = useState<Record<string, any[]>>({});
  const [crossQuestionImageViewerUrl, setCrossQuestionImageViewerUrl] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editingLog, setEditingLog] = useState<TeacherDailyLog | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteBusyId, setDeleteBusyId] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAssignments() {
      setAssignmentsLoading(true);
      setAssignmentsError("");
      try {
        const teacher = getCurrentTeacher();
        if (!teacher?.teacherUuid) {
          if (!cancelled) {
            setAssignments([]);
            setAssignmentsError("Your teacher identity could not be found. Please sign in again.");
          }
          return;
        }
        const rows = await getAllTeacherAssignmentsByTeacher(teacher.teacherUuid);
        if (!cancelled) {
          setAssignments(rows);
          setSelectedClassKey("");
        }
      } catch (error) {
        if (!cancelled) {
          setAssignments([]);
          setAssignmentsError(error instanceof Error ? error.message : "Unable to load your assigned classes.");
        }
      } finally {
        if (!cancelled) setAssignmentsLoading(false);
      }
    }
    void loadAssignments();
    return () => { cancelled = true; };
  }, []);

  const classOptions = useMemo<ClassOption[]>(() => {
    const map = new Map<string, ClassOption>();
    for (const assignment of assignments) {
      if (!assignment.id) continue;
      const className = String(assignment.className ?? "").trim();
      const sectionName = String(assignment.sectionName ?? "").trim();
      const key = `${className}::${sectionName}`;
      const existing = map.get(key);
      if (existing) {
        if (!existing.assignmentIds.includes(assignment.id)) existing.assignmentIds.push(assignment.id);
      } else {
        map.set(key, { key, className, sectionName, assignmentIds: [assignment.id] });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.className.localeCompare(b.className, undefined, { numeric: true }) ||
      a.sectionName.localeCompare(b.sectionName, undefined, { numeric: true })
    );
  }, [assignments]);

  const selectedClass = classOptions.find((option) => option.key === selectedClassKey);
  const historyRows = useMemo(() => {
    if (!history) return [];
    const allowedIds = new Set(selectedClass?.assignmentIds ?? []);
    return history
      .filter((log) => {
        const date = logDateKey(log);
        return Boolean(date) &&
          date >= startDate &&
          date <= endDate &&
          (!selectedClass || allowedIds.has(log.teacherAssignmentUuid));
      })
      .sort((a, b) => {
        const byDate = logDateKey(b).localeCompare(logDateKey(a));
        return byDate || String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
      });
  }, [history, startDate, endDate, selectedClass]);

  function invalidateHistory() {
    setHistory(null);
    setHistoryError("");
  }

  async function fetchHistory() {
    setHistoryError("");
    if (!startDate || !endDate) {
      setHistoryError("Please select both a start date and an end date.");
      return;
    }
    if (startDate > endDate) {
      setHistoryError("Start date cannot be after end date.");
      return;
    }
    if (endDate > todayKey()) {
      setHistoryError("End date cannot be in the future.");
      return;
    }
    if (assignmentsLoading || !assignments.length) {
      setHistoryError("No assigned classes are available for your account.");
      return;
    }
    // Fetch the current teacher's complete assignment-scoped history. The
    // selected class is applied locally in historyRows, so changing the class
    // while a request is in flight cannot leave the UI holding only the old
    // class's records when that request completes.
    const assignmentIds = Array.from(new Set(assignments.map((assignment) => assignment.id).filter(Boolean)));
    if (!assignmentIds.length) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const logs = await getTeacherDailyLogsByAssignmentsPaginated(assignmentIds);
      const supabase = getSupabaseClient();
      const historyWithImageUrls = await Promise.all((logs ?? []).map(async (log: any) => {
        if (!log.crossQuestionImagePath || !supabase) return log;
        try {
          const { data, error } = await supabase.storage.from("daily-log-cross-questions").createSignedUrl(String(log.crossQuestionImagePath), 60 * 60);
          if (error) throw error;
          return { ...log, crossQuestionImageUrl: data?.signedUrl ?? null };
        } catch (imageError) {
          console.warn("TEACHER HISTORY CROSS QUESTION IMAGE URL FAILED", imageError);
          return { ...log, crossQuestionImageUrl: null };
        }
      }));
      setHistory(historyWithImageUrls);
      // Student-level results are shown only in the teacher's existing history view.
      // Failure to load this additive panel must not fail or hide the daily-log history.
      try {
        const logIds = (logs ?? []).map((log: any) => String(log.id)).filter(Boolean);
        if (supabase && logIds.length) {
          const [{ data: feedbackRows, error: feedbackError }, { data: attemptRows, error: attemptError }] = await Promise.all([
            (supabase as any).from("student_daily_feedback")
              .select("daily_log_uuid,student_uuid,cross_question_selected_index,cross_question_is_correct,understanding_level,concepts_not_understood")
              .in("daily_log_uuid", logIds),
            (supabase as any).from("student_daily_cross_question_attempts")
              .select("daily_log_uuid,student_uuid,selected_index,is_correct,attempted_at")
              .in("daily_log_uuid", logIds),
          ]);
          if (feedbackError) throw feedbackError;
          if (attemptError) throw attemptError;
          const grouped: Record<string, any[]> = {};
          for (const row of feedbackRows ?? []) {
            const key = String(row.daily_log_uuid);
            (grouped[key] ??= []).push({ ...row, cross_question_selected_index: row.cross_question_selected_index ?? null, cross_question_is_correct: row.cross_question_is_correct ?? null });
          }
          // An attempt is durable even if the student closes the page before
          // finishing the alternate-understanding form. Keep that evidence in history.
          for (const attempt of attemptRows ?? []) {
            const key = String(attempt.daily_log_uuid);
            const rows = grouped[key] ??= [];
            const existing = rows.find((row: any) => String(row.student_uuid) === String(attempt.student_uuid));
            if (existing) {
              existing.cross_question_selected_index = attempt.selected_index;
              existing.cross_question_is_correct = attempt.is_correct;
              existing.cross_question_attempted_at = attempt.attempted_at;
            } else {
              rows.push({ daily_log_uuid: attempt.daily_log_uuid, student_uuid: attempt.student_uuid,
                cross_question_selected_index: attempt.selected_index, cross_question_is_correct: attempt.is_correct,
                cross_question_attempted_at: attempt.attempted_at, understanding_level: null, concepts_not_understood: [] });
            }
          }
          setCrossQuestionFeedbackByLog(grouped);
        } else {
          setCrossQuestionFeedbackByLog({});
        }
      } catch (feedbackHistoryError) {
        console.warn("TEACHER CROSS QUESTION FEEDBACK HISTORY UNAVAILABLE", feedbackHistoryError);
        setCrossQuestionFeedbackByLog({});
      }
    } catch (error) {
      setHistory(null);
      setHistoryError(error instanceof Error ? error.message : "Unable to fetch daily log history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function downloadReport() {
    if (!historyRows.length || pdfLoading) return;
    setPdfLoading(true);
    try {
      // Render report text through the browser canvas rather than jsPDF's
      // built-in Helvetica font. Browser text shaping supports Hindi and
      // other Unicode classroom content that standard PDF fonts can lose.
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      const pageWidthMm = 297;
      const pageHeightMm = 210;
      const scale = 10; // 10 raster pixels per millimetre (~254 dpi)
      const canvasWidth = pageWidthMm * scale;
      const canvasHeight = pageHeightMm * scale;
      const margin = 9 * scale;
      const columns = [
        { title: "Date", width: 22 },
        { title: "Class", width: 20 },
        { title: "Section", width: 20 },
        { title: "Subject", width: 24 },
        { title: "Topic", width: 38 },
        { title: "Subtopics / Concepts", width: 43 },
        { title: "Pages", width: 18 },
        { title: "Homework", width: 19 },
        { title: "Activity", width: 17 },
        { title: "Teacher Notes", width: 58 },
      ];
      const lineHeight = 37;
      const contentFont = '21px Arial, "Noto Sans Devanagari", sans-serif';
      let pageCanvas: HTMLCanvasElement = document.createElement("canvas");
      let ctx: CanvasRenderingContext2D = pageCanvas.getContext("2d")!;
      let y = margin;
      let pageCount = 0;

      const wrapCanvasText = (value: unknown, maxWidth: number): string[] => {
        const text = pdfText(value) || "—";
        const words = text.split(" ");
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const candidate = line ? `${line} ${word}` : word;
          if (ctx.measureText(candidate).width <= maxWidth) {
            line = candidate;
            continue;
          }
          if (line) lines.push(line);
          if (ctx.measureText(word).width <= maxWidth) {
            line = word;
          } else {
            // Keep unusually long unbroken values complete as well.
            let chunk = "";
            for (const character of Array.from(word)) {
              const next = chunk + character;
              if (chunk && ctx.measureText(next).width > maxWidth) {
                lines.push(chunk);
                chunk = character;
              } else {
                chunk = next;
              }
            }
            line = chunk;
          }
        }
        if (line) lines.push(line);
        return lines.length ? lines : ["—"];
      };

      const startPage = () => {
        pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = canvasHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Unable to prepare the PDF report canvas.");
        ctx = context;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#0B1D38";
        ctx.font = 'bold 44px Arial, "Noto Sans Devanagari", sans-serif';
        ctx.fillText("Teacher Daily Log History", margin, y + 30);
        y += 55;
        ctx.font = '22px Arial, "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = "#334155";
        ctx.fillText(
          `Class: ${selectedClass ? pdfText(classLabel(selectedClass)) : "All assigned classes"}  |  Period: ${displayDate(startDate)} to ${displayDate(endDate)}`,
          margin,
          y + 15,
          canvasWidth - margin * 2
        );
        y += 50;
        ctx.fillStyle = "#F5F8FC";
        ctx.strokeStyle = "#D3DCE8";
        ctx.lineWidth = 1;
        ctx.fillRect(margin, y - 20, canvasWidth - margin * 2, 70);
        ctx.strokeRect(margin, y - 20, canvasWidth - margin * 2, 70);
        ctx.font = 'bold 21px Arial, "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = "#0B1D38";
        let x = margin;
        for (const column of columns) {
          ctx.fillText(column.title, x + 10, y + 20, column.width * scale - 16);
          x += column.width * scale;
        }
        y += 70;
        pageCount += 1;
      };

      const commitPage = () => {
        const image = pageCanvas.toDataURL("image/jpeg", 0.92);
        if (pageCount > 1) doc.addPage();
        doc.addImage(image, "JPEG", 0, 0, pageWidthMm, pageHeightMm, undefined, "FAST");
      };

      startPage();
      for (const log of historyRows) {
        ctx.font = contentFont;
        const values = [
          displayDate(logDateKey(log)),
          log.className || selectedClass?.className || "—",
          log.sectionName || selectedClass?.sectionName || "—",
          log.subjectName || "—",
          log.topicName || "—",
          Array.isArray(log.conceptsCovered) && log.conceptsCovered.length ? log.conceptsCovered.join(", ") : "—",
          log.pageFrom != null || log.pageTo != null ? `${log.pageFrom ?? "—"}–${log.pageTo ?? "—"}` : "—",
          log.homeworkGiven ? "Yes" : "No",
          log.activityConducted ? "Yes" : "No",
          log.teacherNotes || "—",
        ];
        const wrapped = values.map((value, index) => wrapCanvasText(value, columns[index].width * scale - 25));
        const maxLines = Math.max(1, ...wrapped.map((lines) => lines.length));
        const linesPerSegment = 35;
        for (let lineStart = 0; lineStart < maxLines; lineStart += linesPerSegment) {
          const segment = wrapped.map((lines) => lines.slice(lineStart, lineStart + linesPerSegment));
          const segmentLineCount = Math.max(1, ...segment.map((lines) => lines.length));
          const rowHeight = Math.max(65, segmentLineCount * lineHeight + 20);
          if (y + rowHeight > canvasHeight - margin) {
            commitPage();
            y = margin;
            startPage();
          }
          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.fillRect(margin, y - 20, canvasWidth - margin * 2, rowHeight);
          ctx.strokeRect(margin, y - 20, canvasWidth - margin * 2, rowHeight);
          ctx.font = contentFont;
          ctx.fillStyle = "#0B1D38";
          let x = margin;
          segment.forEach((lines, index) => {
            lines.forEach((line, lineIndex) => {
              ctx.fillText(line, x + 10, y + lineIndex * lineHeight + 10, columns[index].width * scale - 20);
            });
            x += columns[index].width * scale;
          });
          y += rowHeight;
        }
      }
      commitPage();
      await downloadOrSharePdfBlob(
        doc.output("blob"),
        `Teacher-Daily-Log-History-${startDate}-to-${endDate}.pdf`,
        "Talent Passport — Teacher Daily Log History"
      );
    } catch (error) {
      console.error("TEACHER DAILY LOG HISTORY PDF FAILED", error);
      window.alert("Unable to generate the daily log history report. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function saveEditedLog() {
    if (!editingLog || editSaving) return;
    if (!editingLog.topicName.trim()) {
      setEditError("Topic is required.");
      return;
    }
    if (
      (editingLog.pageFrom !== null && (!Number.isInteger(editingLog.pageFrom) || editingLog.pageFrom < 0)) ||
      (editingLog.pageTo !== null && (!Number.isInteger(editingLog.pageTo) || editingLog.pageTo < 0))
    ) {
      setEditError("Page numbers must be zero or a positive whole number.");
      return;
    }
    if (
      editingLog.pageFrom !== null &&
      editingLog.pageTo !== null &&
      editingLog.pageTo < editingLog.pageFrom
    ) {
      setEditError("Page to cannot be less than Page from.");
      return;
    }
    setEditSaving(true); setEditError("");
    try {
      await updateTeacherDailyLog(editingLog.id, {
        topic_name: editingLog.topicName.trim(), concepts_covered: editingLog.conceptsCovered,
        page_from: editingLog.pageFrom, page_to: editingLog.pageTo,
        homework_given: editingLog.homeworkGiven, activity_conducted: editingLog.activityConducted,
        teacher_notes: editingLog.teacherNotes,
      });
      setEditingLog(null);
      await fetchHistory();
      await onRecordsChanged?.();
    } catch (error) { setEditError(error instanceof Error ? error.message : "Unable to update this log. This log may already have student feedback. Once even one student submits feedback, the log cannot be edited."); }
    finally { setEditSaving(false); }
  }

  async function removeLog(log: TeacherDailyLog) {
    if (deleteBusyId) return;
    if (!window.confirm(`Delete the published log for ${log.className} ${log.sectionName} — ${log.topicName}? You can delete it only if no student has submitted feedback. If even one student has responded, deletion will be blocked.`)) return;
    setDeleteBusyId(log.id); setHistoryError("");
    try {
      await deleteTeacherDailyLog(log.id);
      await fetchHistory();
      await onRecordsChanged?.();
    }
    catch (error) { setHistoryError(error instanceof Error ? error.message : "Unable to delete this log. This log may already have student feedback. Once even one student submits feedback, deletion is not permitted."); }
    finally { setDeleteBusyId(""); }
  }

  useEffect(() => {
    if (!crossQuestionImageViewerUrl) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCrossQuestionImageViewerUrl(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [crossQuestionImageViewerUrl]);

  // Refresh the history after a delete initiated from the published-record cards.
  useEffect(() => {
    if (refreshSignal > 0 && history !== null) void fetchHistory();
    // fetchHistory intentionally runs only when the parent signals a successful mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);


  return (
    <section id="teacher-daily-log-history" className="tdlh-card">
      <style>{styles}</style>
      <div className="tdlh-heading">
        <div>
          <p className="tdlh-eyebrow">YOUR CLASSROOM RECORDS</p>
          <h2>Daily Log History</h2>
          <p>Review and download your published lecture records for a selected class and date range.</p>
        </div>
        <div className="tdlh-count">{historyRows.length} {historyRows.length === 1 ? "record" : "records"}</div>
      </div>

      <div className="tdlh-controls">
        <label className="tdlh-field">
          <span>CLASS / SECTION</span>
          <select
            value={selectedClassKey}
            disabled={assignmentsLoading || !classOptions.length}
            onChange={(event) => { setSelectedClassKey(event.target.value); invalidateHistory(); }}
          >
            <option value="">All my classes</option>
            {classOptions.map((option) => (
              <option key={option.key} value={option.key}>{classLabel(option)}</option>
            ))}
          </select>
        </label>
        <label className="tdlh-field">
          <span>START DATE</span>
          <input
            type="date"
            value={startDate}
            max={endDate && endDate < todayKey() ? endDate : todayKey()}
            onChange={(event) => { setStartDate(event.target.value); invalidateHistory(); }}
          />
        </label>
        <label className="tdlh-field">
          <span>END DATE</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={todayKey()}
            onChange={(event) => { setEndDate(event.target.value); invalidateHistory(); }}
          />
        </label>
        <button type="button" className="tdlh-fetch" onClick={() => void fetchHistory()} disabled={assignmentsLoading || historyLoading}>
          {historyLoading ? "Fetching…" : "Fetch Daily Log History"}
        </button>
        <button type="button" className="tdlh-download" onClick={() => void downloadReport()} disabled={!historyRows.length || pdfLoading}>
          {pdfLoading ? "Preparing PDF…" : "Download Report"}
        </button>
      </div>

      {assignmentsLoading && <div className="tdlh-message">Loading your assigned classes…</div>}
      {assignmentsError && <div className="tdlh-error">{assignmentsError}</div>}
      {historyError && <div className="tdlh-error">{historyError}</div>}
      {historyLoading && <div className="tdlh-message">Fetching published daily logs for the selected period…</div>}
      {!historyLoading && !history && !assignmentsLoading && !assignmentsError && (
        <div className="tdlh-empty">Choose a class and date range, then select <strong>Fetch Daily Log History</strong>.</div>
      )}
      {!historyLoading && history && historyRows.length === 0 && (
        <div className="tdlh-empty">No published daily logs were found for this selection.</div>
      )}
      {!historyLoading && historyRows.length > 0 && (
        <>
          <div className="tdlh-note">PUBLISHED RECORDS · NEWEST FIRST · USE THE HORIZONTAL SCROLL TO VIEW EVERY FIELD</div>
          <div className="tdlh-table-wrap">
            <table className="tdlh-table">
              <thead>
                <tr>
                  <th>Date</th><th>Class</th><th>Section</th><th>Subject</th><th>Topic</th>
                  <th>Subtopics / Concepts</th><th>Pages</th><th>Homework</th><th>Activity</th><th>Teacher Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((log) => (
                  <tr key={log.id}>
                    <td>{displayDate(logDateKey(log))}</td>
                    <td>{log.className || selectedClass?.className || "—"}</td>
                    <td>{log.sectionName || selectedClass?.sectionName || "—"}</td>
                    <td>{log.subjectName || "—"}</td>
                    <td>
                      {log.chapterName && (
                        <div className="tdlh-muted" style={{ marginBottom: 4, fontSize: 10, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                          Chapter: {String(log.chapterName).replace(/^__TP_MANUAL_CHAPTER__:/, "")}
                        </div>
                      )}
                      <strong>Topic: {log.topicName || "—"}</strong>
                      {(log.crossQuestionText || log.crossQuestionImagePath) && <div style={{ marginTop: 6, padding: 7, border: "1px solid #CBD5E1", borderRadius: 7, fontSize: 12 }}><strong>Cross Question:</strong> {log.crossQuestionText || "Image-based question"}{log.crossQuestionImageUrl && <button type="button" onClick={() => setCrossQuestionImageViewerUrl(log.crossQuestionImageUrl ?? null)} aria-label="Enlarge cross-question image" style={{ display: "block", marginTop: 5, padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}><img src={log.crossQuestionImageUrl} alt="Cross question (select to enlarge)" style={{ display: "block", maxWidth: 180, maxHeight: 110, objectFit: "contain" }} /></button>}<div>4 options saved · Correct option {Number.isInteger(log.crossQuestionCorrectIndex) ? String.fromCharCode(65 + Number(log.crossQuestionCorrectIndex)) : "—"}</div>{(crossQuestionFeedbackByLog[String(log.id)] ?? []).filter((row: any) => row.cross_question_selected_index !== null && row.cross_question_selected_index !== undefined).map((row: any) => <div key={`${log.id}-${row.student_uuid}`} style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid #E2E8F0" }}><strong>Student {String(row.student_uuid).slice(0, 8)}:</strong> Option {String.fromCharCode(65 + Number(row.cross_question_selected_index))} · {row.cross_question_is_correct ? "Correct" : "Incorrect"}<div>Understanding: {row.understanding_level || "—"}</div><div>Concepts not understood: {Array.isArray(row.concepts_not_understood) && row.concepts_not_understood.length ? row.concepts_not_understood.join(", ") : "—"}</div></div>)}</div>}
                    </td>
                    <td>
                      {Array.isArray(log.conceptsCovered) && log.conceptsCovered.length
                        ? <div className="tdlh-chips">{log.conceptsCovered.map((concept, index) => <span key={`${log.id}-concept-${index}`}>{concept}</span>)}</div>
                        : <span className="tdlh-muted">No subtopics recorded</span>}
                    </td>
                    <td>{log.pageFrom ?? "—"}{log.pageTo != null ? `–${log.pageTo}` : ""}</td>
                    <td><span className={`tdlh-pill ${log.homeworkGiven ? "yes" : "no"}`}>{log.homeworkGiven ? "Yes" : "No"}</span></td>
                    <td><span className={`tdlh-pill ${log.activityConducted ? "yes" : "no"}`}>{log.activityConducted ? "Yes" : "No"}</span></td>
                    <td className="tdlh-notes">{log.teacherNotes || "—"}</td>
                    <td><div className="tdlh-row-actions"><button type="button" disabled={editSaving || Boolean(deleteBusyId)} onClick={()=>{setEditingLog(log);setEditError("")}}>Edit</button><button type="button" className="tdlh-delete" disabled={editSaving || deleteBusyId===log.id || Boolean(deleteBusyId)} onClick={()=>void removeLog(log)}>{deleteBusyId===log.id?"Deleting…":"Delete"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {editingLog && <div className="tdlh-edit-overlay" role="dialog" aria-modal="true" aria-label="Edit daily log"><div className="tdlh-edit-panel"><div className="tdlh-edit-head"><div><h3>Edit Daily Log</h3><p>{classLabel({className:editingLog.className,sectionName:editingLog.sectionName})} · {displayDate(logDateKey(editingLog))} · {editingLog.subjectName}</p></div><button type="button" onClick={()=>{if(!editSaving)setEditingLog(null)}} disabled={editSaving} aria-label="Close edit dialog">×</button></div>{editError&&<div className="tdlh-error">{editError}</div>}<label>Topic taught<input value={editingLog.topicName} onChange={e=>setEditingLog({...editingLog,topicName:e.target.value})}/></label><label>Subtopics / concepts (one per line)<textarea value={editingLog.conceptsCovered.join("\n")} onChange={e=>setEditingLog({...editingLog,conceptsCovered:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)})}/></label><div className="tdlh-edit-grid"><label>Page from<input type="number" min="0" value={editingLog.pageFrom ?? ""} onChange={e=>setEditingLog({...editingLog,pageFrom:e.target.value===""?null:Number(e.target.value)})}/></label><label>Page to<input type="number" min="0" value={editingLog.pageTo ?? ""} onChange={e=>setEditingLog({...editingLog,pageTo:e.target.value===""?null:Number(e.target.value)})}/></label></div><label className="tdlh-check"><input type="checkbox" checked={editingLog.homeworkGiven} onChange={e=>setEditingLog({...editingLog,homeworkGiven:e.target.checked})}/> Homework given</label><label className="tdlh-check"><input type="checkbox" checked={editingLog.activityConducted} onChange={e=>setEditingLog({...editingLog,activityConducted:e.target.checked})}/> Activity conducted</label><label>Teacher notes<textarea value={editingLog.teacherNotes} onChange={e=>setEditingLog({...editingLog,teacherNotes:e.target.value})}/></label><div className="tdlh-edit-actions"><button type="button" onClick={()=>setEditingLog(null)} disabled={editSaving}>Cancel</button><button type="button" onClick={()=>void saveEditedLog()} disabled={editSaving}>{editSaving?"Saving…":"Save changes"}</button></div></div></div>}
      {crossQuestionImageViewerUrl && <div role="dialog" aria-modal="true" aria-label="Cross-question image preview" onClick={(event) => { if (event.target === event.currentTarget) setCrossQuestionImageViewerUrl(null); }} style={{ position: "fixed", inset: 0, zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2,6,23,.88)" }}><button type="button" onClick={() => setCrossQuestionImageViewerUrl(null)} aria-label="Close enlarged image" style={{ position: "absolute", top: 16, right: 16, zIndex: 1, width: 42, height: 42, border: "1px solid rgba(255,255,255,.65)", borderRadius: 999, background: "#fff", color: "#0f172a", fontSize: 26, cursor: "pointer" }}>×</button><img src={crossQuestionImageViewerUrl} alt="Enlarged cross question" onClick={(event) => event.stopPropagation()} style={{ display: "block", maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} /></div>}
    </section>
  );
}

const styles = `
.tdlh-row-actions{display:flex;gap:5px}.tdlh-row-actions button{border:1px solid #C9DAFF;background:#F4F7FF;color:#2456D6;border-radius:7px;padding:5px 7px;font-size:9px;font-weight:800;cursor:pointer}.tdlh-row-actions .tdlh-delete{border-color:#FECACA;background:#FEF2F2;color:#B91C1C}.tdlh-row-actions button:disabled{opacity:.5}.tdlh-edit-overlay{position:fixed;inset:0;z-index:1200;background:rgba(7,20,45,.45);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}.tdlh-edit-panel{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:16px;border:1px solid #DCE4EF;padding:18px;box-shadow:0 24px 70px rgba(15,23,42,.22);display:flex;flex-direction:column;gap:11px}.tdlh-edit-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.tdlh-edit-head h3{margin:0;font-size:18px;color:#0B1D38}.tdlh-edit-head p{margin:5px 0 0;font-size:10px;color:#64748B}.tdlh-edit-head>button{border:1px solid #CBD5E1;background:#fff;border-radius:8px;padding:5px 10px;font-size:18px}.tdlh-edit-panel>label{display:flex;flex-direction:column;gap:5px;color:#526987;font-size:10px;font-weight:800}.tdlh-edit-panel input:not([type=checkbox]),.tdlh-edit-panel textarea{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:8px;padding:9px;font:inherit;font-size:12px;color:#0B1D38}.tdlh-edit-panel textarea{min-height:75px;resize:vertical}.tdlh-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tdlh-edit-grid label{display:flex;flex-direction:column;gap:5px;color:#526987;font-size:10px;font-weight:800}.tdlh-check{display:flex!important;flex-direction:row!important;align-items:center}.tdlh-edit-actions{display:flex;justify-content:flex-end;gap:8px}.tdlh-edit-actions button{border:1px solid #CBD5E1;border-radius:8px;padding:9px 12px;background:#fff;font-size:10px;font-weight:900}.tdlh-edit-actions button:last-child{background:#143B73;border-color:#143B73;color:#fff}.tdlh-card{position:relative;box-sizing:border-box;width:100%;min-width:0;margin:24px 0 0;padding:24px;border:1px solid #DCE4EF;border-radius:22px;background:#FFF;color:#0B1D38;box-shadow:0 8px 24px rgba(15,35,65,.045);overflow:hidden}
.tdlh-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:18px;border-bottom:1px solid #E5EAF1}
.tdlh-eyebrow{margin:0 0 7px;color:#F97316;font-size:10px;font-weight:900;letter-spacing:.14em}
.tdlh-heading h2{margin:0;color:#0B1D38;font-size:22px;line-height:1.2;font-weight:900;letter-spacing:-.35px}
.tdlh-heading p:not(.tdlh-eyebrow){margin:7px 0 0;color:#5D7190;font-size:12px;line-height:1.55}
.tdlh-count{flex-shrink:0;padding:8px 11px;border:1px solid #C9DAFF;border-radius:999px;background:#F4F7FF;color:#2456D6;font-size:10px;font-weight:900}
.tdlh-controls{display:grid;grid-template-columns:minmax(150px,1.2fr) minmax(140px,.85fr) minmax(140px,.85fr) auto auto;align-items:end;gap:10px;margin:18px 0 14px}
.tdlh-field{display:flex;min-width:0;flex-direction:column;gap:6px}
.tdlh-field>span{color:#60728F;font-size:9px;font-weight:900;letter-spacing:.08em}
.tdlh-field select,.tdlh-field input{box-sizing:border-box;width:100%;min-width:0;min-height:42px;padding:9px 10px;border:1px solid #D5DFEB;border-radius:10px;background:#FFF;color:#0B1D38;font:inherit;font-size:12px;font-weight:600;line-height:1.3;outline:none}
.tdlh-field select:focus,.tdlh-field input:focus{border-color:#FF9B52;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
.tdlh-fetch,.tdlh-download{min-height:42px;padding:10px 13px;border-radius:10px;font-size:10px;font-weight:900;white-space:nowrap;cursor:pointer}
.tdlh-fetch{border:1px solid #F97316;background:linear-gradient(135deg,#F97316,#FB8C24);color:#FFF}
.tdlh-download{border:1px solid #C9DAFF;background:#F4F7FF;color:#2456D6}
.tdlh-fetch:disabled,.tdlh-download:disabled{opacity:.48;cursor:not-allowed}
.tdlh-message,.tdlh-empty,.tdlh-error{margin-top:10px;padding:15px 16px;border:1px solid #E0E6EF;border-radius:12px;background:#F8FAFD;color:#657896;font-size:11px;line-height:1.5}
.tdlh-error{border-color:#FFD1D6;background:#FFF5F6;color:#B4233D}
.tdlh-note{margin:12px 0 8px;color:#657896;font-size:9px;font-weight:900;letter-spacing:.07em}
.tdlh-table-wrap{width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;border:1px solid #DCE4EF;border-radius:13px;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.tdlh-table{width:100%;min-width:1080px;border-collapse:separate;border-spacing:0;font-size:11px;text-align:left}
.tdlh-table th{position:sticky;top:0;padding:12px 11px;border-bottom:1px solid #DCE4EF;background:#F4F7FB;color:#526987;font-size:9px;font-weight:900;letter-spacing:.035em;white-space:nowrap}
.tdlh-table td{max-width:280px;padding:12px 11px;border-bottom:1px solid #E8EDF4;background:#FFF;color:#243B59;vertical-align:top;line-height:1.5}
.tdlh-table tbody tr:last-child td{border-bottom:0}
.tdlh-table tbody tr:hover td{background:#FFFCF8}
.tdlh-table td strong{color:#0B1D38}
.tdlh-chips{display:flex;flex-wrap:wrap;gap:5px;min-width:130px}
.tdlh-chips span{display:inline-block;padding:4px 7px;border:1px solid #C9DAFF;border-radius:999px;background:#F4F7FF;color:#2456D6;font-size:9px;line-height:1.3}
.tdlh-muted{color:#8A9AB1;font-size:10px}
.tdlh-pill{display:inline-block;padding:4px 7px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}
.tdlh-pill.yes{border:1px solid #AEE8C0;background:#F2FCF5;color:#168A43}
.tdlh-pill.no{border:1px solid #DCE4EF;background:#F8FAFD;color:#657896}
.tdlh-notes{min-width:180px;white-space:normal;overflow-wrap:anywhere}
@media(max-width:1024px){
 .tdlh-card{margin-top:16px;padding:16px;border-radius:18px}
 .tdlh-heading h2{font-size:18px}
 .tdlh-controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .tdlh-fetch,.tdlh-download{width:100%;white-space:normal}
 .tdlh-table{min-width:1020px}
}
@media(max-width:600px){
 .tdlh-card{margin-top:12px;padding:12px;border-radius:15px}
 .tdlh-heading{gap:8px;padding-bottom:12px}
 .tdlh-eyebrow{font-size:8px;letter-spacing:.09em}
 .tdlh-heading h2{font-size:15px}
 .tdlh-heading p:not(.tdlh-eyebrow){font-size:9px;line-height:1.4}
 .tdlh-count{padding:6px 7px;font-size:8px}
 .tdlh-controls{grid-template-columns:minmax(0,1fr);gap:8px;margin-top:12px}
 .tdlh-field>span{font-size:8px}
 .tdlh-field select,.tdlh-field input{min-height:38px;padding:8px;font-size:11px}
 .tdlh-fetch,.tdlh-download{min-height:38px;font-size:10px}
 .tdlh-table{min-width:980px;font-size:10px}
 .tdlh-table th,.tdlh-table td{padding:9px 8px}
 .tdlh-note{font-size:8px;line-height:1.5}
}
`;
