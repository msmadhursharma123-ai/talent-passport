import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";

export interface LiveDoubtRow {
  id: string;
  student_uuid: string;
  school_uuid?: string | null;
  student_name?: string | null;
  teacher_uuid?: string | null;
  teacher_assignment_uuid?: string | null;
  daily_log_uuid?: string | null;
  source_feedback_id?: string | null;
  latest_source_feedback_id?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  subject_name: string;
  topic_name?: string | null;
  doubt_concept: string;
  normalized_concept: string;
  original_understanding_level?: string | null;
  source_submitted_at?: string | null;
  latest_source_submitted_at?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  is_unresolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  last_reconciled_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  academic_year_id?: string | null;
}

export interface LiveReconciliationSubject {
  subjectName: string;
  doubts: LiveDoubtRow[];
}

export interface LiveReconciliationResult {
  eligibleSubjects: LiveReconciliationSubject[];
  available: boolean;
}

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function isMissingLiveInfrastructure(error: any) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return (
    message.includes("student_live_unresolved_doubts") ||
    message.includes("student_live_doubt_reconciliation_checks") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeId(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function normalizeLiveConcept(value: unknown) {
  return normalize(value);
}

export async function syncStudentLiveDoubtLedger(strict = false): Promise<boolean> {
  try {
    const identity = requireIdentity();
    const { error } = await client().rpc(
      "sync_student_live_doubt_ledger",
      { p_student_uuid: identity.studentUuid }
    );

    if (error) {
      if (isMissingLiveInfrastructure(error)) {
        if (strict) throw error;
        return false;
      }
      throw error;
    }

    return true;
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) {
      if (strict) throw error;
      return false;
    }
    throw error;
  }
}

export async function getStudentLiveDoubtRows(strict = false): Promise<LiveDoubtRow[]> {
  try {
    const identity = requireIdentity();
    const { data, error } = await client().rpc(
      "get_student_live_doubt_rows",
      { p_student_uuid: identity.studentUuid }
    );

    if (error) {
      if (isMissingLiveInfrastructure(error)) {
        if (strict) throw error;
        return [];
      }
      throw error;
    }

    return (data ?? []) as LiveDoubtRow[];
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) {
        if (strict) throw error;
        return [];
      }
    throw error;
  }
}

const LIVE_READ_PAGE_SIZE = 500;

async function readAllLiveDoubtsPaged(
  buildQuery: (afterId?: string) => any,
  getExactCount: () => Promise<number>
): Promise<LiveDoubtRow[]> {
  const expectedCount = await getExactCount();
  const rows: LiveDoubtRow[] = [];
  let afterId: string | undefined;

  while (true) {
    const query = buildQuery(afterId);
    const { data, error } = await query;
    if (error) throw error;

    const page = (data ?? []) as LiveDoubtRow[];
    rows.push(...page);

    if (page.length < LIVE_READ_PAGE_SIZE) break;

    const lastId = page[page.length - 1]?.id;
    if (!lastId) {
      throw new Error("Live doubt pagination could not advance because the page ended without a row id.");
    }
    afterId = String(lastId);
  }

  if (rows.length !== expectedCount) {
    throw new Error(`Live doubt pagination was incomplete (${rows.length} of ${expectedCount} rows).`);
  }

  return rows;
}

export async function getLiveDoubtsForTeacherAssignments(
  assignmentIds: string[],
  strict = false
): Promise<LiveDoubtRow[]> {
  const ids = Array.from(
    new Set((assignmentIds ?? []).filter(Boolean).map(String))
  );

  if (ids.length === 0) return [];

  try {
    const supabase = client();
    return await readAllLiveDoubtsPaged(
      (afterId) => {
        let query = supabase
          .from("student_live_unresolved_doubts")
          .select("*")
          .in("teacher_assignment_uuid", ids)
          .order("id", { ascending: true })
          .limit(LIVE_READ_PAGE_SIZE);
        if (afterId) query = query.gt("id", afterId);
        return query;
      },
      async () => {
        const { count, error } = await supabase
          .from("student_live_unresolved_doubts")
          .select("id", { count: "exact", head: true })
          .in("teacher_assignment_uuid", ids);
        if (error) throw error;
        if (typeof count !== "number") {
          throw new Error("Live doubt count could not be verified; canonical learning metrics are unavailable.");
        }
        return count;
      }
    );
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) {
      if (strict) throw error;
      return [];
    }
    throw error;
  }
}

function liveExamPreparationDateKey(row: LiveDoubtRow): string {
  // Preserve the existing Exam Preparation historical-day precedence used by
  // the Student repository. Resolution/reconciliation timestamps must not move
  // an old doubt into a different day.
  const raw =
    row.first_seen_at ??
    row.source_submitted_at ??
    row.latest_source_submitted_at ??
    (row as any).created_at ??
    "";

  if (!raw) return "";

  const rawText = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawText)) return rawText;

  const parsed = new Date(rawText);
  if (Number.isNaN(parsed.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  return `${parts.find((part) => part.type === "year")?.value ?? ""}-${
    parts.find((part) => part.type === "month")?.value ?? ""
  }-${parts.find((part) => part.type === "day")?.value ?? ""}`;
}

/**
 * Exam Preparation-only Live read scope.
 *
 * This is deliberately read-only and deliberately does not use
 * last_reconciled_at as an eligibility gate. The existing merge function
 * remains responsible for reconciliation/matching and continues to preserve
 * its existing includeUnmatchedLive behavior.
 */
export function filterLiveRowsForExamPreparation(
  rows: LiveDoubtRow[],
  options: {
    startDate?: string;
    endDateInclusive?: string;
    endDateExclusive?: string;
    subjectName?: string;
  } = {}
): LiveDoubtRow[] {
  const subject = normalize(options.subjectName);
  const hasSubjectFilter = Boolean(
    subject && subject !== "all subjects" && subject !== "all_subjects"
  );

  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (hasSubjectFilter && exactSubject(row) !== subject) return false;

    const dateKey = liveExamPreparationDateKey(row);
    if (
      !dateKey &&
      (options.startDate || options.endDateInclusive || options.endDateExclusive)
    ) {
      return false;
    }

    if (options.startDate && dateKey < options.startDate) return false;
    if (options.endDateInclusive && dateKey > options.endDateInclusive) return false;
    if (options.endDateExclusive && dateKey >= options.endDateExclusive) return false;

    return true;
  });
}

export async function getExamPreparationLiveRowsForTeacherAssignments(
  assignmentIds: string[],
  startDate?: string,
  endDateInclusive?: string
): Promise<LiveDoubtRow[]> {
  const rows = await getLiveDoubtsForTeacherAssignments(assignmentIds);
  return filterLiveRowsForExamPreparation(rows, {
    startDate,
    endDateInclusive,
  }).filter(
    (row) => row.is_unresolved === true || Boolean(row.last_reconciled_at)
  );
}

export async function getExamPreparationLiveRowsForStudent(
  startDate?: string,
  endDateExclusive?: string,
  subjectName?: string
): Promise<LiveDoubtRow[]> {
  const rows = await getStudentLiveDoubtRows();
  return filterLiveRowsForExamPreparation(rows, {
    startDate,
    endDateExclusive,
    subjectName,
  });
}

export async function getLiveDoubtsForSchool(
  schoolUuid: string,
  strict = false
): Promise<LiveDoubtRow[]> {
  if (!schoolUuid) return [];

  try {
    const supabase = client();
    return await readAllLiveDoubtsPaged(
      (afterId) => {
        let query = supabase
          .from("student_live_unresolved_doubts")
          .select("*")
          .eq("school_uuid", schoolUuid)
          .order("id", { ascending: true })
          .limit(LIVE_READ_PAGE_SIZE);
        if (afterId) query = query.gt("id", afterId);
        return query;
      },
      async () => {
        const { count, error } = await supabase
          .from("student_live_unresolved_doubts")
          .select("id", { count: "exact", head: true })
          .eq("school_uuid", schoolUuid);
        if (error) throw error;
        if (typeof count !== "number") {
          throw new Error("Live doubt count could not be verified; canonical learning metrics are unavailable.");
        }
        return count;
      }
    );
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) {
      if (strict) throw error;
      return [];
    }
    throw error;
  }
}

/**
 * Shared current-state analytics read scope.
 *
 * This deliberately uses the original/source doubt date and does not gate
 * eligibility on last_reconciled_at. A currently-unresolved Live row is
 * valid current intelligence even when that timestamp is NULL; resolved rows
 * remain available when they are needed to reconcile the corresponding
 * historical Loop-2/feedback evidence.
 */
export function filterLiveRowsForCurrentState(
  rows: LiveDoubtRow[],
  options: {
    startDate?: string;
    endDateInclusive?: string;
    endDateExclusive?: string;
    subjectName?: string;
  } = {}
): LiveDoubtRow[] {
  return filterLiveRowsForExamPreparation(rows, options);
}

export async function getSchoolIntelligenceLiveRows(
  schoolUuid: string,
  startDate?: string,
  endDateInclusive?: string
): Promise<LiveDoubtRow[]> {
  const rows = await getLiveDoubtsForSchool(schoolUuid);

  return filterLiveRowsForCurrentState(rows, {
    startDate,
    endDateInclusive,
  });
}

/**
 * Current-state reporting read for period-scoped analytics.
 *
 * IMPORTANT: do not date-filter these rows before reconciliation. A Live row
 * represents the current state of a conceptual doubt whose source occurrence
 * may belong to an earlier reporting period. Filtering it by first_seen/source
 * date before matching can make the same Loop-2 occurrence appear unresolved
 * in one period and resolved in another consumer.
 *
 * Period scoping is applied only to unmatched Live-only rows by the
 * period-aware merge helper below. Matched historical Loop-2 rows may use a
 * Live row whose source date is outside the reporting period.
 */
async function readCurrentStateLiveRows(
  buildQuery: (afterId?: string) => any,
  getExactCount: () => Promise<number>,
): Promise<LiveDoubtRow[]> {
  try {
    return await readAllLiveDoubtsPaged(buildQuery, getExactCount);
  } catch (error) {
    // Preserve the existing Live repository fail-soft contract used by
    // current-state School/Teacher intelligence reads: a missing Live
    // infrastructure must not turn an otherwise usable portal read into a
    // hard failure. Other database errors remain fatal.
    if (isMissingLiveInfrastructure(error)) return [];
    throw error;
  }
}

export async function getSchoolIntelligenceCurrentStateLiveRows(
  schoolUuid: string,
): Promise<LiveDoubtRow[]> {
  if (!schoolUuid) return [];

  const { data: assignments, error: assignmentError } = await client()
    .from("teacher_classroom_assignments")
    .select("id")
    .eq("school_uuid", schoolUuid)
    .eq("is_active", true);

  if (assignmentError) throw assignmentError;

  const assignmentIds = Array.from(
    new Set((assignments ?? []).map((row: any) => String(row.id ?? "")).filter(Boolean))
  );

  if (assignmentIds.length === 0) return [];

  // Keep the same active-assignment school boundary used by School Intelligence
  // itself. This prevents historical/inactive assignment Live rows from being
  // introduced merely because the new current-state read is intentionally not
  // date-filtered.
  const rows: LiveDoubtRow[] = [];
  const chunkSize = 100;
  for (let i = 0; i < assignmentIds.length; i += chunkSize) {
    const chunk = assignmentIds.slice(i, i + chunkSize);
    rows.push(
      ...(await readCurrentStateLiveRows(
        (afterId) => {
          let query = client()
            .from("student_live_unresolved_doubts")
            .select("*")
            .eq("school_uuid", schoolUuid)
            .in("teacher_assignment_uuid", chunk)
            .order("id", { ascending: true })
            .limit(LIVE_READ_PAGE_SIZE);
          if (afterId) query = query.gt("id", afterId);
          return query;
        },
        async () => {
          const { count, error } = await client()
            .from("student_live_unresolved_doubts")
            .select("id", { count: "exact", head: true })
            .eq("school_uuid", schoolUuid)
            .in("teacher_assignment_uuid", chunk);
          if (error) throw error;
          if (typeof count !== "number") {
            throw new Error("Live doubt count could not be verified; current-state analytics are unavailable.");
          }
          return count;
        },
      ))
    );
  }

  return rows;
}

export async function getTeacherCurrentStateLiveRows(
  assignmentIds: string[],
): Promise<LiveDoubtRow[]> {
  const ids = Array.from(
    new Set((assignmentIds ?? []).filter(Boolean).map(String))
  );

  if (ids.length === 0) return [];

  return readCurrentStateLiveRows(
    (afterId) => {
      let query = client()
        .from("student_live_unresolved_doubts")
        .select("*")
        .in("teacher_assignment_uuid", ids)
        .order("id", { ascending: true })
        .limit(LIVE_READ_PAGE_SIZE);
      if (afterId) query = query.gt("id", afterId);
      return query;
    },
    async () => {
      const { count, error } = await client()
        .from("student_live_unresolved_doubts")
        .select("id", { count: "exact", head: true })
        .in("teacher_assignment_uuid", ids);
      if (error) throw error;
      if (typeof count !== "number") {
        throw new Error("Live doubt count could not be verified; current-state analytics are unavailable.");
      }
      return count;
    },
  );
}

/**
 * Reconcile a reporting-period Loop-2 cohort against the complete current
 * Live state, while preventing Live-only rows from outside the reporting
 * period from inflating the period.
 *
 * This is the narrow consistency contract for School Overview, Morning Brief
 * and Teaching Journal. It deliberately does not alter the canonical
 * reconciliation algorithm; it only fixes the read scope around it.
 */
export function mergePendingDoubtsWithLiveLedgerForReportingPeriod(
  pendingDoubts: any[],
  liveRows: LiveDoubtRow[],
  options: {
    startDate?: string;
    endDateInclusive?: string;
    endDateExclusive?: string;
  } = {},
) {
  const reconciled = reconcilePendingDoubtsWithLiveLedger(
    pendingDoubts,
    liveRows,
    { includeUnmatchedLive: true },
  );

  const allowedUnmatchedIds = new Set(
    filterLiveRowsForCurrentState(liveRows, {
      startDate: options.startDate,
      endDateInclusive: options.endDateInclusive,
      endDateExclusive: options.endDateExclusive,
    }).map((row) => String(row.id ?? "")).filter(Boolean),
  );

  return reconciled
    .filter((item) => {
      if (!item.pending && item.live) {
        return allowedUnmatchedIds.has(String(item.live.id ?? ""));
      }
      return true;
    })
    .map((item) => item.merged);
}


function parseTimestamp(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const text = String(value).trim();
  if (!text) return null;

  const time = Date.parse(text);
  return Number.isFinite(time) ? time : null;
}

function timestampValue(value: unknown) {
  return parseTimestamp(value) ?? 0;
}

function latestSourceTime(row: LiveDoubtRow) {
  const values = [
    row.latest_source_submitted_at,
    row.source_submitted_at,
    row.last_seen_at,
    row.updated_at,
  ];

  for (const value of values) {
    const time = parseTimestamp(value);
    if (time !== null) return time;
  }

  return 0;
}

function exactAssignment(row: any) {
  return String(row?.teacher_assignment_uuid ?? "").trim();
}

function normalizeAssignment(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function exactDailyLog(row: any) {
  return String(row?.daily_log_uuid ?? "").trim();
}

function exactStudent(row: any) {
  return String(row?.student_uuid ?? "").trim();
}

function exactSubject(row: any) {
  return normalize(row?.subject_name);
}

function exactConcept(row: any) {
  return normalize(
    row?.doubt_concept ??
      row?.previous_difficult_concept ??
      row?.previous_topic_name
  );
}

function sourceFeedbackKey(value: unknown) {
  const id = normalizeId(value);
  return id ? `feedback:${id}` : null;
}

function dailyLogConceptKey(row: any) {
  const student = exactStudent(row);
  const assignment = exactAssignment(row);
  const log = exactDailyLog(row);
  const subject = exactSubject(row);
  const concept = exactConcept(row);

  if (!student || !assignment || !log || !subject || !concept) {
    return null;
  }

  return [student, assignment, log, subject, concept].join("|");
}

function identityKey(row: any) {
  const student = exactStudent(row);
  const assignment = exactAssignment(row);
  const subject = exactSubject(row);
  const concept = exactConcept(row);

  if (!student || !assignment || !subject || !concept) {
    return null;
  }

  return [student, assignment, subject, concept].join("|");
}

function pendingDate(row: any) {
  const value =
    row?.log_date ??
    row?.created_at ??
    row?.revision_checked_at ??
    "";

  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : 0;
}

/**
 * Match hierarchy for a Loop-2 doubt -> live first-loop state.
 *
 * 1. Exact source_feedback_id.
 * 2. Exact student + assignment + daily_log + subject + concept.
 * 3. Exact student + assignment + subject + concept.
 *
 * There is deliberately NO subject-only, student-only, or fuzzy-concept
 * match. A live selection must never resolve another teacher's doubt.
 */
function chooseLiveForPending(
  pending: any,
  candidates: LiveDoubtRow[]
): LiveDoubtRow | null {
  if (!candidates.length) return null;

  const pendingFeedback = sourceFeedbackKey(
    pending?.source_feedback_id
  );

  if (pendingFeedback) {
    const exact = candidates.find(
      (row) =>
        sourceFeedbackKey(row.source_feedback_id) === pendingFeedback ||
        sourceFeedbackKey(row.latest_source_feedback_id) === pendingFeedback
    );

    if (exact) return exact;
  }

  const logKey = dailyLogConceptKey(pending);

  if (logKey) {
    const exact = candidates.find(
      (row) => dailyLogConceptKey(row) === logKey
    );

    if (exact) return exact;
  }

  const identity = identityKey(pending);

  if (!identity) return null;

  const sameIdentity = candidates.filter(
    (row) => identityKey(row) === identity
  );

  if (sameIdentity.length === 0) return null;
  if (sameIdentity.length === 1) return sameIdentity[0];

  const target = pendingDate(pending);

  return [...sameIdentity].sort(
    (a, b) =>
      Math.abs(latestSourceTime(a) - target) -
      Math.abs(latestSourceTime(b) - target)
  )[0];
}

/**
 * Canonical overlay.
 *
 * `includeUnmatchedLive` is intentional:
 *   false = teacher reward / closure calculations. Only real Loop-2 doubts
 *           are counted; live-only first-loop rows cannot inflate the
 *           denominator.
 *   true  = student/school exam-preparation views. Live-only first-loop
 *           unresolved doubts are retained as intelligence rows.
 *
 * In BOTH modes, a live row that matches a pending row is consumed exactly
 * once. Nothing is counted twice.
 */
export interface LiveDoubtReconciliationMatch {
  pending: any;
  live: LiveDoubtRow | null;
  merged: any;
}

export function reconcilePendingDoubtsWithLiveLedger(
  pendingDoubts: any[],
  liveRows: LiveDoubtRow[],
  options?: {
    includeUnmatchedLive?: boolean;
    preserveHistoricalOccurrences?: boolean;
  }
): LiveDoubtReconciliationMatch[] {
  const pending = Array.isArray(pendingDoubts) ? pendingDoubts : [];
  const live = Array.isArray(liveRows) ? liveRows : [];
  const includeUnmatchedLive =
    options?.includeUnmatchedLive !== false;
  const preserveHistoricalOccurrences =
    options?.preserveHistoricalOccurrences === true;

  const byFeedback = new Map<string, LiveDoubtRow[]>();
  const byDailyLogConcept = new Map<string, LiveDoubtRow[]>();
  const byIdentity = new Map<string, LiveDoubtRow[]>();

  for (const row of live) {
    const feedbackIds = [
      row.source_feedback_id,
      row.latest_source_feedback_id,
    ]
      .map(sourceFeedbackKey)
      .filter(Boolean) as string[];

    for (const key of feedbackIds) {
      const list = byFeedback.get(key) ?? [];
      list.push(row);
      byFeedback.set(key, list);
    }

    const logKey = dailyLogConceptKey(row);
    if (logKey) {
      const list = byDailyLogConcept.get(logKey) ?? [];
      list.push(row);
      byDailyLogConcept.set(logKey, list);
    }

    const key = identityKey(row);
    if (key) {
      const list = byIdentity.get(key) ?? [];
      list.push(row);
      byIdentity.set(key, list);
    }
  }

  const mergeWithLiveState = (
    row: any,
    liveMatch: LiveDoubtRow,
    collapseHistoricalOccurrence = false,
  ) => ({
    ...row,
    student_name:
      row.student_name ?? liveMatch.student_name ?? "Student",
    previous_topic_name:
      row.previous_topic_name ??
      liveMatch.topic_name ??
      liveMatch.doubt_concept,
    previous_difficult_concept:
      row.previous_difficult_concept ??
      liveMatch.doubt_concept,
    status:
      collapseHistoricalOccurrence
        ? "RESOLVED"
        : liveMatch.is_unresolved
          ? "NOT DISCUSSED"
          : "RESOLVED",
    doubt_resolved:
      collapseHistoricalOccurrence
        ? true
        : !liveMatch.is_unresolved,
    // Current Live state is authoritative for the representative occurrence.
    // Historical occurrences sharing the same current-state identity are
    // collapsed out of current analytics so one Live doubt cannot inflate
    // unresolved counts multiple times.
    student_response:
      collapseHistoricalOccurrence
        ? "DISCUSSED"
        : liveMatch.is_unresolved
          ? null
          : "DISCUSSED",
    revision_checked_at:
      liveMatch.last_reconciled_at ??
      row.revision_checked_at,
  });

  /**
   * V44/V45 historical reconciliation mode.
   *
   * This intentionally preserves the previous one-Live-row/one-pending-row
   * consumption semantics for Track Record event-history calculations.
   * Current-state consumers use the identity-aware mode below.
   */
  if (preserveHistoricalOccurrences) {
    const consumedLiveIds = new Set<string>();
    const reconciled: LiveDoubtReconciliationMatch[] = [];

    for (const row of pending) {
      const candidateLists: LiveDoubtRow[][] = [];

      const feedbackKey = sourceFeedbackKey(row?.source_feedback_id);
      if (feedbackKey) {
        candidateLists.push(byFeedback.get(feedbackKey) ?? []);
      }

      const logKey = dailyLogConceptKey(row);
      if (logKey) {
        candidateLists.push(byDailyLogConcept.get(logKey) ?? []);
      }

      const identity = identityKey(row);
      if (identity) {
        candidateLists.push(byIdentity.get(identity) ?? []);
      }

      const candidates = Array.from(
        new Map(
          candidateLists
            .flat()
            .filter((item) => item?.id)
            .map((item) => [String(item.id), item])
        ).values()
      ).filter((item) => !consumedLiveIds.has(String(item.id)));

      const liveMatch = chooseLiveForPending(row, candidates);

      if (liveMatch) {
        consumedLiveIds.add(String(liveMatch.id));
      }

      const merged = liveMatch
        ? mergeWithLiveState(row, liveMatch)
        : row;

      reconciled.push({
        pending: row,
        live: liveMatch,
        merged,
      });
    }

    if (!includeUnmatchedLive) {
      return reconciled;
    }

    for (const row of live) {
      const id = String(row.id ?? "");
      if (!id || consumedLiveIds.has(id)) continue;

      reconciled.push({
        pending: null,
        live: row,
        merged: {
          id: `live-${id}`,
          _live_only: true,
          student_uuid: row.student_uuid,
          student_name: row.student_name ?? "Student",
          teacher_uuid: row.teacher_uuid,
          teacher_assignment_uuid: row.teacher_assignment_uuid,
          daily_log_uuid: row.daily_log_uuid,
          status: row.is_unresolved ? "NOT DISCUSSED" : "RESOLVED",
          student_response: row.is_unresolved ? null : "DISCUSSED",
          school_name: null,
          class_name: row.class_name,
          section_name: row.section_name,
          subject_name: row.subject_name,
          previous_topic_name: row.topic_name ?? row.doubt_concept,
          previous_difficult_concept: row.doubt_concept,
          log_date:
            row.first_seen_at?.slice(0, 10) ??
            row.source_submitted_at?.slice(0, 10) ??
            row.latest_source_submitted_at?.slice(0, 10) ??
            null,
          doubt_resolved: !row.is_unresolved,
          revision_checked_at: row.last_reconciled_at,
          created_at: row.first_seen_at,
        },
      });
    }

    return reconciled;
  }

  /**
   * Current-state reconciliation.
   *
   * A current Live identity represents the current state of a conceptual
   * doubt, not an independent state for every historical Loop-2 occurrence.
   * Repeated Loop-2 rows therefore form one identity group. The authoritative
   * Live row is selected before any row is marked as consumed, so an older
   * historical occurrence cannot steal the Live row from the occurrence that
   * exactly matches its current daily log/source.
   *
   * When a current Live row exists:
   *   - the representative (latest/exactly-linked) occurrence receives the
   *     Live state;
   *   - older occurrences are retained as evidence but collapsed as resolved
   *     in the current-state projection;
   *   - one current unresolved Live identity therefore contributes at most
   *     one unresolved row.
   *
   * Rows with no Live identity match preserve their existing Loop-2 state.
   */
  const groupedPending = new Map<string, any[]>();
  const unkeyedPending: any[] = [];

  for (const row of pending) {
    const key = identityKey(row);
    if (!key) {
      unkeyedPending.push(row);
      continue;
    }
    const list = groupedPending.get(key) ?? [];
    list.push(row);
    groupedPending.set(key, list);
  }

  const authoritativeLiveByIdentity = new Map<string, LiveDoubtRow>();
  const representativePendingRows = new Set<any>();
  const consumedLiveIds = new Set<string>();

  const compareLatest = (a: any, b: any) =>
    pendingDate(b) - pendingDate(a) ||
    String(b?.id ?? "").localeCompare(String(a?.id ?? ""));

  for (const [identity, rows] of groupedPending.entries()) {
    const identityLiveRows = byIdentity.get(identity) ?? [];
    if (identityLiveRows.length === 0) continue;

    const unique = (rowsToDedupe: LiveDoubtRow[]) =>
      Array.from(
        new Map(
          rowsToDedupe
            .filter((row) => row?.id)
            .map((row) => [String(row.id), row])
        ).values()
      );

    const sortLiveLatest = (a: LiveDoubtRow, b: LiveDoubtRow) =>
      latestSourceTime(b) - latestSourceTime(a) ||
      timestampValue(b?.last_reconciled_at) -
        timestampValue(a?.last_reconciled_at) ||
      timestampValue(b?.updated_at) - timestampValue(a?.updated_at) ||
      String(b?.id ?? "").localeCompare(String(a?.id ?? ""));

    const identityCandidates = unique(identityLiveRows).sort(sortLiveLatest);

    // The authoritative current Live state must be selected from the complete
    // physical identity set. Exact source-feedback/daily-log linkage is used
    // only to choose which historical Loop-2 occurrence receives that state;
    // it must never allow an older duplicate Live row to override a newer
    // current Live row. This is especially important when physical duplicates
    // disagree (for example, old unresolved + newer resolved).
    const authoritativeLive = identityCandidates[0];

    if (!authoritativeLive) continue;

    authoritativeLiveByIdentity.set(identity, authoritativeLive);

    // Any physical Live duplicates for the same current identity are
    // represented by the one authoritative current row. Do not append the
    // others as independent Live-only intelligence rows.
    for (const duplicate of identityLiveRows) {
      if (duplicate?.id) consumedLiveIds.add(String(duplicate.id));
    }

    const authoritativeFeedbackIds = new Set(
      [
        authoritativeLive.source_feedback_id,
        authoritativeLive.latest_source_feedback_id,
      ]
        .map(sourceFeedbackKey)
        .filter(Boolean) as string[]
    );

    const exactFeedbackRows = rows.filter((pendingRow) => {
      const key = sourceFeedbackKey(pendingRow?.source_feedback_id);
      return Boolean(key && authoritativeFeedbackIds.has(key));
    });

    const exactDailyLogRows = rows.filter(
      (pendingRow) =>
        dailyLogConceptKey(pendingRow) ===
        dailyLogConceptKey(authoritativeLive)
    );

    const representative =
      exactFeedbackRows.sort(compareLatest)[0] ??
      exactDailyLogRows.sort(compareLatest)[0] ??
      [...rows].sort(compareLatest)[0];

    if (representative) {
      representativePendingRows.add(representative);
    }
  }

  // Live-only identities can also contain duplicate physical rows. They have
  // no pending occurrence through which the identity-aware selection above
  // could consume them, so select one deterministic current row here and
  // suppress the remaining physical duplicates from current analytics.
  // Historical Track Record mode does not enter this branch.
  if (includeUnmatchedLive) {
    for (const [identity, identityLiveRows] of byIdentity.entries()) {
      if (authoritativeLiveByIdentity.has(identity)) continue;
      if (identityLiveRows.length === 0) continue;

      const authoritative = [...identityLiveRows].sort(
        (a, b) =>
          latestSourceTime(b) - latestSourceTime(a) ||
          timestampValue(b?.last_reconciled_at) -
            timestampValue(a?.last_reconciled_at) ||
          timestampValue(b?.updated_at) - timestampValue(a?.updated_at) ||
          String(b?.id ?? "").localeCompare(String(a?.id ?? ""))
      )[0];

      authoritativeLiveByIdentity.set(identity, authoritative);
      for (const duplicate of identityLiveRows) {
        if (!duplicate?.id) continue;
        const duplicateId = String(duplicate.id);
        // If a pending occurrence already consumed this identity, every
        // physical Live row is intentionally suppressed from the unmatched
        // Live-only pass. For a genuinely Live-only identity, keep the
        // authoritative row available to be emitted once.
        if (groupedPending.has(identity) || duplicateId !== String(authoritative.id)) {
          consumedLiveIds.add(duplicateId);
        }
      }
    }
  }

  const reconciled: LiveDoubtReconciliationMatch[] = [];

  // Project every pending row in its original input order. Keyed rows use the
  // identity-aware current-state path; unkeyed rows use the exact-match
  // fallback at the same position. This preserves observable ordering even
  // when malformed/unkeyed rows are interleaved with normal keyed rows.
  for (const row of pending) {
    const identity = identityKey(row);

    if (!identity) {
      const candidates = live.filter(
        (candidate) => !consumedLiveIds.has(String(candidate?.id ?? ""))
      );
      const liveMatch = chooseLiveForPending(row, candidates);

      if (liveMatch) {
        consumedLiveIds.add(String(liveMatch.id));
      }

      reconciled.push({
        pending: row,
        live: liveMatch,
        merged: liveMatch
          ? mergeWithLiveState(row, liveMatch)
          : row,
      });
      continue;
    }

    const authoritativeLive =
      authoritativeLiveByIdentity.get(identity) ?? null;

    if (authoritativeLive) {
      const representative = representativePendingRows.has(row);

      reconciled.push({
        pending: row,
        live: representative ? authoritativeLive : null,
        merged: mergeWithLiveState(
          row,
          authoritativeLive,
          !representative
        ),
      });
      continue;
    }

    // No current Live identity exists. Preserve the Loop-2 occurrence exactly
    // as stored; this is important for fail-safe historical evidence.
    reconciled.push({
      pending: row,
      live: null,
      merged: row,
    });
  }

  if (!includeUnmatchedLive) {
    return reconciled;
  }

  for (const row of live) {
    const id = String(row.id ?? "");
    if (!id || consumedLiveIds.has(id)) continue;

    reconciled.push({
      pending: null,
      live: row,
      merged: {
        id: `live-${id}`,
        _live_only: true,
        student_uuid: row.student_uuid,
        student_name: row.student_name ?? "Student",
        teacher_uuid: row.teacher_uuid,
        teacher_assignment_uuid: row.teacher_assignment_uuid,
        daily_log_uuid: row.daily_log_uuid,
        status: row.is_unresolved ? "NOT DISCUSSED" : "RESOLVED",
        student_response: row.is_unresolved ? null : "DISCUSSED",
        school_name: null,
        class_name: row.class_name,
        section_name: row.section_name,
        subject_name: row.subject_name,
        previous_topic_name:
          row.topic_name ?? row.doubt_concept,
        previous_difficult_concept: row.doubt_concept,
        log_date:
          row.first_seen_at?.slice(0, 10) ??
          row.source_submitted_at?.slice(0, 10) ??
          row.latest_source_submitted_at?.slice(0, 10) ??
          null,
        doubt_resolved: !row.is_unresolved,
        revision_checked_at: row.last_reconciled_at,
        created_at: row.first_seen_at,
      },
    });
  }

  return reconciled;
}

export function mergePendingDoubtsWithLiveLedger(
  pendingDoubts: any[],
  liveRows: LiveDoubtRow[],
  options?: { includeUnmatchedLive?: boolean }
) {
  return reconcilePendingDoubtsWithLiveLedger(
    pendingDoubts,
    liveRows,
    options
  ).map((item) => item.merged);
}

/**
 * Updates comprehension using exact first-loop linkage.
 *
 * It first uses source_feedback_id. The fallback is exact daily-log + student
 * + subject + concept. It never falls back to student + subject + concept
 * alone, because that could cross teacher assignments.
 */
export function mergeFeedbackUnderstandingLevels(
  feedbackRows: any[],
  liveRows: LiveDoubtRow[]
) {
  if (!liveRows.length) return feedbackRows ?? [];

  const byFeedbackConcept = new Map<string, LiveDoubtRow[]>();
  const byDailyLogConcept = new Map<string, LiveDoubtRow[]>();

  const addToMap = (
    map: Map<string, LiveDoubtRow[]>,
    key: string | null,
    row: LiveDoubtRow,
  ) => {
    if (!key) return;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  };

  for (const row of liveRows) {
    const concept = exactConcept(row);
    if (!concept) continue;

    const ids = [
      row.source_feedback_id,
      row.latest_source_feedback_id,
    ].filter(Boolean) as string[];

    for (const id of ids) {
      addToMap(
        byFeedbackConcept,
        [String(id), concept].join("|"),
        row,
      );
    }

    addToMap(byDailyLogConcept, dailyLogConceptKey(row), row);
  }

  const sortLiveLatest = (a: LiveDoubtRow, b: LiveDoubtRow) =>
    latestSourceTime(b) - latestSourceTime(a) ||
    timestampValue(b?.last_reconciled_at) -
      timestampValue(a?.last_reconciled_at) ||
    timestampValue(b?.updated_at) - timestampValue(a?.updated_at) ||
    String(b?.id ?? "").localeCompare(String(a?.id ?? ""));

  const authoritativeForConcept = (candidates: LiveDoubtRow[]) =>
    [...candidates].sort(sortLiveLatest)[0] ?? null;

  return (feedbackRows ?? []).map((feedback: any) => {
    const concepts = Array.isArray(feedback.concepts_not_understood)
      ? feedback.concepts_not_understood.filter(Boolean)
      : [];

    if (!concepts.length) return feedback;

    const feedbackId = normalizeId(feedback.id);
    const student = exactStudent(feedback);
    const assignment = exactAssignment(feedback);
    const log = exactDailyLog(feedback);
    const subject = exactSubject(feedback);

    const resolvedConcepts = new Set<string>();
    const activeConcepts = new Set<string>();
    let matchedAnyConcept = false;

    for (const concept of concepts) {
      const normalizedConcept = normalize(concept);
      if (!normalizedConcept) continue;

      let candidates: LiveDoubtRow[] = [];

      // Concept-level source-feedback matching. A source-feedback match for
      // one concept must never suppress fallback matching for another concept
      // in the same feedback row.
      if (feedbackId) {
        candidates = (
          byFeedbackConcept.get([String(feedbackId), normalizedConcept].join("|")) ??
          []
        ).filter(
          (row) =>
            (!student || exactStudent(row) === student) &&
            (!subject || exactSubject(row) === subject) &&
            (!assignment || exactAssignment(row) === assignment) &&
            (!log || exactDailyLog(row) === log)
        );
      }

      // Exact daily-log + student + assignment + subject + concept fallback.
      // Assignment is mandatory here so this path can never cross teachers.
      if (!candidates.length && student && assignment && log && subject) {
        const key = [
          student,
          assignment,
          log,
          subject,
          normalizedConcept,
        ].join("|");
        candidates = byDailyLogConcept.get(key) ?? [];
      }

      // Legacy feedback rows may not contain teacher_assignment_uuid. The
      // exact daily_log_uuid remains the safe boundary in that case. Never
      // use student + subject + concept alone.
      if (!candidates.length && student && log && subject && !assignment) {
        candidates = liveRows.filter(
          (row) =>
            exactStudent(row) === student &&
            exactDailyLog(row) === log &&
            exactSubject(row) === subject &&
            exactConcept(row) === normalizedConcept
        );
      }

      const authoritative = authoritativeForConcept(candidates);
      if (!authoritative) continue;

      matchedAnyConcept = true;
      if (authoritative.is_unresolved) {
        activeConcepts.add(normalizedConcept);
      } else {
        resolvedConcepts.add(normalizedConcept);
      }
    }

    if (!matchedAnyConcept) return feedback;

    const remainingConcepts = concepts.filter(
      (concept: string) => {
        const normalizedConcept = normalize(concept);
        return !resolvedConcepts.has(normalizedConcept);
      }
    );

    const allFeedbackConceptsResolved =
      concepts.length > 0 &&
      remainingConcepts.length === 0 &&
      activeConcepts.size === 0;

    if (allFeedbackConceptsResolved) {
      return {
        ...feedback,
        concepts_not_understood: [],
        understanding_level: "I completely understood.",
        has_doubt: false,
        _live_reconciled: true,
      };
    }

    return {
      ...feedback,
      concepts_not_understood: remainingConcepts,
      has_doubt: remainingConcepts.length > 0,
      _live_reconciled: true,
    };
  });
}

export async function getStudentLiveReconciliationState(): Promise<LiveReconciliationResult> {
  try {
    await syncStudentLiveDoubtLedger();

    const identity = requireIdentity();
    const checkDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // The reconciliation popup is a once-per-India-calendar-day check.
    // The previous implementation used last_reconciled_at/source timestamps
    // to decide eligibility. That prevented the same still-unresolved doubts
    // from appearing again on the next day. The authoritative daily check
    // history now controls the once-per-day behavior instead.
    const { data: todaysCheck, error: todaysCheckError } = await client()
      .from("student_live_doubt_reconciliation_checks")
      .select("id")
      .eq("student_uuid", identity.studentUuid)
      .eq("check_date", checkDate)
      .limit(1);

    if (todaysCheckError) {
      if (isMissingLiveInfrastructure(todaysCheckError)) {
        return { eligibleSubjects: [], available: false };
      }
      throw todaysCheckError;
    }

    // If today's reconciliation has already been submitted, suppress the
    // popup for the rest of today. A new India calendar day starts a fresh
    // eligibility cycle.
    if ((todaysCheck ?? []).length > 0) {
      return {
        eligibleSubjects: [],
        available: true,
      };
    }

    const rows = await getStudentLiveDoubtRows();
    const bySubject = new Map<string, LiveDoubtRow[]>();

    for (const row of rows) {
      if (!row.is_unresolved) continue;

      const subject = String(row.subject_name ?? "").trim();
      if (!subject) continue;

      const list = bySubject.get(subject) ?? [];
      list.push(row);
      bySubject.set(subject, list);
    }

    const eligibleSubjects: LiveReconciliationSubject[] = [];

    for (const [subjectName, doubts] of bySubject.entries()) {
      const sorted = [...doubts].sort(
        (a, b) =>
          latestSourceTime(a) - latestSourceTime(b) ||
          String(a.doubt_concept).localeCompare(
            String(b.doubt_concept)
          )
      );

      // Five or more active unresolved first-loop doubts in the subject makes
      // that subject eligible for today's mandatory reconciliation. Do not
      // require a newer source signal here: daily check history above is the
      // mechanism that makes the same unresolved doubts eligible again tomorrow.
      if (sorted.length < 5) continue;

      eligibleSubjects.push({
        subjectName,
        doubts: sorted,
      });
    }

    return {
      eligibleSubjects,
      available: true,
    };
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) {
      return { eligibleSubjects: [], available: false };
    }
    throw error;
  }
}

export async function submitStudentLiveReconciliation(
  subjects: Array<{
    subjectName: string;
    presentedDoubtIds: string[];
    resolvedConcepts: string[];
  }>
) {
  const identity = requireIdentity();
  const checkDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const { data, error } = await client().rpc(
    "submit_student_live_doubt_reconciliation",
    {
      p_student_uuid: identity.studentUuid,
      p_check_date: checkDate,
      p_selections: subjects,
    }
  );

  if (error) throw error;
  return data;
}


// -----------------------------------------------------------------------------
// Compatibility exports kept intentionally stable for existing teacher and
// analytics repositories. The canonical implementation above remains the
// source of truth.
// -----------------------------------------------------------------------------
export async function getLiveDoubtRowsForAssignments(
  assignmentIds: string[],
  startDate?: string,
  endDateExclusive?: string
): Promise<LiveDoubtRow[]> {
  const rows = await getLiveDoubtsForTeacherAssignments(assignmentIds);
  if (!startDate && !endDateExclusive) return rows;

  const calendarDateKey = (value: string) => {
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) return "";
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
  };

  return rows.filter((row) => {
    const raw =
      row.first_seen_at ??
      row.source_submitted_at ??
      row.latest_source_submitted_at ??
      row.last_seen_at ??
      row.updated_at;
    if (!raw) return false;
    const dateKey = calendarDateKey(String(raw));
    if (!dateKey) return false;
    if (startDate && dateKey < startDate) return false;
    if (endDateExclusive && dateKey >= endDateExclusive) return false;
    return true;
  });
}

export function isPendingDoubtLiveResolved(
  pending: any,
  liveRows: LiveDoubtRow[]
): boolean | null {
  const candidates = (liveRows ?? []).filter((row) => {
    const pendingStudent = normalizeId(pending?.student_uuid);
    const pendingAssignment = normalizeAssignment(
      pending?.teacher_assignment_uuid
    );
    if (!pendingStudent || !pendingAssignment) return false;

    return (
      normalizeId(row.student_uuid) === pendingStudent &&
      normalizeAssignment(row.teacher_assignment_uuid) === pendingAssignment
    );
  });

  const match = chooseLiveForPending(pending, candidates);
  return match ? !match.is_unresolved : null;
}