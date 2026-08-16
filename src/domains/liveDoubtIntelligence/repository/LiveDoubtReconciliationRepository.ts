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
  const ids = Array.from(new Set((assignmentIds ?? []).filter(Boolean).map(String)));
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
      0
  ).getTime();
}

function liveKey(
  row: {
    student_uuid?: string | null;
    teacher_assignment_uuid?: string | null;
    subject_name?: string | null;
    doubt_concept?: string | null;
  }
) {
  return [
    String(row.student_uuid ?? ""),
    String(row.teacher_assignment_uuid ?? ""),
    normalize(row.doubt_concept),
  ].join("|");
}

function pendingKey(row: any) {
  return liveKey({
    student_uuid: row.student_uuid,
    teacher_assignment_uuid: row.teacher_assignment_uuid,
    subject_name: row.subject_name,
    doubt_concept:
      row.previous_difficult_concept ??
      row.previous_topic_name,
  });
}

export function mergePendingDoubtsWithLiveLedger(
  pendingDoubts: any[],
  liveRows: LiveDoubtRow[]
) {
  const liveByKey = new Map<string, LiveDoubtRow>();
  for (const row of liveRows) {
    const key = liveKey(row);
    const previous = liveByKey.get(key);
    if (!previous || latestSourceTime(row) >= latestSourceTime(previous)) {
      liveByKey.set(key, row);
    }
  }

  const matched = new Set<string>();

  const merged = (pendingDoubts ?? []).map((row: any) => {
    const live = liveByKey.get(pendingKey(row));
    if (!live) return row;

    matched.add(live.id);

    return {
      ...row,
      student_name: row.student_name ?? live.student_name ?? "Student",
      previous_topic_name:
        row.previous_topic_name ??
        live.topic_name ??
        live.doubt_concept,
      previous_difficult_concept:
        row.previous_difficult_concept ??
        live.doubt_concept,
      status: live.is_unresolved ? "NOT DISCUSSED" : "RESOLVED",
      doubt_resolved: !live.is_unresolved,
      student_response: live.is_unresolved
        ? row.student_response
        : "DISCUSSED",
      revision_checked_at:
        live.last_reconciled_at ??
        row.revision_checked_at,
    };
  });

  // Add live rows that do not already exist in the original second-loop
  // ledger. Resolved rows are kept as synthetic historical evidence so
  // school/teacher closure metrics remain correct; exam-preparation views
  // filter them back out because they are no longer unresolved.
  for (const live of liveRows) {
    if (matched.has(live.id)) continue;

    merged.push({
      id: `live-${live.id}`,
      student_uuid: live.student_uuid,
      student_name: live.student_name ?? "Student",
      teacher_uuid: live.teacher_uuid,
      teacher_assignment_uuid: live.teacher_assignment_uuid,
      daily_log_uuid: live.daily_log_uuid,
      status: live.is_unresolved ? "NOT DISCUSSED" : "RESOLVED",
      student_response: live.is_unresolved ? null : "DISCUSSED",
      school_name: null,
      class_name: live.class_name,
      section_name: live.section_name,
      subject_name: live.subject_name,
      previous_topic_name:
        live.topic_name ?? live.doubt_concept,
      previous_difficult_concept: live.doubt_concept,
      log_date: live.latest_source_submitted_at?.slice(0, 10) ?? null,
      doubt_resolved: !live.is_unresolved,
      revision_checked_at: live.last_reconciled_at,
      created_at: live.first_seen_at,
    });
  }

  return merged;
}

export function mergeFeedbackUnderstandingLevels(
  feedbackRows: any[],
  liveRows: LiveDoubtRow[]
) {
  if (!liveRows.length) return feedbackRows ?? [];

  const byFeedback = new Map<string, LiveDoubtRow[]>();
  const byStudentSubjectConcept = new Map<string, LiveDoubtRow[]>();

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

    const key = [
      row.student_uuid,
      normalize(row.subject_name),
      normalize(row.doubt_concept),
    ].join("|");
    const list = byStudentSubjectConcept.get(key) ?? [];
    list.push(row);
    byStudentSubjectConcept.set(key, list);
  }

  return (feedbackRows ?? []).map((feedback: any) => {
    const concepts = Array.isArray(feedback.concepts_not_understood)
      ? feedback.concepts_not_understood.filter(Boolean)
      : [];

    let related =
      byFeedback.get(String(feedback.id ?? "")) ?? [];

    if (related.length === 0) {
      related = concepts.flatMap((concept: string) =>
        byStudentSubjectConcept.get(
          [
            feedback.student_uuid,
            normalize(feedback.subject_name),
            normalize(concept),
          ].join("|")
        ) ?? []
      );
    }

    if (related.length === 0) return feedback;

    const resolvedConcepts = new Set(
      related
        .filter((row) => !row.is_unresolved)
        .map((row) => row.normalized_concept)
    );

    const activeConcepts = related.filter(
      (row) => row.is_unresolved
    );

    const remainingConcepts = concepts.filter(
      (concept: string) =>
        !resolvedConcepts.has(normalize(concept))
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

      if (sorted.length < 5) continue;

      const needsReconciliation = sorted.some((row) => {
        if (!row.last_reconciled_at) return true;
        return latestSourceTime(row) > new Date(row.last_reconciled_at).getTime();
      });

      if (!needsReconciliation) continue;

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
