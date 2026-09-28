import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import { getCanonicalExamPreparationRows } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import { getStudentLiveDoubtRows, syncStudentLiveDoubtLedger } from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import { currentReviewMonth, indiaDate } from "../utils/MonthlyReviewDate";
import { monthlyLearningIdentityKey as buildMonthlyLearningIdentityKey } from "../utils/MonthlyLearningIdentity";
import { getStudentMonthlyProjectionRows } from "../repository/StudentMonthlyLearningReviewRepository";
import type { StudentDailyVerificationRow } from "../types/MonthlyLearningReviewTypes";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function learningIdentityKey(row: any, academicYearIdOverride?: string | null) {
  const source = String(row.source ?? row.source_type ?? "").toLowerCase();
  return buildMonthlyLearningIdentityKey({
    studentUuid: String(row.studentUuid ?? row.student_uuid ?? ""),
    academicYearId: row.academicYearId ?? row.academic_year_id ?? null,
    academicYearIdOverride,
    teacherAssignmentUuid: String(row.teacherAssignmentUuid ?? row.teacher_assignment_uuid ?? ""),
    dailyLogUuid: String(row.dailyLogUuid ?? row.daily_log_uuid ?? ""),
    subjectName: String(row.subjectName ?? row.subject_name ?? ""),
    conceptName: String(row.conceptName ?? row.concept_name ?? row.doubt_concept ?? ""),
    sourceFeedbackId: row.sourceFeedbackId ?? row.source_feedback_id ?? null,
    sourceLiveId: source === "live" ? row.liveRowId ?? row.source_live_id ?? null : null,
    sourceMonthlyItemId: source === "monthly" ? String(row.id ?? row.source_monthly_item_id ?? "").replace(/^monthly-/, "") : null,
    sourceLoop2Id: source === "loop2" ? row.id ?? row.source_loop2_id ?? null : null,
  });
}

async function dailyHistoryKeys(date: string) {
  const identity = requireIdentity();
  const { data, error } = await client()
    .from("tp_learning_verification_history")
    .select("learning_identity_key")
    .eq("student_uuid", identity.studentUuid)
    .eq("verification_date", date);
  if (error) throw error;
  return new Set((data ?? []).map((row: any) => String(row.learning_identity_key)));
}

function monthlyItemId(row: any) {
  if (String(row.source ?? "").toLowerCase() !== "monthly") return null;
  const id = String(row.id ?? "").replace(/^monthly-/, "").trim();
  return id || null;
}

export async function getStudentDailyVerificationState() {
  const identity = requireIdentity();
  // Preserve the original Student Live gate contract: refresh the existing Live ledger
  // before deriving current Canonical verification candidates. This is read/sync only;
  // no Live schema or RPC implementation is changed by the Monthly feature.
  await syncStudentLiveDoubtLedger(true);
  // The locked architecture is explicitly a union of the existing Live
  // candidate population and Canonical candidates, followed by occurrence-safe
  // deduplication. Canonical remains the central intelligence projection, but
  // the existing Live population is retained as an explicit candidate source
  // so the new gate cannot silently replace the old Live eligibility behavior.
  const [liveRows, canonicalRows, todaysLiveCheck] = await Promise.all([
    getStudentLiveDoubtRows(true),
    getCanonicalExamPreparationRows({ scope: "student", studentUuid: identity.studentUuid }),
    client()
      .from("student_live_doubt_reconciliation_checks")
      .select("id")
      .eq("student_uuid", identity.studentUuid)
      .eq("check_date", indiaDate())
      .limit(1),
  ]);
  if (todaysLiveCheck.error) throw todaysLiveCheck.error;
  const existingLiveCheckToday = (todaysLiveCheck.data ?? []).length > 0;
  // The old Live check table remains authoritative for an already-completed
  // old Live popup during deployment/upgrade transitions. If a check exists
  // for this India day, suppress the entire old Live candidate population;
  // Monthly/Loop-2/other non-Live candidates remain eligible.
  const liveCanonicalRows = liveRows
    .filter((row: any) => row.is_unresolved)
    .map((row: any) => ({
      id: String(row.id),
      studentUuid: String(row.student_uuid),
      studentName: String(row.student_name ?? "Student"),
      teacherUuid: row.teacher_uuid ? String(row.teacher_uuid) : null,
      teacherAssignmentUuid: String(row.teacher_assignment_uuid ?? ""),
      dailyLogUuid: row.daily_log_uuid ? String(row.daily_log_uuid) : null,
      className: String(row.class_name ?? ""),
      sectionName: String(row.section_name ?? ""),
      subjectName: String(row.subject_name ?? ""),
      topicName: String(row.topic_name ?? ""),
      conceptName: String(row.doubt_concept ?? ""),
      canonicalDate: String(row.source_submitted_at ?? row.last_seen_at ?? row.updated_at ?? "").slice(0, 10),
      isUnresolved: true,
      source: "live",
      sourceFeedbackId: row.source_feedback_id ?? row.latest_source_feedback_id ?? null,
      liveRowId: String(row.id),
    }));
  const rows = [
    ...(existingLiveCheckToday ? [] : liveCanonicalRows),
    ...canonicalRows.filter((row: any) => !(existingLiveCheckToday && String(row.source ?? "").toLowerCase() === "live")),
  ];
  const assignmentIds = Array.from(new Set(rows.map((row: any) => String(row.teacherAssignmentUuid ?? row.teacher_assignment_uuid ?? "")).filter(Boolean)));
  const assignmentYearById = new Map<string, string>();
  if (assignmentIds.length) {
    const { data: assignments, error: assignmentError } = await client()
      .from("teacher_classroom_assignments")
      .select("id,school_uuid,academic_year_id")
      .in("id", assignmentIds);
    if (assignmentError) throw assignmentError;
    for (const a of assignments ?? []) {
      if (a.academic_year_id) assignmentYearById.set(String(a.id), String(a.academic_year_id));
    }
  }
  const history = await dailyHistoryKeys(indiaDate());
  const projections = await getStudentMonthlyProjectionRows();

  // The projection is deliberately a projection of the complete final canonical
  // candidate population. It is not a second source of truth. The sync RPC
  // validates the supplied source identities before it materializes/refreshes it.
  const { error: syncError } = await client().rpc("tp_sync_student_verification_projection", {
    p_student_uuid: identity.studentUuid,
    p_rows: rows.map((row: any) => ({
      id: row.id,
      source_type: row.source,
      source_live_id: row.liveRowId,
      source_loop2_id: row.source === "loop2" ? row.id : null,
      source_monthly_item_id: monthlyItemId(row),
      student_uuid: row.studentUuid,
      student_name: row.studentName,
      teacher_uuid: row.teacherUuid,
      teacher_assignment_uuid: row.teacherAssignmentUuid,
      daily_log_uuid: row.dailyLogUuid,
      class_name: row.className,
      section_name: row.sectionName,
      subject_name: row.subjectName,
      topic_name: row.topicName,
      concept_name: row.conceptName,
      canonical_date: row.canonicalDate,
      source_feedback_id: row.sourceFeedbackId,
      academic_year_id: assignmentYearById.get(String(row.teacherAssignmentUuid ?? "")) ?? row.academicYearId ?? null,
      learning_identity_key: learningIdentityKey(row, assignmentYearById.get(String(row.teacherAssignmentUuid ?? ""))),
    })),
  });
  if (syncError) throw syncError;

  const refreshed = await getStudentMonthlyProjectionRows();
  const projectionByKey = new Map(refreshed.map((row: any) => [String(row.learning_identity_key), row]));
  const monthlyByItem = new Map(projections.map((row: any) => [String(row.source_monthly_item_id ?? ""), row]));

  const candidates: StudentDailyVerificationRow[] = [];
  const candidateByKey = new Map<string, any>();
  // Prefer an explicit existing Live row when the same occurrence is present in
  // Canonical. This preserves the established Live identity while still allowing
  // Loop-2/Monthly-only canonical occurrences into the unified candidate pool.
  for (const row of rows) {
    if (!row.isUnresolved) continue;
    const key = learningIdentityKey(row, assignmentYearById.get(String(row.teacherAssignmentUuid ?? row.teacher_assignment_uuid ?? "")));
    const existing = candidateByKey.get(key);
    if (!existing || String(row.source ?? "").toLowerCase() === "live") candidateByKey.set(key, row);
  }
  for (const row of candidateByKey.values()) {
    const key = learningIdentityKey(row, assignmentYearById.get(String(row.teacherAssignmentUuid ?? row.teacher_assignment_uuid ?? "")));
    if (history.has(key)) continue;

    const projection = projectionByKey.get(key);
    if (!projection) throw new Error("Verification projection could not be created for a canonical learning occurrence.");

    // Live state is authoritative in the existing Live ledger. A non-Live
    // canonical occurrence is resolved only through the isolated projection.
    if (String(row.source).toLowerCase() !== "live" && String(projection.review_state).toUpperCase() === "RESOLVED") {
      continue;
    }

    const monthlyId = monthlyItemId(row);
    const monthly = monthlyId ? monthlyByItem.get(monthlyId) : null;
    const doubtText = String(
      row.source === "live"
        ? (row.conceptName || row.topicName || "Learning doubt")
        : row.conceptName || row.topicName || monthly?.concept_name || "Learning doubt"
    ).trim();

    candidates.push({
      id: String(projection.id),
      studentUuid: row.studentUuid,
      studentName: row.studentName,
      teacherUuid: row.teacherUuid,
      teacherName: String(projection.teacher_name ?? monthly?.teacher_name ?? "Assigned teacher"),
      teacherAssignmentUuid: row.teacherAssignmentUuid,
      dailyLogUuid: row.dailyLogUuid,
      className: row.className,
      sectionName: row.sectionName,
      subjectName: row.subjectName,
      topicName: row.topicName,
      conceptName: row.conceptName,
      canonicalDate: row.canonicalDate,
      isUnresolved: true,
      sourceLiveId: row.liveRowId ? String(row.liveRowId) : null,
      sourceMonthlyItemId: monthlyId,
      sourceProjectionId: String(projection.id),
      learningIdentityKey: key,
      responseState: "UNRESOLVED",
      doubtText,
    });
  }

  const grouped = new Map<string, StudentDailyVerificationRow[]>();
  for (const row of candidates) {
    const list = grouped.get(row.subjectName) ?? [];
    list.push(row);
    grouped.set(row.subjectName, list);
  }

  const eligibleSubjects = Array.from(grouped.entries())
    .filter(([, items]) => items.length >= 5)
    .map(([subjectName, doubts]) => ({ subjectName, doubts }));

  return { available: true, eligibleSubjects, reviewMonth: currentReviewMonth() };
}

export async function submitStudentDailyVerification(
  subjects: Array<{
    subjectName: string;
    doubts: Array<{
      id: string;
      sourceLiveId: string | null;
      sourceMonthlyItemId: string | null;
      sourceProjectionId: string;
      conceptName: string;
      learningIdentityKey: string;
      responseState: "RESOLVED" | "UNRESOLVED";
    }>;
  }>
) {
  const identity = requireIdentity();
  const date = indiaDate();
  const all = subjects.flatMap((subject) => subject.doubts.map((doubt) => ({ ...doubt, subjectName: subject.subjectName })));
  if (!all.length) return;

  const { error } = await client().rpc("tp_submit_student_daily_verification", {
    p_student_uuid: identity.studentUuid,
    p_verification_date: date,
    p_rows: all.map((row) => ({
      projection_id: row.sourceProjectionId,
      source_live_id: row.sourceLiveId,
      learning_identity_key: row.learningIdentityKey,
      response_state: row.responseState,
      subject_name: row.subjectName,
      concept_name: row.conceptName,
    })),
  });
  if (error) throw error;
}
