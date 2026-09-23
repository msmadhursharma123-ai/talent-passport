import { buildTeacherExamPreparationResult, getCanonicalExamPreparationRows } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import { inclusiveEndToExclusive } from "../../examPreparationIntelligence/canonical/ExamPreparationDate";

/**
 * Teacher Exam Preparation is the teacher-assignment projection of the same
 * canonical current-state doubt ledger used by Student and School.
 */
export async function getTeacherExamAttentionIntelligenceWithLiveLayer(
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
