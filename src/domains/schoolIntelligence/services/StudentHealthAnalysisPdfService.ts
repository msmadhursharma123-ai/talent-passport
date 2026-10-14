import { Capacitor } from "@capacitor/core";

import html2canvas from "html2canvas";

import jsPDF from "jspdf";

import logoUrl from "../../../assets/logo.png";

import { getCurrentSchool } from "../../../services/identityService";

import { getSupabaseClient } from "../../../supabaseClient";

import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";

import type { SchoolDailyClassroomIntelligenceRow } from "../types/SchoolIntelligenceModels";

import { downloadOrSharePdfBlob } from "../../../services/platform/nativeDocumentService";

type DoubtRow = {

  teacher_assignment_uuid?: string | null;

  student_uuid?: string | null;

  class_name?: string | null;

  section_name?: string | null;

  subject_name?: string | null;

  student_name?: string | null;

  previous_topic_name?: string | null;

  previous_difficult_concept?: string | null;

  student_response?: string | null;

  log_date?: string | null;

  status?: string | null;

  doubt_resolved?: boolean | null;

};

type Loop2ClassroomSummary = {

  assignmentId: string;

  classroom: string;

  pendingCount: number;

  previousTopic: string;

  difficultConcept: string;

  students: string;

  logDate: string;

  status: string;

};

type DailyLogRow = {

  id?: string | null;

  teacher_assignment_uuid?: string | null;

  topic_name?: string | null;

  concepts_covered?: unknown;

  log_date?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

};

type TeacherReport = {

  teacherUuid: string;

  teacherName: string;

  classrooms: SchoolDailyClassroomIntelligenceRow[];

  // Canonical classroom rows are grouped by teacher + class + section. Retain

  // every active subject-assignment UUID in each group so Loop 2 doubts from

  // sibling subject assignments are not silently omitted from that classroom.

  assignmentIdsByClassroom: Map<string, string[]>;

};

// Supabase projects commonly impose a per-request row cap. Fetch every page so

// the report never silently omits teachers, assignments, doubts, or daily logs.

const QUERY_PAGE_SIZE = 500;

const QUERY_IN_CHUNK_SIZE = 100;

type QueryPage<T> = { data: T[] | null; error: { message?: string } | null };

async function fetchAllRows<T>(

  queryPage: (from: number, to: number) => PromiseLike<QueryPage<T>>,

  context: string,

): Promise<T[]> {

  const rows: T[] = [];

  for (let from = 0; ; from += QUERY_PAGE_SIZE) {

    const result = await queryPage(from, from + QUERY_PAGE_SIZE - 1);

    if (result.error) throw new Error(`${context}: ${result.error.message || "query failed"}`);

    const page = result.data ?? [];

    rows.push(...page);

    if (page.length < QUERY_PAGE_SIZE) return rows;

  }

}

function chunks<T>(values: T[], size: number): T[][] {

  const result: T[][] = [];

  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));

  return result;

}

// SchoolIdentity does not carry a logo URL. When the signed-in school is linked

// to an organization, use its existing organizations_master.logo_url; fall back

// to the bundled Talent Passport logo when no organization logo is configured.

async function resolveSchoolLogoUrl(supabase: any, organizationUuid?: string | null): Promise<string> {

  if (!organizationUuid) return logoUrl;

  try {

    const { data, error } = await supabase.from("organizations_master")

      .select("logo_url").eq("id", organizationUuid).maybeSingle();

    if (!error && typeof data?.logo_url === "string" && data.logo_url.trim()) return data.logo_url.trim();

  } catch { /* Optional branding lookup must not block the report. */ }

  return logoUrl;

}

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim() || "—";

const escapeHtml = (value: unknown) => clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const dateKey = (d: Date) => {

  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);

  return `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}-${parts.find(p => p.type === "day")?.value}`;

};

const shiftDateKey = (value: string, days: number) => {

  const [year, month, day] = value.split("-").map(Number);

  const shifted = new Date(Date.UTC(year, month - 1, day + days, 12));

  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;

};

const displayDate = (value: string) => {

  if (!value) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

};

// Match the existing SchoolIntelligenceEngine's Loop 2 definition exactly:

// status must be NOT DISCUSSED and the explicit resolved flag must not be true.

// Do not infer resolution from student_response; the canonical engine does not.

// Exact parity with TeacherPendingDoubtRepository.getTeacherPendingDoubtLedger():
// the Teacher Portal ledger selects rows by assignment UUID + status only.
// It deliberately has NO log_date filter and does not additionally filter
// doubt_resolved/student_response. "Day before yesterday" describes the
// revision workflow, not a report-date restriction.
const isUnresolved = (row: DoubtRow) =>
  String(row.status ?? "").trim().toUpperCase() === "NOT DISCUSSED";

const assignmentLabel = (c: SchoolDailyClassroomIntelligenceRow) => `${clean(c.className)}${c.sectionName ? `-${clean(c.sectionName)}` : ""} · ${clean(c.subjectName)}`;

const sameValue = (a: unknown, b: unknown) => String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

const classroomKey = (className: unknown, sectionName: unknown) => `${String(className ?? "").trim().toLowerCase()}\u0000${String(sectionName ?? "").trim().toLowerCase()}`;

function latestLogTime(log: DailyLogRow): number {

  const value = new Date(log.created_at ?? log.log_date ?? "").getTime();

  return Number.isFinite(value) ? value : 0;

}

function conceptsText(value: unknown): string {

  if (Array.isArray(value)) return value.filter(Boolean).map(String).join(", ");

  if (typeof value === "string") {

    const trimmed = value.trim();

    if (!trimmed) return "";

    // Some older rows store the concept list as a JSON array string.

    if (trimmed.startsWith("[")) {

      try {

        const parsed: unknown = JSON.parse(trimmed);

        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String).join(", ");

      } catch { /* Preserve the original text when it is not valid JSON. */ }

    }

    return trimmed;

  }

  return value == null ? "" : String(value);

}

function reportCss(): string {

  // All styles are deliberately scoped to the generated report. This host is

  // temporarily attached to document.body during PDF generation; global rules

  // such as `*`, `table`, `th`, `td`, or `html,body` would otherwise restyle the

  // live Classroom Intelligence UI while the report is being captured.

  return `

  .sha-page,.sha-page *{box-sizing:border-box}

  .sha-page{width:1122px;height:793px;min-height:793px;padding:0;background:#fff;overflow:hidden;display:block;position:relative;font-family:Arial,Helvetica,sans-serif;color:#1e293b}
  .sha-page .sha-content{width:1122px;min-height:793px;height:auto;padding:0 10px 8px;background:#fff;overflow:visible;display:flex;flex-direction:column;transform-origin:top left;font-family:Arial,Helvetica,sans-serif;color:#1e293b}

  .sha-page .sha-head{min-height:0;display:grid;grid-template-columns:minmax(150px,1fr) auto minmax(0,1fr);align-items:start;column-gap:10px;border-bottom:1px solid #f97316;padding:14px 0 7px;margin:0;flex-shrink:0}

  .sha-page .sha-logo-viewport{position:relative;width:150px;height:68px;overflow:hidden;margin:0;padding:0}
  .sha-page .sha-logo{display:block;max-width:150px;max-height:68px;object-fit:contain;object-position:left top}
  /* The bundled TP logo PNG has a large transparent canvas. Crop that transparent
     inset in the viewport so the visible mark starts at the top without modifying the asset. */
  .sha-page .sha-logo.sha-logo-tp{position:absolute;width:216px;height:auto;max-width:none;max-height:none;left:-50.4px;top:-48px;object-fit:initial}
  .sha-page .sha-title{padding-top:5px}
  .sha-page .sha-school{padding-top:6px}

  .sha-page .sha-brand-fallback{font-size:14px;font-weight:800;color:#c2410c}

  .sha-page .sha-title{text-align:center;font-size:25px;font-weight:800;color:#0f172a;letter-spacing:.2px}

  .sha-page .sha-school{min-width:0;text-align:right;font-size:15px;font-weight:750;color:#334155;overflow-wrap:anywhere;word-break:normal}

  .sha-page .sha-meta{display:flex;justify-content:space-between;gap:12px;padding:5px 0 7px;font-size:11px;color:#475569;flex-shrink:0}

  .sha-page .sha-section{background:linear-gradient(135deg,#fff7ed,#fffbf5);color:#c2410c;border:1px solid #fed7aa;border-left:4px solid #f97316;padding:5px 8px;font-size:12px;font-weight:900;letter-spacing:.45px;flex-shrink:0}

  .sha-page .sha-table-wrap{min-height:0;overflow:visible;flex:initial;display:block}

  .sha-page table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10px;line-height:1.25}

  .sha-page th{background:linear-gradient(135deg,#fff7ed,#fffbf5);color:#c2410c;font-weight:900;text-align:left;padding:5px 5px;border:1px solid #fed7aa}

  .sha-page td{padding:4px 5px;border:1px solid #dbe3ea;vertical-align:top;overflow-wrap:anywhere;word-break:normal}

  .sha-page tbody tr:nth-child(odd) td{background:#f8fafc}.sha-page tbody tr:nth-child(even) td{background:#fff}

  .sha-page .sha-class{font-weight:800;color:#0f172a}.sha-page .sha-subtle{color:#64748b;font-size:9px}.sha-page .sha-attention{color:#9a3412}

  .sha-page .sha-doubts{margin-top:6px;flex-shrink:0;width:100%}.sha-page .sha-doubt-grid{display:block;width:100%;padding-top:4px;max-height:none;overflow:visible}

  .sha-page .sha-doubt{border:1px solid #e2e8f0;border-left:3px solid #f97316;background:#fff7ed;padding:6px 8px;font-size:9px;line-height:1.3;overflow-wrap:anywhere}.sha-page .sha-loop2-table{margin-top:6px}.sha-page .sha-loop2-table{table-layout:fixed}.sha-page .sha-loop2-table th{font-size:9px;padding:4px}.sha-page .sha-loop2-table td{font-size:9px;padding:3px 4px;overflow-wrap:anywhere}

  .sha-page .sha-loop2-table{width:100%;margin-top:0}.sha-page .sha-doubt strong{color:#7c2d12}.sha-page .sha-none{font-size:10px;color:#64748b;padding:8px 2px}

  /* Sparse pages use the available body height instead of leaving a large blank lower half.
     The identity header remains pinned at the top; both tables share the remaining space. */
  .sha-page.sha-density-spacious .sha-table-wrap{flex:1 1 0;display:flex;flex-direction:column;min-height:0}
  .sha-page.sha-density-spacious .sha-table-wrap table{height:100%}
  .sha-page.sha-density-spacious .sha-doubts{flex:1 1 0;display:flex;flex-direction:column;min-height:0;margin-top:5px}
  .sha-page.sha-density-spacious .sha-doubt-grid{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;padding-top:3px}
  .sha-page.sha-density-spacious .sha-loop2-table{height:100%}
  .sha-page.sha-density-spacious .sha-loop2-table tbody tr,
  .sha-page.sha-density-spacious .sha-table-wrap tbody tr{height:auto}

  /* Data-density modes compact spacing before the final fit-to-page scale is applied. */
  .sha-page.sha-density-compact .sha-title{font-size:22px}
  .sha-page.sha-density-compact .sha-meta{padding:3px 0 4px;font-size:10px}
  .sha-page.sha-density-compact .sha-section{padding:4px 7px;font-size:11px}
  .sha-page.sha-density-compact table{font-size:9px;line-height:1.15}
  .sha-page.sha-density-compact th{padding:3px 4px}
  .sha-page.sha-density-compact td{padding:3px 4px}
  .sha-page.sha-density-compact .sha-loop2-table th,
  .sha-page.sha-density-compact .sha-loop2-table td{font-size:8px;padding:2px 3px;line-height:1.1}
  .sha-page.sha-density-compact .sha-doubts{margin-top:4px}
  .sha-page.sha-density-compact .sha-doubt-grid{padding-top:3px}
  .sha-page.sha-density-ultra .sha-title{font-size:19px}
  .sha-page.sha-density-ultra .sha-school{font-size:12px}
  .sha-page.sha-density-ultra table{font-size:8px;line-height:1.08}
  .sha-page.sha-density-ultra th{font-size:8px;padding:2px 3px}
  .sha-page.sha-density-ultra td{font-size:8px;padding:2px 3px}
  .sha-page.sha-density-ultra .sha-loop2-table th,
  .sha-page.sha-density-ultra .sha-loop2-table td{font-size:7px;padding:2px;line-height:1.05}
  .sha-page.sha-density-ultra .sha-section{font-size:10px;padding:3px 6px}
  .sha-page .sha-footer{margin-top:auto;padding-top:5px;border-top:1px solid #e2e8f0;font-size:9px;color:#64748b;display:flex;justify-content:space-between;flex-shrink:0}

  `;

}

function buildTeacherPage(teacher: TeacherReport, schoolName: string, schoolLogoUrl: string, generatedDate: string, loop2Summaries: Loop2ClassroomSummary[], subtopicsByLogId: Map<string, string>): string {

  const classes = teacher.classrooms.length ? teacher.classrooms : [];

  // The Teacher Portal exposes one ledger summary per classroom, not every
  // historical pending_teacher_doubts row. Match its visible grouping: class +
  // section, selecting the first assignment summary for that classroom.
  const summaryByClassroom = new Map<string, Loop2ClassroomSummary>();
  for (const classroom of classes) {
    const key = classroomKey(classroom.className, classroom.sectionName);
    if (summaryByClassroom.has(key)) continue;
    const assignmentIds = teacher.assignmentIdsByClassroom.get(key) ?? [String(classroom.assignmentUuid ?? "")];
    const summary = loop2Summaries.find(item => assignmentIds.includes(item.assignmentId));
    if (summary) summaryByClassroom.set(key, summary);
  }

  const rows = classes.map(c => {

    const attention = c.studentsRequiringAttention?.length ? c.studentsRequiringAttention.map(escapeHtml).join(", ") : "None flagged";

    return `<tr>

      <td><div class="sha-class">${escapeHtml(assignmentLabel(c))}</div><div class="sha-subtle">${escapeHtml(c.classroom)}</div></td>

      <td>${escapeHtml(displayDate(c.latestLectureDate))}</td>

      <td>${escapeHtml(`${Number(c.feedbackSubmitted ?? 0)} / ${Number(c.totalStudents ?? 0)}`)}</td>

      <td>${escapeHtml(c.latestTopic)}</td>

      <td>${escapeHtml(subtopicsByLogId.get(String(c.latestLectureUuid || "")) || "—")}</td>

      <td>${escapeHtml(c.mostDifficultConcept)}</td>

      <td class="sha-attention">${attention}</td>

    </tr>`;

  }).join("");

  // Set crossorigin before src is assigned. This lets html2canvas attempt a

  // CORS-safe image load; a remote logo that does not permit CORS is replaced

  // with the bundled same-origin logo before canvas export.

  const isBundledLogo = !schoolLogoUrl || schoolLogoUrl === logoUrl;
  const logo = `<div class="sha-logo-viewport"><img class="sha-logo${isBundledLogo ? " sha-logo-tp" : " sha-logo-school"}" crossorigin="anonymous" src="${escapeHtml(schoolLogoUrl || logoUrl)}" alt="School logo" /></div>`;

  const tableBody = rows || `<tr><td colspan="7">No classroom assignment found for this teacher.</td></tr>`;

  const loop2Rows = classes.map(c => {
    const summary = summaryByClassroom.get(classroomKey(c.className, c.sectionName));
    return `<tr>
      <td><div class="sha-class">${escapeHtml(assignmentLabel(c))}</div><div class="sha-subtle">${escapeHtml(c.classroom)}</div></td>
      <td>${summary ? escapeHtml(displayDate(summary.logDate)) : "—"}</td>
      <td>${summary ? escapeHtml(String(summary.pendingCount)) : "—"}</td>
      <td>${summary ? escapeHtml(summary.previousTopic) : "—"}</td>
      <td>${summary ? escapeHtml(summary.status) : "—"}</td>
      <td>${summary ? escapeHtml(summary.difficultConcept) : "—"}</td>
      <td>${summary ? escapeHtml(summary.students) : "—"}</td>
    </tr>`;
  }).join("");
  // Both tables deliberately use the exact same column partitions. The final
  // column gets the largest share for student names; class/subject and topic
  // columns remain compact while the date and status columns stay readable.
  const sharedColumnWidths = `<colgroup><col style="width:10%"><col style="width:9%"><col style="width:8%"><col style="width:12%"><col style="width:13%"><col style="width:8%"><col style="width:40%"></colgroup>`;
  const allDoubts = `<table class="sha-loop2-table">${sharedColumnWidths}<thead><tr><th>Class / Subject</th><th>Discussion date</th><th>Students with doubts</th><th>Topic taught</th><th>Status</th><th>Most difficult concept</th><th>Students requiring attention</th></tr></thead><tbody>${loop2Rows || `<tr><td colspan="7">No classroom assignment found for this teacher.</td></tr>`}</tbody></table>`;

  // Density is decided independently for each teacher page from meaningful cell
  // content, not just classroom count. Empty/default placeholders must not force
  // a sparse teacher's report into a cramped layout.
  const meaningful = (value: unknown): string => {
    const text = String(value ?? "").trim();
    if (!text || text === "—" || text === "-" || /^no daily log recorded$/i.test(text) || /^no data$/i.test(text) || /^none flagged$/i.test(text)) return "";
    return text;
  };
  const contentVolume = classes.reduce((sum, c) => sum + [
    c.latestTopic,
    c.mostDifficultConcept,
    (c.studentsRequiringAttention ?? []).join(", "),
    subtopicsByLogId.get(String(c.latestLectureUuid || "")),
    summaryByClassroom.get(classroomKey(c.className, c.sectionName))?.previousTopic,
    summaryByClassroom.get(classroomKey(c.className, c.sectionName))?.difficultConcept,
    summaryByClassroom.get(classroomKey(c.className, c.sectionName))?.students,
  ].reduce((n, value) => n + meaningful(value).length, 0), 0);
  const estimatedWrappedLines = classes.reduce((sum, c) => {
    const summary = summaryByClassroom.get(classroomKey(c.className, c.sectionName));
    const cellLengths = [
      meaningful(c.latestTopic).length,
      meaningful(subtopicsByLogId.get(String(c.latestLectureUuid || ""))).length,
      meaningful(c.mostDifficultConcept).length,
      meaningful((c.studentsRequiringAttention ?? []).join(", ")).length,
      meaningful(summary?.previousTopic).length,
      meaningful(summary?.difficultConcept).length,
      meaningful(summary?.students).length,
    ];
    return sum + cellLengths.reduce((n, length) => n + Math.max(1, Math.ceil(length / 34)), 0);
  }, 0);
  const denseScore = contentVolume + estimatedWrappedLines * 24 + Math.max(0, classes.length - 3) * 35;
  const densityClass = denseScore >= 4200 || classes.length >= 9
    ? " sha-density-ultra"
    : denseScore >= 1500 || estimatedWrappedLines >= 32
      ? " sha-density-compact"
      : " sha-density-spacious";

  return `<article class="sha-page${densityClass}"><div class="sha-content">

    <header class="sha-head"><div>${logo}</div><div class="sha-title">Student Health Analysis</div><div class="sha-school">${escapeHtml(schoolName)}</div></header>

    <div class="sha-meta"><div><strong>Teacher:</strong> ${escapeHtml(teacher.teacherName)}</div><div><strong>Generated:</strong> ${escapeHtml(displayDate(generatedDate))}</div></div>

    <div class="sha-section">LATEST CLASSROOM INSIGHTS</div>

    <div class="sha-table-wrap"><table>${sharedColumnWidths}<thead><tr><th>Class / Subject</th><th>Latest log date</th><th>Students Response</th><th>Topic taught</th><th>Subtopics taught</th><th>Most difficult concept</th><th>Students requiring attention</th></tr></thead><tbody>${tableBody}</tbody></table></div>

    <section class="sha-doubts"><div class="sha-section">Day before Yesterday's unresolved doubts</div><div class="sha-doubt-grid">${allDoubts}</div></section>

    <footer class="sha-footer"><span>Confidential school-use report · Talent Passport</span><span>Teacher report</span></footer>

  </div></article>`;

}

async function waitForImages(root: HTMLElement, timeoutMs = 8000): Promise<void> {

  await Promise.all(Array.from(root.querySelectorAll("img")).map(async image => {

    if (!image.complete) await new Promise<void>(resolve => {

      let settled = false;

      const finish = () => {

        if (settled) return;

        settled = true;

        window.clearTimeout(timer);

        image.removeEventListener("load", finish);

        image.removeEventListener("error", finish);

        resolve();

      };

      const timer = window.setTimeout(finish, timeoutMs);

      image.addEventListener("load", finish, { once: true });

      image.addEventListener("error", finish, { once: true });

    });

    // decode() can also stall in embedded/mobile browsers, so keep a bound.

    try {

      await Promise.race([

        image.decode(),

        new Promise<void>(resolve => window.setTimeout(resolve, timeoutMs)),

      ]);

    } catch { /* logo fallback is handled below */ }

  }));

}

export type PreparedStudentHealthAnalysisPdf = {
  blob: Blob;
  fileName: string;
  title: string;
};

function isTouchBrowser(): boolean {
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  const ua = nav.userAgent || "";
  return /iPhone|iPad|iPod|Android/i.test(ua) || (nav.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1) || (typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches);
}

/** Try a native share/save sheet when supported; retain a direct-download fallback. */
export async function savePreparedStudentHealthAnalysisPdf(prepared: PreparedStudentHealthAnalysisPdf): Promise<void> {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (typeof nav.share === "function") {
    try {
      const file = new File([prepared.blob], prepared.fileName, { type: "application/pdf" });
      const shareData: ShareData = { files: [file], title: prepared.title };
      if (typeof nav.canShare !== "function" || nav.canShare(shareData)) {
        await nav.share(shareData);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // If file sharing is unavailable or fails, try the browser download route.
    }
  }
  triggerPdfDownload(prepared.blob, prepared.fileName, true);
}

/** Start the browser's download flow. iOS/WebKit may preview instead; V28 also
 * returns a retained PDF on touch devices so the UI can offer a manual fallback. */
function triggerPdfDownload(blob: Blob, fileName: string, useGenericMime = false): void {
  const downloadBlob = useGenericMime ? new Blob([blob], { type: "application/octet-stream" }) : blob;
  const url = URL.createObjectURL(downloadBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadStudentHealthAnalysis(onProgress?: (percent: number) => void): Promise<PreparedStudentHealthAnalysisPdf | null> {

  const reportProgress = (percent: number) => onProgress?.(Math.max(0, Math.min(100, Math.round(percent))));
  reportProgress(1);

  const school = getCurrentSchool();

  if (!school?.schoolUuid) throw new Error("School identity is missing. Please sign in again.");

  const supabase = getSupabaseClient();

  if (!supabase) throw new Error("Supabase is not configured.");

  const schoolLogoUrl = await resolveSchoolLogoUrl(supabase, school.organizationUuid);
  reportProgress(4);

  const snapshot = await loadSchoolIntelligence(undefined, undefined, undefined, { forceRefresh: true });

  if (snapshot.schoolUuid !== school.schoolUuid) throw new Error("The loaded school context does not match the signed-in school. Please reload the portal.");
  reportProgress(8);

  const [teachersData, assignmentsData] = await Promise.all([

    fetchAllRows<{ teacher_uuid: string | null; full_name: string | null; is_active: boolean | null }>(

      (from, to) => supabase.from("teachers_master").select("teacher_uuid,full_name,is_active")

        .eq("school_uuid", school.schoolUuid).order("teacher_uuid", { ascending: true }).range(from, to),

      "Could not load school teachers",

    ),

    fetchAllRows<{ id: string | null; teacher_uuid: string | null; school_uuid: string | null; class_name: string | null; section_name: string | null; subject_name: string | null; is_active: boolean | null }>(

      (from, to) => supabase.from("teacher_classroom_assignments")

        .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,is_active")

        .eq("school_uuid", school.schoolUuid).order("id", { ascending: true }).range(from, to),

      "Could not load school classroom assignments",

    ),

  ]);

  reportProgress(15);

  const intelligenceByTeacher = new Map<string, { teacherName: string; classrooms: SchoolDailyClassroomIntelligenceRow[] }>(

    (snapshot.dailyClassroomIntelligence ?? []).map(t => [String(t.teacherUuid), t] as const)

  );

  // Query the authoritative Daily Log table independently of the snapshot.

  // The existing School Intelligence repository has unpaginated source queries;

  // this report paginates so it can detect logs that the snapshot did not include.

  const activeAssignments = assignmentsData.filter(a => a.is_active !== false && a.teacher_uuid && a.id);

  const assignmentIds = Array.from(new Set(activeAssignments.map(a => String(a.id))));

  const logsById = new Map<string, DailyLogRow>();

  const latestLogByAssignmentId = new Map<string, DailyLogRow>();

  for (const assignmentChunk of chunks(assignmentIds, QUERY_IN_CHUNK_SIZE)) {

    const logRows = await fetchAllRows<DailyLogRow>(

      (from, to) => supabase.from("teacher_daily_logs")

        .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at,updated_at")

        .in("teacher_assignment_uuid", assignmentChunk)

        .order("id", { ascending: true }).range(from, to),

      "Could not verify latest classroom daily logs",

    );

    for (const row of logRows) {

      const logId = String(row.id ?? "");

      const assignmentId = String(row.teacher_assignment_uuid ?? "");

      if (logId) logsById.set(logId, row);

      if (!assignmentId) continue;

      const current = latestLogByAssignmentId.get(assignmentId);

      if (!current || latestLogTime(row) > latestLogTime(current) ||

          (latestLogTime(row) === latestLogTime(current) && String(row.id ?? "").localeCompare(String(current.id ?? "")) > 0)) {

        latestLogByAssignmentId.set(assignmentId, row);

      }

    }

  }

  const assignmentsByTeacher = new Map<string, SchoolDailyClassroomIntelligenceRow[]>();

  const representedClassroomsByTeacher = new Map<string, Set<string>>();

  const subtopicsByLogId = new Map<string, string>();

  // Preserve every classroom already shown by the canonical Intelligence

  // snapshot. If the complete direct query finds a newer log than the snapshot,

  // fail closed rather than publishing mismatched topic/health metrics.

  for (const intelligence of snapshot.dailyClassroomIntelligence ?? []) {

    const teacherUuid = String(intelligence.teacherUuid);

    const rows = assignmentsByTeacher.get(teacherUuid) ?? [];

    const represented = representedClassroomsByTeacher.get(teacherUuid) ?? new Set<string>();

    for (const classroom of intelligence.classrooms ?? []) {

      const key = classroomKey(classroom.className, classroom.sectionName);

      if (represented.has(key)) continue;

      const latestDirect = latestLogByAssignmentId.get(String(classroom.assignmentUuid));

      const snapshotLog = logsById.get(String(classroom.latestLectureUuid));

      if (!latestDirect || !snapshotLog || String(snapshotLog.teacher_assignment_uuid ?? "") !== String(classroom.assignmentUuid)) {

        throw new Error(`Could not verify the latest daily log for ${classroom.className}${classroom.sectionName ? `-${classroom.sectionName}` : ""}. No report was downloaded to avoid showing incomplete information.`);

      }

      // The canonical engine sorts by created_at/log_date but does not define

      // a secondary order for equal timestamps. The paginated verification

      // query uses id ordering, so equal-time rows can legitimately select a

      // different ID without indicating that the snapshot is stale. Fail only

      // when the direct query proves that a strictly newer log exists; keep

      // the canonical snapshot's row/metrics when timestamps tie.

      if (latestLogTime(latestDirect) > latestLogTime(snapshotLog)) {

        throw new Error(`The latest Daily Log is newer than the Classroom Intelligence snapshot for ${classroom.className}${classroom.sectionName ? `-${classroom.sectionName}` : ""}. Refresh the School Intelligence data and try again.`);

      }

      subtopicsByLogId.set(String(snapshotLog.id), conceptsText(snapshotLog.concepts_covered));

      rows.push(classroom);

      represented.add(key);

    }

    assignmentsByTeacher.set(teacherUuid, rows);

    representedClassroomsByTeacher.set(teacherUuid, represented);

  }

  // Add only genuinely missing class/section groups. This mirrors the existing

  // engine's grouping and prevents multiple subject assignments from producing

  // duplicate classroom rows. If logs exist but the canonical snapshot lacks

  // that classroom, fail visibly instead of claiming that no log exists.

  for (const assignment of activeAssignments) {

    const teacherUuid = String(assignment.teacher_uuid);

    const key = classroomKey(assignment.class_name, assignment.section_name);

    const represented = representedClassroomsByTeacher.get(teacherUuid) ?? new Set<string>();

    if (represented.has(key)) continue;

    const siblingAssignments = activeAssignments.filter(a =>

      String(a.teacher_uuid) === teacherUuid &&

      sameValue(a.class_name, assignment.class_name) && sameValue(a.section_name, assignment.section_name)

    );

    const siblingLogs = siblingAssignments.map(a => latestLogByAssignmentId.get(String(a.id))).filter((log): log is DailyLogRow => Boolean(log));

    if (siblingLogs.length) {

      throw new Error(`A Daily Log exists for ${assignment.class_name}${assignment.section_name ? `-${assignment.section_name}` : ""}, but the canonical Classroom Intelligence snapshot has no matching row. No incomplete report was downloaded.`);

    }

    const classroom: SchoolDailyClassroomIntelligenceRow = {

      assignmentUuid: String(assignment.id), teacherUuid, teacherName: "",

      classroom: `${assignment.class_name ?? ""}${assignment.section_name ? ` - ${assignment.section_name}` : ""}`,

      className: String(assignment.class_name ?? ""), sectionName: String(assignment.section_name ?? ""), subjectName: String(assignment.subject_name ?? ""),

      latestLectureUuid: "", latestLectureDate: "", latestTopic: "No Daily Log recorded",

      totalStudents: 0, feedbackSubmitted: 0, feedbackRemaining: 0, completelyUnderstood: 0, completelyUnderstoodRate: 0,

      partiallyUnderstood: 0, partiallyUnderstoodRate: 0, didntUnderstand: 0, didntUnderstandRate: 0,

      classHealthScore: 0, classHealthStatus: "No data", mostDifficultConcept: "No data", studentsRequiringAttention: [],

    };

    const rows = assignmentsByTeacher.get(teacherUuid) ?? [];

    rows.push(classroom);

    assignmentsByTeacher.set(teacherUuid, rows);

    represented.add(key);

    representedClassroomsByTeacher.set(teacherUuid, represented);

  }

  // Match the page's visible teacher set: retain teachers present in the

  // canonical Intelligence snapshot even if their master row is now inactive.

  const reportTeachersByUuid = new Map<string, { teacher_uuid: string; full_name: string | null }>();

  for (const teacher of teachersData) {

    if (teacher.is_active !== false && teacher.teacher_uuid) {

      reportTeachersByUuid.set(String(teacher.teacher_uuid), { teacher_uuid: String(teacher.teacher_uuid), full_name: teacher.full_name ?? null });

    }

  }

  for (const teacher of snapshot.dailyClassroomIntelligence ?? []) {

    if (teacher.teacherUuid && !reportTeachersByUuid.has(String(teacher.teacherUuid))) {

      reportTeachersByUuid.set(String(teacher.teacherUuid), { teacher_uuid: String(teacher.teacherUuid), full_name: teacher.teacherName ?? null });

    }

  }

  const assignmentIdsByTeacherAndClassroom = new Map<string, Map<string, string[]>>();

  for (const assignment of activeAssignments) {

    const teacherUuid = String(assignment.teacher_uuid);

    const key = classroomKey(assignment.class_name, assignment.section_name);

    const byClassroom = assignmentIdsByTeacherAndClassroom.get(teacherUuid) ?? new Map<string, string[]>();

    const ids = byClassroom.get(key) ?? [];

    if (assignment.id && !ids.includes(String(assignment.id))) ids.push(String(assignment.id));

    byClassroom.set(key, ids);

    assignmentIdsByTeacherAndClassroom.set(teacherUuid, byClassroom);

  }

  const teachers: TeacherReport[] = Array.from(reportTeachersByUuid.values())

    .map(t => {

      const teacherUuid = String(t.teacher_uuid);

      const intelligence = intelligenceByTeacher.get(teacherUuid);

      let classrooms = assignmentsByTeacher.get(teacherUuid) ?? [];

      if (!classrooms.length) {

        classrooms = [{

          assignmentUuid: "", teacherUuid, teacherName: String(t.full_name ?? "Teacher"), classroom: "No assigned classroom",

          className: "No assigned classroom", sectionName: "", subjectName: "—", latestLectureUuid: "", latestLectureDate: "",

          latestTopic: "No assigned classroom", totalStudents: 0, feedbackSubmitted: 0, feedbackRemaining: 0,

          completelyUnderstood: 0, completelyUnderstoodRate: 0, partiallyUnderstood: 0, partiallyUnderstoodRate: 0,

          didntUnderstand: 0, didntUnderstandRate: 0, classHealthScore: 0, classHealthStatus: "No data", mostDifficultConcept: "No data", studentsRequiringAttention: [],

        }];

      }

      return {

        teacherUuid,

        teacherName: String(t.full_name ?? intelligence?.teacherName ?? "Teacher"),

        classrooms: classrooms.sort((a,b) => assignmentLabel(a).localeCompare(assignmentLabel(b))),

        assignmentIdsByClassroom: assignmentIdsByTeacherAndClassroom.get(teacherUuid) ?? new Map<string, string[]>(),

      };

    }).sort((a,b) => a.teacherName.localeCompare(b.teacherName));

  if (!teachers.length) throw new Error("No active teachers were found for this school.");

  const generatedDate = dateKey(new Date());


  // Match TeacherPendingDoubtRepository.getTeacherPendingDoubtLedger(): query
  // each assignment independently with status = NOT DISCUSSED and no date
  // filter. The portal displays one summary per classroom, based on data[0],
  // distinct student UUIDs, canonical student names, and the same log date.
  const doubtsByAssignmentId = new Map<string, DoubtRow[]>();
  const assignmentChunks = chunks(activeAssignments, 10);
  for (const assignmentChunk of assignmentChunks) {
    const assignmentResults = await Promise.all(assignmentChunk.map(async assignment => {
      const assignmentId = String(assignment.id);
      const rows = await fetchAllRows<DoubtRow>(
        (from, to) => supabase.from("pending_teacher_doubts")
          .select("id,teacher_assignment_uuid,student_uuid,class_name,section_name,subject_name,student_name,previous_topic_name,previous_difficult_concept,student_response,log_date,status,doubt_resolved")
          .eq("teacher_assignment_uuid", assignmentId).eq("status", "NOT DISCUSSED").range(from, to),
        `Could not load Loop 2 ledger for assignment ${assignmentId}`,
      );
      return [assignmentId, rows.filter(isUnresolved)] as const;
    }));
    for (const [assignmentId, rows] of assignmentResults) doubtsByAssignmentId.set(assignmentId, rows);
  }

  const allDoubts = Array.from(doubtsByAssignmentId.values()).flat();
  const studentUuids = Array.from(new Set(allDoubts.map(row => String(row.student_uuid ?? "").trim()).filter(Boolean)));
  const studentNamesByUuid = new Map<string, string>();
  for (const studentChunk of chunks(studentUuids, QUERY_IN_CHUNK_SIZE)) {
    const result = await fetchAllRows<{ student_uuid: string | null; student_name: string | null }>(
      (from, to) => supabase.from("students_master").select("student_uuid,student_name")
        .eq("school_uuid", school.schoolUuid).in("student_uuid", studentChunk)
        .order("student_uuid", { ascending: true }).range(from, to),
      "Could not resolve Loop 2 student names",
    );
    for (const student of result) {
      const uuid = String(student.student_uuid ?? "").trim();
      const name = String(student.student_name ?? "").trim();
      if (uuid && name && !studentNamesByUuid.has(uuid)) studentNamesByUuid.set(uuid, name);
    }
  }

  const loop2Summaries: Loop2ClassroomSummary[] = [];
  for (const assignment of activeAssignments) {
    const assignmentId = String(assignment.id);
    const rows = doubtsByAssignmentId.get(assignmentId) ?? [];
    if (!rows.length) continue;
    const first = rows[0]; // same first-row semantics as the Teacher Portal repository
    const studentIds = Array.from(new Set(rows.map(row => String(row.student_uuid ?? "").trim()).filter(Boolean)));
    const students = Array.from(new Set(rows.map(row => {
      const uuid = String(row.student_uuid ?? "").trim();
      const canonicalName = studentNamesByUuid.get(uuid) ?? "";
      const storedName = String(row.student_name ?? "").trim();
      if (canonicalName) return canonicalName;
      if (storedName && !/^glps\d+$/i.test(storedName)) return storedName;
      return "";
    }).filter(Boolean))).join(", ");
    loop2Summaries.push({
      assignmentId,
      classroom: `${assignment.class_name ?? ""}-${assignment.section_name ?? ""}`,
      pendingCount: studentIds.length,
      previousTopic: String(first.previous_topic_name ?? "-"),
      difficultConcept: String(first.previous_difficult_concept ?? "-"),
      students: students || "-",
      logDate: String(first.log_date ?? "-"),
      status: "Needs Revision",
    });
  }

  reportProgress(32);

  const host = document.createElement("div");

  // Keep the render host inside the viewport. V7 placed it 20,000px off-screen,

  // which can cause html2canvas to clone/capture a blank or clipped target in

  // some browsers because its clone viewport is only report-sized. Negative

  // stacking keeps it behind the portal while html2canvas captures the target

  // report element directly.

  host.style.position = "fixed";

  host.style.left = "0";

  host.style.top = "0";

  host.style.width = "1122px";

  host.style.pointerEvents = "none";

  host.style.zIndex = "-1";

  host.setAttribute("aria-hidden", "true");

  host.innerHTML = `<style>${reportCss()}</style>${teachers.map(t => buildTeacherPage(t, school.schoolName || "School", schoolLogoUrl, generatedDate, loop2Summaries.filter(summary => Array.from(t.assignmentIdsByClassroom.values()).some(ids => ids.includes(summary.assignmentId))), subtopicsByLogId)).join("")}`;

  document.body.appendChild(host);

  try {

    if (document.fonts?.ready) await document.fonts.ready;

    await waitForImages(host);

    const logoImages = Array.from(host.querySelectorAll<HTMLImageElement>(".sha-logo"));

    for (const img of logoImages) {

      if (!img.naturalWidth && img.src !== new URL(logoUrl, document.baseURI).href) {

        // Remote organization logos can be unavailable or block canvas capture.

        // Retry with the bundled same-origin logo before using a text fallback.

        img.classList.remove("sha-logo-school");
        img.classList.add("sha-logo-tp");
        img.src = logoUrl;

        await waitForImages(img.parentElement ?? host);

      }

      if (!img.naturalWidth) {

        const fallback = document.createElement("span");

        fallback.className = "sha-brand-fallback";

        fallback.textContent = "TALENT PASSPORT";

        img.replaceWith(fallback);

      }

    }

    const pages = Array.from(host.querySelectorAll<HTMLElement>(".sha-page"));

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

    for (let index = 0; index < pages.length; index++) {

      const page = pages[index];

      // Every teacher gets one landscape-A4 page. The report identity header is
      // pinned to the top by the small content padding. Sparse pages distribute
      // spare height through both tables; dense pages keep natural row heights and
      // are uniformly scaled only if their measured content exceeds the frame.
      // No classroom or Loop 2 rows are dropped by this layout adjustment.
      const content = page.querySelector<HTMLElement>(".sha-content");
      if (!content) throw new Error(`Could not prepare the report layout for ${teachers[index]?.teacherName ?? "a teacher"}.`);
      content.style.transform = "none";
      const naturalHeight = Math.max(content.scrollHeight, Math.ceil(content.getBoundingClientRect().height));
      const fitScale = Math.min(1, 793 / naturalHeight);
      content.style.transform = `translateX(${(1122 * (1 - fitScale)) / 2}px) scale(${fitScale})`;

      // Keep the original 2x capture resolution for print-quality output.
      // Improve memory/encoding overhead by avoiding a base64 data URL copy.
      const renderScale = 2;
      reportProgress(35);
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff", scale: renderScale, useCORS: true, logging: false,
        width: 1122, height: 793, windowWidth: 1122,
        windowHeight: 793, scrollX: 0, scrollY: 0,
      });

      if (!canvas.width || !canvas.height) throw new Error(`Could not render the PDF page for ${teachers[index]?.teacherName ?? "a teacher"}.`);

      if (index > 0) pdf.addPage("a4", "landscape");
      // Encode directly to a JPEG Blob, then pass binary bytes to jsPDF.
      // This avoids allocating a large base64 string while retaining the same
      // 2x raster resolution and JPEG quality used by the previous report path.
      const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error(`Could not encode the PDF page for ${teachers[index]?.teacherName ?? "a teacher"}.`)),
          "image/jpeg",
          0.94,
        );
      });
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      pdf.addImage(jpegBytes, "JPEG", 0, 0, 297, 210, undefined, "FAST");

      canvas.width = 1;

      canvas.height = 1;
      reportProgress(35 + Math.round(((index + 1) / Math.max(1, pages.length)) * 58));

    }

    reportProgress(96);
    const blob = pdf.output("blob");

    const fileName = `Student-Health-Analysis-${generatedDate}.pdf`;

    const title = `Talent Passport — ${clean(school.schoolName)} Student Health Analysis`;

    if (Capacitor.isNativePlatform()) {
      // Preserve the existing Capacitor save/share behavior for installed apps.
      await downloadOrSharePdfBlob(blob, fileName, title);
      reportProgress(100);
      return null;
    } else {
      // One click first attempts the browser download. Keep a copy on touch
      // devices so Safari/WebKit users have an explicit Save/Share fallback.
      triggerPdfDownload(blob, fileName, isTouchBrowser());
      reportProgress(100);
      return isTouchBrowser() ? { blob, fileName, title } : null;
    }

  } finally {

    host.remove();

  }

}
