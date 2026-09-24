import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { printHtmlAsPdf } from "../../../services/platform/nativeDocumentService";


import { getCurrentTeacher } from "../../../services/identityService";
import {
  getCanonicalExamPreparationRows,
} from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import type {
  CanonicalExamPreparationRow,
} from "../../examPreparationIntelligence/canonical/ExamPreparationTypes";
import {
  buildExamPreparationRange,
  shiftExamPreparationDate,
} from "../../examPreparationIntelligence/canonical/ExamPreparationDate";
import {
  getLiveDoubtsForTeacherAssignments,
  type LiveDoubtRow,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

interface TeacherDoubtReferenceExactDoubt {
  doubt: string;
  count: number;
}

interface TeacherDoubtReferenceTopic {
  topic: string;
  count: number;
  doubts: TeacherDoubtReferenceExactDoubt[];
}

interface TeacherDoubtReferenceClassroom {
  classroom: string;
  totalDoubts: number;
  topics: TeacherDoubtReferenceTopic[];
}

interface ExactLiveDoubtReference {
  liveRow: LiveDoubtRow;
  topic: string;
}

type DoubtFilterPeriod = "ALL" | "30" | "60" | "90" | "CUSTOM";

const STORAGE_PREFIX = "teacherDailyDoubtAcknowledgement";

function getIndiaDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return [
    parts.find((part) => part.type === "year")?.value ?? "",
    parts.find((part) => part.type === "month")?.value ?? "",
    parts.find((part) => part.type === "day")?.value ?? "",
  ].join("-");
}

function storageKey(teacherUuid: string, dateKey: string) {
  return `${STORAGE_PREFIX}:${teacherUuid}:${dateKey}`;
}

function getDoubtFilterRange(
  period: DoubtFilterPeriod,
  customStartDate: string,
  customEndDate: string
) {
  const range = buildExamPreparationRange(
    period,
    customStartDate,
    customEndDate
  );

  if (!range) return null;

  const start = "startDate" in range ? range.startDate : undefined;
  const endExclusive =
    "endDateExclusive" in range ? range.endDateExclusive : undefined;

  return {
    start,
    endExclusive,
    end: endExclusive
      ? shiftExamPreparationDate(endExclusive, -1)
      : undefined,
  };
}

function buildExactLiveRows(
  canonicalRows: CanonicalExamPreparationRow[],
  liveRows: LiveDoubtRow[]
): ExactLiveDoubtReference[] {
  const liveById = new Map<string, LiveDoubtRow>();
  for (const row of liveRows) {
    if (row?.is_unresolved !== true) continue;
    const id = String(row.id ?? "").trim();
    if (id) liveById.set(id, row);
  }

  const liveByFeedback = new Map<string, LiveDoubtRow>();
  for (const row of liveRows) {
    if (row?.is_unresolved !== true) continue;
    const feedbackId = String(
      row.source_feedback_id ?? row.latest_source_feedback_id ?? ''
    ).trim();
    if (feedbackId) liveByFeedback.set(feedbackId, row);
  }

  const seen = new Set<string>();
  const exactRows: ExactLiveDoubtReference[] = [];

  for (const canonicalRow of canonicalRows) {
    if (canonicalRow.source !== 'live' || !canonicalRow.liveRowId) continue;

    const liveRow =
      liveById.get(String(canonicalRow.liveRowId).trim()) ??
      (canonicalRow.sourceFeedbackId
        ? liveByFeedback.get(String(canonicalRow.sourceFeedbackId).trim())
        : undefined);

    if (!liveRow || !liveRow.doubt_concept?.trim()) continue;

    const key = String(liveRow.id ?? '').trim();
    if (!key || seen.has(key)) continue;

    seen.add(key);
    exactRows.push({
      liveRow,
      topic:
        String(canonicalRow.topicName ?? '').trim() ||
        String(liveRow.topic_name ?? '').trim() ||
        'Topic not recorded',
    });
  }

  return exactRows;
}

function buildClassroomReferences(
  rows: ExactLiveDoubtReference[]
): TeacherDoubtReferenceClassroom[] {
  const grouped = new Map<
    string,
    Map<string, Map<string, number>>
  >();

  for (const item of Array.isArray(rows) ? rows : []) {
    const row = item?.liveRow;
    if (row?.is_unresolved !== true) continue;

    const className = String(row?.class_name ?? '').trim();
    const sectionName = String(row?.section_name ?? '').trim();
    const classroom = className || sectionName
      ? `Class ${className} - Section ${sectionName}`
      : 'Classroom';
    const exactDoubt = String(row?.doubt_concept ?? '').trim();
    const topic = String(item?.topic ?? '').trim() || 'Topic not recorded';

    if (!exactDoubt) continue;

    const topicMap = grouped.get(classroom) ?? new Map<string, Map<string, number>>();
    const doubtMap = topicMap.get(topic) ?? new Map<string, number>();
    doubtMap.set(exactDoubt, (doubtMap.get(exactDoubt) ?? 0) + 1);
    topicMap.set(topic, doubtMap);
    grouped.set(classroom, topicMap);
  }

  return Array.from(grouped.entries())
    .map(([classroom, topicMap]) => {
      const topics = Array.from(topicMap.entries())
        .map(([topic, doubtMap]) => {
          const doubts = Array.from(doubtMap.entries())
            .map(([doubt, count]) => ({ doubt, count }))
            .sort(
              (a, b) =>
                b.count - a.count || a.doubt.localeCompare(b.doubt)
            );

          return {
            topic,
            count: doubts.reduce((sum, item) => sum + item.count, 0),
            doubts,
          };
        })
        .sort(
          (a, b) =>
            b.count - a.count || a.topic.localeCompare(b.topic)
        );

      return {
        classroom,
        totalDoubts: topics.reduce((sum, item) => sum + item.count, 0),
        topics,
      };
    })
    .filter((item) => item.topics.length > 0)
    .sort((a, b) =>
      a.classroom.localeCompare(b.classroom, undefined, { numeric: true })
    );
}

export default function TeacherDailyDoubtAcknowledgement() {
  const [open, setOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<TeacherDoubtReferenceClassroom[]>([]);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [filterPeriod, setFilterPeriod] = useState<DoubtFilterPeriod>("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadDailyDoubtReference() {
      const teacher = getCurrentTeacher();
      const teacherUuid = String(teacher?.teacherUuid ?? "").trim();
      if (!teacherUuid) return;

      const today = getIndiaDateKey();
      const key = storageKey(teacherUuid, today);

      if (filterPeriod === "ALL") {
        try {
          if (localStorage.getItem(key) === "completed") return;
        } catch (error) {
          console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT STORAGE READ FAILED", error);
        }
      }

      const range = getDoubtFilterRange(
        filterPeriod,
        customStartDate,
        customEndDate
      );

      if (!range) {
        setFilterError("Select a valid custom start and end date.");
        setClassrooms([]);
        setAcknowledged({});
        setFilterLoading(false);
        if (!cancelled) setOpen(true);
        return;
      }

      setFilterError("");
      setFilterLoading(true);

      try {
        const canonicalRows = await getCanonicalExamPreparationRows({
          scope: "teacher",
          startDate: range.start,
          endDateExclusive: range.endExclusive,
        });

        const assignmentIds = Array.from(
          new Set(
            canonicalRows
              .map((row) => String(row.teacherAssignmentUuid ?? "").trim())
              .filter(Boolean)
          )
        );

        const liveRows = assignmentIds.length
          ? await getLiveDoubtsForTeacherAssignments(assignmentIds, true)
          : [];

        if (cancelled) return;

        // Canonical Exam Intelligence remains the authoritative eligibility
        // layer. We only use the matched Live row to display the student's
        // exact submitted doubt_concept, never the synthesized Loop-2 label.
        const exactLiveRows = buildExactLiveRows(canonicalRows, liveRows);
        const nextClassrooms = buildClassroomReferences(exactLiveRows);

        if (filterPeriod === "ALL" && nextClassrooms.length === 0) {
          // Nothing unresolved is currently present in the same live source
          // used by Exam Preparation, so there is nothing to acknowledge.
          try {
            localStorage.setItem(key, "completed");
          } catch (error) {
            console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT STORAGE WRITE FAILED", error);
          }
          setOpen(false);
          return;
        }

        setClassrooms(nextClassrooms);
        setAcknowledged({});
        setExpandedTopics({});
        setOpen(true);
      } catch (error) {
        if (cancelled) return;
        setFilterError("Unable to refresh the selected doubt range. Please try again.");
        setClassrooms([]);
        setAcknowledged({});
        setExpandedTopics({});
        if (filterPeriod !== "ALL" || open) setOpen(true);
        // This is a secondary reminder layer. It must never block Teacher Home.
        console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT LOAD FAILED", error);
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    }

    void loadDailyDoubtReference();

    return () => {
      cancelled = true;
    };
  }, [filterPeriod, customStartDate, customEndDate]);

  const allAcknowledged = useMemo(
    () =>
      classrooms.length > 0 &&
      classrooms.every((item) => acknowledged[item.classroom] === true),
    [classrooms, acknowledged]
  );

  function acknowledge(classroom: string) {
    setAcknowledged((current) => ({
      ...current,
      [classroom]: !current[classroom],
    }));
  }

  function toggleTopic(classroom: string, topic: string) {
    const key = `${classroom}::${topic}`;
    setExpandedTopics((current) => {
      const next = { ...current };
      const wasOpen = current[key] === true;

      Object.keys(next).forEach((existingKey) => {
        if (existingKey.startsWith(`${classroom}::`)) {
          delete next[existingKey];
        }
      });

      if (!wasOpen) next[key] = true;
      return next;
    });
  }

  function completeAcknowledgement() {
    if (!allAcknowledged) return;

    const teacher = getCurrentTeacher();
    const teacherUuid = String(teacher?.teacherUuid ?? "").trim();

    if (teacherUuid) {
      try {
        localStorage.setItem(
          storageKey(teacherUuid, getIndiaDateKey()),
          "completed"
        );
      } catch (error) {
        console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT STORAGE WRITE FAILED", error);
      }
    }

    setOpen(false);
  }

  async function downloadPdf() {
    if (filterLoading || classrooms.length === 0) return;

    const selectedRange = getDoubtFilterRange(
      filterPeriod,
      customStartDate,
      customEndDate
    );

    const printable = classrooms
      .map(
        (item) => `
          <section class="classroom">
            <h2>${escapeHtml(item.classroom)}</h2>
            <div class="count">${item.totalDoubts} unresolved doubt signal${item.totalDoubts === 1 ? "" : "s"}</div>
            <div class="topics">
              ${item.topics
                .map(
                  (topic) => `
                    <div class="topic">
                      <div class="topic-head"><span>${escapeHtml(topic.topic)}</span><strong>${topic.count}</strong></div>
                      <ul>
                        ${topic.doubts
                          .map(
                            (doubt) =>
                              `<li><span>${escapeHtml(doubt.doubt)}</span><strong>${doubt.count}</strong></li>`
                          )
                          .join("")}
                      </ul>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    if (Capacitor.isNativePlatform()) {
      const css = `
        * { box-sizing: border-box; }
        body { margin:0; padding:28px; font-family:Arial,sans-serif; color:#0F172A; background:#FFF; }
        h1 { margin:0 0 6px; font-size:22px; }
        .date { color:#64748B; font-size:12px; margin-bottom:18px; }
        .classroom { break-inside:avoid; border:1px solid #FED7AA; background:#FFF7ED; border-radius:14px; padding:14px; margin-bottom:12px; }
        h2 { margin:0; font-size:16px; }
        .count { margin-top:4px; color:#9A3412; font-size:11px; font-weight:700; }
        .topic { margin-top:10px; }
        .topic-head { display:flex; justify-content:space-between; gap:14px; padding:7px 0; font-size:12px; font-weight:800; }
        .topic ul { margin:0; padding:0 0 0 12px; list-style:none; }
        .topic li { display:flex; justify-content:space-between; gap:14px; padding:5px 0; border-top:1px solid #FED7AA; font-size:11px; }
        strong { color:#C2410C; }
      `;
      await printHtmlAsPdf({
        bodyHtml: `<h1>Unresolved Doubt Bank</h1><div class="date">${getIndiaDateKey()}${selectedRange?.start && selectedRange?.end ? ` · ${selectedRange.start} to ${selectedRange.end}` : " · All current unresolved doubts"}</div>${printable}`,
        css,
        fileName: `Teacher-Unresolved-Doubts-${getIndiaDateKey()}.pdf`,
        title: "Teacher Unresolved Doubts PDF",
        popupBlockedMessage: "Please allow pop-ups for Talent Passport to print or save this doubt bank as PDF.",
      });
      return;
    }

    // Print through a hidden iframe instead of window.open(). This keeps the
    // print action inside the teacher's click gesture and avoids browser popup
    // blockers from preventing the PDF/print dialog.
    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";
    document.body.appendChild(printFrame);

    const cleanup = () => {
      window.setTimeout(() => printFrame.remove(), 1000);
    };

    printFrame.onload = () => {
      const frameWindow = printFrame.contentWindow;
      if (!frameWindow) {
        cleanup();
        return;
      }
      frameWindow.focus();
      frameWindow.print();
      cleanup();
    };

    const printDocument = printFrame.contentDocument;
    if (!printDocument) {
      cleanup();
      return;
    }

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html>
        <head>
          <title>Teacher Unresolved Doubts - ${getIndiaDateKey()}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin:0; padding:28px; font-family:Arial,sans-serif; color:#0F172A; background:#FFF; }
            h1 { margin:0 0 6px; font-size:22px; }
            .date { color:#64748B; font-size:12px; margin-bottom:18px; }
            .classroom { break-inside:avoid; border:1px solid #FED7AA; background:#FFF7ED; border-radius:14px; padding:14px; margin-bottom:12px; }
            h2 { margin:0; font-size:16px; }
            .count { margin-top:4px; color:#9A3412; font-size:11px; font-weight:700; }
            .topic { margin-top:10px; break-inside:avoid; }
            .topic-head { display:flex; justify-content:space-between; gap:14px; padding:7px 0; font-size:12px; font-weight:800; }
            .topic ul { margin:0; padding:0 0 0 12px; list-style:none; }
            .topic li { display:flex; justify-content:space-between; gap:14px; padding:6px 0; border-top:1px solid #FED7AA; font-size:11px; }
            strong { color:#C2410C; }
          </style>
        </head>
        <body>
          <h1>Unresolved Doubt Bank</h1>
          <div class="date">${getIndiaDateKey()}${selectedRange?.start && selectedRange?.end ? ` · ${selectedRange.start} to ${selectedRange.end}` : " · All current unresolved doubts"}</div>
          ${printable}
        </body>
      </html>
    `);

        printDocument.close();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-doubt-ack-title"
      className="teacher-doubt-ack-overlay"
    >
      <style>{`
        .teacher-doubt-ack-overlay {
          position: fixed; inset: 0; z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 22px; background: rgba(15,23,42,.58);
          backdrop-filter: blur(5px);
        }
        .teacher-doubt-ack-modal {
          width: min(760px,100%); max-height: min(86vh,720px);
          overflow: hidden; display:flex; flex-direction:column;
          background:#FFF; border:1px solid #E2E8F0; border-radius:24px;
          box-shadow:0 24px 70px rgba(15,23,42,.22);
        }
        .teacher-doubt-ack-head { padding:20px 22px 14px; border-bottom:1px solid #EEF2F7; }
        .teacher-doubt-ack-kicker { margin:0; color:#EA580C; font-size:10px; font-weight:900; letter-spacing:1.6px; }
        .teacher-doubt-ack-title { margin:6px 0 4px; color:#07142D; font-size:24px; line-height:1.12; font-weight:900; }
        .teacher-doubt-ack-copy { margin:0; color:#64748B; font-size:12px; line-height:1.45; font-weight:600; }
        .teacher-doubt-ack-filter { display:flex; align-items:flex-end; gap:8px; margin-top:12px; flex-wrap:wrap; }
        .teacher-doubt-ack-filter-field { display:flex; flex-direction:column; gap:4px; min-width:190px; }
        .teacher-doubt-ack-filter-label { color:#64748B; font-size:8px; font-weight:900; letter-spacing:.9px; text-transform:uppercase; }
        .teacher-doubt-ack-filter-select,.teacher-doubt-ack-filter-date { width:100%; min-height:34px; border:1px solid #CBD5E1; border-radius:9px; background:#FFF; color:#0F172A; padding:0 9px; font-size:10px; font-weight:800; outline:none; }
        .teacher-doubt-ack-filter-select:focus,.teacher-doubt-ack-filter-date:focus { border-color:#F97316; box-shadow:0 0 0 2px rgba(249,115,22,.10); }
        .teacher-doubt-ack-custom { display:grid; grid-template-columns:repeat(2,minmax(130px,1fr)); gap:8px; flex:1 1 280px; min-width:280px; }
        .teacher-doubt-ack-filter-status { margin-top:6px; color:#C2410C; font-size:8px; font-weight:800; }
        .teacher-doubt-ack-empty { padding:28px 12px; text-align:center; color:#94A3B8; font-size:10px; font-weight:800; }
        .teacher-doubt-ack-body { min-height:0; overflow-y:auto; padding:14px 16px; }
        .teacher-doubt-ack-class { margin-bottom:10px; padding:12px; border:1px solid #FED7AA; border-radius:15px; background:#FFF7ED; }
        .teacher-doubt-ack-class:last-child { margin-bottom:0; }
        .teacher-doubt-ack-class-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .teacher-doubt-ack-class-name { min-width:0; color:#0F172A; font-size:15px; font-weight:900; }
        .teacher-doubt-ack-count { flex:0 0 auto; padding:4px 7px; border-radius:999px; background:#FFF; border:1px solid #FED7AA; color:#C2410C; font-size:8px; font-weight:900; white-space:nowrap; }
        .teacher-doubt-ack-topic-summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px 6px; margin-top:8px; }
        .teacher-doubt-ack-topic { min-width:0; border:1px solid #FED7AA; border-radius:9px; background:#FFF; overflow:hidden; }
        .teacher-doubt-ack-topic.is-expanded { grid-column:1 / -1; }
        .teacher-doubt-ack-topic-toggle { width:100%; min-height:30px; display:flex; align-items:center; justify-content:space-between; gap:7px; padding:5px 7px; border:0; background:transparent; color:#9A3412; text-align:left; cursor:pointer; }
        .teacher-doubt-ack-topic-toggle:hover { background:#FFF7ED; }
        .teacher-doubt-ack-topic-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:9px; line-height:1.25; font-weight:900; }
        .teacher-doubt-ack-topic-meta { flex:0 0 auto; display:inline-flex; align-items:center; gap:5px; }
        .teacher-doubt-ack-topic-meta strong { color:#EA580C; font-size:8px; }
        .teacher-doubt-ack-topic-chevron { display:inline-flex; width:14px; height:14px; align-items:center; justify-content:center; border:1px solid #FDBA74; border-radius:50%; color:#C2410C; font-size:10px; font-weight:900; line-height:1; }
        .teacher-doubt-ack-subtopics { display:flex; flex-wrap:wrap; gap:4px; padding:0 6px 6px; border-top:1px solid #FFEDD5; background:#FFFBF7; }
        .teacher-doubt-ack-subtopic { display:inline-flex; align-items:center; gap:4px; max-width:100%; padding:4px 6px; border:1px solid #FED7AA; border-radius:999px; background:#FFF; color:#7C2D12; font-size:8px; line-height:1.2; font-weight:800; }
        .teacher-doubt-ack-subtopic span { min-width:0; overflow-wrap:anywhere; }
        .teacher-doubt-ack-subtopic strong { color:#EA580C; font-size:7px; white-space:nowrap; }
        .teacher-doubt-ack-action { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; padding-top:9px; border-top:1px solid rgba(251,146,60,.25); }
        .teacher-doubt-ack-check { display:inline-flex; align-items:center; gap:7px; color:#334155; font-size:10px; font-weight:900; cursor:pointer; }
        .teacher-doubt-ack-check input { width:15px; height:15px; margin:0; accent-color:#F97316; }
        .teacher-doubt-ack-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 16px; border-top:1px solid #EEF2F7; background:#FCFCFB; }
        .teacher-doubt-ack-foot-note { color:#94A3B8; font-size:9px; line-height:1.3; font-weight:700; }
        .teacher-doubt-ack-btn { flex:0 0 auto; border:1px solid #F97316; border-radius:10px; padding:8px 12px; background:#F97316; color:#FFF; font-size:10px; font-weight:900; cursor:pointer; }
        .teacher-doubt-ack-btn:disabled { opacity:.45; cursor:not-allowed; }
        .teacher-doubt-ack-download { border:1px solid #FED7AA; border-radius:10px; padding:8px 10px; background:#FFF7ED; color:#C2410C; font-size:9px; font-weight:900; cursor:pointer; }
        .teacher-doubt-ack-download:disabled { opacity:.45; cursor:not-allowed; }
        @media (max-width:1024px) {
          .teacher-doubt-ack-overlay { padding:10px; }
          .teacher-doubt-ack-modal { width:min(620px,100%); max-height:90vh; border-radius:18px; }
          .teacher-doubt-ack-head { padding:13px 14px 10px; }
          .teacher-doubt-ack-kicker { font-size:9px; letter-spacing:1.15px; }
          .teacher-doubt-ack-title { font-size:18px; margin-top:4px; }
          .teacher-doubt-ack-copy { font-size:10px; line-height:1.4; }
          .teacher-doubt-ack-filter { gap:6px; margin-top:8px; }
          .teacher-doubt-ack-filter-field { min-width:150px; flex:1 1 150px; }
          .teacher-doubt-ack-filter-label { font-size:8px; }
          .teacher-doubt-ack-filter-select,.teacher-doubt-ack-filter-date { min-height:32px; padding:0 8px; font-size:10px; border-radius:8px; }
          .teacher-doubt-ack-custom { min-width:220px; gap:6px; }
          .teacher-doubt-ack-filter-status { font-size:8px; }
          .teacher-doubt-ack-body { padding:9px; }
          .teacher-doubt-ack-class { padding:9px; margin-bottom:7px; border-radius:12px; }
          .teacher-doubt-ack-class-name { font-size:12px; }
          .teacher-doubt-ack-count { padding:3px 6px; font-size:8px; }
          .teacher-doubt-ack-topic-summary { grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; margin-top:6px; }
          .teacher-doubt-ack-topic.is-expanded { grid-column:1 / -1; }
          .teacher-doubt-ack-topic-toggle { min-height:27px; padding:4px 6px; }
          .teacher-doubt-ack-topic-label { font-size:12px; }
          .teacher-doubt-ack-topic-meta strong { font-size:10px; }
          .teacher-doubt-ack-topic-chevron { width:12px; height:12px; font-size:9px; }
          .teacher-doubt-ack-subtopics { gap:3px; padding:0 5px 5px; }
          .teacher-doubt-ack-subtopic { padding:4px 6px; font-size:10px; }
          .teacher-doubt-ack-subtopic strong { font-size:8.5px; }
          .teacher-doubt-ack-action { margin-top:7px; padding-top:6px; }
          .teacher-doubt-ack-check { font-size:9px; }
          .teacher-doubt-ack-check input { width:13px; height:13px; }
          .teacher-doubt-ack-foot { padding:8px 9px; }
          .teacher-doubt-ack-foot-note { font-size:8px; }
          .teacher-doubt-ack-btn,.teacher-doubt-ack-download { padding:6px 8px; font-size:8px; border-radius:8px; }
        }
        @media (max-width:600px) {
          .teacher-doubt-ack-overlay { padding:7px; }
          .teacher-doubt-ack-modal { max-height:92vh; border-radius:14px; }
          .teacher-doubt-ack-head { padding:10px 11px 8px; }
          .teacher-doubt-ack-kicker { font-size:8px; letter-spacing:.85px; }
          .teacher-doubt-ack-title { font-size:15px; margin:3px 0; }
          .teacher-doubt-ack-copy { font-size:10px; line-height:1.35; }
          .teacher-doubt-ack-filter { display:grid; grid-template-columns:minmax(0,1fr); gap:5px; margin-top:7px; }
          .teacher-doubt-ack-filter-field { min-width:0; }
          .teacher-doubt-ack-filter-label { font-size:8px; }
          .teacher-doubt-ack-filter-select,.teacher-doubt-ack-filter-date { min-height:32px; padding:0 7px; font-size:10px; border-radius:8px; }
          .teacher-doubt-ack-custom { min-width:0; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px; }
          .teacher-doubt-ack-filter-status { margin-top:3px; font-size:8px; }
          .teacher-doubt-ack-body { padding:7px; }
          .teacher-doubt-ack-class { padding:7px; margin-bottom:5px; border-radius:10px; }
          .teacher-doubt-ack-class-head { gap:5px; }
          .teacher-doubt-ack-class-name { font-size:12px; }
          .teacher-doubt-ack-count { padding:3px 6px; font-size:8px; }
          .teacher-doubt-ack-topic-summary { grid-template-columns:1fr; gap:3px; margin-top:5px; }
          .teacher-doubt-ack-topic.is-expanded { grid-column:auto; }
          .teacher-doubt-ack-topic-toggle { min-height:29px; padding:5px 6px; }
          .teacher-doubt-ack-topic-label { font-size:12px; }
          .teacher-doubt-ack-topic-meta { gap:5px; }
          .teacher-doubt-ack-topic-meta strong { font-size:10px; }
          .teacher-doubt-ack-topic-chevron { width:16px; height:16px; font-size:10px; }
          .teacher-doubt-ack-subtopics { gap:4px; padding:0 6px 6px; }
          .teacher-doubt-ack-subtopic { padding:5px 7px; font-size:11px; }
          .teacher-doubt-ack-subtopic strong { font-size:9.5px; }
          .teacher-doubt-ack-action { margin-top:5px; padding-top:5px; }
          .teacher-doubt-ack-check { gap:4px; font-size:9px; }
          .teacher-doubt-ack-check input { width:11px; height:11px; }
          .teacher-doubt-ack-foot { gap:5px; padding:6px 7px; }
          .teacher-doubt-ack-foot-note { max-width:45%; font-size:8px; }
          .teacher-doubt-ack-btn,.teacher-doubt-ack-download { padding:6px 7px; font-size:8px; border-radius:8px; }
        }
      `}</style>

      <div className="teacher-doubt-ack-modal">
        <div className="teacher-doubt-ack-head">
          <p className="teacher-doubt-ack-kicker">DAILY ACADEMIC CHECK</p>
          <h2 id="teacher-doubt-ack-title" className="teacher-doubt-ack-title">
            Unresolved Doubts — Daily Review
          </h2>
          <p className="teacher-doubt-ack-copy">
            Review each classroom by topic, then expand a topic to see the exact student-originated doubt signals. Acknowledge each classroom before continuing.
          </p>

          <div className="teacher-doubt-ack-filter">
            <div className="teacher-doubt-ack-filter-field">
              <label className="teacher-doubt-ack-filter-label" htmlFor="teacher-doubt-range">
                Doubt range
              </label>
              <select
                id="teacher-doubt-range"
                className="teacher-doubt-ack-filter-select"
                value={filterPeriod}
                onChange={(event) => setFilterPeriod(event.target.value as DoubtFilterPeriod)}
                disabled={filterLoading}
              >
                <option value="ALL">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="60">Last 60 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="CUSTOM">Custom Date</option>
              </select>
            </div>

            {filterPeriod === "CUSTOM" ? (
              <div className="teacher-doubt-ack-custom">
                <div className="teacher-doubt-ack-filter-field">
                  <label className="teacher-doubt-ack-filter-label" htmlFor="teacher-doubt-custom-start">
                    From
                  </label>
                  <input
                    id="teacher-doubt-custom-start"
                    className="teacher-doubt-ack-filter-date"
                    type="date"
                    value={customStartDate}
                    onChange={(event) => setCustomStartDate(event.target.value)}
                    disabled={filterLoading}
                  />
                </div>
                <div className="teacher-doubt-ack-filter-field">
                  <label className="teacher-doubt-ack-filter-label" htmlFor="teacher-doubt-custom-end">
                    To
                  </label>
                  <input
                    id="teacher-doubt-custom-end"
                    className="teacher-doubt-ack-filter-date"
                    type="date"
                    value={customEndDate}
                    min={customStartDate || undefined}
                    onChange={(event) => setCustomEndDate(event.target.value)}
                    disabled={filterLoading}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {filterError ? (
            <div className="teacher-doubt-ack-filter-status">{filterError}</div>
          ) : null}
        </div>

        <div className="teacher-doubt-ack-body">
          {filterLoading ? (
            <div className="teacher-doubt-ack-empty">Refreshing unresolved doubts…</div>
          ) : classrooms.length === 0 ? (
            <div className="teacher-doubt-ack-empty">
              No unresolved doubts are available for the selected date range.
            </div>
          ) : classrooms.map((item) => (
            <section className="teacher-doubt-ack-class" key={item.classroom}>
              <div className="teacher-doubt-ack-class-head">
                <div className="teacher-doubt-ack-class-name">{item.classroom}</div>
                <div className="teacher-doubt-ack-count">
                  {item.totalDoubts} UNRESOLVED
                </div>
              </div>

              <div className="teacher-doubt-ack-topic-summary">
                {item.topics.map((topic) => {
                  const topicKey = `${item.classroom}::${topic.topic}`;
                  const expanded = expandedTopics[topicKey] === true;
                  return (
                    <div className={`teacher-doubt-ack-topic ${expanded ? "is-expanded" : ""}`} key={topicKey}>
                      <button
                        type="button"
                        className="teacher-doubt-ack-topic-toggle"
                        aria-expanded={expanded}
                        onClick={() => toggleTopic(item.classroom, topic.topic)}
                      >
                        <span className="teacher-doubt-ack-topic-label">{topic.topic}</span>
                        <span className="teacher-doubt-ack-topic-meta">
                          <strong>{topic.count}</strong>
                          <span className="teacher-doubt-ack-topic-chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
                        </span>
                      </button>

                      {expanded ? (
                        <div className="teacher-doubt-ack-subtopics" aria-label={`Exact doubts under ${topic.topic}`}>
                          {topic.doubts.map((doubt) => (
                            <span
                              className="teacher-doubt-ack-subtopic"
                              key={`${topicKey}:${doubt.doubt}`}
                            >
                              <span>{doubt.doubt}</span>
                              <strong>×{doubt.count}</strong>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="teacher-doubt-ack-action">
                <label className="teacher-doubt-ack-check">
                  <input
                    type="checkbox"
                    checked={acknowledged[item.classroom] === true}
                    onChange={() => acknowledge(item.classroom)}
                  />
                  Acknowledge
                </label>
              </div>
            </section>
          ))}
        </div>

        <div className="teacher-doubt-ack-foot">
          <div className="teacher-doubt-ack-foot-note">
            {classrooms.length === 0
              ? "Choose another date range to review unresolved doubts."
              : allAcknowledged
              ? "All classrooms acknowledged."
              : `Acknowledge ${classrooms.length} classroom${classrooms.length === 1 ? "" : "s"} to continue.`}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <button
              type="button"
              className="teacher-doubt-ack-download"
              disabled={filterLoading || classrooms.length === 0}
              onClick={downloadPdf}
            >
              SAVE PDF
            </button>
            <button
              type="button"
              className="teacher-doubt-ack-btn"
              disabled={!allAcknowledged}
              onClick={completeAcknowledgement}
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
