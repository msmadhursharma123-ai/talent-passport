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

export async function syncStudentLiveDoubtLedger(): Promise<boolean> {
  try {
    const identity = requireIdentity();
    const { error } = await client().rpc(
      "sync_student_live_doubt_ledger",
      { p_student_uuid: identity.studentUuid }
    );

    if (error) {
      if (isMissingLiveInfrastructure(error)) return false;
      throw error;
    }

    return true;
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) return false;
    throw error;
  }
}

export async function getStudentLiveDoubtRows(): Promise<LiveDoubtRow[]> {
  try {
    const identity = requireIdentity();
    const { data, error } = await client().rpc(
      "get_student_live_doubt_rows",
      { p_student_uuid: identity.studentUuid }
    );

    if (error) {
      if (isMissingLiveInfrastructure(error)) return [];
      throw error;
    }

    return (data ?? []) as LiveDoubtRow[];
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) return [];
    throw error;
  }
}

export async function getLiveDoubtsForTeacherAssignments(
  assignmentIds: string[]
): Promise<LiveDoubtRow[]> {
  const ids = Array.from(
    new Set((assignmentIds ?? []).filter(Boolean).map(String))
  );

  if (ids.length === 0) return [];

  try {
    const { data, error } = await client()
      .from("student_live_unresolved_doubts")
      .select("*")
      .in("teacher_assignment_uuid", ids);

    if (error) {
      if (isMissingLiveInfrastructure(error)) return [];
      throw error;
    }

    return (data ?? []) as LiveDoubtRow[];
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) return [];
    throw error;
  }
}

export async function getLiveDoubtsForSchool(
  schoolUuid: string
): Promise<LiveDoubtRow[]> {
  if (!schoolUuid) return [];

  try {
    const { data, error } = await client()
      .from("student_live_unresolved_doubts")
      .select("*")
      .eq("school_uuid", schoolUuid);

    if (error) {
      if (isMissingLiveInfrastructure(error)) return [];
      throw error;
    }

    return (data ?? []) as LiveDoubtRow[];
  } catch (error) {
    if (isMissingLiveInfrastructure(error)) return [];
    throw error;
  }
}

function latestSourceTime(row: LiveDoubtRow) {
  return new Date(
    row.latest_source_submitted_at ??
      row.source_submitted_at ??
      row.last_seen_at ??
      row.updated_at ??
      0
  ).getTime();
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
export function mergePendingDoubtsWithLiveLedger(
  pendingDoubts: any[],
  liveRows: LiveDoubtRow[],
  options?: { includeUnmatchedLive?: boolean }
) {
  const pending = Array.isArray(pendingDoubts) ? pendingDoubts : [];
  const live = Array.isArray(liveRows) ? liveRows : [];
  const includeUnmatchedLive =
    options?.includeUnmatchedLive !== false;

  if (!live.length) return pending;

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

  const consumedLiveIds = new Set<string>();

  const merged = pending.map((row: any) => {
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
    if (!liveMatch) return row;

    consumedLiveIds.add(String(liveMatch.id));

    return {
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
      status: liveMatch.is_unresolved ? "NOT DISCUSSED" : "RESOLVED",
      doubt_resolved: !liveMatch.is_unresolved,
      student_response: liveMatch.is_unresolved
        ? row.student_response
        : "DISCUSSED",
      revision_checked_at:
        liveMatch.last_reconciled_at ??
        row.revision_checked_at,
    };
  });

  if (!includeUnmatchedLive) {
    return merged;
  }

  for (const row of live) {
    const id = String(row.id ?? "");
    if (!id || consumedLiveIds.has(id)) continue;

    merged.push({
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
        row.source_submitted_at?.slice(0, 10) ??
        row.latest_source_submitted_at?.slice(0, 10) ??
        null,
      doubt_resolved: !row.is_unresolved,
      revision_checked_at: row.last_reconciled_at,
      created_at: row.first_seen_at,
    });
  }

  return merged;
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

  const byFeedback = new Map<string, LiveDoubtRow[]>();
  const byDailyLogConcept = new Map<string, LiveDoubtRow[]>();

  for (const row of liveRows) {
    const ids = [
      row.source_feedback_id,
      row.latest_source_feedback_id,
    ].filter(Boolean) as string[];

    for (const id of ids) {
      const list = byFeedback.get(String(id)) ?? [];
      list.push(row);
      byFeedback.set(String(id), list);
    }

    const key = dailyLogConceptKey(row);
    if (key) {
      const list = byDailyLogConcept.get(key) ?? [];
      list.push(row);
      byDailyLogConcept.set(key, list);
    }
  }

  return (feedbackRows ?? []).map((feedback: any) => {
    const concepts = Array.isArray(feedback.concepts_not_understood)
      ? feedback.concepts_not_understood.filter(Boolean)
      : [];

    let related = byFeedback.get(String(feedback.id ?? "")) ?? [];

    if (related.length === 0 && feedback.daily_log_uuid) {
      related = concepts.flatMap((concept: string) => {
        const key = dailyLogConceptKey({
          student_uuid: feedback.student_uuid,
          teacher_assignment_uuid: feedback.teacher_assignment_uuid,
          daily_log_uuid: feedback.daily_log_uuid,
          doubt_concept: concept,
        });
        return key ? byDailyLogConcept.get(key) ?? [] : [];
      });
    }

    // Legacy feedback rows may not contain teacher_assignment_uuid. In that
    // case the exact daily_log_uuid is still a safe boundary because the live
    // row was created from that same teacher_daily_logs record. Never fall back
    // to student + subject + concept alone.
    if (related.length === 0 && feedback.daily_log_uuid) {
      const log = String(feedback.daily_log_uuid);
      const student = String(feedback.student_uuid ?? "");
      const subject = normalize(feedback.subject_name);
      const conceptSet = new Set(concepts.map((concept: string) => normalize(concept)));

      related = liveRows.filter(
        (row) =>
          String(row.student_uuid ?? "") === student &&
          String(row.daily_log_uuid ?? "") === log &&
          normalize(row.subject_name) === subject &&
          conceptSet.has(normalize(row.doubt_concept))
      );
    }

    if (related.length === 0) return feedback;

    const resolvedConcepts = new Set(
      related
        .filter((row) => !row.is_unresolved)
        .map((row) => row.normalized_concept)
    );

    const activeConcepts = related.filter((row) => row.is_unresolved);

    const remainingConcepts = concepts.filter(
      (concept: string) => !resolvedConcepts.has(normalize(concept))
    );

    const allFeedbackConceptsResolved =
      concepts.length > 0 &&
      remainingConcepts.length === 0 &&
      activeConcepts.length === 0;

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