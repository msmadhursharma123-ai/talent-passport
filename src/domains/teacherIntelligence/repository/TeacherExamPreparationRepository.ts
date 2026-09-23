import { getCanonicalExamPreparationRows, buildTeacherExamPreparationResult } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import { inclusiveEndToExclusive } from "../../examPreparationIntelligence/canonical/ExamPreparationDate";

/**
 * Compatibility entry point retained for existing imports.
 * The calculation itself is delegated to the canonical Exam Preparation
 * service so this repository cannot drift from Student/School semantics.
 */
export async function getTeacherExamAttentionIntelligence(
  startDate?: string,
  endDateInclusive?: string
) {
  const rows = await getCanonicalExamPreparationRows({
    scope: "teacher",
    startDate,
    endDateExclusive: inclusiveEndToExclusive(endDateInclusive),
  });

  return buildTeacherExamPreparationResult(rows);
}
