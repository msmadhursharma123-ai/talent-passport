
import { getSupabaseClient } from "../../supabaseClient";
import { getCurrentTeacher, requireSchoolIdentity } from "../../services/identityService";
import {
  getMyAcademicYearContext,
  getSchoolAcademicYears,
} from "../academicYear/repositories/AcademicYearRepository";
import { getAcademicYearRuntime } from "../academicYear/context/AcademicYearRuntime";
import { validateCurrentYearAssignments } from "../learningEvidenceEngine/repository/CurrentYearAssignments";
import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
  calculateLearningDoubtRate,
  calculateDoubtClosureRate,
  isDoubtResolved,
} from "../learningAnalytics/canonical/LearningAnalyticsCanonicalService";
import { buildVerifiedEnrollmentRoster, classroomRosterKey } from "../learningEvidenceEngine/repository/EnrollmentRoster";
import {
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
  reconcilePendingDoubtsWithLiveLedger,
} from "../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import { enumerateCalendarDays, getAssignmentEffectiveEndDate, isAssignmentActiveOnDate, getResolvedDoubtDate, getStudentUnderstandingPercentage, getEffectivePeriodEndExclusive, hasUnverifiableAssignmentInterval, buildAssignmentIntervalWarning, buildTrackRecordPeriods, selectSchoolOverviewDoubtClosureCohort, getSchoolOverviewDoubtClosureStartDate } from "./TrackRecordCalculations";
import type {
  TrackRecordAudience, TrackRecordCell, TrackRecordData, TrackRecordDetailRow,
  TrackRecordGroup, TrackRecordMetric, TrackRecordMetricId, TrackRecordPeriod,
} from "./TrackRecordTypes";

const METRICS: Array<{ id: TrackRecordMetricId; label: string }> = [
  { id: "feedback", label: "Average Feedback %" },
  { id: "health", label: "Average Learning Health %" },
  { id: "understanding", label: "Average Understanding %" },
  { id: "partial", label: "Average Partial Understanding %" },
  { id: "didNotUnderstand", label: "Average Didn't Understand %" },
  { id: "doubtRate", label: "Average Doubt %" },
  { id: "closureRate", label: "Doubt Closure Rate %" },
  { id: "below50", label: "Below 50% Understanding — students / %" },
  { id: "above80", label: "Above 80% Understanding — students / %" },
  { id: "openingDoubts", label: "Total Doubts at Period Start" },
  { id: "closingDoubts", label: "Total Active Doubts at Period End" },
  { id: "newDoubts", label: "New Doubts in Period" },
  { id: "resolvedDoubts", label: "Doubts Resolved in Period" },
  { id: "topics", label: "Unique Topics Taught" },
  { id: "subtopics", label: "Unique Subtopics Taught" },
  { id: "logsSubmitted", label: "Total Logs Submitted" },
  { id: "logsMissed", label: "Total Logs Missed" },
];

const client = () => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
};
const clean = (v: unknown) => String(v ?? "").trim();
const norm = (v: unknown) => clean(v).toLowerCase().replace(/\s+/g, " ");
const isoDay = (v: unknown) => {
  const value = clean(v);
  if (!value) return "";
  // DATE columns are already calendar dates. Timestamp columns are converted
  // to the school's India business date to avoid UTC month/week boundary drift.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const year = parts.find(part => part.type === "year")?.value ?? "";
  const month = parts.find(part => part.type === "month")?.value ?? "";
  const day = parts.find(part => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
};
const addDays = (date: string, days: number) => {
  // Date-only reporting boundaries must not depend on the device/browser timezone.
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const minDate = (values: string[], fallback: string) => values.filter(Boolean).sort()[0] ?? fallback;
const pct = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;
const exactPct = (n: number, d: number) => d > 0 ? (n / d) * 100 : 0;
const unique = (values: unknown[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach(value => {
    const display = clean(value);
    const key = norm(display);
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(display);
    }
  });
  return result;
};

function blankMetric(id: TrackRecordMetricId): TrackRecordMetric {
  const percentageIds = ["feedback", "health", "understanding", "partial", "didNotUnderstand", "doubtRate", "closureRate"];
  if (id === "logsMissed") return { id, label: METRICS.find(x => x.id === id)!.label, value: null, display: "—", unit: "unavailable", note: "No teacher timetable or expected teaching-day schedule exists in the source project; a missed-log count cannot be asserted accurately." };
  return { id, label: METRICS.find(x => x.id === id)!.label, value: 0, display: percentageIds.includes(id) ? "0%" : "0", unit: percentageIds.includes(id) ? "percent" : "count" };
}
function makeCell(period: TrackRecordPeriod, metricValues: Partial<Record<TrackRecordMetricId, TrackRecordMetric>>, details: Partial<Record<TrackRecordMetricId, TrackRecordDetailRow[]>>): TrackRecordCell {
  const metrics = {} as Record<TrackRecordMetricId, TrackRecordMetric>;
  METRICS.forEach(({ id }) => {
    metrics[id] = metricValues[id] ?? (period.isFuture
      ? { ...blankMetric(id), value: null, display: "—", unit: "unavailable", note: "This reporting period has not started." }
      : blankMetric(id));
  });
  return { period, metrics, details };
}
function makeUnavailableCell(period: TrackRecordPeriod, note: string): TrackRecordCell {
  const metrics = {} as Record<TrackRecordMetricId, TrackRecordMetric>;
  METRICS.forEach(({ id }) => {
    metrics[id] = { ...blankMetric(id), value: null, display: "—", unit: "unavailable", note };
  });
  return { period, metrics, details: {} };
}
function dateIn(date: string, period: TrackRecordPeriod) {
  return Boolean(date) && date >= period.startDate && date < period.endDateExclusive;
}
function getCreatedDate(row: any) {
  return isoDay(row.log_date || row.created_at || row.createdAt);
}
function getResolvedDate(row: any) {
  return getResolvedDoubtDate(row, isDoubtResolved, isoDay);
}
function metric(id: TrackRecordMetricId, value: number, display?: string, unit: TrackRecordMetric["unit"] = "count"): TrackRecordMetric {
  return { id, label: METRICS.find(x => x.id === id)!.label, value, display: display ?? String(value), unit };
}
function groupKey(teacherUuid: string, className: string, sectionName: string, subjectName: string) {
  return JSON.stringify([teacherUuid, className, sectionName, subjectName].map(norm));
}
function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}
async function readAll(query: any, pageSize = 750) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}
async function queryChunks(table: string, ids: string[], foreignKey: string, columns = "*", scope: { schoolUuid?: string; startDate?: string; endDate?: string } = {}) {
  const rows: any[] = [];
  // Keep the pending-doubt predicate deliberately small: the source project
  // previously experienced statement timeouts on wide assignment UUID lists.
  const chunkSize = table === "pending_teacher_doubts" ? 8 :
    table === "student_daily_feedback" ? 50 : 35;
  for (const part of chunk(ids, chunkSize)) {
    if (!part.length) continue;
    let query = client().from(table).select(columns).in(foreignKey, part);
    if (table === "teacher_daily_logs") {
      if (scope.startDate) query = query.gte("log_date", scope.startDate);
      if (scope.endDate) query = query.lte("log_date", scope.endDate);
      query = query.order("log_date", { ascending: true }).order("id", { ascending: true });
    } else if (table === "student_daily_feedback") {
      if (scope.schoolUuid) query = query.eq("school_uuid", scope.schoolUuid);
      query = query.order("daily_log_uuid", { ascending: true }).order("id", { ascending: true });
    }
    else if (table === "pending_teacher_doubts") query = query.order("id", { ascending: true });
    rows.push(...await readAll(query));
  }
  return rows;
}

/**
 * Read the complete live overlay for a bounded assignment chunk. The shared
 * single-page helper cannot detect PostgREST max-row truncation. Track Record
 * uses the same table and shared reconciliation functions, but pages the read
 * and verifies the fetched row count against an exact RLS-scoped count. If the
 * count and page result disagree (including concurrent changes), fail closed.
 */
async function readAllLiveDoubtsForAssignments(assignmentIds: string[]) {
  if (!assignmentIds.length) return [];
  const supabase = client();
  const countResult = await supabase.from("student_live_unresolved_doubts")
    .select("id", { count: "exact", head: true })
    .in("teacher_assignment_uuid", assignmentIds);
  if (countResult.error) throw countResult.error;
  if (typeof countResult.count !== "number") {
    throw new Error("Live doubt count could not be verified; canonical learning metrics are unavailable.");
  }
  const query = supabase.from("student_live_unresolved_doubts")
    .select("*")
    .in("teacher_assignment_uuid", assignmentIds)
    .order("id", { ascending: true });
  const rows = await readAll(query, 500);
  if (rows.length !== countResult.count) {
    throw new Error(`Live doubt pagination was incomplete (${rows.length} of ${countResult.count} rows).`);
  }
  return rows;
}

/**
 * Resolve the exact school-selected academic year used by AcademicYearProvider.
 *
 * The provider deliberately falls back to the school's current (or first
 * non-archived) year when the saved selection RPC returns no matching row.
 * Track Record must consume that same runtime selection instead of treating a
 * missing saved-context RPC row as proof that no academic year is selected.
 *
 * When the provider has not populated its runtime snapshot yet (for example,
 * an immediate click during initial portal loading), reproduce the provider's
 * resolution order from the same school-scoped source. RPC errors are not
 * swallowed: an authorization/RLS failure must remain a failure, not silently
 * select a different year.
 */
async function resolveSelectedAcademicYear(schoolUuid: string) {
  const runtime = getAcademicYearRuntime();
  if (runtime?.schoolUuid === schoolUuid) {
    return runtime.academicYear;
  }

  const rows = (await getSchoolAcademicYears(schoolUuid))
    .filter(row => row.status !== "ARCHIVED");
  if (!rows.length) return null;

  const serverContext = await getMyAcademicYearContext();
  const current = rows.find(row => row.isCurrent) ?? rows[0] ?? null;
  return serverContext && rows.some(row => row.id === serverContext.id)
    ? rows.find(row => row.id === serverContext.id) ?? current
    : current;
}

export async function loadTrackRecordData(audience: TrackRecordAudience): Promise<TrackRecordData> {
  const supabase = client();
  const warnings: string[] = [];
  let schoolUuid = "";
  let schoolName = "";
  let teacherUuid = "";
  let teacherName = "";

  if (audience === "teacher") {
    const identity = getCurrentTeacher();
    if (!identity?.teacherUuid || !identity.schoolUuid) throw new Error("Teacher identity is unavailable.");
    teacherUuid = String(identity.teacherUuid);
    teacherName = String(identity.teacherName ?? "Teacher");
    schoolUuid = String(identity.schoolUuid);
    schoolName = String(identity.schoolName ?? "");
  } else {
    const identity = requireSchoolIdentity();
    if (!identity?.schoolUuid) throw new Error("Authenticated school UUID is missing.");
    schoolUuid = String(identity.schoolUuid);
    schoolName = String(identity.schoolName ?? "");
  }

  // Follow the same resolved school selection as AcademicYearProvider.
  // Do not require a separately persisted RPC selection when the provider has
  // already resolved the school's current/selected year into its runtime.
  const academicYearContext = await resolveSelectedAcademicYear(schoolUuid);
  if (!academicYearContext || clean(academicYearContext.schoolUuid) !== schoolUuid ||
      !clean(academicYearContext.id) || !clean(academicYearContext.academicYearCode) ||
      !clean(academicYearContext.startDate) || !clean(academicYearContext.endDate)) {
    throw new Error("Track Record requires a valid school-scoped selected academic-year context with start and end dates. Confirm that this school has a non-archived academic year with valid start and end dates.");
  }
  const academicYearId = clean(academicYearContext.id);
  const academicYearCode = clean(academicYearContext.academicYearCode);
  const academicStart = isoDay(academicYearContext.startDate);
  const academicEnd = isoDay(academicYearContext.endDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(academicStart) || !/^\d{4}-\d{2}-\d{2}$/.test(academicEnd) || academicEnd < academicStart) {
    throw new Error("Track Record stopped: selected academic-year dates are invalid.");
  }
  const academicEndExclusive = addDays(academicEnd, 1);

  let assignmentCandidatesQuery = supabase.from("teacher_classroom_assignments")
    .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,academic_year,academic_year_id,is_active,created_at,ended_at")
    .eq("school_uuid", schoolUuid);
  if (audience === "teacher") assignmentCandidatesQuery = assignmentCandidatesQuery.eq("teacher_uuid", teacherUuid);
  const assignmentCandidates = await readAll(assignmentCandidatesQuery.order("created_at", { ascending: true }).order("id", { ascending: true }));
  // Match the Learning Evidence Engine contract: explicit year IDs must match;
  // legacy NULL IDs are accepted only when the normalized year code matches.
  const assignments = validateCurrentYearAssignments(assignmentCandidates, schoolUuid, academicYearId, academicYearCode);
  const assignmentIds: string[] = assignments.map((x: any) => clean(x.id)).filter(Boolean);
  // School Overview's closure source uses every school-scoped ACTIVE
  // assignment, without applying Track Record's selected-year validator to
  // that raw assignment population. Keep that exact source population
  // separately for closure parity; selected-year assignments still govern
  // Track Record group creation and all non-closure historical metrics.
  const schoolOverviewActiveAssignments = assignmentCandidates.filter((assignment: any) =>
    clean(assignment.school_uuid) === schoolUuid && assignment.is_active === true
  );
  const schoolOverviewActiveAssignmentIds = schoolOverviewActiveAssignments
    .map((assignment: any) => clean(assignment.id)).filter(Boolean);
  const schoolOverviewActiveAssignmentIdsByGroup = new Map<string, string[]>();
  schoolOverviewActiveAssignments.forEach((assignment: any) => {
    const key = groupKey(
      clean(assignment.teacher_uuid), clean(assignment.class_name),
      clean(assignment.section_name), clean(assignment.subject_name),
    );
    const ids = schoolOverviewActiveAssignmentIdsByGroup.get(key) ?? [];
    const id = clean(assignment.id);
    if (id && !ids.includes(id)) ids.push(id);
    schoolOverviewActiveAssignmentIdsByGroup.set(key, ids);
  });
  const closureQueryAssignmentIds = Array.from(new Set([
    ...assignmentIds, ...schoolOverviewActiveAssignmentIds,
  ]));
  const teacherIds: string[] = Array.from(new Set<string>(assignments.map((x: any) => clean(x.teacher_uuid)).filter(Boolean)));

  let teacherRows: any[] = [];
  try {
    if (audience === "school") {
      teacherRows = await readAll(supabase.from("teachers_master")
        .select("*")
        .eq("school_uuid", schoolUuid)
        .order("teacher_uuid", { ascending: true }));
    } else {
      teacherRows = await readAll(supabase.from("teachers_master")
        .select("*")
        .eq("school_uuid", schoolUuid)
        .eq("teacher_uuid", teacherUuid)
        .order("teacher_uuid", { ascending: true }));
    }
  } catch (error: any) {
    warnings.push(`Teacher directory lookup unavailable: ${error?.message ?? "query failed"}. Teacher UUIDs are used as display fallbacks; assignment-scoped metrics remain separately calculated.`);
  }
  const teachers: Array<{ uuid: string; name: string }> = audience === "school"
    ? teacherRows.map((x: any) => ({ uuid: clean(x.teacher_uuid), name: clean(x.full_name) || "Teacher" }))
    : [{ uuid: teacherUuid, name: teacherName }];
  const teacherNameById = new Map(teachers.map(x => [x.uuid, x.name]));
  const teacherCreatedAtById = new Map(teacherRows.map((x: any) => [clean(x.teacher_uuid), isoDay(x.created_at || x.inserted_at)]));
  if (!assignmentIds.length) {
    warnings.push(`No classroom assignments match the selected academic year ${academicYearCode}.`);
    return { audience, schoolName, generatedAt: new Date().toISOString(), startDate: academicStart, endDate: academicEnd, groups: [], teachers, classes: [], sections: [], subjects: [], warnings };
  }

  const earliestAvailableAccountOrAssignment = minDate([
    ...assignments.map((x: any) => isoDay(x.created_at)),
    ...teacherRows.map((x: any) => isoDay(x.created_at || x.inserted_at)),
  ], academicStart);
  const startDate = earliestAvailableAccountOrAssignment > academicStart
    ? earliestAvailableAccountOrAssignment
    : academicStart;
  if (teacherIds.some(id => !teacherCreatedAtById.get(id))) {
    warnings.push("One or more teacher account creation timestamps are not exposed; those timelines begin at the earliest available teacher-assignment creation date (bounded by the selected academic-year start date).");
  }
  warnings.push("Total Logs Missed is intentionally unavailable: the source project has no teacher/class timetable or expected teaching-day schedule. Counting weekdays without a log would falsely label non-teaching days as missed.");
  warnings.push("Student-derived metrics use the exact school/year ACTIVE enrollment roster when present. Only when that query succeeds with zero rows for the CURRENT ACTIVE year may the existing Learning Evidence Engine active-profile compatibility path be used for recent 30-day periods; mutable profiles are never projected onto older historical periods.");
  const endDate = academicEnd;

  const logRows = await queryChunks("teacher_daily_logs", assignmentIds, "teacher_assignment_uuid",
    "id,teacher_assignment_uuid,academic_year_id,topic_name,concepts_covered,log_date,created_at",
    { startDate, endDate });
  const logs = logRows.filter((x: any) => {
    const date = isoDay(x.log_date);
    const yearMatches = x.academic_year_id == null || clean(x.academic_year_id) === academicYearId;
    return yearMatches && date && date >= startDate && date <= endDate;
  });
  const logIds = logs.map((x: any) => clean(x.id)).filter(Boolean);

  // Keep this projection aligned with the existing Learning Evidence Engine
  // student_daily_feedback contract. This table is timestamped by submitted_at;
  // created_at and updated_at are not guaranteed columns in the deployed schema.
  // Assignment identity is obtained through teacher_daily_logs.daily_log_uuid,
  // never by inventing a feedback.teacher_assignment_uuid column.
  const feedbackRows = await queryChunks("student_daily_feedback", logIds, "daily_log_uuid",
    "id,daily_log_uuid,student_uuid,school_uuid,teacher_uuid,academic_year_id,understanding_level,concepts_not_understood,submitted_at,subject_name,topic_name,has_doubt,additional_note",
    { schoolUuid });
  const feedback = feedbackRows.filter((row: any) =>
    clean(row.school_uuid) === schoolUuid &&
    (row.academic_year_id == null || clean(row.academic_year_id) === academicYearId)
  );

  let ledgerDoubts: any[] = [];
  // Preserve the exact assignment-scoped pending-doubt rows returned by the
  // source query. School Overview's closure contract scopes these rows by the
  // assignment UUID list and log_date interval; it does not additionally
  // filter row-level school_uuid / academic_year_id metadata. Keep a separate
  // raw cohort for that metric, while retaining the stricter metadata scope
  // below for Track Record's event-history calculations.
  let closureLedgerDoubts: any[] = [];
  let doubtLedgerFailed = false;
  try {
    const fetchedLedgerDoubts = await queryChunks(
      "pending_teacher_doubts", closureQueryAssignmentIds, "teacher_assignment_uuid", "*",
    );
    closureLedgerDoubts = fetchedLedgerDoubts;
    ledgerDoubts = fetchedLedgerDoubts.filter((row: any) =>
      (!clean(row.school_uuid) || clean(row.school_uuid) === schoolUuid) &&
      (row.academic_year_id == null || clean(row.academic_year_id) === academicYearId)
    );
  } catch (error: any) {
    ledgerDoubts = [];
    closureLedgerDoubts = [];
    doubtLedgerFailed = true;
    warnings.push(`Doubt ledger unavailable: ${error?.message ?? "query failed"}. Doubt-derived metrics are shown as unavailable rather than zero.`);
  }

  let liveRows: any[] = [];
  let liveDoubtFailed = false;
  try {
    for (const part of chunk(closureQueryAssignmentIds, 10)) {
      liveRows.push(...await readAllLiveDoubtsForAssignments(part));
    }
    liveRows = liveRows.filter((row: any) =>
      (!clean(row.school_uuid) || clean(row.school_uuid) === schoolUuid) &&
      (row.academic_year_id == null || clean(row.academic_year_id) === academicYearId)
    );
  } catch (error: any) {
    liveRows = [];
    liveDoubtFailed = true;
    warnings.push("Live doubt overlay could not be loaded. Doubt-derived metrics are unavailable rather than presenting a potentially stale Loop-2-only result.");
  }
  // Keep event-history reconciliation separate from the closure cohort.
  // Track Record's closure metric must match School Overview and Teaching
  // Journal: reconcile the raw assignment-scoped Loop-2 ledger with the same
  // Live rows and retain unmatched Live-only rows as unresolved evidence.
  // The existing false-mode reconciliation below remains unchanged for the
  // historical event metrics, preventing Loop-1-only rows from inflating
  // opening/new/resolved/closing event counts.
  const closureEffectiveDoubts = mergePendingDoubtsWithLiveLedger(
    closureLedgerDoubts,
    liveRows,
    { includeUnmatchedLive: true },
  );
  const reconciledDoubts = reconcilePendingDoubtsWithLiveLedger(ledgerDoubts, liveRows, {
    includeUnmatchedLive: false,
  });
  const effectiveDoubts = reconciledDoubts.map(({ merged, pending, live }: any) => {
    const result = { ...merged };
    if (live && live.is_unresolved === false) {
      // last_reconciled_at is a sync timestamp, not a resolution event time.
      if (live.resolved_at) result.resolved_at = live.resolved_at;
      result.revision_checked_at = pending?.revision_checked_at ?? "";
    }
    return result;
  });
  const effectiveFeedback = mergeFeedbackUnderstandingLevels(feedback, liveRows);
  const doubtHistoryIncomplete = effectiveDoubts.some((row: any) =>
    !getCreatedDate(row) || (isDoubtResolved(row) && !getResolvedDate(row))
  );
  if (doubtHistoryIncomplete) {
    warnings.push("One or more doubt records lack a usable creation date or a resolved timestamp. Event-dated opening, closing, new and resolution counts are withheld because their periods cannot be reconstructed safely. The canonical closure rate remains independently calculable from the current resolution state of doubts recorded in each reporting period.");
  }

  let students: any[] = [];
  let studentNameLookupFailed = false;
  try {
    students = await readAll(supabase.from("students_master")
      .select("student_uuid,student_name,class_name,section_name,school_uuid,school_name")
      .eq("school_uuid", schoolUuid)
      .order("student_uuid", { ascending: true }));
  } catch (error: any) {
    studentNameLookupFailed = true;
    warnings.push(`Student display-name lookup unavailable: ${error?.message ?? "query failed"}. The separately validated roster source remains authoritative; generic labels will be used.`);
  }
  // V2: never fall back to school_name for roster authorization or analytics.
  if (!studentNameLookupFailed && students.length === 0) {
    warnings.push("No students were returned for the authenticated school_uuid display-name lookup. Student membership must still be established by the strict year-linked roster or the explicitly gated current-year compatibility path.");
  }
  let enrollmentRows: any[] = [];
  let enrollmentLookupFailed = false;
  try {
    enrollmentRows = await readAll(supabase.from("student_academic_enrollments")
      .select("student_uuid,school_uuid,school_academic_year_id,class_name,section_name,status")
      .eq("school_uuid", schoolUuid)
      .eq("school_academic_year_id", academicYearId)
      .order("student_uuid", { ascending: true }));
  } catch (error: any) {
    enrollmentLookupFailed = true;
    warnings.push(`Academic-year enrollment roster could not be loaded: ${error?.message ?? "query failed"}. No legacy fallback is attempted after a failed enrollment query; student-derived metrics remain unavailable.`);
  }
  const studentNameById = new Map<string, string>(students.map((x: any) => [clean(x.student_uuid), clean(x.student_name) || "Student"] as [string, string]));

  // Match the existing Learning Evidence Engine compatibility contract:
  // use active, school-scoped students_master profiles ONLY when the selected
  // CURRENT ACTIVE academic year has exactly zero year-linked enrollment rows.
  // Never mix a partial/malformed enrollment roster with legacy profiles, and
  // never use mutable profiles to reconstruct a historical academic year.
  const currentActiveAcademicYear =
    academicYearContext.isCurrent === true &&
    clean(academicYearContext.status).toUpperCase() === "ACTIVE";
  const legacyRosterByClassroom = new Map<string, ReadonlySet<string>>();
  let legacyRosterAvailable = false;
  if (!enrollmentLookupFailed && enrollmentRows.length === 0 && currentActiveAcademicYear) {
    try {
      const legacyRows = await readAll(supabase.from("students_master")
        .select("student_uuid,school_uuid,class_name,section_name,account_status")
        .eq("school_uuid", schoolUuid)
        .order("student_uuid", { ascending: true }));
      const seenStudentIds = new Set<string>();
      const mutableRoster = new Map<string, Set<string>>();
      for (const row of legacyRows) {
        if (clean(row.school_uuid) !== schoolUuid) {
          throw new Error("Legacy student profile returned outside the authenticated school scope.");
        }
        const status = clean(row.account_status ?? "active").toLowerCase();
        if (!["active", "enabled"].includes(status)) continue;
        const studentId = clean(row.student_uuid);
        const className = clean(row.class_name);
        const sectionName = clean(row.section_name);
        if (!studentId || !className || !sectionName) continue;
        if (seenStudentIds.has(studentId)) {
          throw new Error("Duplicate student UUID found in the active legacy student profile roster.");
        }
        seenStudentIds.add(studentId);
        const key = classroomRosterKey(className, sectionName);
        const members = mutableRoster.get(key) ?? new Set<string>();
        members.add(studentId);
        mutableRoster.set(key, members);
      }
      if (seenStudentIds.size === 0) {
        throw new Error("No usable active school-scoped legacy student profiles were found.");
      }
      mutableRoster.forEach((members, key) => legacyRosterByClassroom.set(key, members));
      legacyRosterAvailable = true;
      warnings.push("DATA-COMPATIBILITY LIMITATION: zero student_academic_enrollments rows exist for the CURRENT ACTIVE academic year. For recent reporting windows only, roster membership uses active school-scoped students_master profiles, matching the existing Learning Evidence Engine's zero-row compatibility path. These mutable profiles are not a verified historical roster; older periods and year-over-year comparisons remain unavailable until year-linked, effective-dated enrollments are populated.");
    } catch (error: any) {
      warnings.push(`Current-year legacy roster compatibility could not be used: ${error?.message ?? "roster validation failed"}. Student-derived metrics remain unavailable.`);
    }
  } else if (!enrollmentLookupFailed && enrollmentRows.length === 0) {
    warnings.push("No student_academic_enrollments rows were returned for the selected academic year. Legacy students_master fallback is restricted to the CURRENT ACTIVE academic year; historical-year student-derived metrics remain unavailable.");
  } else if (!enrollmentLookupFailed && enrollmentRows.length > 0) {
    warnings.push("The enrollment source has no effective-from/effective-to dates. The exact year-linked ACTIVE roster may be used only for recent reporting windows in the CURRENT ACTIVE academic year; older periods remain unavailable rather than applying today's roster to historical membership.");
  }

  const verifiedRosterByYear = new Map<string, ReadonlyMap<string, ReadonlySet<string>> | null>();
  const getVerifiedYearRoster = (yearIdValue: string) => {
    const yearId = clean(yearIdValue);
    if (!yearId || enrollmentRows.length === 0 || enrollmentLookupFailed) return null;
    if (verifiedRosterByYear.has(yearId)) return verifiedRosterByYear.get(yearId) ?? null;
    try {
      const yearRows = enrollmentRows.filter((row: any) =>
        clean(row.school_uuid) === schoolUuid &&
        clean(row.school_academic_year_id) === yearId
      );
      const roster = buildVerifiedEnrollmentRoster(yearRows, schoolUuid, yearId);
      verifiedRosterByYear.set(yearId, roster);
      return roster;
    } catch (error: any) {
      verifiedRosterByYear.set(yearId, null);
      warnings.push(`Verified enrollment roster unavailable for academic year ${yearId}: ${error?.message ?? "roster validation failed"}. Student-derived metrics are not reported for affected periods.`);
      return null;
    }
  };


  const groupsMap = new Map<string, any>();
  assignments.forEach((a: any) => {
    const teacher = clean(a.teacher_uuid);
    const cls = clean(a.class_name);
    const sec = clean(a.section_name);
    const sub = clean(a.subject_name);
    if (!teacher || !cls || !sec || !sub) return;
    const key = groupKey(teacher, cls, sec, sub);
    if (!groupsMap.has(key)) groupsMap.set(key, {
      id: key, teacherUuid: teacher, teacherName: teacherNameById.get(teacher) ?? teacher,
      className: cls, sectionName: sec, subjectName: sub, assignmentIds: [],
      assignmentCreated: [],
    });
    const group = groupsMap.get(key);
    group.assignmentIds.push(clean(a.id));
    group.assignmentCreated.push(isoDay(a.created_at));
  });

  const now = isoDay(new Date().toISOString());
  // Keep the compatibility snapshot within the same rolling 30-day evidence
  // horizon used by the existing Learning Evidence Engine. A current roster
  // snapshot is allowed only when every log contributing to a period falls
  // inside that rolling window; older evidence is never re-rostered today.
  const recentEvidenceStart = addDays(now, -29);
  // Match the assignment population used by SchoolIntelligenceRepository
  // (.eq("is_active", true)) and TeachingJournalRepository's active-assignment
  // grouping. Historical/inactive assignment rows remain available to the
  // other Track Record history metrics, but must not leak into the live
  // canonical classroom closure cohort.
  const groups: TrackRecordGroup[] = [];
  for (const group of groupsMap.values()) {
    const ids = new Set<string>(group.assignmentIds);
    const teacherCreated = teacherCreatedAtById.get(group.teacherUuid) || "";
    const groupStart = teacherCreated || minDate(group.assignmentCreated, academicStart);
    const groupTimelineStart = groupStart > academicStart ? groupStart : academicStart;
    const groupLogs = logs.filter((x: any) =>
      ids.has(clean(x.teacher_assignment_uuid)) && isoDay(x.log_date) >= groupTimelineStart
    );
    const groupLogIds = new Set(groupLogs.map((x: any) => clean(x.id)));
    const groupFeedback = effectiveFeedback.filter((x: any) => groupLogIds.has(clean(x.daily_log_uuid)));
    const groupDoubts = effectiveDoubts.filter((x: any) =>
      ids.has(clean(x.teacher_assignment_uuid)) && getCreatedDate(x) >= groupTimelineStart
    );
    // School Overview's authoritative classroom closure metric is calculated
    // from the raw pending_teacher_doubts cohort whose log_date falls inside
    // the selected reporting interval. Keep this source separate from the
    // reconciled event-history rows used for opening/closing/resolved counts.
    const activeGroupClosureAssignmentIds = new Set<string>(
      schoolOverviewActiveAssignmentIdsByGroup.get(group.id) ?? []
    );
    const groupClosureAssignmentIds = new Set<string>([
      ...ids, ...activeGroupClosureAssignmentIds,
    ]);
    const groupClosureDoubts = closureEffectiveDoubts.filter((x: any) =>
      groupClosureAssignmentIds.has(clean(x.teacher_assignment_uuid))
    );
    const feedbackByLog = new Map<string, any[]>();
    const logDateById = new Map<string, string>(groupLogs.map((log: any) => [clean(log.id), isoDay(log.log_date)] as [string, string]));
    groupFeedback.forEach((row: any) => {
      const id = clean(row.daily_log_uuid);
      if (!feedbackByLog.has(id)) feedbackByLog.set(id, []);
      feedbackByLog.get(id)!.push(row);
    });

    const periodToday = now < academicEnd ? now : academicEnd;
    const periods = [
      // Pass the actual current India business date to period construction.
      // The calculation end remains capped separately at periodToday below.
      // This lets the builder recognize a current month/week even when today
      // is its final calendar day; such a period is still in progress until
      // the business date rolls over.
      ...buildTrackRecordPeriods(groupTimelineStart, "monthly", now, academicEndExclusive),
      ...buildTrackRecordPeriods(groupTimelineStart, "weekly", now, academicEndExclusive),
    ];
    const cells: TrackRecordCell[] = periods.map(period => {
      if (period.isFuture) return makeCell(period, {}, {});
      const effectiveEnd = getEffectivePeriodEndExclusive(period.endDateExclusive, periodToday);
      const metricPeriod = { ...period, endDateExclusive: effectiveEnd };
      const closurePeriodStart = getSchoolOverviewDoubtClosureStartDate(metricPeriod);
      const buildClosureDetails = (cohort: any[]): TrackRecordDetailRow[] =>
        enumerateCalendarDays(closurePeriodStart, metricPeriod.endDateExclusive).map(day => {
          const dayRows = cohort.filter((d: any) => isoDay(d.log_date) === day);
          const resolvedForDay = dayRows.filter(isDoubtResolved).length;
          return {
            label: day,
            value: `${calculateDoubtClosureRate(dayRows)}%`,
            secondary: `${resolvedForDay} resolved / ${dayRows.length} doubts recorded`,
          };
        });
      const applyCanonicalClosure = (cell: TrackRecordCell, assignmentScope: ReadonlySet<string>) => {
        if (doubtLedgerFailed || assignmentScope.size === 0) return cell;
        const cohort = selectSchoolOverviewDoubtClosureCohort(
          groupClosureDoubts, assignmentScope, closurePeriodStart,
          metricPeriod.endDateExclusive, isoDay,
        );
        const rate = calculateDoubtClosureRate(cohort);
        cell.metrics.closureRate = metric("closureRate", rate, `${rate}%`, "percent");
        cell.details.closureRate = buildClosureDetails(cohort);
        return cell;
      };
      // Resolve the roster and every event's assignment interval independently
      // for this period. A group can contain multiple historical assignment
      // IDs for the same teacher/class/section/subject; group membership alone
      // must not make an ended assignment's later logs/doubts count again.
      const groupAssignments = assignments.filter((assignment: any) => ids.has(clean(assignment.id)));
      const periodAssignmentScopeIncomplete = hasUnverifiableAssignmentInterval(
        groupAssignments,
        metricPeriod.startDate,
        metricPeriod.endDateExclusive,
        isoDay,
      );
      if (periodAssignmentScopeIncomplete) {
        const note = buildAssignmentIntervalWarning(
          group.className, group.sectionName, group.subjectName, period.label,
        );
        warnings.push(note);
        // The event-history interval may be uncertain, but School Overview's
        // canonical closure metric does not depend on that reconstruction.
        // Preserve its independently verifiable active-assignment/log_date
        // cohort while withholding the other period metrics.
        return applyCanonicalClosure(makeUnavailableCell(period, note), activeGroupClosureAssignmentIds);
      }
      const periodAssignments = groupAssignments.filter((assignment: any) => {
        const assignedFrom = isoDay(assignment.created_at);
        const assignedUntil = getAssignmentEffectiveEndDate(assignment, isoDay);
        return (!assignedFrom || assignedFrom < metricPeriod.endDateExclusive) &&
          (!assignedUntil || assignedUntil >= metricPeriod.startDate);
      });
      if (periodAssignments.length === 0) {
        const unavailable = makeUnavailableCell(period,
          "No classroom assignment for this teacher/class/section/subject overlaps this reporting period; activity is not reported as zero.");
        return applyCanonicalClosure(unavailable, activeGroupClosureAssignmentIds);
      }
      const assignmentById = new Map(groupAssignments.map((assignment: any) => [clean(assignment.id), assignment]));
      const periodAssignmentIds = new Set(periodAssignments.map((assignment: any) => clean(assignment.id)));
      const periodLogs = groupLogs.filter((log: any) => {
        const eventDate = isoDay(log.log_date);
        const assignmentId = clean(log.teacher_assignment_uuid);
        const assignment = assignmentById.get(assignmentId);
        return periodAssignmentIds.has(assignmentId) && dateIn(eventDate, metricPeriod) &&
          Boolean(assignment && isAssignmentActiveOnDate(assignment, eventDate, isoDay));
      });
      const periodLogIds = new Set(periodLogs.map((x: any) => clean(x.id)));
      const periodFeedback = groupFeedback.filter((x: any) => periodLogIds.has(clean(x.daily_log_uuid)));
      // Keep valid historical doubts that were opened under an assignment
      // during its effective dates. Such unresolved rows can carry forward
      // into a later overlapping assignment period; new rows created after an
      // assignment ended are excluded.
      const periodDoubts = groupDoubts.filter((doubt: any) => {
        const createdDate = getCreatedDate(doubt);
        const assignment = assignmentById.get(clean(doubt.teacher_assignment_uuid));
        return Boolean(createdDate && createdDate < metricPeriod.endDateExclusive &&
          assignment && isAssignmentActiveOnDate(assignment, createdDate, isoDay));
      });
      // Match School Overview's canonical closure cohort exactly whenever a
      // current active assignment exists. For a historical-only group with no
      // active counterpart in School Overview, retain the period-overlapping
      // assignment IDs so the historical Track Record remains useful.
      const closureAssignmentScope = activeGroupClosureAssignmentIds.size > 0
        ? activeGroupClosureAssignmentIds
        : periodAssignmentIds;
      // Resolution is classified by the canonical current-state classifier,
      // not by requiring the resolution timestamp to fall in the same period.
      // This is intentionally distinct from the event-date "Doubts Resolved
      // in Period" count below.
      const periodClosureDoubts = selectSchoolOverviewDoubtClosureCohort(
        groupClosureDoubts,
        closureAssignmentScope,
        closurePeriodStart,
        metricPeriod.endDateExclusive,
        isoDay,
      );
      const canonicalClosureRate = calculateDoubtClosureRate(periodClosureDoubts);
      const canonicalClosureDetails = buildClosureDetails(periodClosureDoubts);
      const periodAcademicYearIds = [academicYearId];
      const rosterSnapshotAllowedForPeriod =
        currentActiveAcademicYear && periodLogs.length > 0 &&
        periodLogs.every((log: any) => isoDay(log.log_date) >= recentEvidenceStart);
      let rosterIds: string[] = [];
      if (periodAcademicYearIds.length === 1 && rosterSnapshotAllowedForPeriod) {
        const classroomKey = classroomRosterKey(group.className, group.sectionName);
        const yearRoster = getVerifiedYearRoster(periodAcademicYearIds[0]);
        const classRoster = yearRoster?.get(classroomKey);
        const legacyClassRoster = enrollmentRows.length === 0 && legacyRosterAvailable
          ? legacyRosterByClassroom.get(classroomKey)
          : undefined;
        const selectedRoster = classRoster ?? legacyClassRoster;
        rosterIds = selectedRoster ? Array.from(selectedRoster) : [];
        if (!selectedRoster) {
          warnings.push(`No usable school-scoped ACTIVE roster exists for ${group.className} ${group.sectionName} in the selected current academic year ${periodAcademicYearIds[0]}. Student-derived metrics remain unavailable for affected periods.`);
        }
      } else if (!rosterSnapshotAllowedForPeriod) {
        warnings.push(`Student-derived metrics for ${group.className} ${group.sectionName} ${period.label} are withheld because a current ACTIVE roster snapshot is not authoritative for this historical or out-of-window period. Effective-dated enrollment history is required.`);
      }
      const rosterSet = new Set(rosterIds);
      const lectureMetrics = periodLogs.map((log: any) => calculateLearningLectureMetrics({
        studentUuids: rosterIds,
        feedback: feedbackByLog.get(clean(log.id)) ?? [],
        getUnderstandingLevel: (row: any) => row.understanding_level,
      }));
      const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
      const doubtPct = calculateLearningDoubtRate(
        aggregate.partialStudentObservations,
        aggregate.didntUnderstandStudentObservations,
        aggregate.eligibleStudentObservations,
      );
      const newDoubts = periodDoubts.filter((d: any) => dateIn(getCreatedDate(d), metricPeriod));
      const resolvedInPeriod = periodDoubts.filter((d: any) => dateIn(getResolvedDate(d), metricPeriod));
      const activeAt = (boundary: string) => periodDoubts.filter((d: any) => {
        const created = getCreatedDate(d);
        const resolved = getResolvedDate(d);
        return created < boundary && (!resolved || resolved >= boundary);
      });
      const opening = activeAt(period.startDate);
      const closing = activeAt(metricPeriod.endDateExclusive);
      const dailyDetails = (
        getter: (m: any) => number,
        countLabel: (m: any) => string,
      ) => periodLogs.map((log: any) => {
        const m = calculateLearningLectureMetrics({
          studentUuids: rosterIds,
          feedback: feedbackByLog.get(clean(log.id)) ?? [],
        });
        return { label: isoDay(log.log_date), value: `${getter(m)}%`, secondary: countLabel(m) };
      });
      const perStudent = new Map<string, { eligible: number; complete: number }>();
      // Derive every student-period observation through the same canonical
      // lecture calculator used by the portal. This avoids a second copy of
      // the absence, duplicate-feedback and non-response denominator rules.
      periodLogs.forEach((log: any) => {
        const logFeedback = feedbackByLog.get(clean(log.id)) ?? [];
        rosterIds.forEach(sid => {
          const studentLecture = calculateLearningLectureMetrics({
            studentUuids: [sid],
            feedback: logFeedback,
          });
          const current = perStudent.get(sid) ?? { eligible: 0, complete: 0 };
          current.eligible += studentLecture.eligibleStudents;
          current.complete += studentLecture.completeStudents;
          perStudent.set(sid, current);
        });
      });
      const thresholdRows = (test: (value: number) => boolean) => Array.from(perStudent.entries())
        .map(([sid, counts]) => ({ sid, value: getStudentUnderstandingPercentage(counts.complete, counts.eligible) }))
        .filter((x): x is { sid: string; value: number } => x.value !== null && test(x.value))
        .map(x => ({ label: studentNameById.get(x.sid) ?? "Student", value: `${Number(x.value.toFixed(1))}%`, secondary: x.sid }));
      // Apply strict 50%/80% thresholds to unrounded values; display rounding
      // must never change which student is classified into a band.
      const lowRows = thresholdRows(v => v < 50);
      const highRows = thresholdRows(v => v > 80);
      const scopedPeriodFeedback = periodFeedback.filter((row: any) => rosterSet.has(clean(row.student_uuid)));
      const feedbackDetails: TrackRecordDetailRow[] = Array.from(new Set<string>(scopedPeriodFeedback.map((x: any) => clean(x.student_uuid))))
        .map(sid => ({
          label: studentNameById.get(sid) ?? "Student",
          value: Array.from(new Set(scopedPeriodFeedback.filter((x: any) => clean(x.student_uuid) === sid)
            .map((x: any) => isoDay(x.submitted_at) || logDateById.get(clean(x.daily_log_uuid)) || "")
            .filter(Boolean))).sort().join(", "),
          secondary: sid,
        }));
      const uniqueTopics = unique(periodLogs.map((x: any) => x.topic_name));
      const uniqueSubtopics = unique(periodLogs.flatMap((x: any) => Array.isArray(x.concepts_covered) ? x.concepts_covered : []));
      const metricValues: Partial<Record<TrackRecordMetricId, TrackRecordMetric>> = {
        // Canonical closure is a current-state resolved/total rate over doubts
        // whose source log_date belongs to this reporting period, matching
        // School Overview and the Teacher Journal canonical consumer.
        feedback: metric("feedback", aggregate.responseRate, `${aggregate.responseRate}%`, "percent"),
        health: metric("health", aggregate.classHealthPercentage, `${aggregate.classHealthPercentage}%`, "percent"),
        understanding: metric("understanding", aggregate.understandingRate, `${aggregate.understandingRate}%`, "percent"),
        partial: metric("partial", aggregate.partialRate, `${aggregate.partialRate}%`, "percent"),
        didNotUnderstand: metric("didNotUnderstand", aggregate.didntUnderstandRate, `${aggregate.didntUnderstandRate}%`, "percent"),
        doubtRate: metric("doubtRate", doubtPct, `${doubtPct}%`, "percent"),
        closureRate: metric("closureRate", canonicalClosureRate, `${canonicalClosureRate}%`, "percent"),
        below50: { ...metric("below50", lowRows.length, `${lowRows.length} / ${rosterIds.length} (${pct(lowRows.length, rosterIds.length)}%)`, "countPercent"), trendValue: exactPct(lowRows.length, rosterIds.length) },
        above80: { ...metric("above80", highRows.length, `${highRows.length} / ${rosterIds.length} (${pct(highRows.length, rosterIds.length)}%)`, "countPercent"), trendValue: exactPct(highRows.length, rosterIds.length) },
        openingDoubts: metric("openingDoubts", opening.length),
        closingDoubts: metric("closingDoubts", closing.length),
        newDoubts: metric("newDoubts", newDoubts.length),
        resolvedDoubts: metric("resolvedDoubts", resolvedInPeriod.length),
        topics: metric("topics", uniqueTopics.length),
        subtopics: metric("subtopics", uniqueSubtopics.length),
        logsSubmitted: metric("logsSubmitted", periodLogs.length),
      };
      const details: Partial<Record<TrackRecordMetricId, TrackRecordDetailRow[]>> = {
        feedback: feedbackDetails,
        health: dailyDetails(
          m => m.healthPercentage,
          m => `${m.completeStudents} complete + ${m.partialStudents} partial / ${m.eligibleStudents} eligible`,
        ),
        understanding: dailyDetails(
          m => m.understandingRate,
          m => `${m.completeStudents}/${m.eligibleStudents} completely understood`,
        ),
        partial: dailyDetails(
          m => m.partialRate,
          m => `${m.partialStudents}/${m.eligibleStudents} partially understood`,
        ),
        didNotUnderstand: dailyDetails(
          m => m.didntUnderstandRate,
          m => `${m.didntUnderstandStudents}/${m.eligibleStudents} didn't understand`,
        ),
        doubtRate: periodLogs.map((log: any) => {
          const m = calculateLearningLectureMetrics({ studentUuids: rosterIds, feedback: feedbackByLog.get(clean(log.id)) ?? [] });
          return { label: isoDay(log.log_date), value: `${calculateLearningDoubtRate(m.partialStudents, m.didntUnderstandStudents, m.eligibleStudents)}%`, secondary: `${m.partialStudents + m.didntUnderstandStudents}/${m.eligibleStudents} eligible doubt-indicating responses` };
        }),
        closureRate: canonicalClosureDetails,
        below50: lowRows,
        above80: highRows,
        openingDoubts: opening.map((d: any) => ({ label: clean(d.student_name) || studentNameById.get(clean(d.student_uuid)) || "Student", value: clean(d.previous_difficult_concept || d.previous_topic_name) || "Doubt", secondary: getCreatedDate(d) })),
        closingDoubts: closing.map((d: any) => ({ label: clean(d.student_name) || studentNameById.get(clean(d.student_uuid)) || "Student", value: clean(d.previous_difficult_concept || d.previous_topic_name) || "Doubt", secondary: getCreatedDate(d) })),
        newDoubts: newDoubts.map((d: any) => ({ label: clean(d.student_name) || studentNameById.get(clean(d.student_uuid)) || "Student", value: clean(d.previous_difficult_concept || d.previous_topic_name) || "Doubt", secondary: getCreatedDate(d) })),
        resolvedDoubts: resolvedInPeriod.map((d: any) => ({ label: clean(d.student_name) || studentNameById.get(clean(d.student_uuid)) || "Student", value: clean(d.previous_difficult_concept || d.previous_topic_name) || "Doubt", secondary: getResolvedDate(d) })),
        topics: uniqueTopics.map(x => ({ label: x })),
        subtopics: uniqueSubtopics.map(x => ({ label: x })),
        logsSubmitted: periodLogs.map((x: any) => ({ label: isoDay(x.log_date), value: clean(x.topic_name) })),
      };
      // The existing Learning Evidence Engine uses the exact ACTIVE
      // year-linked roster, or its explicitly documented zero-row legacy
      // compatibility path, for a rolling 30-day current-year evidence window.
      // Track Record follows that same bounded rule. Outside that window, a
      // current snapshot cannot reconstruct historical transfers/withdrawals.
      const rosterDependentMetricIds: TrackRecordMetricId[] = [
        "feedback", "health", "understanding", "partial", "didNotUnderstand",
        "doubtRate", "below50", "above80",
      ];
      if (!rosterSnapshotAllowedForPeriod) {
        rosterDependentMetricIds.forEach(key => {
          metricValues[key] = {
            ...blankMetric(key), value: null, display: "—", unit: "unavailable",
            note: "Historical student membership cannot be reconstructed from a current roster snapshot. This metric is withheld outside the recent current-year evidence window until effective-dated enrollment history is available.",
          };
          details[key] = [];
        });
      }
      if (rosterIds.length === 0) {
        ["feedback", "health", "understanding", "partial", "didNotUnderstand", "doubtRate", "below50", "above80"].forEach(id => {
          const key = id as TrackRecordMetricId;
          metricValues[key] = {
            ...blankMetric(key),
            value: null,
            display: "—",
            unit: "unavailable",
            note: "No authenticated school_uuid-scoped student roster was available; this metric is not reported as zero.",
          };
          details[key] = [];
        });
      }
      if (periodLogs.length === 0) {
        ["feedback", "health", "understanding", "partial", "didNotUnderstand", "doubtRate", "below50", "above80"].forEach(id => {
          const key = id as TrackRecordMetricId;
          metricValues[key] = {
            ...blankMetric(key), value: null, display: "—", unit: "unavailable",
            note: "No teaching logs exist in this reporting period; learning performance is not measured as zero.",
          };
          details[key] = [];
        });
      }
      if (liveDoubtFailed) {
        // Loop-1 live reconciliation can carry the latest understanding level.
        // Without it, do not present Loop-2-only learning figures as canonical.
        ["feedback", "health", "understanding", "partial", "didNotUnderstand", "doubtRate", "below50", "above80"].forEach(id => {
          const key = id as TrackRecordMetricId;
          metricValues[key] = {
            ...blankMetric(key), value: null, display: "—", unit: "unavailable",
            note: "Live doubt/feedback reconciliation could not be loaded; canonical learning metrics are withheld rather than showing a stale Loop-2-only result.",
          };
          details[key] = [];
        });
      }
      if (doubtLedgerFailed) {
        // Canonical closure needs the period's pending-doubt cohort. If that
        // source failed, do not manufacture an empty/zero result.
        ["closureRate", "openingDoubts", "closingDoubts", "newDoubts", "resolvedDoubts"].forEach(id => {
          const key = id as TrackRecordMetricId;
          metricValues[key] = {
            ...blankMetric(key), value: null, display: "—", unit: "unavailable",
            note: "The period-scoped pending-doubt source is unavailable; doubt metrics are not reported as zero.",
          };
          details[key] = [];
        });
      } else if (liveDoubtFailed || doubtHistoryIncomplete) {
        // The canonical period-cohort closure rate uses current resolution
        // classification on raw pending rows, just like School Overview. It
        // does not depend on live overlay availability or resolution dates.
        // Event-dated counts remain fail-closed when those dependencies fail.
        ["openingDoubts", "closingDoubts", "newDoubts", "resolvedDoubts"].forEach(id => {
          const key = id as TrackRecordMetricId;
          metricValues[key] = {
            ...blankMetric(key), value: null, display: "—", unit: "unavailable",
            note: "Live doubt reconciliation or authoritative event dates are unavailable; this event-period count is not reported as zero.",
          };
          details[key] = [];
        });
      }
      return makeCell(period, metricValues, details);
    });
    groups.push({ ...group, cells });
  }

  const allGroups = groups;
  return {
    audience, schoolName, generatedAt: new Date().toISOString(), startDate: academicStart, endDate: academicEnd,
    groups: allGroups,
    teachers,
    classes: Array.from(new Set(groups.map(g => g.className))).sort().map(v => ({ value: v, label: `Class ${v}` })),
    sections: Array.from(new Set(groups.map(g => g.sectionName))).sort().map(v => ({ value: v, label: v })),
    subjects: Array.from(new Set(groups.map(g => g.subjectName))).sort().map(v => ({ value: v, label: v })),
    warnings: Array.from(new Set(warnings)),
  };
}

export { METRICS };
