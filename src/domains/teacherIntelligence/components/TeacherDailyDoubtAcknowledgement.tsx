import { useEffect, useMemo, useState } from "react";

import { getCurrentTeacher } from "../../../services/identityService";
import {
  getTeacherExamAttentionIntelligenceWithLiveLayer,
} from "../../liveDoubtIntelligence/service/LiveTeacherExamPreparation";

interface TeacherDoubtReferenceStudent {
  studentName?: string;
  totalUnresolvedDoubts?: number;
  topics?: string[];
  highestRiskTopic?: string;
  attentionLevel?: string;
}

interface TeacherDoubtReferenceTable {
  classroom?: string;
  students?: TeacherDoubtReferenceStudent[];
}

interface TeacherDoubtReferenceClassroom {
  classroom: string;
  totalDoubts: number;
  doubts: Array<{ topic: string; count: number }>;
}

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

function buildClassroomReferences(
  tables: TeacherDoubtReferenceTable[]
): TeacherDoubtReferenceClassroom[] {
  const grouped = new Map<string, Map<string, number>>();

  for (const table of tables) {
    const classroom = String(table?.classroom ?? "").trim();
    if (!classroom) continue;

    const doubtMap = grouped.get(classroom) ?? new Map<string, number>();

    for (const student of table?.students ?? []) {
      const studentTopics = Array.isArray(student?.topics)
        ? student.topics
        : [];

      for (const rawTopic of studentTopics) {
        const topic = String(rawTopic ?? "").trim();
        if (!topic) continue;
        doubtMap.set(topic, (doubtMap.get(topic) ?? 0) + 1);
      }

      const unresolvedCount = Number(
        student?.totalUnresolvedDoubts ?? 0
      );

      if (
        unresolvedCount > studentTopics.filter(
          (topic) => String(topic ?? "").trim()
        ).length
      ) {
        const missingCount =
          unresolvedCount -
          studentTopics.filter(
            (topic) => String(topic ?? "").trim()
          ).length;

        const fallback = "Unresolved doubt";
        doubtMap.set(
          fallback,
          (doubtMap.get(fallback) ?? 0) + missingCount
        );
      }
    }

    grouped.set(classroom, doubtMap);
  }

  return Array.from(grouped.entries())
    .map(([classroom, doubtMap]) => {
      const doubts = Array.from(doubtMap.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort(
          (a, b) =>
            b.count - a.count || a.topic.localeCompare(b.topic)
        );

      return {
        classroom,
        totalDoubts: doubts.reduce((sum, item) => sum + item.count, 0),
        doubts,
      };
    })
    .filter((item) => item.doubts.length > 0)
    .sort((a, b) =>
      a.classroom.localeCompare(b.classroom, undefined, { numeric: true })
    );
}

export default function TeacherDailyDoubtAcknowledgement() {
  const [open, setOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<TeacherDoubtReferenceClassroom[]>([]);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadDailyDoubtReference() {
      const teacher = getCurrentTeacher();
      const teacherUuid = String(teacher?.teacherUuid ?? "").trim();
      if (!teacherUuid) return;

      const today = getIndiaDateKey();
      const key = storageKey(teacherUuid, today);

      try {
        if (localStorage.getItem(key) === "completed") return;
      } catch (error) {
        console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT STORAGE READ FAILED", error);
      }

      try {
        const data = await getTeacherExamAttentionIntelligenceWithLiveLayer();
        if (cancelled) return;

        const nextClassrooms = buildClassroomReferences(
          Array.isArray(data) ? data : []
        );

        if (nextClassrooms.length === 0) {
          // Nothing unresolved is currently present in the same live source
          // used by Exam Preparation, so there is nothing to acknowledge.
          try {
            localStorage.setItem(key, "completed");
          } catch (error) {
            console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT STORAGE WRITE FAILED", error);
          }
          return;
        }

        setClassrooms(nextClassrooms);
        setAcknowledged({});
        setOpen(true);
      } catch (error) {
        // This is a secondary reminder layer. It must never block Teacher Home.
        console.error("TEACHER DAILY DOUBT ACKNOWLEDGEMENT LOAD FAILED", error);
      }
    }

    void loadDailyDoubtReference();

    return () => {
      cancelled = true;
    };
  }, []);

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

  function downloadPdf() {
    const printable = classrooms
      .map(
        (item) => `
          <section class="classroom">
            <h2>${escapeHtml(item.classroom)}</h2>
            <div class="count">${item.totalDoubts} unresolved doubt signal${item.totalDoubts === 1 ? "" : "s"}</div>
            <ul>
              ${item.doubts
                .map(
                  (doubt) =>
                    `<li><span>${escapeHtml(doubt.topic)}</span><strong>${doubt.count}</strong></li>`
                )
                .join("")}
            </ul>
          </section>
        `
      )
      .join("");

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
            ul { margin:10px 0 0; padding:0; list-style:none; }
            li { display:flex; justify-content:space-between; gap:14px; padding:7px 0; border-top:1px solid #FED7AA; font-size:12px; }
            strong { color:#C2410C; }
          </style>
        </head>
        <body>
          <h1>Unresolved Doubt Bank</h1>
          <div class="date">${getIndiaDateKey()}</div>
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
        .teacher-doubt-ack-body { min-height:0; overflow-y:auto; padding:14px 16px; }
        .teacher-doubt-ack-class { margin-bottom:10px; padding:12px; border:1px solid #FED7AA; border-radius:15px; background:#FFF7ED; }
        .teacher-doubt-ack-class:last-child { margin-bottom:0; }
        .teacher-doubt-ack-class-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .teacher-doubt-ack-class-name { min-width:0; color:#0F172A; font-size:15px; font-weight:900; }
        .teacher-doubt-ack-count { flex:0 0 auto; padding:4px 7px; border-radius:999px; background:#FFF; border:1px solid #FED7AA; color:#C2410C; font-size:8px; font-weight:900; white-space:nowrap; }
        .teacher-doubt-ack-list { display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; }
        .teacher-doubt-ack-chip { display:inline-flex; align-items:center; gap:5px; max-width:100%; padding:5px 8px; border:1px solid #FDBA74; border-radius:999px; background:#FFF; color:#9A3412; font-size:10px; line-height:1.2; font-weight:800; }
        .teacher-doubt-ack-chip strong { color:#EA580C; font-size:9px; }
        .teacher-doubt-ack-action { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; padding-top:9px; border-top:1px solid rgba(251,146,60,.25); }
        .teacher-doubt-ack-check { display:inline-flex; align-items:center; gap:7px; color:#334155; font-size:10px; font-weight:900; cursor:pointer; }
        .teacher-doubt-ack-check input { width:15px; height:15px; margin:0; accent-color:#F97316; }
        .teacher-doubt-ack-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 16px; border-top:1px solid #EEF2F7; background:#FCFCFB; }
        .teacher-doubt-ack-foot-note { color:#94A3B8; font-size:9px; line-height:1.3; font-weight:700; }
        .teacher-doubt-ack-btn { flex:0 0 auto; border:1px solid #F97316; border-radius:10px; padding:8px 12px; background:#F97316; color:#FFF; font-size:10px; font-weight:900; cursor:pointer; }
        .teacher-doubt-ack-btn:disabled { opacity:.45; cursor:not-allowed; }
        .teacher-doubt-ack-download { border:1px solid #FED7AA; border-radius:10px; padding:8px 10px; background:#FFF7ED; color:#C2410C; font-size:9px; font-weight:900; cursor:pointer; }
        @media (max-width:1024px) {
          .teacher-doubt-ack-overlay { padding:10px; }
          .teacher-doubt-ack-modal { width:min(620px,100%); max-height:90vh; border-radius:18px; }
          .teacher-doubt-ack-head { padding:13px 14px 10px; }
          .teacher-doubt-ack-kicker { font-size:8px; letter-spacing:1.15px; }
          .teacher-doubt-ack-title { font-size:18px; margin-top:4px; }
          .teacher-doubt-ack-copy { font-size:9px; line-height:1.35; }
          .teacher-doubt-ack-body { padding:9px; }
          .teacher-doubt-ack-class { padding:9px; margin-bottom:7px; border-radius:12px; }
          .teacher-doubt-ack-class-name { font-size:11px; }
          .teacher-doubt-ack-count { padding:3px 6px; font-size:6.5px; }
          .teacher-doubt-ack-list { gap:4px; margin-top:6px; }
          .teacher-doubt-ack-chip { padding:4px 6px; font-size:8px; }
          .teacher-doubt-ack-chip strong { font-size:7px; }
          .teacher-doubt-ack-action { margin-top:7px; padding-top:6px; }
          .teacher-doubt-ack-check { font-size:8px; }
          .teacher-doubt-ack-check input { width:13px; height:13px; }
          .teacher-doubt-ack-foot { padding:8px 9px; }
          .teacher-doubt-ack-foot-note { font-size:7px; }
          .teacher-doubt-ack-btn,.teacher-doubt-ack-download { padding:6px 8px; font-size:7px; border-radius:8px; }
        }
        @media (max-width:600px) {
          .teacher-doubt-ack-overlay { padding:7px; }
          .teacher-doubt-ack-modal { max-height:92vh; border-radius:14px; }
          .teacher-doubt-ack-head { padding:10px 11px 8px; }
          .teacher-doubt-ack-kicker { font-size:6.5px; letter-spacing:.85px; }
          .teacher-doubt-ack-title { font-size:15px; margin:3px 0; }
          .teacher-doubt-ack-copy { font-size:7.5px; line-height:1.3; }
          .teacher-doubt-ack-body { padding:7px; }
          .teacher-doubt-ack-class { padding:7px; margin-bottom:5px; border-radius:10px; }
          .teacher-doubt-ack-class-head { gap:5px; }
          .teacher-doubt-ack-class-name { font-size:9px; }
          .teacher-doubt-ack-count { padding:2px 5px; font-size:5.5px; }
          .teacher-doubt-ack-list { gap:3px; margin-top:5px; }
          .teacher-doubt-ack-chip { padding:3px 5px; font-size:6.5px; }
          .teacher-doubt-ack-chip strong { font-size:6px; }
          .teacher-doubt-ack-action { margin-top:5px; padding-top:5px; }
          .teacher-doubt-ack-check { gap:4px; font-size:6.5px; }
          .teacher-doubt-ack-check input { width:11px; height:11px; }
          .teacher-doubt-ack-foot { gap:5px; padding:6px 7px; }
          .teacher-doubt-ack-foot-note { max-width:45%; font-size:6px; }
          .teacher-doubt-ack-btn,.teacher-doubt-ack-download { padding:5px 6px; font-size:6px; border-radius:7px; }
        }
      `}</style>

      <div className="teacher-doubt-ack-modal">
        <div className="teacher-doubt-ack-head">
          <p className="teacher-doubt-ack-kicker">DAILY ACADEMIC CHECK</p>
          <h2 id="teacher-doubt-ack-title" className="teacher-doubt-ack-title">
            Unresolved Doubts — Daily Review
          </h2>
          <p className="teacher-doubt-ack-copy">
            Please review the latest unresolved doubt bank for every classroom
            currently requiring your attention. Acknowledge each classroom before continuing.
          </p>
        </div>

        <div className="teacher-doubt-ack-body">
          {classrooms.map((item) => (
            <section className="teacher-doubt-ack-class" key={item.classroom}>
              <div className="teacher-doubt-ack-class-head">
                <div className="teacher-doubt-ack-class-name">{item.classroom}</div>
                <div className="teacher-doubt-ack-count">
                  {item.totalDoubts} UNRESOLVED
                </div>
              </div>

              <div className="teacher-doubt-ack-list">
                {item.doubts.map((doubt) => (
                  <span
                    className="teacher-doubt-ack-chip"
                    key={`${item.classroom}:${doubt.topic}`}
                  >
                    {doubt.topic}
                    <strong>×{doubt.count}</strong>
                  </span>
                ))}
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
            {allAcknowledged
              ? "All classrooms acknowledged."
              : `Acknowledge ${classrooms.length} classroom${classrooms.length === 1 ? "" : "s"} to continue.`}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <button
              type="button"
              className="teacher-doubt-ack-download"
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
