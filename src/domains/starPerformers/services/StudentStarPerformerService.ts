import { calculateDailyFeedbackCreditSummaryFromLogs } from "../../../data/creditEngine";
import { getStudentStarPerformerSourceData } from "../repository/StudentStarPerformerRepository";
import type {
  StudentStarPerformerClassroom,
  StudentStarPerformerResult,
  StudentStarPerformerRow,
} from "../types/StudentStarPerformerModels";

export interface StudentStarPerformerCalculationInput {
  startDate: string;
  endDate: string;
  classroomFilter?: string;
  asOfDate: string;
}

function classroomKey(className: unknown, sectionName: unknown) {
  return `${String(className ?? "").trim()}::${String(sectionName ?? "").trim()}`;
}

function classroomLabel(className: unknown, sectionName: unknown) {
  const classNameText = String(className ?? "").trim();
  const sectionText = String(sectionName ?? "").trim();
  return sectionText ? `${classNameText} ${sectionText}`.trim() : classNameText || "Unassigned";
}

/**
 * Daily Feedback-only Star Performer calculation.
 *
 * The calculation delegates the +1 / -10 rules to the existing pure credit
 * engine. No combined wallet credits are included.
 */
export async function calculateStudentStarPerformers(
  input: StudentStarPerformerCalculationInput,
): Promise<StudentStarPerformerResult> {
  const raw = await getStudentStarPerformerSourceData(input.startDate, input.endDate);

  const classroomMap = new Map<string, StudentStarPerformerClassroom>();
  for (const student of raw.students) {
    const className = String(student.class_name ?? "").trim();
    const sectionName = String(student.section_name ?? "").trim();
    if (!className) continue;
    const key = classroomKey(className, sectionName);
    if (!classroomMap.has(key)) {
      classroomMap.set(key, {
        key,
        className,
        sectionName,
        label: classroomLabel(className, sectionName),
      });
    }
  }

  const logByClassroom = new Map<string, any[]>();
  for (const log of raw.logs) {
    const key = classroomKey(log.class_name, log.section_name);
    const existing = logByClassroom.get(key) ?? [];
    existing.push({ id: log.id, log_date: log.log_date });
    logByClassroom.set(key, existing);
  }

  const feedbackByStudent = new Map<string, any[]>();
  for (const feedback of raw.feedback) {
    const existing = feedbackByStudent.get(feedback.student_uuid) ?? [];
    existing.push({ daily_log_uuid: feedback.daily_log_uuid });
    feedbackByStudent.set(feedback.student_uuid, existing);
  }

  const selectedClassroom = input.classroomFilter && input.classroomFilter !== "ALL"
    ? input.classroomFilter
    : "ALL";

  const scored: Array<Omit<StudentStarPerformerRow, "rank">> = [];

  for (const student of raw.students) {
    const studentClassroom = classroomKey(student.class_name, student.section_name);
    if (selectedClassroom !== "ALL" && selectedClassroom !== studentClassroom) continue;

    const logs = logByClassroom.get(studentClassroom) ?? [];
    const feedbackHistory = feedbackByStudent.get(student.student_uuid) ?? [];

    const summary = calculateDailyFeedbackCreditSummaryFromLogs(
      logs,
      feedbackHistory,
      input.asOfDate,
    );

    scored.push({
      studentUuid: student.student_uuid,
      studentName: student.student_name || "Student",
      className: String(student.class_name ?? "").trim(),
      sectionName: String(student.section_name ?? "").trim(),
      dailyFeedbackCredits: summary.totalCredits,
      submittedFeedbackCount: summary.submittedFeedbackCount,
      missedFeedbackCount: summary.missedFeedbackCount,
    });
  }

  // The scorecard is explicitly two winners PER class + section.
  const grouped = new Map<string, Array<Omit<StudentStarPerformerRow, "rank">>>();
  for (const row of scored) {
    const key = classroomKey(row.className, row.sectionName);
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  const topTwo: StudentStarPerformerRow[] = [];
  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => {
      if (b.dailyFeedbackCredits !== a.dailyFeedbackCredits) {
        return b.dailyFeedbackCredits - a.dailyFeedbackCredits;
      }
      if (b.submittedFeedbackCount !== a.submittedFeedbackCount) {
        return b.submittedFeedbackCount - a.submittedFeedbackCount;
      }
      if (a.missedFeedbackCount !== b.missedFeedbackCount) {
        return a.missedFeedbackCount - b.missedFeedbackCount;
      }
      return a.studentName.localeCompare(b.studentName);
    });

    bucket.slice(0, 2).forEach((row, index) => {
      topTwo.push({
        ...row,
        rank: (index + 1) as 1 | 2,
      });
    });
  }

  topTwo.sort((a, b) => {
    const classroomCompare = classroomLabel(a.className, a.sectionName).localeCompare(
      classroomLabel(b.className, b.sectionName),
      undefined,
      { numeric: true, sensitivity: "base" },
    );
    return classroomCompare || a.rank - b.rank;
  });

  const classrooms = Array.from(classroomMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
  );

  return {
    startDate: input.startDate,
    endDate: input.endDate,
    classroomFilter: selectedClassroom,
    rows: topTwo,
    classrooms,
    studentCount: scored.length,
    calculatedAt: new Date().toISOString(),
  };
}
