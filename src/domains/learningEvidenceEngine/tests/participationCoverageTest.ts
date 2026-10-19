import { buildLearningEvidenceReport } from "../engine/buildLearningEvidenceReport";
import type { LearningEvidenceAssignment, LearningEvidenceFeedbackRow, LearningEvidenceLogRow } from "../types/LearningEvidenceTypes";
import { classroomRosterKey } from "../repository/EnrollmentRoster";

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
const assignment: LearningEvidenceAssignment = { id: "a1", teacher_uuid: "t1", teacher_name: "Teacher", class_name: "8", section_name: "A", subject_name: "Science", is_active: true };
const logs: LearningEvidenceLogRow[] = [
  { id: "l1", teacher_assignment_uuid: "a1", topic_name: "Force", log_date: "2026-10-01" },
  { id: "l2", teacher_assignment_uuid: "a1", topic_name: "Force", log_date: "2026-10-02" },
];
const roster = new Map([[classroomRosterKey("8", "A"), new Set(Array.from({ length: 10 }, (_, i) => `s${i + 1}`))]]);
const feedback: LearningEvidenceFeedbackRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `f${i + 1}`, daily_log_uuid: i === 1 ? "l2" : "l1", student_uuid: `s${i + 1}`,
  class_name: "8", section_name: "A", subject_name: "Science", teacher_uuid: "t1",
  understanding_level: i < 2 ? "I didn't understand." : "I completely understood.",
  concepts_not_understood: i < 2 ? ["Friction"] : [],
}));
const report = buildLearningEvidenceReport({
  windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"),
  assignments: [assignment], logs, feedback, eligibleStudentUuidsByClassroom: roster,
});
assert(report.findings.length === 1, "only the explicitly named concept should produce a finding");
assert(report.coverage.dailyLogs === 2, "coverage must count selected daily logs without implying publication status");
assert(report.findings[0].distinctStudentCount === 2, "concept evidence count must only count students naming the concept");
assert(report.findings[0].eligibleStudentCount === 10, "eligible count must come from the verified year-linked roster");
assert(report.findings[0].feedbackCoveragePercent === 100, "participation coverage must count all eligible non-absence feedback respondents, not only concept reporters");
assert(report.findings[0].status === "recurring_signal", "recurrence may be reported when concept evidence spans students/lectures and participation coverage is sufficient");
assert(!report.caveats.some((c) => c.includes("roster is unavailable")), "report must not emit a stale caveat claiming the supplied roster is unavailable");
const lowParticipation = buildLearningEvidenceReport({
  windowStart: "2026-10-01", windowEnd: "2026-10-30", generatedAt: new Date("2026-10-30T00:00:00Z"),
  assignments: [assignment], logs, feedback: feedback.slice(0, 2), eligibleStudentUuidsByClassroom: roster,
});
assert(lowParticipation.findings[0].feedbackCoveragePercent === 20, "coverage must reflect participation rather than concept-report share");
assert(lowParticipation.findings[0].status === "insufficient_coverage", "low participation must prevent a recurring-signal status");
console.log("PASS: V21 daily-log terminology/count, participation coverage, and roster caveat checks.");
