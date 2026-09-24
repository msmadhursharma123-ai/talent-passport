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
