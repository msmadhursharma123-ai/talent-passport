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

function indiaDateKey(value: unknown) {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  return `${parts.find(part => part.type === "year")?.value ?? ""}-${parts.find(part => part.type === "month")?.value ?? ""}-${parts.find(part => part.type === "day")?.value ?? ""}`;
}

function classroomLabel(className: unknown, sectionName: unknown) {
  const classNameText = String(className ?? "").trim();
  const sectionText = String(sectionName ?? "").trim();
  return sectionText ? `${classNameText} ${sectionText}`.trim() : classNameText || "Unassigned";
}

/**
 * Combined Loop 1 + Loop 2 Star Performer calculation.
 *
 * All credit rules and Loop 2 student-response safeguards are delegated to
 * the existing pure credit engine. Wallet/top-up credits are not included.
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

  const loop2ByStudent = new Map<string, any[]>();
  for (const row of raw.loop2History) {
    const dueDate = row.created_at ?? row.revision_checked_at ?? row.log_date;
    const dueDateKey = indiaDateKey(dueDate);
    // Restrict earned/lost Loop 2 credits to the selected scorecard period.
    if (!dueDateKey || dueDateKey < input.startDate || dueDateKey > input.endDate) continue;
    const existing = loop2ByStudent.get(row.student_uuid) ?? [];
    existing.push(row);
    loop2ByStudent.set(row.student_uuid, existing);
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
    const loop2History = loop2ByStudent.get(student.student_uuid) ?? [];

    const summary = calculateDailyFeedbackCreditSummaryFromLogs(
      logs,
      feedbackHistory,
      input.asOfDate,
      {
        studentCreatedAt: student.created_at ?? null,
        loop2History,
      },
    );

    scored.push({
      studentUuid: student.student_uuid,
      studentName: student.student_name || "Student",
      className: String(student.class_name ?? "").trim(),
      sectionName: String(student.section_name ?? "").trim(),
      dailyFeedbackCredits: summary.totalCredits,
      submittedFeedbackCount: summary.submittedFeedbackCount,
      missedFeedbackCount: summary.missedFeedbackCount,
      submittedLoop2ResponseCount: summary.submittedLoop2ResponseCount,
      missedLoop2ResponseCount: summary.missedLoop2ResponseCount,
    });
  }

  // The scorecard is explicitly five winners PER class + section.
  const grouped = new Map<string, Array<Omit<StudentStarPerformerRow, "rank">>>();
  for (const row of scored) {
    const key = classroomKey(row.className, row.sectionName);
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  const topFive: StudentStarPerformerRow[] = [];
  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => {
      if (b.dailyFeedbackCredits !== a.dailyFeedbackCredits) {
        return b.dailyFeedbackCredits - a.dailyFeedbackCredits;
      }
      const aSubmitted = a.submittedFeedbackCount + a.submittedLoop2ResponseCount;
      const bSubmitted = b.submittedFeedbackCount + b.submittedLoop2ResponseCount;
      if (bSubmitted !== aSubmitted) return bSubmitted - aSubmitted;
      const aMissed = a.missedFeedbackCount + a.missedLoop2ResponseCount;
      const bMissed = b.missedFeedbackCount + b.missedLoop2ResponseCount;
      if (aMissed !== bMissed) return aMissed - bMissed;
      return a.studentName.localeCompare(b.studentName);
    });

    bucket.slice(0, 5).forEach((row, index) => {
      topFive.push({
        ...row,
        rank: (index + 1) as 1 | 2 | 3 | 4 | 5,
      });
    });
  }

  topFive.sort((a, b) => {
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
    rows: topFive,
    classrooms,
    studentCount: scored.length,
    calculatedAt: new Date().toISOString(),
  };
}
