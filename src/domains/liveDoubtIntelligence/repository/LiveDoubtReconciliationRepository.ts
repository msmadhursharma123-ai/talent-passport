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
  class_name?: string | null;
  section_name?: string | null;
  subject_name: string;
  topic_name?: string | null;
  doubt_concept: string;
  normalized_concept: string;
  original_understanding_level?: string | null;
  source_submitted_at?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  is_unresolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  last_reconciled_at?: string | null;
  updated_at?: string | null;
}

export interface LiveDoubtSubject {
  subjectName: string;
  unresolvedDoubts: LiveDoubtRow[];
  unresolvedCount: number;
}

export interface LiveDoubtPrompt {
  subjects: LiveDoubtSubject[];
  totalUnresolvedDoubts: number;
  shouldShow: boolean;
  alreadySubmittedToday: boolean;
  liveCalculatedThrough: string | null;
  checkDate: string;
}

export interface LiveDoubtSelection {
  subjectName: string;
  unresolvedConcepts: string[];
  presentedDoubtIds: string[];
}

const TABLE = "student_live_unresolved_doubts";
const CHECK_TABLE = "student_live_doubt_reconciliation_checks";
const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function localDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function normalizeLiveDoubtText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).map(v => v.trim()).filter(Boolean);
    } catch {}
  }
  return [];
}

export async function syncStudentLiveDoubtLedger(studentUuid?: string) {
  const identity = requireIdentity();
  const resolvedStudentUuid = studentUuid ?? identity.studentUuid;
  if (!resolvedStudentUuid || resolvedStudentUuid !== identity.studentUuid) {
    throw new Error("Student identity mismatch while syncing live doubt intelligence.");
  }

  const { error } = await client().rpc("sync_student_live_doubt_ledger", {
    p_student_uuid: resolvedStudentUuid,
  });
  if (error) throw error;
  return getStudentLiveDoubtRows(resolvedStudentUuid);
}

export async function getStudentLiveDoubtRows(studentUuid?: string): Promise<LiveDoubtRow[]> {
  const identity = requireIdentity();
  const resolvedStudentUuid = studentUuid ?? identity.studentUuid;
  if (!resolvedStudentUuid || resolvedStudentUuid !== identity.studentUuid) throw new Error("Student identity mismatch.");
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("student_uuid", resolvedStudentUuid)
    .order("subject_name", { ascending: true })
    .order("doubt_concept", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentLiveDoubtPrompt(studentUuid?: string): Promise<LiveDoubtPrompt> {
  const identity = requireIdentity();
  const resolvedStudentUuid = studentUuid ?? identity.studentUuid;
  const rows = await syncStudentLiveDoubtLedger(resolvedStudentUuid);
  const today = localDate();
  const { data: check } = await client()
    .from(CHECK_TABLE)
    .select("id,submitted_at,check_date")
    .eq("student_uuid", resolvedStudentUuid)
    .eq("check_date", today)
    .maybeSingle();

  const grouped = new Map<string, LiveDoubtRow[]>();
  rows.filter(row => row.is_unresolved).forEach(row => {
    const subject = String(row.subject_name ?? "").trim();
    if (!subject) return;
    grouped.set(subject, [...(grouped.get(subject) ?? []), row]);
  });

  const subjects: LiveDoubtSubject[] = Array.from(grouped.entries())
    .map(([subjectName, unresolvedDoubts]) => ({ subjectName, unresolvedDoubts, unresolvedCount: unresolvedDoubts.length }))
    .filter(item => item.unresolvedCount >= 5)
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const latest = rows
    .map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    subjects,
    totalUnresolvedDoubts: subjects.reduce((sum, item) => sum + item.unresolvedCount, 0),
    shouldShow: subjects.length > 0 && !check,
    alreadySubmittedToday: Boolean(check),
    liveCalculatedThrough: latest,
    checkDate: today,
  };
}

export async function submitStudentLiveDoubtReconciliation(selections: LiveDoubtSelection[], checkDate = localDate()) {
  const identity = requireIdentity();
  if (!identity.studentUuid) throw new Error("Student identity missing.");

  const payload = selections.map(selection => ({
    subjectName: selection.subjectName,
    unresolvedConcepts: selection.unresolvedConcepts.map(normalizeLiveDoubtText),
    presentedDoubtIds: selection.presentedDoubtIds,
  }));

  const { data, error } = await client().rpc("submit_student_live_doubt_reconciliation", {
    p_student_uuid: identity.studentUuid,
    p_check_date: checkDate,
    p_selections: payload,
  });

  if (error) throw error;
  return data ?? { success: true, checkDate };
}

export async function getLiveDoubtRowsForSchool(schoolUuid: string, startDate?: string, endDate?: string): Promise<LiveDoubtRow[]> {
  const query = client().from(TABLE).select("*").eq("school_uuid", schoolUuid);
  if (startDate) query.gte("source_submitted_at", `${startDate}T00:00:00`);
  if (endDate) query.lt("source_submitted_at", `${endDate}T00:00:00`);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLiveDoubtRowsForAssignments(assignmentIds: string[], startDate?: string, endDate?: string): Promise<LiveDoubtRow[]> {
  if (assignmentIds.length === 0) return [];
  const query = client().from(TABLE).select("*").in("teacher_assignment_uuid", assignmentIds);
  if (startDate) query.gte("source_submitted_at", `${startDate}T00:00:00`);
  if (endDate) query.lt("source_submitted_at", `${endDate}T00:00:00`);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function effectiveUnderstandingFromLiveFeedback(feedback: any, liveRows: LiveDoubtRow[]) {
  const original = feedback?.understanding_level;
  if (original !== PARTIAL && original !== NONE) return original;

  const concepts = asArray(feedback?.concepts_not_understood);
  if (concepts.length === 0) return original;

  const relevant = concepts.map(normalizeLiveDoubtText).filter(Boolean);
  const unresolved = liveRows.some(row =>
    row.is_unresolved &&
    String(row.student_uuid) === String(feedback.student_uuid) &&
    String(row.subject_name ?? "").trim().toLowerCase() === String(feedback.subject_name ?? "").trim().toLowerCase() &&
    relevant.includes(row.normalized_concept)
  );

  return unresolved ? original : COMPLETE;
}

export function isPendingDoubtLiveResolved(doubt: any, liveRows: LiveDoubtRow[]) {
  const student = String(doubt.student_uuid ?? "");
  const subject = String(doubt.subject_name ?? "").trim().toLowerCase();
  const concept = normalizeLiveDoubtText(doubt.previous_difficult_concept);
  const topic = normalizeLiveDoubtText(doubt.previous_topic_name);

  const matches = liveRows.filter(row =>
    String(row.student_uuid) === student &&
    String(row.subject_name ?? "").trim().toLowerCase() === subject &&
    (
      (concept && row.normalized_concept === concept) ||
      (topic && normalizeLiveDoubtText(row.topic_name) === topic)
    )
  );

  if (matches.length === 0) return null;
  return matches.every(row => !row.is_unresolved);
}
