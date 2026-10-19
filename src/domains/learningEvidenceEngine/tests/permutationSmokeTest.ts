import { buildLearningEvidenceReport } from "../engine/buildLearningEvidenceReport";
import type { LearningEvidenceAssignment, LearningEvidenceFeedbackRow, LearningEvidenceLogRow } from "../types/LearningEvidenceTypes";

const assignment: LearningEvidenceAssignment = { id: "a1", teacher_uuid: "t1", teacher_name: "Teacher", class_name: "8", section_name: "A", subject_name: "Science", is_active: true };
const logs: LearningEvidenceLogRow[] = [
  { id: "l1", teacher_assignment_uuid: "a1", topic_name: "Force", log_date: "2026-10-01" },
  { id: "l2", teacher_assignment_uuid: "a1", topic_name: "Force", log_date: "2026-10-02" },
];
const baseRows: LearningEvidenceFeedbackRow[] = [
  { id: "f1", daily_log_uuid: "l1", student_uuid: "s1", understanding_level: "I didn't understand.", concepts_not_understood: ["Friction"] },
  { id: "f2", daily_log_uuid: "l2", student_uuid: "s2", understanding_level: "I partially understood.", concepts_not_understood: ["Friction"] },
];
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };

// Deterministic guard cases.
const baseline = buildLearningEvidenceReport({ windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"), assignments: [assignment], logs, feedback: baseRows, eligibleStudentUuidsByClassroom: undefined });
assert(baseline.readOnly === true, "report must be read-only");
assert(baseline.findings.length === 1, "one explicitly named concept should produce one finding");
assert(baseline.findings[0].status === "insufficient_coverage", "without a verified academic-year roster, coverage status must be insufficient");
assert(baseline.findings[0].feedbackCoveragePercent === null && baseline.findings[0].eligibleStudentCount === null, "coverage must remain unknown without a verified year-linked roster");
assert(baseline.findings[0].independentAssessmentStatus === "not_connected", "assessment status must be transparent");
const offRoster = buildLearningEvidenceReport({
  windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"),
  assignments: [assignment], logs, feedback: [
    ...baseRows,
    { id: "off-roster", daily_log_uuid: "l1", student_uuid: "not-in-class-8a", class_name: "9", section_name: "A", subject_name: "Science", teacher_uuid: "t1", understanding_level: "I didn't understand.", concepts_not_understood: ["Friction"] },
  ], eligibleStudentUuidsByClassroom: undefined,
});
assert(offRoster.findings[0].distinctStudentCount === 2, "feedback recorded for another classroom must not inflate the evidence count");
assert(offRoster.findings[0].feedbackCoveragePercent === null, "coverage must not be fabricated without a verified roster");


const mismatchedClassroom = buildLearningEvidenceReport({
  windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"),
  assignments: [assignment], logs, feedback: [
    { id: "wrong-class", daily_log_uuid: "l1", student_uuid: "s9", class_name: "9", section_name: "A", subject_name: "Science", teacher_uuid: "t1", understanding_level: "I didn't understand.", concepts_not_understood: ["Friction"] },
  ],
});
assert(mismatchedClassroom.findings.length === 0, "feedback recorded against a different classroom must not be attributed to this assignment");

// 100,000 deterministic input permutations. This is a stress/property smoke
// test, not a proof of all possible program behaviour or a replacement for app tests.
let cases = 0;
for (let mask = 0; mask < 100_000; mask++) {
  const rows: LearningEvidenceFeedbackRow[] = [];
  const studentCount = mask % 5;
  const lectureCount = (Math.floor(mask / 5) % 3) + 1;
  const conceptMode = Math.floor(mask / 15) % 4;
  const coverage = Math.floor(mask / 60) % 5;
  for (let i = 0; i < studentCount; i++) {
    for (let j = 0; j < lectureCount; j++) {
      const concepts = conceptMode === 0 ? [] : conceptMode === 1 ? ["Friction"] : conceptMode === 2 ? ["  Friction  ", "Friction"] : ["Pressure"];
      rows.push({ id: `f-${mask}-${i}-${j}`, daily_log_uuid: j % 2 === 0 ? "l1" : "l2", student_uuid: `s${i}`, understanding_level: coverage === 0 ? "I was absent." : (i % 2 === 0 ? "I didn't understand." : "I completely understood."), concepts_not_understood: concepts });
    }
  }
  const result = buildLearningEvidenceReport({
    windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"),
    assignments: [assignment], logs, feedback: rows,
    eligibleStudentUuidsByClassroom: undefined,
  });
  assert(result.readOnly === true, `case ${mask}: read-only contract`);
  assert(result.coverage.feedbackRows <= rows.length, `case ${mask}: de-duplicated count cannot exceed inputs`);
  assert(result.findings.every(f => f.distinctStudentCount >= 1 && f.distinctLectureCount >= 1), `case ${mask}: findings require evidence`);
  assert(result.findings.every(f => f.feedbackCoveragePercent === null || (f.feedbackCoveragePercent >= 0 && f.feedbackCoveragePercent <= 100)), `case ${mask}: coverage bounded`);
  assert(result.findings.every(f => f.eligibleStudentCount === null && f.feedbackCoveragePercent === null), `case ${mask}: never invent roster denominator or coverage`);
  assert(result.findings.every(f => f.independentAssessmentStatus === "not_connected"), `case ${mask}: no invented assessment validation`);
  assert(result.findings.every(f => f.status !== "recurring_signal"), `case ${mask}: do not label recurring without verified roster coverage`);
  cases++;
}
console.log(`PASS: ${cases.toLocaleString()} deterministic input permutations + baseline guard cases.`);
