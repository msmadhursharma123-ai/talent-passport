import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import type { StudentResolveRaisedDoubtResolution } from "../types/StudentResolveRaisedDoubtTypes";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

/**
 * Resolves the exact current Exam Preparation identities selected by the
 * student. The database function is intentionally atomic: every selected
 * canonical identity is validated for the authenticated student and then
 * its matching Live and/or Loop-2 state is retired in the same transaction.
 *
 * Unselected rows are never sent and therefore remain unresolved.
 */
export async function resolveStudentRaisedDoubts(
  rows: StudentResolveRaisedDoubtResolution[],
) {
  if (!rows.length) return [];

  const identity = requireIdentity();
  const studentUuid = clean(identity.studentUuid);
  if (!studentUuid) {
    throw new Error("Student identity is missing.");
  }

  const deduped = new Map<string, StudentResolveRaisedDoubtResolution>();

  for (const row of rows) {
    if (clean(row.studentUuid) !== studentUuid) {
      throw new Error("The selected doubt does not belong to the signed-in student.");
    }

    const key =
      clean(row.liveRowId) ||
      clean(row.pendingDoubtId) ||
      clean(row.canonicalRowId);

    if (key) deduped.set(key, row);
  }

  const resolutions = Array.from(deduped.values()).map((row) => ({
    canonical_row_id: clean(row.canonicalRowId),
    pending_doubt_id: clean(row.pendingDoubtId) || null,
    live_row_id: clean(row.liveRowId) || null,
    student_uuid: studentUuid,
    teacher_assignment_uuid: clean(row.teacherAssignmentUuid),
    subject_name: clean(row.subjectName),
    topic_name: clean(row.topicName),
    subtopic_name: clean(row.subtopicName),
    canonical_date: clean(row.canonicalDate),
  }));

  if (!resolutions.length) return [];

  const { data, error } = await client().rpc(
    "resolve_student_exam_raised_doubts",
    {
      p_student_uuid: studentUuid,
      p_resolutions: resolutions,
    },
  );

  if (error) throw error;
  return data ?? [];
}
