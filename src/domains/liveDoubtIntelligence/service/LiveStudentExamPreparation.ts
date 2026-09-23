import { buildStudentExamPreparationResult, getCanonicalExamPreparationRows } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import { shiftExamPreparationDate } from "../../examPreparationIntelligence/canonical/ExamPreparationDate";

export interface StudentExamPreparationDateRange {
  startDate?: string;
  endDateExclusive?: string;
}

function monthRange(value?: string) {
  const text = String(value ?? "").trim();
  if (!text) return {};

  const match = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return {};

  const date = new Date(`${match[1]} 1, ${match[2]} 00:00:00`);
  if (Number.isNaN(date.getTime())) return {};

  const start =
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const end =
    `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01`;

  return { startDate: start, endDateExclusive: end };
}

/**
 * Student Exam Preparation is now a projection of the same canonical
 * reconciled dataset used by Teacher and School Exam Preparation.
 *
 * Important: Loop-2 and Live are reconciled BEFORE the date/subject filter.
 * A Live failure is not silently replaced by stale Loop-2 data.
 */
export async function getStudentExamPreparationIntelligenceWithLiveLayer(
  selectedSubject?: string,
  selectedMonth?: string,
  dateRange?: StudentExamPreparationDateRange
) {
  const range = dateRange ?? monthRange(selectedMonth);

  const rows = await getCanonicalExamPreparationRows({
    scope: "student",
    subjectName: selectedSubject,
    startDate: range.startDate,
    endDateExclusive: range.endDateExclusive,
  });

  return buildStudentExamPreparationResult(rows);
}
