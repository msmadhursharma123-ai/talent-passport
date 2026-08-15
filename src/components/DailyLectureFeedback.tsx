import jsPDF from "jspdf";
import { useEffect, useState } from "react";

import {
  getStudentDailyLectureLogs,
  getTodaysLectureLogs,
  getStudentSubjects,
  getStudentFeedbackStatementData,
} from "../data/studentGrowthPlanRepository";

import {
  UNDERSTANDING_OPTIONS,
} from "../data/studentUnderstandingOptions";

import {
  submitStudentDailyFeedback,
  getStudentFeedbackForLectures,
  getStudentFeedbackHistory,
} from "../data/studentDailyFeedbackRepository";

import {
  getPendingDoubtsByStudent,
  submitStudentPendingDoubtResponse,
} from "../domains/teacherIntelligence/repository/PendingTeacherDoubtRepository";

import {
  requireIdentity,
} from "../services/identityService";

import {
  calculateDailyFeedbackCreditSummaryFromLogs,
} from "../data/creditEngine";

interface FeedbackStatementRow {
  id: string;
  date: string;
  topic: string;
  subtopics: string[];
  response: string | null;
  difficultConcepts: string[];
  creditChange: number;
  creditLabel: string;
  balance: number;
}

function getIndiaTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function toDateKey(value: unknown) {
  if (value === null || value === undefined) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw.slice(0, 10);
  }

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

function formatStatementDate(value: string) {
  if (!value) return "—";

  const parts = value.split("-");
  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getResponseLabel(value: string | null | undefined) {
  if (!value) return "Pending";

  if (value === "I completely understood.") {
    return "I completely understood";
  }

  if (value === "I partially understood.") {
    return "I partially understood";
  }

  if (value === "I didn't understand.") {
    return "I didn't understand";
  }

  return value.replace(/\.$/, "");
}

export default function DailyLectureFeedback() {
  const [lectureLogs, setLectureLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [understandingLevel, setUnderstandingLevel] = useState("");
  const [conceptsNotUnderstood, setConceptsNotUnderstood] = useState<string[]>([]);
  const [somethingElse, setSomethingElse] = useState(false);
  const [somethingElseText, setSomethingElseText] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");

  const [pendingDoubts, setPendingDoubts] = useState<any[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<Record<string, string>>({});
  const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, any>>({});

  const [isSubmittingFeedbackId, setIsSubmittingFeedbackId] = useState<string | null>(null);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);

  const [dailyFeedbackEarnedCredits, setDailyFeedbackEarnedCredits] = useState(0);
  const [dailyFeedbackLostCredits, setDailyFeedbackLostCredits] = useState(0);
  const [dailyFeedbackTotalCredits, setDailyFeedbackTotalCredits] = useState(0);
  const [isLoadingCreditSummary, setIsLoadingCreditSummary] = useState(true);

  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [statementSubject, setStatementSubject] = useState("");
  const [statementStartDate, setStatementStartDate] = useState("");
  const [statementEndDate, setStatementEndDate] = useState("");
  const [statementRows, setStatementRows] = useState<FeedbackStatementRow[]>([]);
  const [hasFetchedStatement, setHasFetchedStatement] = useState(false);
  const [isFetchingStatement, setIsFetchingStatement] = useState(false);
  const [statementError, setStatementError] = useState<string | null>(null);
  const [isGeneratingStatementPdf, setIsGeneratingStatementPdf] = useState(false);

  useEffect(() => {
    void loadPageData();
    void loadDailyFeedbackCreditSummary();
  }, []);

  async function loadPageData() {
    setIsLoadingLogs(true);

    try {
      // Critical path: fetch ONLY today's logs. The old page downloaded
      // the complete lecture history before it could render today's cards.
      const todaysLogs = await getTodaysLectureLogs();

      setLectureLogs(todaysLogs ?? []);
      setIsLoadingLogs(false);

      // These are secondary data loads and run together. None of them blocks
      // the initial daily-log render above.
      const feedbackPromise = (todaysLogs ?? []).length > 0
        ? getStudentFeedbackForLectures(
            (todaysLogs ?? []).map((log: any) => log.id).filter(Boolean)
          )
        : Promise.resolve([]);

      // Secondary loads must not be allowed to erase an otherwise healthy
      // daily feed. A failure in doubts, subjects, or feedback status is
      // isolated to that feature instead of triggering the page-level catch.
      const [doubtsResult, subjectsResult, feedbackResult] =
        await Promise.allSettled([
          loadPendingDoubtsData(),
          getStudentSubjects(),
          feedbackPromise,
        ]);

      if (doubtsResult.status === "fulfilled") {
        setPendingDoubts(doubtsResult.value ?? []);
      } else {
        console.error("PENDING DOUBTS INITIAL LOAD FAILED", doubtsResult.reason);
        setPendingDoubts([]);
      }

      if (subjectsResult.status === "fulfilled") {
        setSubjectOptions(subjectsResult.value ?? []);
      } else {
        console.error("STUDENT SUBJECT OPTIONS LOAD FAILED", subjectsResult.reason);
        setSubjectOptions([]);
      }

      if (feedbackResult.status === "fulfilled") {
        const feedbackMap: Record<string, any> = {};

        for (const feedback of feedbackResult.value ?? []) {
          if (feedback?.daily_log_uuid) {
            feedbackMap[feedback.daily_log_uuid] = feedback;
          }
        }

        setSubmittedFeedback(feedbackMap);
      } else {
        console.error("TODAY FEEDBACK STATUS LOAD FAILED", feedbackResult.reason);
        setSubmittedFeedback({});
      }
    } catch (error) {
      console.error("DAILY LECTURE FEEDBACK PAGE LOAD FAILED", error);
      setLectureLogs([]);
      setPendingDoubts([]);
      setSubjectOptions([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }

  async function loadPendingDoubtsData() {
    const identity = requireIdentity();
    return await getPendingDoubtsByStudent(identity.studentUuid);
  }

  async function loadDailyFeedbackCreditSummary() {
    setIsLoadingCreditSummary(true);

    try {
      const [allLectureLogs, feedbackHistory] = await Promise.all([
        getStudentDailyLectureLogs(),
        getStudentFeedbackHistory(),
      ]);

      const today = getIndiaTodayKey();

      const summary = calculateDailyFeedbackCreditSummaryFromLogs(
        allLectureLogs ?? [],
        feedbackHistory ?? [],
        today
      );

      setDailyFeedbackEarnedCredits(summary.earnedCredits);
      setDailyFeedbackLostCredits(summary.lostCredits);
      setDailyFeedbackTotalCredits(summary.totalCredits);
    } catch (error) {
      console.error("DAILY FEEDBACK CREDIT SUMMARY LOAD FAILED", error);
      setDailyFeedbackEarnedCredits(0);
      setDailyFeedbackLostCredits(0);
      setDailyFeedbackTotalCredits(0);
    } finally {
      setIsLoadingCreditSummary(false);
    }
  }

  async function loadPendingDoubts() {
    try {
      const doubts = await loadPendingDoubtsData();
      setPendingDoubts(doubts ?? []);
    } catch (error) {
      console.error("PENDING DOUBTS LOAD FAILED", error);
      setPendingDoubts([]);
    }
  }

  function resetFeedbackForm() {
    setExpandedCard(null);
    setUnderstandingLevel("");
    setConceptsNotUnderstood([]);
    setAdditionalNote("");
    setSomethingElse(false);
    setSomethingElseText("");
    setFeedbackSubmitError(null);
  }

  async function submitFeedback(log: any) {
    if (isSubmittingFeedbackId) return;

    if (understandingLevel.length === 0) {
      alert("Please select your understanding level.");
      return;
    }

    if (
      understandingLevel !== "I completely understood." &&
      conceptsNotUnderstood.length === 0 &&
      !somethingElse
    ) {
      alert("Please select at least one difficult concept.");
      return;
    }

    let finalAdditionalNote = additionalNote;

    if (somethingElse && somethingElseText.trim()) {
      finalAdditionalNote = `${additionalNote}${
        additionalNote.trim() ? "\n\n" : ""
      }Additional Learning Gap:\n${somethingElseText}`;
    }

    setFeedbackSubmitError(null);
    setIsSubmittingFeedbackId(log.id);

    try {
      await submitStudentDailyFeedback(
        log.id,
        log.teacher_uuid,
        log.school_uuid,
        log.class_name,
        log.section_name,
        log.subject_name,
        log.topic_name,
        understandingLevel,
        conceptsNotUnderstood,
        finalAdditionalNote.trim().length > 0
          ? finalAdditionalNote
          : null
      );

      // Keep the existing repository return contract (true), but update
      // the UI immediately from the values that were just submitted.
      // This avoids a second database read after a successful INSERT.
      const localSubmittedFeedback = {
        daily_log_uuid: log.id,
        student_uuid: requireIdentity().studentUuid,
        teacher_uuid: log.teacher_uuid,
        school_uuid: log.school_uuid,
        class_name: log.class_name,
        section_name: log.section_name,
        subject_name: log.subject_name,
        topic_name: log.topic_name,
        understanding_level: understandingLevel,
        concepts_not_understood: [...conceptsNotUnderstood],
        has_doubt: conceptsNotUnderstood.length > 0,
        additional_note:
          finalAdditionalNote.trim().length > 0
            ? finalAdditionalNote
            : null,
        submitted_at: new Date().toISOString(),
      };

      setSubmittedFeedback((previous) => ({
        ...previous,
        [log.id]: localSubmittedFeedback,
      }));

      // The submission itself has succeeded, so reflect the +1 locally.
      // Do not re-fetch the complete credit history here.
      setDailyFeedbackEarnedCredits((value) => value + 1);
      setDailyFeedbackTotalCredits((value) => value + 1);

      resetFeedbackForm();
    } catch (error) {
      console.error("DAILY FEEDBACK SUBMISSION FAILED", error);
      setFeedbackSubmitError(
        "We could not submit your feedback. Please try again."
      );
    } finally {
      setIsSubmittingFeedbackId(null);
    }
  }

  async function submitPendingDoubt(doubt: any) {
    const response = selectedResponse[doubt.id];

    if (!response) {
      alert("Please select your response.");
      return;
    }

    await submitStudentPendingDoubtResponse(doubt.id, response);
    await loadPendingDoubts();
  }

  async function fetchFeedbackStatement() {
    setStatementError(null);

    if (!statementSubject) {
      setStatementError("Please choose a subject.");
      return;
    }

    if (!statementStartDate || !statementEndDate) {
      setStatementError("Please choose a start date and end date.");
      return;
    }

    if (statementStartDate > statementEndDate) {
      setStatementError("Start date cannot be after end date.");
      return;
    }

    setIsFetchingStatement(true);
    setHasFetchedStatement(true);

    try {
      const { logs, feedback } = await getStudentFeedbackStatementData(
        statementStartDate,
        statementEndDate,
        statementSubject
      );

      const feedbackMap = new Map<string, any>();

      for (const item of feedback ?? []) {
        if (item?.daily_log_uuid) {
          feedbackMap.set(String(item.daily_log_uuid), item);
        }
      }

      const today = getIndiaTodayKey();
      let runningBalance = 0;

      const rows = (logs ?? [])
        .map((log: any) => {
          const logId = String(log.id);
          const feedbackRecord = feedbackMap.get(logId);
          const dateKey = toDateKey(log.log_date || log.created_at);
          const isCompletedDay = dateKey < today;

          let creditChange = 0;
          let creditLabel = "Pending — not submitted";

          if (feedbackRecord) {
            creditChange = 1;
            creditLabel = "+1 credit";
          } else if (isCompletedDay) {
            creditChange = -10;
            creditLabel = "−10 debit";
          } else {
            creditLabel = "Pending — no debit yet";
          }

          runningBalance += creditChange;

          return {
            id: logId,
            date: dateKey,
            topic: log.topic_name ?? "Topic not available",
            subtopics: Array.isArray(log.concepts_covered)
              ? log.concepts_covered
              : [],
            response: feedbackRecord?.understanding_level ?? null,
            difficultConcepts: Array.isArray(
              feedbackRecord?.concepts_not_understood
            )
              ? feedbackRecord.concepts_not_understood
              : [],
            creditChange,
            creditLabel,
            balance: runningBalance,
          } satisfies FeedbackStatementRow;
        })
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.topic.localeCompare(b.topic);
        });

      // Recalculate balance after the chronological sort.
      let balance = 0;
      const chronologicalRows = rows.map((row) => {
        balance += row.creditChange;
        return { ...row, balance };
      });

      setStatementRows(chronologicalRows);
    } catch (error) {
      console.error("FEEDBACK STATEMENT LOAD FAILED", error);
      setStatementRows([]);
      setStatementError(
        "We could not fetch the feedback records. Please try again."
      );
    } finally {
      setIsFetchingStatement(false);
    }
  }

  async function generateStatementPdf() {
    if (!statementRows.length) return;

    setIsGeneratingStatementPdf(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;

      const columnWidths = [
        17, // Date
        32, // Topic
        57, // Subtopics
        42, // Response
        48, // Not understood
        25, // Credit
        25, // Balance
      ];

      const headers = [
        "Date",
        "Topic",
        "Teacher subtopics",
        "Response",
        "Not understood",
        "Credits",
        "Balance",
      ];

      const wrap = (text: string, width: number, fontSize = 6.5) => {
        doc.setFontSize(fontSize);
        return doc.splitTextToSize(text || "—", width - 3);
      };

      let y = 10;

      const drawHeader = () => {
        doc.setFillColor(255, 247, 237);
        doc.rect(margin, y, usableWidth, 13, "F");
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, usableWidth, 13);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);

        let x = margin;
        headers.forEach((header, index) => {
          doc.text(header, x + 1.5, y + 8);
          x += columnWidths[index];
          doc.line(x, y, x, y + 13);
        });

        y += 13;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("Daily Lecture Feedback Statement", margin, y + 4);

      y += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Subject: ${statementSubject}   |   Period: ${formatStatementDate(
          statementStartDate
        )} to ${formatStatementDate(statementEndDate)}`,
        margin,
        y + 2
      );

      y += 7;
      drawHeader();

      statementRows.forEach((row) => {
        const cells = [
          formatStatementDate(row.date),
          row.topic,
          row.subtopics.join(", "),
          getResponseLabel(row.response),
          row.difficultConcepts.length
            ? row.difficultConcepts.join(", ")
            : row.response
              ? "—"
              : "—",
          row.creditChange > 0
            ? "+1"
            : row.creditChange < 0
              ? "−10"
              : "0",
          String(row.balance),
        ];

        const wrapped = cells.map((cell, index) =>
          wrap(String(cell), columnWidths[index])
        );

        const maxLines = Math.max(...wrapped.map((lines) => lines.length));
        const rowHeight = Math.max(9, maxLines * 3.2 + 3);

        if (y + rowHeight > pageHeight - 10) {
          doc.addPage();
          y = 10;
          drawHeader();
        }

        let x = margin;
        doc.setDrawColor(226, 232, 240);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(51, 65, 85);

        wrapped.forEach((lines, index) => {
          const color =
            index === 5 && row.creditChange > 0
              ? [22, 163, 74]
              : index === 5 && row.creditChange < 0
                ? [220, 38, 38]
                : [51, 65, 85];

          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(lines, x + 1.5, y + 4.5, {
            baseline: "top",
          });
          x += columnWidths[index];
          doc.line(x, y, x, y + rowHeight);
        });

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + rowHeight, margin + usableWidth, y + rowHeight);
        y += rowHeight;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Credit rule: +1 for successful feedback; −10 for a missed completed-day teacher log; today's pending feedback is not debited yet.",
        margin,
        pageHeight - 5
      );

      doc.save(
        `Daily-Lecture-Feedback-${statementStartDate}-to-${statementEndDate}.pdf`
      );
    } catch (error) {
      console.error("DAILY FEEDBACK PDF GENERATION FAILED", error);
      alert("The PDF could not be generated. Please try again.");
    } finally {
      setIsGeneratingStatementPdf(false);
    }
  }

return (
  <>
    <style>{`
      /* =========================================================
         DAILY LECTURE FEEDBACK
         COMPACT RESPONSIVE UI
         FUNCTIONAL LOGIC UNCHANGED
      ========================================================= */

      .dlf-page,
      .dlf-page * {
        box-sizing: border-box;
      }

      .dlf-page {
        width: 100%;
        min-width: 0;
        color: #0f172a;
      }

      .dlf-surface {
        width: 100%;
        min-width: 0;
        background: #ffffff;
        border: 1px solid #dbe4ef;
        border-radius: 22px;
        box-shadow: 0 5px 18px rgba(15, 23, 42, 0.035);
      }

      .dlf-eyebrow {
        color: #f97316;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .dlf-title {
        margin: 7px 0 0;
        color: #0f172a;
        font-size: 26px;
        line-height: 1.12;
        font-weight: 900;
        letter-spacing: -0.55px;
      }

      .dlf-copy {
        margin: 7px 0 0;
        max-width: 720px;
        color: #64748b;
        font-size: 15px;
        line-height: 1.48;
      }


      /* =========================================================
         LEARNING GAP STATUS
      ========================================================= */

      .dlf-gap-section {
        position: relative;
        overflow: hidden;
        padding: 22px 24px;
        margin-bottom: 18px;
      }

      .dlf-section-head {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .dlf-status-pill {
        flex-shrink: 0;
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 11px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.45px;
        text-transform: uppercase;
      }

      .dlf-status-orange {
        color: #c2410c;
        background: #fff7ed;
        border: 1px solid #fed7aa;
      }

      .dlf-gap-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 17px;
      }

      .dlf-gap-card {
        padding: 16px;
        border: 1px solid #fed7aa;
        border-radius: 16px;
        background: #fffaf5;
      }

      .dlf-gap-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .dlf-gap-meta {
        min-width: 0;
        padding: 10px 11px;
        border: 1px solid #edf2f7;
        border-radius: 10px;
        background: #ffffff;
      }

      .dlf-label {
        display: block;
        margin-bottom: 4px;
        color: #94a3b8;
        font-size: 10px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 0.75px;
        text-transform: uppercase;
      }

      .dlf-value {
        color: #25324a;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .dlf-value-orange {
        color: #c2410c;
      }

      .dlf-gap-question {
        margin: 12px 0 0;
        color: #475569;
        font-size: 13px;
        line-height: 1.45;
        font-weight: 600;
      }

      .dlf-response-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-top: 11px;
      }

      .dlf-choice {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        padding: 10px 11px;
        border: 1px solid #dbe4ef;
        border-radius: 10px;
        background: #ffffff;
        color: #334155;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 750;
        cursor: pointer;
      }

      .dlf-choice input {
        flex: 0 0 auto;
        width: 15px;
        height: 15px;
        accent-color: #f97316;
      }

      .dlf-submit-gap {
        min-height: 36px;
        margin-top: 11px;
        padding: 0 15px;
        border: 0;
        border-radius: 9px;
        background: #0f2f63;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.3px;
        cursor: pointer;
      }


      /* =========================================================
         NO LEARNING GAPS
      ========================================================= */

      .dlf-clear-card {
        position: relative;
        overflow: hidden;
        margin-bottom: 18px;
        padding: 17px 22px;
        border-color: #86efac;
        background: linear-gradient(135deg, #f4fff8 0%, #ffffff 100%);
      }

      .dlf-clear-row {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .dlf-clear-icon {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #86efac;
        border-radius: 13px;
        background: #dcfce7;
        color: #16a34a;
        font-size: 22px;
        font-weight: 900;
      }

      .dlf-clear-eyebrow {
        color: #16a34a;
        font-size: 11px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 1.4px;
        text-transform: uppercase;
      }

      .dlf-clear-title {
        margin: 3px 0 0;
        color: #166534;
        font-size: 20px;
        line-height: 1.2;
        font-weight: 900;
      }

      .dlf-clear-copy {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 13px;
        line-height: 1.42;
      }


      .dlf-loading {
        min-height: 220px; display: flex; align-items: center;
        justify-content: center; padding: 28px 18px; text-align: center;
      }
      .dlf-loading-card {
        width: min(470px, 100%); padding: 26px 22px;
        border: 1px solid #dbe4ef; border-radius: 18px; background: #f8fafc;
      }
      .dlf-loading-spinner {
        width: 40px; height: 40px; margin: 0 auto;
        border: 4px solid #ffedd5; border-top-color: #f97316;
        border-radius: 50%; animation: dlf-spin .8s linear infinite;
      }
      .dlf-loading-title { margin: 15px 0 0; color: #0f172a; font-size: 17px; font-weight: 900; }
      .dlf-loading-copy { margin: 7px auto 0; max-width: 390px; color: #64748b; font-size: 13px; line-height: 1.5; }
      @keyframes dlf-spin { to { transform: rotate(360deg); } }

      /* =========================================================
         DAILY FEEDBACK LEDGER
      ========================================================= */

      .dlf-ledger {
        position: relative;
        overflow: hidden;
        padding: 22px 24px 24px;
      }

      .dlf-ledger-count {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 11px;
        border: 1px solid #dbe4ef;
        border-radius: 11px;
        background: #f8fafc;
        color: #64748b;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .dlf-ledger-count strong {
        color: #f97316;
        font-size: 20px;
        line-height: 1;
      }

      .dlf-feed {
        display: flex;
        flex-direction: column;
        gap: 13px;
        margin-top: 18px;
      }


      /* =========================================================
         LECTURE CARD
      ========================================================= */

      .dlf-lecture-card {
        position: relative;
        overflow: hidden;
        border: 1px solid #dbe4ef;
        border-radius: 17px;
        background: #ffffff;
      }

      .dlf-lecture-card::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #f97316;
      }

      /* NEW:
         clear green/orange card edge depending on feedback state */

      .dlf-lecture-card-submitted {
        border-color: #bbf7d0;
      }

      .dlf-lecture-card-submitted::before {
        background: #16a34a;
      }

      .dlf-lecture-card-pending {
        border-color: #fed7aa;
      }

      .dlf-lecture-card-pending::before {
        background: #f97316;
      }

      .dlf-lecture-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 18px;
        padding: 18px 18px 18px 21px;
      }

      .dlf-lecture-main {
        min-width: 0;
      }


      /* =========================================================
         NEW — TOP LECTURE HEADER + STATUS
      ========================================================= */

      .dlf-lecture-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        min-width: 0;
      }

      .dlf-lecture-heading {
        flex: 1 1 auto;
        min-width: 0;
      }

      .dlf-card-status {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 34px;
        padding: 5px 10px 5px 6px;
        border-radius: 999px;
        white-space: nowrap;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.45px;
        text-transform: uppercase;
      }

      .dlf-card-status-icon {
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 13px;
        line-height: 1;
        font-weight: 900;
      }

      .dlf-card-status-submitted {
        color: #15803d;
        border: 1px solid #86efac;
        background: #f0fdf4;
      }

      .dlf-card-status-submitted .dlf-card-status-icon {
        color: #ffffff;
        background: #16a34a;
      }

      .dlf-card-status-pending {
        color: #c2410c;
        border: 1px solid #fdba74;
        background: #fff7ed;
      }

      .dlf-card-status-pending .dlf-card-status-icon {
        color: #ffffff;
        background: #f97316;
      }


      .dlf-subject-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px;
      }

      .dlf-subject {
        display: inline-flex;
        align-items: center;
        min-height: 27px;
        padding: 0 10px;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.55px;
        text-transform: uppercase;
      }

      .dlf-date {
        color: #94a3b8;
        font-size: 11px;
        line-height: 1.2;
        font-weight: 800;
      }

      .dlf-topic {
        margin: 10px 0 0;
        color: #0f172a;
        font-size: 21px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: -0.3px;
      }


      /* =========================================================
         CONCEPTS
      ========================================================= */

      .dlf-covered {
        margin-top: 12px;
        padding: 12px 13px;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        background: #f8fbff;
      }

      .dlf-covered-title {
        color: #1e3a8a;
        font-size: 10px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 0.75px;
        text-transform: uppercase;
      }

      .dlf-concepts {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .dlf-concept-chip {
        padding: 6px 9px;
        border: 1px solid #cfe1ff;
        border-radius: 8px;
        background: #ffffff;
        color: #334155;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 750;
      }


      /* =========================================================
         LECTURE META
      ========================================================= */

      .dlf-meta {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 7px;
        margin-top: 10px;
      }

      .dlf-meta-item {
        min-width: 0;
        padding: 9px 10px;
        border: 1px solid #e5ebf3;
        border-radius: 10px;
        background: #f8fafc;
      }

      .dlf-meta-item-wide {
        grid-column: span 2;
      }

      .dlf-meta-value {
        color: #334155;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 800;
        overflow-wrap: anywhere;
      }


      /* =========================================================
         FEEDBACK PANEL
      ========================================================= */

      .dlf-feedback-panel {
        min-width: 0;
        align-self: stretch;
        padding-left: 17px;
        border-left: 1px solid #e8edf4;
      }

      .dlf-feedback-empty {
        height: 100%;
        min-height: 132px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 15px;
        border: 1px dashed #fdba74;
        border-radius: 13px;
        background: #fffaf5;
      }

      .dlf-feedback-empty-label {
        color: #ea580c;
        font-size: 10px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .dlf-feedback-empty-title {
        margin-top: 5px;
        color: #0f172a;
        font-size: 15px;
        line-height: 1.3;
        font-weight: 900;
      }

      .dlf-feedback-empty-copy {
        margin-top: 4px;
        color: #64748b;
        font-size: 12px;
        line-height: 1.4;
      }

      .dlf-feedback-button {
        min-height: 36px;
        margin-top: 10px;
        padding: 0 14px;
        border: 0;
        border-radius: 9px;
        background: #ff6b00;
        color: #ffffff;
        font-size: 11px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.2px;
        cursor: pointer;
      }


      /* =========================================================
         SUBMITTED FEEDBACK
      ========================================================= */

      .dlf-submitted {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .dlf-submitted-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 11px;
        border: 1px solid #86efac;
        border-radius: 10px;
        background: #f0fdf4;
      }

      .dlf-submitted-head span:first-child {
        color: #15803d;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 900;
      }

      .dlf-submitted-head span:last-child {
        color: #16a34a;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.45px;
        text-transform: uppercase;
      }

      .dlf-feedback-info {
        padding: 10px 11px;
        border: 1px solid #dbe4ef;
        border-radius: 10px;
        background: #f8fafc;
      }

      .dlf-feedback-info-red {
        border-color: #fca5a5;
        background: #fff7f7;
      }

      .dlf-feedback-info-orange {
        border-color: #fdba74;
        background: #fffaf5;
      }

      .dlf-feedback-info-title {
        margin-bottom: 5px;
        color: #94a3b8;
        font-size: 10px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 0.7px;
        text-transform: uppercase;
      }

      .dlf-feedback-info-value {
        color: #334155;
        font-size: 13px;
        line-height: 1.4;
        font-weight: 750;
      }

      .dlf-feedback-info-red .dlf-feedback-info-title {
        color: #dc2626;
      }

      .dlf-feedback-info-orange .dlf-feedback-info-title {
        color: #ea580c;
      }

      .dlf-difficult-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .dlf-difficult-chip {
        padding: 6px 8px;
        border: 1px solid #fca5a5;
        border-radius: 7px;
        background: #ffffff;
        color: #b91c1c;
        font-size: 11px;
        line-height: 1.2;
        font-weight: 800;
      }


      /* =========================================================
         FEEDBACK FORM
      ========================================================= */

      .dlf-form {
        margin: 0 18px 18px 21px;
        padding: 16px;
        border: 1px solid #fdba74;
        border-radius: 14px;
        background: #fffaf5;
      }

      .dlf-form-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 11px;
        border-bottom: 1px solid #ffedd5;
      }

      .dlf-form-icon {
        width: 35px;
        height: 35px;
        flex: 0 0 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #fed7aa;
        border-radius: 10px;
        background: #fff7ed;
        color: #ea580c;
        font-size: 16px;
        font-weight: 900;
      }

      .dlf-form-eyebrow {
        color: #ea580c;
        font-size: 10px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .dlf-form-title {
        margin-top: 3px;
        color: #0f172a;
        font-size: 14px;
        line-height: 1.3;
        font-weight: 900;
      }

      .dlf-option-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
        margin-top: 12px;
      }

      .dlf-form-choice {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        padding: 9px 10px;
        border: 1px solid #dbe4ef;
        border-radius: 9px;
        background: #ffffff;
        color: #334155;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 750;
        cursor: pointer;
      }

      .dlf-form-choice input {
        width: 15px;
        height: 15px;
        flex: 0 0 auto;
        accent-color: #f97316;
      }

      .dlf-form-section {
        margin-top: 14px;
        padding-top: 13px;
        border-top: 1px solid #ffedd5;
      }

      .dlf-form-label {
        color: #0f172a;
        font-size: 13px;
        line-height: 1.4;
        font-weight: 850;
      }

      .dlf-textarea {
        width: 100%;
        min-height: 66px;
        margin-top: 8px;
        padding: 10px 11px;
        resize: vertical;
        outline: none;
        border: 1px solid #cbd5e1;
        border-radius: 9px;
        background: #ffffff;
        color: #0f172a;
        font: inherit;
        font-size: 13px;
        line-height: 1.45;
      }

      .dlf-textarea:focus {
        border-color: #fb923c;
        box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
      }

      .dlf-form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 14px;
      }

      .dlf-cancel-button,
      .dlf-submit-button {
        min-height: 36px;
        padding: 0 14px;
        border-radius: 9px;
        font-size: 11px;
        line-height: 1;
        font-weight: 900;
        cursor: pointer;
      }

      .dlf-cancel-button {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #475569;
      }

      .dlf-submit-button {
        border: 1px solid #ff6b00;
        background: #ff6b00;
        color: #ffffff;
      }


      /* =========================================================
         EMPTY STATE
      ========================================================= */

      .dlf-empty {
        margin-top: 17px;
        padding: 30px 20px;
        border: 1px dashed #cbd5e1;
        border-radius: 16px;
        background: #fafcff;
        text-align: center;
      }

      .dlf-empty-icon {
        width: 42px;
        height: 42px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #fed7aa;
        border-radius: 12px;
        background: #fff7ed;
        color: #ea580c;
        font-size: 18px;
      }

      .dlf-empty h2 {
        margin: 10px 0 0;
        color: #0f172a;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 900;
      }

      .dlf-empty p {
        max-width: 580px;
        margin: 6px auto 0;
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
      }


      /* =========================================================
         DAILY FEEDBACK CREDIT LEDGER
         Same responsive credit language as CreditDashboard
      ========================================================= */

      .dlf-credit-section {
        position: relative;
        overflow: hidden;
        margin-bottom: 18px;
        padding: 22px 24px 24px;
      }

      .dlf-credit-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-top: 14px;
      }

      .dlf-credit-card {
        position: relative;
        overflow: hidden;
        min-height: 102px;
        border-radius: 18px;
        padding: 17px 20px;
      }

      .dlf-credit-card::after {
        content: "";
        position: absolute;
        width: 82px;
        height: 82px;
        border-radius: 50%;
        right: -26px;
        top: -34px;
        pointer-events: none;
      }

      .dlf-credit-card-inner {
        position: relative;
        z-index: 1;
      }

      .dlf-credit-label {
        font-size: 10px;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: .7px;
      }

      .dlf-credit-value {
        margin-top: 11px;
        font-size: 27px;
        line-height: 1;
        font-weight: 900;
      }

      .dlf-credit-copy {
        margin-top: 9px;
        color: #64748B;
        font-size: 11px;
        line-height: 1.4;
        font-weight: 600;
      }

      .dlf-credit-earned {
        background: linear-gradient(135deg, #F0FDF4 0%, #FBFFFC 100%);
        border: 1px solid #BBF7D0;
      }

      .dlf-credit-earned::after { background: rgba(22,163,74,.07); }
      .dlf-credit-earned .dlf-credit-label { color: #166534; }
      .dlf-credit-earned .dlf-credit-value { color: #16A34A; }

      .dlf-credit-lost {
        background: linear-gradient(135deg, #FFF7F7 0%, #FFFCFC 100%);
        border: 1px solid #FCA5A5;
      }

      .dlf-credit-lost::after { background: rgba(220,38,38,.06); }
      .dlf-credit-lost .dlf-credit-label { color: #B91C1C; }
      .dlf-credit-lost .dlf-credit-value { color: #DC2626; }

      .dlf-credit-total {
        background: linear-gradient(135deg, #FFF8EF 0%, #FFFCF7 100%);
        border: 1px solid #FED7AA;
      }

      .dlf-credit-total::after { background: rgba(249,115,22,.08); }
      .dlf-credit-total .dlf-credit-label { color: #9A3412; }
      .dlf-credit-total .dlf-credit-value { color: #F97316; }

      .dlf-credit-formula {
        margin-top: 12px;
        padding: 9px 11px;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        background: #F8FAFC;
        color: #64748B;
        font-size: 11px;
        line-height: 1.4;
        font-weight: 700;
      }

      @media (max-width: 1024px) {
        .dlf-credit-section { padding: 19px 20px 20px; margin-bottom: 15px; }
        .dlf-credit-grid { gap: 8px; }
        .dlf-credit-card { min-height: 64px; padding: 9px 9px; }
        .dlf-credit-card::after { width: 58px; height: 58px; }
        .dlf-credit-label { font-size: 7.5px; }
        .dlf-credit-value { margin-top: 5px; font-size: 20px; }
        .dlf-credit-copy { margin-top: 5px; font-size: 8.5px; }
        .dlf-credit-formula { font-size: 10px; }
      }

      @media (max-width: 767px) {
        .dlf-credit-section { padding: 15px; margin-bottom: 12px; }
        .dlf-credit-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; margin-top: 10px; }
        .dlf-credit-card { min-height: 68px; border-radius: 18px; padding: 8px 7px; }
        .dlf-credit-card::after { width: 66px; height: 66px; right: -34px; top: -42px; }
        .dlf-credit-label { font-size: 6.5px; letter-spacing: .7px; }
        .dlf-credit-value { margin-top: 5px; font-size: 18px; }
        .dlf-credit-copy { margin-top: 5px; font-size: 7px; line-height: 1.4; }
        .dlf-credit-formula { margin-top: 9px; padding: 8px 9px; font-size: 9px; }
      }

      /* =========================================================
         TABLET
      ========================================================= */

      @media (max-width: 1024px) {

        .dlf-gap-section {
          padding: 18px 20px;
          margin-bottom: 15px;
        }

        .dlf-clear-card {
          padding: 15px 18px;
          margin-bottom: 15px;
        }

        .dlf-ledger {
          padding: 19px 20px 20px;
        }

        .dlf-title {
          font-size: 24px;
        }

        .dlf-copy {
          font-size: 14px;
        }

        /* CREDIT + TODAY'S FEEDBACK COPY — COMPACT ON TABLET */
        .dlf-credit-section .dlf-copy,
        .dlf-ledger > .dlf-section-head .dlf-copy {
          font-size: 11.5px;
          line-height: 1.32;
          max-width: 560px;
        }

        /* COMPACT LECTURE CARDS — TABLET */
        .dlf-lecture-card {
          border-radius: 11px;
        }

        .dlf-lecture-row {
          gap: 8px;
          padding: 9px 9px 9px 12px;
        }

        .dlf-lecture-top {
          gap: 6px;
        }

        .dlf-subject-row {
          gap: 6px;
        }

        .dlf-subject {
          min-height: 22px;
          padding: 0 7px;
          font-size: 8px;
          border-radius: 7px;
        }

        .dlf-date {
          font-size: 9px;
        }

        .dlf-topic {
          margin-top: 6px;
          font-size: 16px;
          line-height: 1.14;
        }

        .dlf-covered {
          margin-top: 7px;
          padding: 7px 8px;
          border-radius: 9px;
        }

        .dlf-covered-title {
          font-size: 8px;
        }

        .dlf-concepts {
          gap: 4px;
          margin-top: 5px;
        }

        .dlf-concept-chip {
          padding: 4px 6px;
          border-radius: 7px;
          font-size: 9px;
        }

        .dlf-meta {
          gap: 4px;
          margin-top: 6px;
        }

        .dlf-meta-item {
          padding: 6px 7px;
          border-radius: 8px;
        }

        .dlf-label {
          margin-bottom: 2px;
          font-size: 7px;
          letter-spacing: .55px;
        }

        .dlf-meta-value {
          font-size: 9px;
          line-height: 1.25;
        }

        .dlf-feedback-panel {
          margin-top: 7px;
          padding: 7px 0 0;
        }

        .dlf-submitted {
          gap: 4px;
        }

        .dlf-submitted-head {
          padding: 6px 7px;
          border-radius: 8px;
        }

        .dlf-submitted-head span:first-child {
          font-size: 9px;
        }

        .dlf-submitted-head span:last-child {
          font-size: 8px;
        }

        .dlf-feedback-info {
          padding: 6px 7px;
          border-radius: 8px;
        }

        .dlf-feedback-info-title {
          margin-bottom: 3px;
          font-size: 7px;
        }

        .dlf-feedback-info-value {
          font-size: 9.5px;
          line-height: 1.28;
        }

        .dlf-difficult-list {
          gap: 4px;
        }

        .dlf-difficult-chip {
          padding: 4px 5px;
          border-radius: 6px;
          font-size: 9px;
        }

        /* COMPACT GREEN LEARNING-GAP STATUS — TABLET */
        .dlf-clear-card {
          padding: 10px 12px;
        }

        .dlf-clear-row {
          gap: 8px;
        }

        .dlf-clear-icon {
          width: 32px;
          height: 32px;
          flex-basis: 32px;
          border-radius: 9px;
          font-size: 17px;
        }

        .dlf-clear-eyebrow {
          font-size: 8px;
          letter-spacing: .9px;
        }

        .dlf-clear-title {
          margin-top: 2px;
          font-size: 15px;
          line-height: 1.15;
        }

        .dlf-clear-copy {
          margin-top: 2px;
          font-size: 10.5px;
          line-height: 1.28;
        }

        .dlf-gap-grid {
          grid-template-columns: 1fr;
        }

        .dlf-lecture-row {
          grid-template-columns: 1fr;
          gap: 13px;
          padding: 16px 16px 16px 19px;
        }

        .dlf-feedback-panel {
          padding: 13px 0 0;
          border-left: 0;
          border-top: 1px solid #e8edf4;
        }

        .dlf-feedback-empty {
          min-height: 0;
        }

        .dlf-meta {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dlf-meta-item-wide {
          grid-column: span 1;
        }

        .dlf-form {
          margin: 0 16px 16px 19px;
        }

        .dlf-option-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dlf-card-status {
          min-height: 32px;
        }
      }


      /* =========================================================
         MOBILE
      ========================================================= */

      @media (max-width: 767px) {

        .dlf-surface {
          border-radius: 16px;
        }

        .dlf-gap-section {
          padding: 15px;
          margin-bottom: 12px;
        }

        .dlf-section-head {
          align-items: flex-start;
          gap: 8px;
        }

        .dlf-eyebrow {
          font-size: 9px;
          letter-spacing: 1.1px;
        }

        .dlf-title {
          margin-top: 5px;
          font-size: 20px;
          line-height: 1.15;
        }

        .dlf-copy {
          margin-top: 5px;
          font-size: 13px;
          line-height: 1.4;
        }

        /* ONLY THE TWO REQUESTED HEADER PARAGRAPHS */
        .dlf-credit-section .dlf-copy,
        .dlf-ledger > .dlf-section-head .dlf-copy {
          font-size: 10.5px;
          line-height: 1.3;
          max-width: 300px;
        }

        .dlf-status-pill {
          padding: 6px 8px;
          font-size: 9px;
        }

        .dlf-gap-grid {
          gap: 9px;
          margin-top: 12px;
        }

        .dlf-gap-card {
          padding: 12px;
          border-radius: 12px;
        }

        .dlf-gap-meta-grid {
          gap: 6px;
        }

        .dlf-gap-meta {
          padding: 8px;
          border-radius: 8px;
        }

        .dlf-label {
          margin-bottom: 3px;
          font-size: 9px;
        }

        .dlf-value {
          font-size: 12px;
        }

        .dlf-gap-question {
          margin-top: 9px;
          font-size: 12px;
        }

        .dlf-response-options {
          grid-template-columns: 1fr;
          gap: 6px;
          margin-top: 9px;
        }

        .dlf-choice {
          padding: 9px;
          font-size: 12px;
        }

        .dlf-submit-gap {
          width: 100%;
          min-height: 38px;
          margin-top: 9px;
          font-size: 11px;
        }


        /* CLEAR STATUS */

        .dlf-clear-card {
          padding: 9px 10px;
          margin-bottom: 12px;
        }

        .dlf-clear-row {
          gap: 7px;
        }

        .dlf-clear-icon {
          width: 30px;
          height: 30px;
          flex-basis: 30px;
          border-radius: 8px;
          font-size: 16px;
        }

        .dlf-clear-eyebrow {
          font-size: 7.5px;
          letter-spacing: .8px;
        }

        .dlf-clear-title {
          margin-top: 1px;
          font-size: 14px;
          line-height: 1.12;
        }

        .dlf-clear-copy {
          margin-top: 2px;
          font-size: 9.5px;
          line-height: 1.25;
        }


        /* LEDGER */

        .dlf-ledger {
          padding: 15px;
        }

        .dlf-ledger .dlf-section-head {
          align-items: flex-start;
        }

        .dlf-ledger-count {
          padding: 6px 8px;
          gap: 5px;
          border-radius: 8px;
          font-size: 8px;
        }

        .dlf-ledger-count strong {
          font-size: 17px;
        }

        .dlf-feed {
          gap: 10px;
          margin-top: 13px;
        }


        /* LECTURE */

        .dlf-lecture-card {
          border-radius: 11px;
        }

        .dlf-lecture-card::before {
          width: 3px;
        }

        .dlf-lecture-row {
          display: block;
          padding: 8px 8px 8px 11px;
        }

        .dlf-lecture-top {
          gap: 6px;
        }

        .dlf-subject-row {
          gap: 5px;
        }

        .dlf-subject {
          min-height: 21px;
          padding: 0 6px;
          font-size: 7.5px;
          border-radius: 6px;
        }

        .dlf-date {
          font-size: 8.5px;
        }

        .dlf-topic {
          margin-top: 5px;
          font-size: 15px;
          line-height: 1.12;
        }


        /* NEW MOBILE STATUS */

        .dlf-card-status {
          min-height: 29px;
          gap: 5px;
          padding: 4px 8px 4px 4px;
          font-size: 9px;
          letter-spacing: 0.3px;
        }

        .dlf-card-status-icon {
          width: 20px;
          height: 20px;
          flex-basis: 20px;
          font-size: 12px;
        }


        /* CONCEPTS */

        .dlf-covered {
          margin-top: 6px;
          padding: 7px;
          border-radius: 8px;
        }

        .dlf-covered-title {
          font-size: 7.5px;
        }

        .dlf-concepts {
          gap: 4px;
          margin-top: 5px;
        }

        .dlf-concept-chip {
          padding: 4px 6px;
          border-radius: 6px;
          font-size: 9px;
        }


        /* META */

        .dlf-meta {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px;
          margin-top: 6px;
        }

        .dlf-meta-item {
          padding: 6px 7px;
          border-radius: 7px;
        }

        .dlf-meta-item-wide {
          grid-column: span 2;
        }

        .dlf-meta-value {
          font-size: 9px;
          line-height: 1.22;
        }

        .dlf-meta-item .dlf-label {
          margin-bottom: 2px;
          font-size: 7px;
          letter-spacing: .5px;
        }


        /* FEEDBACK */

        .dlf-feedback-panel {
          margin-top: 6px;
          padding: 6px 0 0;
          border-top: 1px solid #e5ebf3;
        }

        .dlf-feedback-empty {
          padding: 8px;
          border-radius: 8px;
        }

        .dlf-feedback-empty-label {
          font-size: 7.5px;
        }

        .dlf-feedback-empty-title {
          font-size: 11px;
        }

        .dlf-feedback-empty-copy {
          font-size: 9px;
        }

        .dlf-feedback-button {
          width: 100%;
          min-height: 32px;
          margin-top: 6px;
          font-size: 9px;
        }

        .dlf-submitted {
          gap: 4px;
        }

        .dlf-submitted-head {
          padding: 6px 7px;
          border-radius: 7px;
        }

        .dlf-submitted-head span:first-child {
          font-size: 8.5px;
        }

        .dlf-submitted-head span:last-child {
          font-size: 7.5px;
        }

        .dlf-feedback-info {
          padding: 6px 7px;
          border-radius: 7px;
        }

        .dlf-feedback-info-title {
          margin-bottom: 3px;
          font-size: 7px;
        }

        .dlf-feedback-info-value {
          font-size: 9px;
          line-height: 1.25;
        }

        .dlf-difficult-list {
          gap: 3px;
        }

        .dlf-difficult-chip {
          padding: 3px 5px;
          border-radius: 6px;
          font-size: 8.5px;
        }


        /* FORM */

        .dlf-form {
          margin: 0 12px 12px 15px;
          padding: 12px;
          border-radius: 11px;
        }

        .dlf-form-head {
          gap: 8px;
          padding-bottom: 9px;
        }

        .dlf-form-icon {
          width: 32px;
          height: 32px;
          flex-basis: 32px;
          font-size: 14px;
        }

        .dlf-form-eyebrow {
          font-size: 9px;
        }

        .dlf-form-title {
          font-size: 13px;
        }

        .dlf-option-grid {
          grid-template-columns: 1fr;
          gap: 6px;
          margin-top: 9px;
        }

        .dlf-form-choice {
          min-height: 38px;
          padding: 8px 9px;
          font-size: 12px;
        }

        .dlf-form-section {
          margin-top: 11px;
          padding-top: 10px;
        }

        .dlf-form-label {
          font-size: 12px;
        }

        .dlf-textarea {
          min-height: 58px;
          margin-top: 7px;
          padding: 9px;
          font-size: 12px;
        }

        .dlf-form-actions {
          gap: 6px;
          margin-top: 11px;
        }

        .dlf-cancel-button,
        .dlf-submit-button {
          min-height: 37px;
          padding: 0 11px;
          font-size: 10px;
        }

        .dlf-submit-button {
          flex: 1;
        }


        /* EMPTY */

        .dlf-empty {
          margin-top: 13px;
          padding: 22px 13px;
          border-radius: 12px;
        }

        .dlf-empty h2 {
          font-size: 16px;
        }

        .dlf-empty p {
          font-size: 12px;
        }
      }


      /* =========================================================
         VERY SMALL MOBILE
      ========================================================= */

      @media (max-width: 420px) {

        .dlf-section-head {
          flex-direction: column;
        }

        .dlf-ledger .dlf-section-head {
          flex-direction: row;
        }

        .dlf-gap-meta-grid {
          grid-template-columns: 1fr;
        }

        .dlf-clear-row {
          align-items: flex-start;
        }

        .dlf-meta {
          grid-template-columns: 1fr 1fr;
        }

        .dlf-meta-item-wide {
          grid-column: span 2;
        }

        .dlf-form-actions {
          align-items: stretch;
        }

        /* Keep status beside the lecture heading,
           but make it compact enough for small phones */

        .dlf-lecture-top {
          align-items: flex-start;
        }

        .dlf-card-status {
          padding-right: 6px;
          font-size: 8px;
        }
      }


      /* =========================================================
         FEEDBACK SUBMISSION STATE
      ========================================================= */

      .dlf-card-status-submitting {
        color: #c2410c;
        background: #fff7ed;
        border-color: #fdba74;
      }

      .dlf-inline-spinner {
        width: 13px;
        height: 13px;
        flex: 0 0 13px;
        display: inline-block;
        border: 2px solid rgba(249, 115, 22, 0.22);
        border-top-color: #f97316;
        border-radius: 50%;
        animation: dlf-spin 0.75s linear infinite;
        vertical-align: -2px;
      }

      .dlf-inline-spinner-light {
        border-color: rgba(255, 255, 255, 0.35);
        border-top-color: #ffffff;
      }

      .dlf-submitting-feedback {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 11px;
        padding: 9px 11px;
        border: 1px solid #fed7aa;
        border-radius: 9px;
        background: #fff7ed;
        color: #c2410c;
        font-size: 11px;
        line-height: 1.3;
        font-weight: 850;
      }

      .dlf-feedback-submit-error {
        margin-top: 11px;
        padding: 9px 11px;
        border: 1px solid #fecaca;
        border-radius: 9px;
        background: #fef2f2;
        color: #b91c1c;
        font-size: 11px;
        line-height: 1.4;
        font-weight: 750;
      }

      .dlf-submit-button:disabled,
      .dlf-cancel-button:disabled,
      .dlf-statement-fetch:disabled,
      .dlf-statement-pdf:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      @keyframes dlf-spin {
        to { transform: rotate(360deg); }
      }

      /* =========================================================
         FEEDBACK STATEMENT
      ========================================================= */

      .dlf-statement-section {
        margin-top: 18px;
        margin-bottom: 18px;
        padding: 22px 24px 24px;
      }

      .dlf-statement-filters {
        display: grid;
        grid-template-columns: minmax(180px, 1.1fr) minmax(150px, .8fr) minmax(150px, .8fr) auto;
        gap: 9px;
        align-items: end;
        margin-top: 17px;
      }

      .dlf-statement-field {
        min-width: 0;
      }

      .dlf-statement-field > span {
        display: block;
        margin-bottom: 5px;
        color: #64748b;
        font-size: 9px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: .75px;
        text-transform: uppercase;
      }

      .dlf-statement-control {
        width: 100%;
        min-height: 38px;
        padding: 0 10px;
        border: 1px solid #cbd5e1;
        border-radius: 9px;
        outline: none;
        background: #ffffff;
        color: #334155;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
      }

      .dlf-statement-control:focus {
        border-color: #fb923c;
        box-shadow: 0 0 0 3px rgba(249,115,22,.08);
      }

      .dlf-statement-fetch,
      .dlf-statement-pdf {
        min-height: 38px;
        padding: 0 13px;
        border: 1px solid #ea580c;
        border-radius: 9px;
        background: #f97316;
        color: #ffffff;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: .2px;
        cursor: pointer;
        white-space: nowrap;
      }

      .dlf-statement-pdf {
        border-color: #cbd5e1;
        background: #ffffff;
        color: #c2410c;
      }

      .dlf-statement-error {
        margin-top: 11px;
        padding: 9px 11px;
        border: 1px solid #fecaca;
        border-radius: 9px;
        background: #fef2f2;
        color: #b91c1c;
        font-size: 11px;
        line-height: 1.4;
        font-weight: 750;
      }

      .dlf-statement-result-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 16px;
        padding: 10px 11px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
      }

      .dlf-statement-result-title {
        color: #0f172a;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 900;
      }

      .dlf-statement-result-copy {
        margin-top: 3px;
        color: #64748b;
        font-size: 9px;
        line-height: 1.35;
        font-weight: 650;
      }

      .dlf-statement-empty {
        margin-top: 12px;
        padding: 20px 12px;
        border: 1px dashed #cbd5e1;
        border-radius: 11px;
        background: #fafcff;
        color: #64748b;
        text-align: center;
        font-size: 11px;
        line-height: 1.45;
        font-weight: 700;
      }

      .dlf-statement-mobile-hint {
        display: none;
        margin-top: 10px;
        padding: 7px 9px;
        border: 1px solid #fed7aa;
        border-radius: 8px;
        background: #fff7ed;
        color: #c2410c;
        font-size: 9px;
        line-height: 1.35;
        font-weight: 800;
        text-align: center;
      }

      .dlf-statement-scroll {
        width: 100%;
        margin-top: 10px;
        overflow-x: visible;
      }

      .dlf-statement-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;
        font-size: 10px;
      }

      .dlf-statement-table th,
      .dlf-statement-table td {
        padding: 7px 6px;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
        text-align: left;
      }

      .dlf-statement-table th:first-child,
      .dlf-statement-table td:first-child {
        border-left: 1px solid #e2e8f0;
      }

      .dlf-statement-table th {
        color: #475569;
        background: #fff7ed;
        font-size: 8px;
        line-height: 1.2;
        font-weight: 900;
        letter-spacing: .25px;
        text-transform: uppercase;
      }

      .dlf-statement-table th:first-child {
        border-top-left-radius: 9px;
      }

      .dlf-statement-table th:last-child {
        border-top-right-radius: 9px;
      }

      .dlf-statement-table td {
        color: #475569;
        background: #ffffff;
        font-size: 9px;
        line-height: 1.35;
        font-weight: 650;
        overflow-wrap: anywhere;
      }

      .dlf-statement-date,
      .dlf-statement-balance {
        white-space: nowrap;
        font-weight: 900 !important;
        color: #334155 !important;
      }

      .dlf-statement-topic {
        color: #0f172a !important;
        font-weight: 850 !important;
      }

      .dlf-statement-subtopics,
      .dlf-statement-difficult {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .dlf-statement-subtopics span,
      .dlf-statement-difficult span {
        display: block;
      }

      .dlf-statement-response {
        display: inline-block;
        padding: 4px 5px;
        border-radius: 6px;
        font-size: 8px;
        line-height: 1.25;
        font-weight: 850;
      }

      .dlf-statement-response-selected {
        color: #166534;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
      }

      .dlf-statement-response-pending {
        color: #c2410c;
        background: #fff7ed;
        border: 1px solid #fed7aa;
      }

      .dlf-statement-credit-positive {
        color: #15803d !important;
        font-weight: 900 !important;
        white-space: nowrap;
      }

      .dlf-statement-credit-negative {
        color: #dc2626 !important;
        font-weight: 900 !important;
        white-space: nowrap;
      }

      .dlf-statement-credit-neutral {
        color: #c2410c !important;
        font-weight: 900 !important;
        white-space: nowrap;
      }

      .dlf-statement-credit-label {
        display: block;
        margin-top: 2px;
        color: #94a3b8;
        font-size: 7px;
        line-height: 1.2;
        font-weight: 700;
        white-space: normal;
      }

      @media (max-width: 1099px) {
        .dlf-statement-section {
          padding: 15px;
          margin-top: 12px;
          margin-bottom: 12px;
        }

        .dlf-statement-filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
          margin-top: 11px;
        }

        .dlf-statement-fetch {
          width: 100%;
          grid-column: 1 / -1;
        }

        .dlf-statement-mobile-hint {
          display: block;
        }

        .dlf-statement-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          border-radius: 9px;
        }

        .dlf-statement-table {
          min-width: 980px;
          table-layout: fixed;
        }

        .dlf-statement-table th,
        .dlf-statement-table td {
          padding: 6px 5px;
        }

        .dlf-statement-result-head {
          align-items: flex-start;
        }
      }

      @media (max-width: 767px) {
        .dlf-statement-filters {
          grid-template-columns: 1fr;
        }

        .dlf-statement-fetch {
          grid-column: auto;
        }

        .dlf-statement-result-head {
          flex-direction: column;
          align-items: stretch;
        }

        .dlf-statement-pdf {
          width: 100%;
        }

        .dlf-statement-mobile-hint {
          font-size: 8.5px;
        }
      }

    `}</style>


    <div className="dlf-page">

      {/* =====================================================
          DAY BEFORE YESTERDAY'S DOUBT FEEDBACK
      ===================================================== */}

      {pendingDoubts.length > 0 ? (

        <section className="dlf-surface dlf-gap-section">

          <div className="dlf-section-head">

            <div>

              <div className="dlf-eyebrow"></div>

              <h2 className="dlf-title">
                Day Before Yesterday's Doubt Feedback
              </h2>

              <p className="dlf-copy">
                Confirm whether your teacher revisited concepts
                that were difficult in an earlier lecture.
              </p>

            </div>


            <div className="dlf-status-pill dlf-status-orange">
              {pendingDoubts.length} Pending
            </div>

          </div>


          <div className="dlf-gap-grid">

            {pendingDoubts.map((doubt: any) => (

              <div
                key={doubt.id}
                className="dlf-gap-card"
              >

                <div className="dlf-gap-meta-grid">

                  <div className="dlf-gap-meta">

                    <span className="dlf-label">
                      Subject
                    </span>

                    <div className="dlf-value">
                      {doubt.subject_name}
                    </div>

                  </div>


                  <div className="dlf-gap-meta">

                    <span className="dlf-label">
                      Teacher
                    </span>

                    <div className="dlf-value">
                      {doubt.teacher_name}
                    </div>

                  </div>


                  <div className="dlf-gap-meta">

                    <span className="dlf-label">
                      Previous Topic
                    </span>

                    <div className="dlf-value">
                      {doubt.previous_topic_name}
                    </div>

                  </div>


                  <div className="dlf-gap-meta">

                    <span className="dlf-label">
                      Difficult Concept
                    </span>

                    <div className="dlf-value dlf-value-orange">
                      {doubt.previous_difficult_concept}
                    </div>

                  </div>

                </div>


                <p className="dlf-gap-question">
                  You previously marked this concept as difficult.
                  Was it discussed again today?
                </p>


                <div className="dlf-response-options">

                  <label className="dlf-choice">

                    <input
                      type="radio"
                      name={doubt.id}
                      checked={
                        selectedResponse[doubt.id] ===
                        "DISCUSSED"
                      }
                      onChange={() => {

                        setSelectedResponse(
                          (previous) => ({
                            ...previous,
                            [doubt.id]: "DISCUSSED",
                          })
                        );

                      }}
                    />

                    <span>
                      Yes, discussed today
                    </span>

                  </label>


                  <label className="dlf-choice">

                    <input
                      type="radio"
                      name={doubt.id}
                      checked={
                        selectedResponse[doubt.id] ===
                        "NOT DISCUSSED"
                      }
                      onChange={() => {

                        setSelectedResponse(
                          (previous) => ({
                            ...previous,
                            [doubt.id]: "NOT DISCUSSED",
                          })
                        );

                      }}
                    />

                    <span>
                      Not discussed yet
                    </span>

                  </label>

                </div>


                <button
                  onClick={() => {
                    submitPendingDoubt(doubt);
                  }}
                  className="dlf-submit-gap"
                >
                  SUBMIT RESPONSE
                </button>

              </div>

            ))}

          </div>

        </section>

      ) : (

        <section className="dlf-surface dlf-clear-card">

          <div className="dlf-clear-row">

            <div className="dlf-clear-icon">
              ✓
            </div>


            <div>

              <div className="dlf-clear-eyebrow">
                LEARNING GAP STATUS
              </div>

              <h2 className="dlf-clear-title">
                No Pending Learning Gaps
              </h2>

              <p className="dlf-clear-copy">
                All previously identified difficult concepts have
                either been revised by your teacher or already
                resolved.
              </p>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          DAILY FEEDBACK CREDIT LEDGER
      ===================================================== */}

      <section className="dlf-surface dlf-credit-section">
        <div className="dlf-section-head">
          <div>
            <div className="dlf-eyebrow">DAILY FEEDBACK CREDITS</div>
            <h2 className="dlf-title">Academic Feedback Credit Ledger</h2>
            <p className="dlf-copy">
              Earn 1 credit for every submitted teacher-log feedback.
              Lose 10 credits for every missed teacher-log feedback.
            </p>
          </div>
          <div className="dlf-ledger-count">
            {isLoadingCreditSummary ? "CALCULATING" : "LIVE"}
          </div>
        </div>

        <div className="dlf-credit-grid">
          <div className="dlf-credit-card dlf-credit-earned">
            <div className="dlf-credit-card-inner">
              <div className="dlf-credit-label">CREDITS EARNED</div>
              <div className="dlf-credit-value">
                {isLoadingCreditSummary ? "—" : dailyFeedbackEarnedCredits}
              </div>
              <div className="dlf-credit-copy">
                +1 for every feedback submitted on a received teacher log
              </div>
            </div>
          </div>

          <div className="dlf-credit-card dlf-credit-lost">
            <div className="dlf-credit-card-inner">
              <div className="dlf-credit-label">CREDITS LOST</div>
              <div className="dlf-credit-value">
                {isLoadingCreditSummary ? "—" : dailyFeedbackLostCredits}
              </div>
              <div className="dlf-credit-copy">
                -10 only for a received teacher log whose feedback was missed
              </div>
            </div>
          </div>

          <div className="dlf-credit-card dlf-credit-total">
            <div className="dlf-credit-card-inner">
              <div className="dlf-credit-label">TOTAL CREDITS</div>
              <div className="dlf-credit-value">
                {isLoadingCreditSummary ? "—" : dailyFeedbackTotalCredits}
              </div>
              <div className="dlf-credit-copy">
                Earned credits minus lost credits
              </div>
            </div>
          </div>
        </div>

        <div className="dlf-credit-formula">
          Total Credits = Credits Earned − Credits Lost
        </div>
      </section>


      {/* =====================================================
          TODAY'S CLASS FEEDBACK
      ===================================================== */}

      <section className="dlf-surface dlf-ledger">

        <div className="dlf-section-head">

          <div>

            <div className="dlf-eyebrow"></div>

            <h2 className="dlf-title">
              Submit Your Today's Topic Feedback
            </h2>

            <p className="dlf-copy">
              Review today's classroom activity and complete
              your learning feedback for each lecture.
            </p>

          </div>


          <div className="dlf-ledger-count">

            <strong>
              {lectureLogs.length}
            </strong>

            {lectureLogs.length === 1
              ? "Lecture"
              : "Lectures"}

          </div>

        </div>


        {isLoadingLogs ? (

          <div className="dlf-loading">
            <div className="dlf-loading-card">
              <div className="dlf-loading-spinner" />
              <h2 className="dlf-loading-title">Loading your recent topic logs</h2>
              <p className="dlf-loading-copy">
                We are loading your recent classroom topics. Kindly give feedback
                on your understanding level to help your teacher understand your learning progress.
              </p>
            </div>
          </div>

        ) : lectureLogs.length === 0 ? (

          <div className="dlf-empty">

            <div className="dlf-empty-icon">
              ◇
            </div>

            <h2>
              No Daily Lecture Logs Available
            </h2>

            <p>
              Your teachers have not submitted classroom
              lecture logs for today. Once today's classroom
              activities are recorded, they will automatically
              appear here.
            </p>

          </div>

        ) : (

          <div className="dlf-feed">

            {lectureLogs.map((log) => (

              <article
                key={log.id}
                className={`dlf-lecture-card ${
                  submittedFeedback[log.id]
                    ? "dlf-lecture-card-submitted"
                    : "dlf-lecture-card-pending"
                }`}
              >

                <div className="dlf-lecture-row">


                  {/* =========================================
                      LECTURE INFORMATION
                  ========================================= */}

                  <div className="dlf-lecture-main">


                    {/* =======================================
                        NEW:
                        SUBJECT/DATE LEFT
                        STATUS RIGHT
                    ======================================= */}

                    <div className="dlf-lecture-top">

                      <div className="dlf-lecture-heading">

                        <div className="dlf-subject-row">

                          <span className="dlf-subject">
                            {log.subject_name ??
                              "Subject Pending"}
                          </span>

                          <span className="dlf-date">
                            {log.log_date ??
                              "Date Pending"}
                          </span>

                        </div>


                        <h3 className="dlf-topic">
                          {log.topic_name ??
                            "Topic Not Available"}
                        </h3>

                      </div>


                      {/* =====================================
                          NEW CARD STATUS
                      ===================================== */}

                      {isSubmittingFeedbackId === log.id ? (

                        <div className="dlf-card-status dlf-card-status-submitting">
                          <span className="dlf-inline-spinner" />
                          <span>Submitting...</span>
                        </div>

                      ) : submittedFeedback[log.id] ? (

                        <div className="dlf-card-status dlf-card-status-submitted">

                          <span className="dlf-card-status-icon">
                            ✓
                          </span>

                          <span>
                            Submitted
                          </span>

                        </div>

                      ) : (

                        <div className="dlf-card-status dlf-card-status-pending">

                          <span className="dlf-card-status-icon">
                            !
                          </span>

                          <span>
                            Pending
                          </span>

                        </div>

                      )}

                    </div>


                    {/* =====================================
                        CONCEPTS
                    ===================================== */}

                    <div className="dlf-covered">

                      <div className="dlf-covered-title">
                        Concepts Covered Today
                      </div>


                      <div className="dlf-concepts">

                        {(log.concepts_covered ?? [])
                          .length > 0 ? (

                          (log.concepts_covered ?? [])
                            .map(
                              (concept: string) => (

                                <span
                                  key={concept}
                                  className="dlf-concept-chip"
                                >
                                  {concept}
                                </span>

                              )
                            )

                        ) : (

                          <span className="dlf-concept-chip">
                            No concepts recorded
                          </span>

                        )}

                      </div>

                    </div>


                    {/* =====================================
                        LECTURE DETAILS
                    ===================================== */}

                    <div className="dlf-meta">


                      <div className="dlf-meta-item">

                        <span className="dlf-label">
                          Teacher
                        </span>

                        <div className="dlf-meta-value">
                          {log.teacher_name ??
                            "Teacher Name Pending"}
                        </div>

                      </div>


                      <div className="dlf-meta-item">

                        <span className="dlf-label">
                          Book Coverage
                        </span>

                        <div className="dlf-meta-value">
                          Page {log.page_from ?? "-"} –{" "}
                          {log.page_to ?? "-"}
                        </div>

                      </div>


                      <div className="dlf-meta-item">

                        <span className="dlf-label">
                          Homework
                        </span>

                        <div className="dlf-meta-value">
                          {log.homework_given
                            ? "Given"
                            : "Not Given"}
                        </div>

                      </div>


                      <div className="dlf-meta-item">

                        <span className="dlf-label">
                          Feedback
                        </span>

                        <div
                          className="dlf-meta-value"
                          style={{
                            color:
                              submittedFeedback[log.id]
                                ? "#15803D"
                                : "#EA580C",
                          }}
                        >
                          {submittedFeedback[log.id]
                            ? "Submitted"
                            : "Pending"}
                        </div>

                      </div>


                      <div className="dlf-meta-item dlf-meta-item-wide">

                        <span className="dlf-label">
                          Teacher Notes
                        </span>

                        <div className="dlf-meta-value">
                          {log.teacher_notes ??
                            "No notes provided."}
                        </div>

                      </div>


                      <div className="dlf-meta-item dlf-meta-item-wide">

                        <span className="dlf-label">
                          Lecture Date
                        </span>

                        <div className="dlf-meta-value">
                          {log.log_date ?? "Pending"}
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =========================================
                      STUDENT FEEDBACK
                  ========================================= */}

                  <div className="dlf-feedback-panel">


                    {submittedFeedback[log.id] ? (

                      <div className="dlf-submitted">


                        <div className="dlf-submitted-head">

                          <span>
                            ✓ Feedback Submitted
                          </span>

                          <span>
                            Recorded
                          </span>

                        </div>


                        <div className="dlf-feedback-info">

                          <div className="dlf-feedback-info-title">
                            Understanding Level
                          </div>

                          <div className="dlf-feedback-info-value">
                            {
                              submittedFeedback[log.id]
                                ?.understanding_level
                            }
                          </div>

                        </div>


                        {submittedFeedback[log.id]
                          ?.concepts_not_understood
                          ?.length > 0 && (

                          <div className="dlf-feedback-info dlf-feedback-info-red">

                            <div className="dlf-feedback-info-title">
                              Difficult Concepts
                            </div>


                            <div className="dlf-difficult-list">

                              {submittedFeedback[log.id]
                                ?.concepts_not_understood
                                ?.map(
                                  (concept: string) => (

                                    <span
                                      key={concept}
                                      className="dlf-difficult-chip"
                                    >
                                      {concept}
                                    </span>

                                  )
                                )}

                            </div>

                          </div>

                        )}


                        {submittedFeedback[log.id]
                          ?.additional_note && (

                          <div className="dlf-feedback-info dlf-feedback-info-orange">

                            <div className="dlf-feedback-info-title">
                              Additional Note
                            </div>

                            <div className="dlf-feedback-info-value">
                              {
                                submittedFeedback[log.id]
                                  ?.additional_note
                              }
                            </div>

                          </div>

                        )}

                      </div>

                    ) : (

                      <div className="dlf-feedback-empty">

                        <div className="dlf-feedback-empty-label">
                          Student Check-In
                        </div>

                        <div className="dlf-feedback-empty-title">
                          How well did you understand this lecture?
                        </div>

                        <div className="dlf-feedback-empty-copy">
                          Record your understanding and identify
                          concepts that need more attention.
                        </div>


                        <button
                          onClick={() => {

                            setExpandedCard(log.id);

                            setUnderstandingLevel("");

                            setConceptsNotUnderstood([]);

                            setAdditionalNote("");

                            setSomethingElse(false);

                            setSomethingElseText("");

                          }}
                          className="dlf-feedback-button"
                        >
                          SUBMIT DAILY FEEDBACK
                        </button>

                      </div>

                    )}

                  </div>

                </div>


                {/* =============================================
                    FEEDBACK FORM
                ============================================= */}

                {expandedCard === log.id && (

                  <div className="dlf-form">


                    <div className="dlf-form-head">

                      <div className="dlf-form-icon">
                        ✓
                      </div>


                      <div>

                        <div className="dlf-form-eyebrow">
                          DAILY LEARNING CHECK-IN
                        </div>

                        <div className="dlf-form-title">
                          How well did you understand today's class?
                        </div>

                      </div>

                    </div>


                    {/* UNDERSTANDING OPTIONS */}

                    <div className="dlf-option-grid">

                      {UNDERSTANDING_OPTIONS.map(
                        (option) => (

                          <label
                            key={option}
                            className="dlf-form-choice"
                          >

                            <input
                              type="radio"
                              name={`understanding-${log.id}`}
                              value={option}
                              checked={
                                understandingLevel ===
                                option
                              }
                              onChange={() =>
                                setUnderstandingLevel(
                                  option
                                )
                              }
                            />

                            <span>
                              {option}
                            </span>

                          </label>

                        )
                      )}

                    </div>


                    {/* =====================================
                        DIFFICULT CONCEPTS
                    ===================================== */}

                    {understandingLevel !== "" &&
                      understandingLevel !==
                        "I completely understood." && (

                      <>

                        <div className="dlf-form-section">

                          <div className="dlf-form-label">
                            Which concepts were difficult today?
                          </div>


                          <div className="dlf-option-grid">

                            {(log.concepts_covered ?? [])
                              .map(
                                (concept: string) => (

                                  <label
                                    key={concept}
                                    className="dlf-form-choice"
                                  >

                                    <input
                                      type="checkbox"
                                      checked={
                                        conceptsNotUnderstood.includes(
                                          concept
                                        )
                                      }
                                      onChange={(event) => {

                                        if (
                                          event.target.checked
                                        ) {

                                          setConceptsNotUnderstood(
                                            [
                                              ...conceptsNotUnderstood,
                                              concept,
                                            ]
                                          );

                                        } else {

                                          setConceptsNotUnderstood(
                                            conceptsNotUnderstood.filter(
                                              (item) =>
                                                item !== concept
                                            )
                                          );

                                        }

                                      }}
                                    />

                                    <span>
                                      {concept}
                                    </span>

                                  </label>

                                )
                              )}


                            <label className="dlf-form-choice">

                              <input
                                type="checkbox"
                                checked={somethingElse}
                                onChange={(event) =>
                                  setSomethingElse(
                                    event.target.checked
                                  )
                                }
                              />

                              <span>
                                Something Else
                              </span>

                            </label>

                          </div>

                        </div>


                        {somethingElse && (

                          <div className="dlf-form-section">

                            <div className="dlf-form-label">
                              What else was difficult?
                            </div>

                            <textarea
                              rows={3}
                              value={somethingElseText}
                              onChange={(e) =>
                                setSomethingElseText(
                                  e.target.value
                                )
                              }
                              className="dlf-textarea"
                              placeholder="Describe the concept or learning gap..."
                            />

                          </div>

                        )}


                        <div className="dlf-form-section">

                          <div className="dlf-form-label">
                            Additional Notes (Optional)
                          </div>

                          <textarea
                            rows={3}
                            value={additionalNote}
                            onChange={(e) =>
                              setAdditionalNote(
                                e.target.value
                              )
                            }
                            className="dlf-textarea"
                            placeholder="Add anything else you want to remember about this lecture..."
                          />

                        </div>

                      </>

                    )}


                    {/* =====================================
                        ACTIONS
                    ===================================== */}

                    {feedbackSubmitError && (
                      <div className="dlf-feedback-submit-error">
                        {feedbackSubmitError}
                      </div>
                    )}

                    {isSubmittingFeedbackId === log.id && (
                      <div className="dlf-submitting-feedback">
                        <span className="dlf-inline-spinner" />
                        <span>Submitting your feedback...</span>
                      </div>
                    )}

                    <div className="dlf-form-actions">

                      <button
                        disabled={isSubmittingFeedbackId === log.id}
                        onClick={() => {

                          if (isSubmittingFeedbackId === log.id) return;

                          setExpandedCard(null);

                          setUnderstandingLevel("");

                          setConceptsNotUnderstood([]);

                          setAdditionalNote("");

                          setSomethingElse(false);

                          setSomethingElseText("");

                        }}
                        className="dlf-cancel-button"
                      >
                        CANCEL
                      </button>


                      <button
                        disabled={isSubmittingFeedbackId === log.id}
                        onClick={() =>
                          submitFeedback(log)
                        }
                        className="dlf-submit-button"
                      >
                        {isSubmittingFeedbackId === log.id ? (
                          <>
                            <span className="dlf-inline-spinner dlf-inline-spinner-light" />
                            SUBMITTING...
                          </>
                        ) : (
                          "SUBMIT FEEDBACK"
                        )}
                      </button>

                    </div>

                  </div>

                )}

              </article>

            ))}

          </div>

        )}

      </section>



      {/* =====================================================
          FEEDBACK STATEMENT / CREDIT HISTORY
      ===================================================== */}

      <section className="dlf-surface dlf-statement-section">
        <div className="dlf-section-head">
          <div>
            <div className="dlf-eyebrow">FEEDBACK STATEMENT</div>
            <h2 className="dlf-title">Daily Feedback Records</h2>
            <p className="dlf-copy">
              Choose a subject and date range to view your classroom feedback,
              credit calculation, and running balance like a bank statement.
            </p>
          </div>
        </div>

        <div className="dlf-statement-filters">
          <label className="dlf-statement-field">
            <span>Subject</span>
            <select
              value={statementSubject}
              onChange={(event) => {
                setStatementSubject(event.target.value);
                setHasFetchedStatement(false);
                setStatementRows([]);
                setStatementError(null);
              }}
              className="dlf-statement-control"
            >
              <option value="">Choose subject</option>
              {subjectOptions.length === 0 ? (
                <option value="" disabled>
                  No teacher subjects available
                </option>
              ) : (
                subjectOptions
                  .filter((subject) => subject)
                  .map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))
              )}
            </select>
          </label>

          <label className="dlf-statement-field">
            <span>Start date</span>
            <input
              type="date"
              value={statementStartDate}
              max={statementEndDate || undefined}
              onChange={(event) => {
                setStatementStartDate(event.target.value);
                setHasFetchedStatement(false);
                setStatementRows([]);
                setStatementError(null);
              }}
              className="dlf-statement-control"
            />
          </label>

          <label className="dlf-statement-field">
            <span>End date</span>
            <input
              type="date"
              value={statementEndDate}
              min={statementStartDate || undefined}
              onChange={(event) => {
                setStatementEndDate(event.target.value);
                setHasFetchedStatement(false);
                setStatementRows([]);
                setStatementError(null);
              }}
              className="dlf-statement-control"
            />
          </label>

          <button
            type="button"
            onClick={fetchFeedbackStatement}
            disabled={isFetchingStatement}
            className="dlf-statement-fetch"
          >
            {isFetchingStatement ? (
              <>
                <span className="dlf-inline-spinner dlf-inline-spinner-light" />
                FETCHING...
              </>
            ) : (
              "FETCH FEEDBACK RECORDS"
            )}
          </button>
        </div>

        {statementError && (
          <div className="dlf-statement-error">
            {statementError}
          </div>
        )}

        {hasFetchedStatement && !isFetchingStatement && !statementError && (
          <>
            <div className="dlf-statement-result-head">
              <div>
                <div className="dlf-statement-result-title">
                  {statementRows.length} record{statementRows.length === 1 ? "" : "s"}
                </div>
                <div className="dlf-statement-result-copy">
                  Running balance is calculated from the first row of the selected period.
                </div>
              </div>

              <button
                type="button"
                onClick={generateStatementPdf}
                disabled={!statementRows.length || isGeneratingStatementPdf}
                className="dlf-statement-pdf"
              >
                {isGeneratingStatementPdf ? "GENERATING..." : "GENERATE PDF"}
              </button>
            </div>

            {statementRows.length === 0 ? (
              <div className="dlf-statement-empty">
                No teacher feedback records were found for the selected subject and date range.
              </div>
            ) : (
              <>
                <div className="dlf-statement-mobile-hint">
                  Scroll left and right to see the full records.
                </div>

                <div className="dlf-statement-scroll">
                  <table className="dlf-statement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Topic</th>
                        <th>Teacher subtopics</th>
                        <th>Response</th>
                        <th>Not understood</th>
                        <th>Talent Credits</th>
                        <th>Credits Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementRows.map((row) => (
                        <tr key={row.id}>
                          <td className="dlf-statement-date">
                            {formatStatementDate(row.date)}
                          </td>
                          <td className="dlf-statement-topic">
                            {row.topic}
                          </td>
                          <td>
                            {row.subtopics.length > 0 ? (
                              <div className="dlf-statement-subtopics">
                                {row.subtopics.map((subtopic) => (
                                  <span key={subtopic}>{subtopic}</span>
                                ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            <span
                              className={
                                row.response
                                  ? "dlf-statement-response dlf-statement-response-selected"
                                  : "dlf-statement-response dlf-statement-response-pending"
                              }
                            >
                              {getResponseLabel(row.response)}
                            </span>
                          </td>
                          <td>
                            {row.difficultConcepts.length > 0 ? (
                              <div className="dlf-statement-difficult">
                                {row.difficultConcepts.map((concept) => (
                                  <span key={concept}>{concept}</span>
                                ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td
                            className={
                              row.creditChange > 0
                                ? "dlf-statement-credit-positive"
                                : row.creditChange < 0
                                  ? "dlf-statement-credit-negative"
                                  : "dlf-statement-credit-neutral"
                            }
                          >
                            {row.creditChange > 0
                              ? "+1"
                              : row.creditChange < 0
                                ? "−10"
                                : "0"}
                            <span className="dlf-statement-credit-label">
                              {row.creditLabel}
                            </span>
                          </td>
                          <td className="dlf-statement-balance">
                            {row.balance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </section>

    </div>
  </>
);

}