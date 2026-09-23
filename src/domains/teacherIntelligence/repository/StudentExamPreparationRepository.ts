import { getCanonicalExamPreparationRows, buildStudentExamPreparationResult } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";

export interface StudentExamPreparationOptions {
  startDate?: string;
  endDateExclusive?: string;
}

/**
 * Compatibility entry point.
 *
 * Exam Preparation no longer owns a separate Loop-2 calculation here.
 * Student/Teacher/School all project the same canonical reconciled ledger.
 */
export async function getStudentExamPreparationIntelligence(
  options: StudentExamPreparationOptions = {}
) {
  const rows = await getCanonicalExamPreparationRows({
    scope: "student",
    startDate: options.startDate,
    endDateExclusive: options.endDateExclusive,
  });

  return buildStudentExamPreparationResult(rows);
}
