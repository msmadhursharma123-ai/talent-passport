/** Deterministic regression vectors usable by any test runner; no runtime side effects. */
import { isDoubtResolved, classifyDoubtResolution, isDoubtUnresolved, calculateDoubtClosureRate, calculateDoubtClosureRateFromCounts, calculateLearningDoubtRate, calculatePooledPercentage, calculateUnweightedAveragePercentage, calculateLearningLectureMetrics, aggregateLearningLectureMetrics, COMPLETE_FEEDBACK_OPTION, PARTIAL_FEEDBACK_OPTION, DID_NOT_UNDERSTAND_FEEDBACK_OPTION, ABSENT_FEEDBACK_OPTION } from "./LearningAnalyticsCanonicalService";

export const DOUBT_RESOLUTION_VECTORS = [
  { name: "resolved flag", row: { doubt_resolved: true }, expected: true },
  { name: "resolved status case-insensitive", row: { status: " resolved " }, expected: true },
  { name: "discussed response case-insensitive", row: { student_response: " discussed " }, expected: true },
  { name: "unresolved", row: { status: "NOT DISCUSSED", doubt_resolved: false, student_response: null }, expected: false },
  { name: "null row", row: null, expected: false },
] as const;

export function runLearningAnalyticsCanonicalVectors(): string[] {
  const failures: string[] = [];
  for (const vector of DOUBT_RESOLUTION_VECTORS) {
    if (isDoubtResolved(vector.row) !== vector.expected) failures.push(`doubt:${vector.name}`);
  }
  if (calculateDoubtClosureRate([{ status: "RESOLVED" }, { status: "NOT DISCUSSED" }, { student_response: "DISCUSSED" }]) !== 67) failures.push("closure:rounded-pooled-rate");
  const lecture = calculateLearningLectureMetrics({
    studentUuids: ["a", "b", "c", "d"],
    feedback: [
      { student_uuid: "a", understanding_level: COMPLETE_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
      { student_uuid: "b", understanding_level: PARTIAL_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
      { student_uuid: "c", understanding_level: DID_NOT_UNDERSTAND_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
      { student_uuid: "d", understanding_level: ABSENT_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
    ],
  });
  if (lecture.eligibleStudents !== 3 || lecture.responseRate !== 100 || lecture.understandingRate !== 33 || lecture.healthPercentage !== 50) failures.push("learning:eligible-denominator-and-health");
  const aggregate = aggregateLearningLectureMetrics([lecture, { ...lecture, healthPercentage: 0 }]);
  if (aggregate.classHealthPercentage !== 25) failures.push("learning:lecture-average-health");

  // Adversarial roster/feedback cases: duplicates, unknown students, no response,
  // duplicate roster IDs, zero denominator, and latest-row precedence.
  const duplicateRoster = calculateLearningLectureMetrics({
    studentUuids: ["a", "a", "b"],
    feedback: [
      { student_uuid: "a", understanding_level: COMPLETE_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
      { student_uuid: "a", understanding_level: DID_NOT_UNDERSTAND_FEEDBACK_OPTION, submitted_at: "2026-01-02T00:00:00Z" },
      { student_uuid: "outside-roster", understanding_level: COMPLETE_FEEDBACK_OPTION, submitted_at: "2026-01-03T00:00:00Z" },
    ],
  });
  if (duplicateRoster.totalStudents !== 2) failures.push("learning:deduplicated-roster");
  if (duplicateRoster.completeStudents !== 0 || duplicateRoster.didntUnderstandStudents !== 1) failures.push("learning:latest-feedback-wins");
  if (duplicateRoster.eligibleStudents !== 2 || duplicateRoster.responseRate !== 50) failures.push("learning:nonresponders-stay-in-denominator");

  const noResponses = calculateLearningLectureMetrics({ studentUuids: ["a", "b"], feedback: [] });
  if (noResponses.eligibleStudents !== 2 || noResponses.responseRate !== 0 || noResponses.healthPercentage !== 0) failures.push("learning:zero-response-lecture-retained");

  const allAbsent = calculateLearningLectureMetrics({
    studentUuids: ["a", "b"],
    feedback: [
      { student_uuid: "a", understanding_level: ABSENT_FEEDBACK_OPTION },
      { student_uuid: "b", understanding_level: ABSENT_FEEDBACK_OPTION },
    ],
  });
  if (allAbsent.eligibleStudents !== 0 || allAbsent.healthPercentage !== 0) failures.push("learning:zero-eligible-denominator");

  if (calculateDoubtClosureRate([]) !== 0) failures.push("closure:empty-denominator-is-zero");

  // V8 cross-checks: classifier precedence, zero/invalid denominator contracts,
  // and explicit distinction between pooled and unweighted rates.
  if (classifyDoubtResolution({ doubt_resolved: true, status: "NOT DISCUSSED", student_response: null }) !== "RESOLVED_FLAG") failures.push("resolution:flag-precedence");
  if (classifyDoubtResolution({ status: "RESOLVED", student_response: "DISCUSSED" }) !== "RESOLVED_STATUS") failures.push("resolution:status-precedence");
  if (!isDoubtUnresolved({ status: "NOT DISCUSSED", doubt_resolved: false })) failures.push("resolution:unresolved-wrapper");
  if (calculateDoubtClosureRateFromCounts(0, 0) !== 0) failures.push("closure:count-zero-denominator");
  if (calculateLearningDoubtRate(1, 1, 0) !== 0) failures.push("learning:doubt-zero-denominator");
  if (calculatePooledPercentage(1, 0) !== 0) failures.push("percentage:pooled-zero-denominator");
  if (calculatePooledPercentage(Number.NaN, 2) !== 0) failures.push("percentage:pooled-nan-input");
  if (calculateUnweightedAveragePercentage([100, 0]) !== 50) failures.push("percentage:unweighted-average");
  if (calculatePooledPercentage(1, 4) !== 25) failures.push("percentage:pooled-rate");
  if (calculateUnweightedAveragePercentage([100, 0]) === calculatePooledPercentage(1, 4)) failures.push("percentage:distinct-definitions-example");

  // Equal timestamps intentionally retain last-row-wins behavior from the original helper.
  const equalTimestamp = calculateLearningLectureMetrics({
    studentUuids: ["a"],
    feedback: [
      { student_uuid: "a", understanding_level: COMPLETE_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
      { student_uuid: "a", understanding_level: PARTIAL_FEEDBACK_OPTION, submitted_at: "2026-01-01T00:00:00Z" },
    ],
  });
  if (equalTimestamp.completeStudents !== 0 || equalTimestamp.partialStudents !== 1) failures.push("learning:equal-timestamp-last-row-wins");
  return failures;
}
