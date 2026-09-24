export const ABSENT_FEEDBACK_OPTION = "I was absent.";
export const COMPLETE_FEEDBACK_OPTION = "I completely understood.";
export const PARTIAL_FEEDBACK_OPTION = "I partially understood.";
export const DID_NOT_UNDERSTAND_FEEDBACK_OPTION = "I didn't understand.";

export interface LearningLectureMetrics {
  totalStudents: number;
  absentStudents: number;
  eligibleStudents: number;
  responseStudents: number;
  completeStudents: number;
  partialStudents: number;
  didntUnderstandStudents: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  healthPercentage: number;
}

export interface LearningAggregateMetrics {
  totalStudentObservations: number;
  absentStudentObservations: number;
  eligibleStudentObservations: number;
  responseStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  lectureCount: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  classHealthPercentage: number;
  healthPercentageSum: number;
}

export function isLearningUnderstandingLevel(value: unknown): boolean {
  const normalized = String(value ?? "").trim();
  return (
    normalized === COMPLETE_FEEDBACK_OPTION ||
    normalized === PARTIAL_FEEDBACK_OPTION ||
    normalized === DID_NOT_UNDERSTAND_FEEDBACK_OPTION
  );
}

export function isAbsentFeedback(value: unknown): boolean {
  return String(value ?? "").trim() === ABSENT_FEEDBACK_OPTION;
}

function feedbackTimestamp(row: any): number {
  const candidate = row?.submitted_at ?? row?.created_at ?? row?.updated_at ?? "";
  const time = new Date(candidate).getTime();
  return Number.isFinite(time) ? time : 0;
}

/**
 * A lecture must contribute at most one response per student. If duplicate
 * feedback rows exist for the same student/lecture, the newest timestamp wins.
 * This is intentionally calculation-only: it does not mutate or write data.
 */
export function latestFeedbackByStudent(feedback: any[]): any[] {
  const latest = new Map<string, any>();

  for (const row of feedback ?? []) {
    const studentUuid = String(row?.student_uuid ?? "").trim();
    if (!studentUuid) continue;

    const existing = latest.get(studentUuid);
    if (!existing || feedbackTimestamp(row) >= feedbackTimestamp(existing)) {
      latest.set(studentUuid, row);
    }
  }

  return Array.from(latest.values());
}

export interface LearningLectureMetricsInput {
  studentUuids: Iterable<unknown>;
  feedback: any[];
  getUnderstandingLevel?: (feedback: any) => unknown;
}

/**
 * Authoritative class-level learning denominator:
 *
 *   total students in class - students who selected "I was absent."
 *
 * Non-responding, non-absent students remain in the denominator. Absence is
 * an attendance response, not a learning outcome. Zero-response lectures are
 * therefore valid lectures with 0% health and are never silently skipped.
 */
export function calculateLearningLectureMetrics({
  studentUuids,
  feedback,
  getUnderstandingLevel,
}: LearningLectureMetricsInput): LearningLectureMetrics {
  const roster = new Set(
    Array.from(studentUuids ?? [])
      .map(value => String(value ?? "").trim())
      .filter(Boolean),
  );

  const latestFeedback = latestFeedbackByStudent(feedback ?? []).filter(row =>
    roster.has(String(row?.student_uuid ?? "").trim()),
  );

  const levelOf = getUnderstandingLevel ?? ((row: any) => row?.understanding_level);
  const absentStudents = new Set<string>();
  const responseStudents = new Set<string>();
  const completeStudents = new Set<string>();
  const partialStudents = new Set<string>();
  const didntUnderstandStudents = new Set<string>();

  for (const row of latestFeedback) {
    const studentUuid = String(row?.student_uuid ?? "").trim();
    const level = String(levelOf(row) ?? "").trim();

    if (isAbsentFeedback(level)) {
      absentStudents.add(studentUuid);
      continue;
    }

    if (level === COMPLETE_FEEDBACK_OPTION) {
      completeStudents.add(studentUuid);
      responseStudents.add(studentUuid);
      continue;
    }

    if (level === PARTIAL_FEEDBACK_OPTION) {
      partialStudents.add(studentUuid);
      responseStudents.add(studentUuid);
      continue;
    }

    if (level === DID_NOT_UNDERSTAND_FEEDBACK_OPTION) {
      didntUnderstandStudents.add(studentUuid);
      responseStudents.add(studentUuid);
    }
  }

  const eligibleStudents = Math.max(0, roster.size - absentStudents.size);
  const responseCount = responseStudents.size;
  const completeCount = completeStudents.size;
  const partialCount = partialStudents.size;
  const didntUnderstandCount = didntUnderstandStudents.size;
  const percentage = (part: number, total: number) =>
    total === 0 ? 0 : Math.round((part / total) * 100);

  return {
    totalStudents: roster.size,
    absentStudents: absentStudents.size,
    eligibleStudents,
    responseStudents: responseCount,
    completeStudents: completeCount,
    partialStudents: partialCount,
    didntUnderstandStudents: didntUnderstandCount,
    responseRate: percentage(responseCount, eligibleStudents),
    understandingRate: percentage(completeCount, eligibleStudents),
    partialRate: percentage(partialCount, eligibleStudents),
    didntUnderstandRate: percentage(didntUnderstandCount, eligibleStudents),
    healthPercentage: percentage(completeCount + partialCount * 0.5, eligibleStudents),
  };
}

export function aggregateLearningLectureMetrics(
  lectures: LearningLectureMetrics[],
): LearningAggregateMetrics {
  const totals = lectures.reduce(
    (acc, lecture) => {
      acc.totalStudentObservations += lecture.totalStudents;
      acc.absentStudentObservations += lecture.absentStudents;
      acc.eligibleStudentObservations += lecture.eligibleStudents;
      acc.responseStudentObservations += lecture.responseStudents;
      acc.completeStudentObservations += lecture.completeStudents;
      acc.partialStudentObservations += lecture.partialStudents;
      acc.didntUnderstandStudentObservations += lecture.didntUnderstandStudents;
      acc.healthPercentageSum += lecture.healthPercentage;
      return acc;
    },
    {
      totalStudentObservations: 0,
      absentStudentObservations: 0,
      eligibleStudentObservations: 0,
      responseStudentObservations: 0,
      completeStudentObservations: 0,
      partialStudentObservations: 0,
      didntUnderstandStudentObservations: 0,
      healthPercentageSum: 0,
    },
  );

  const percentage = (part: number, total: number) =>
    total === 0 ? 0 : Math.round((part / total) * 100);

  return {
    ...totals,
    lectureCount: lectures.length,
    responseRate: percentage(
      totals.responseStudentObservations,
      totals.eligibleStudentObservations,
    ),
    understandingRate: percentage(
      totals.completeStudentObservations,
      totals.eligibleStudentObservations,
    ),
    partialRate: percentage(
      totals.partialStudentObservations,
      totals.eligibleStudentObservations,
    ),
    didntUnderstandRate: percentage(
      totals.didntUnderstandStudentObservations,
      totals.eligibleStudentObservations,
    ),
    classHealthPercentage:
      lectures.length === 0 ? 0 : Math.round(totals.healthPercentageSum / lectures.length),
  };
}
