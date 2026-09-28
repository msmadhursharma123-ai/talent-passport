function norm(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Shared occurrence identity for the isolated Monthly/verification layer.
 * The source token follows the existing reconciliation hierarchy: exact source
 * feedback first, then exact Live identity, then Monthly/Loop-2 identity, then
 * the stable daily-log occurrence. Existing Live reconciliation itself is not
 * rewritten.
 */
export function monthlyLearningIdentityKey(input: {
  studentUuid: string;
  academicYearId?: string | null;
  teacherAssignmentUuid: string;
  dailyLogUuid: string;
  subjectName: string;
  conceptName: string;
  sourceFeedbackId?: string | null;
  sourceLiveId?: string | null;
  sourceMonthlyItemId?: string | null;
  sourceLoop2Id?: string | null;
  academicYearIdOverride?: string | null;
}): string {
  const occurrenceToken = String(
    input.sourceFeedbackId ||
      input.sourceLiveId ||
      input.sourceMonthlyItemId ||
      input.sourceLoop2Id ||
      input.dailyLogUuid
  ).trim();
  return [
    String(input.studentUuid).trim(),
    String(input.academicYearIdOverride ?? input.academicYearId ?? "").trim(),
    String(input.teacherAssignmentUuid).trim(),
    String(input.dailyLogUuid).trim(),
    norm(input.subjectName),
    norm(input.conceptName),
    occurrenceToken,
  ].join("|");
}
