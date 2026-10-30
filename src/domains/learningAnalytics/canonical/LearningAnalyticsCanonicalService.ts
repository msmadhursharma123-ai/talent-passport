/**
 * Canonical, calculation-only service shared by School Admin, Teacher and Student portals.
 * Keep data acquisition/authorization in existing repositories and presentation in existing pages.
 * Do not change Live Layer / Loop 1 / Loop 2 precedence here.
 */
import { LEARNING_FEEDBACK_OPTIONS } from "./LearningAnalyticsContracts";
import type { LearningLectureMetrics, LearningAggregateMetrics, LearningLectureMetricsInput } from "./LearningAnalyticsTypes";

export const ABSENT_FEEDBACK_OPTION = LEARNING_FEEDBACK_OPTIONS.ABSENT;
export const COMPLETE_FEEDBACK_OPTION = LEARNING_FEEDBACK_OPTIONS.COMPLETE;
export const PARTIAL_FEEDBACK_OPTION = LEARNING_FEEDBACK_OPTIONS.PARTIAL;
export const DID_NOT_UNDERSTAND_FEEDBACK_OPTION = LEARNING_FEEDBACK_OPTIONS.DID_NOT_UNDERSTAND;

/**
 * Shared analytics contracts for cross-portal doubt metrics.
 *
 * A doubt-closure rate is 0% when no doubts were raised. This is an explicit
 * product convention: there is no closure event to credit, and 100% must never
 * be inferred from a zero denominator.
 */
export function isDoubtResolved(doubt: any): boolean {
  return (
    doubt?.doubt_resolved === true ||
    String(doubt?.status ?? "").trim().toUpperCase() === "RESOLVED" ||
    String(doubt?.student_response ?? "").trim().toUpperCase() === "DISCUSSED"
  );
}

export function countResolvedDoubts(doubts: any[]): number {
  return (doubts ?? []).filter(isDoubtResolved).length;
}

export function calculateDoubtClosureRate(doubts: any[]): number {
  const rows = doubts ?? [];
  if (rows.length === 0) return 0;
  return Math.round((countResolvedDoubts(rows) / rows.length) * 100);
}

export function calculateDoubtClosureRateFromCounts(
  doubtsAsked: number,
  doubtsResolved: number,
): number {
  if (doubtsAsked <= 0) return 0;
  return Math.round((doubtsResolved / doubtsAsked) * 100);
}

/**
 * A learning "Doubt %" is the share of eligible students who are either
 * partially understanding or did not understand. This keeps the metric
 * consistent with Teaching Journal and the product definition that partial
 * understanding is still a learning doubt/signal requiring attention.
 */
export function calculateLearningDoubtRate(
  partialStudentObservations: number,
  didntUnderstandStudentObservations: number,
  eligibleStudentObservations: number,
): number {
  if (eligibleStudentObservations <= 0) return 0;
  return Math.round(
    ((partialStudentObservations + didntUnderstandStudentObservations) /
      eligibleStudentObservations) * 100,
  );
}

export function isLearningUnderstandingLevel(value: unknown): boolean {
  const normalized = String(value ?? "").trim();
  return (
    normalized === COMPLETE_FEEDBACK_OPTION ||
    normalized === PARTIAL_FEEDBACK_OPTION ||
    normalized === DID_NOT_UNDERSTAND_FEEDBACK_OPTION
  );
}

/**
 * Student-personal learning health for a sequence of submitted feedback levels.
 * Unlike class/lecture metrics, the student denominator is the number of valid
 * learning responses in that sequence; absence and blank values are excluded.
 * This keeps the base Student Progress Tracker and its Live overlay consistent.
 */
export function calculateStudentLearningHealthPercentage(levels: unknown[]): number {
  const learningLevels = (levels ?? []).map(value => String(value ?? "").trim());
  const eligible = learningLevels.filter(isLearningUnderstandingLevel);
  if (eligible.length === 0) return 0;
  const complete = eligible.filter(level => level === COMPLETE_FEEDBACK_OPTION).length;
  const partial = eligible.filter(level => level === PARTIAL_FEEDBACK_OPTION).length;
  return Math.round(((complete + partial * 0.5) / eligible.length) * 100);
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
    classHealthPercentage: calculateUnweightedAveragePercentageFromSum(
      totals.healthPercentageSum,
      lectures.length,
    ),
  };
}

/** One authoritative resolution classifier for all analytics consumers. */
export function classifyDoubtResolution(doubt: any): import("./LearningAnalyticsContracts").DoubtResolutionSource {
  if (doubt?.doubt_resolved === true) return "RESOLVED_FLAG";
  if (String(doubt?.status ?? "").trim().toUpperCase() === "RESOLVED") return "RESOLVED_STATUS";
  if (String(doubt?.student_response ?? "").trim().toUpperCase() === "DISCUSSED") return "DISCUSSED_RESPONSE";
  return "UNRESOLVED";
}

export function isDoubtUnresolved(doubt: any): boolean {
  return classifyDoubtResolution(doubt) === "UNRESOLVED";
}

/** Explicitly named helpers prevent consumers confusing pooled rates with averages of rates. */
export function calculatePooledPercentage(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function calculateUnweightedAveragePercentageFromSum(sum: number, count: number): number {
  if (!Number.isFinite(sum) || !Number.isFinite(count) || count <= 0) return 0;
  return Math.round(sum / count);
}

export function calculateUnweightedAveragePercentage(values: number[]): number {
  const valid = (values ?? []).filter(value => Number.isFinite(value));
  return valid.length === 0 ? 0 : Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}
