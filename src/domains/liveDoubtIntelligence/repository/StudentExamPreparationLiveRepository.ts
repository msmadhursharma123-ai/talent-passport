import {
  buildStudentExamPreparationResult,
  getCanonicalExamPreparationRows,
} from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";

/**
 * Compatibility read model for consumers that historically requested the
 * Student Live Exam Preparation repository directly.
 *
 * It now uses the same reconciled current-state dataset as every portal.
 */
export async function getStudentExamPreparationIntelligenceLive() {
  const rows = await getCanonicalExamPreparationRows({
    scope: "student",
  });

  const result = buildStudentExamPreparationResult(rows);

  const grouped = result.subjectBreakdown.map((subject: any) => ({
    subjectName: subject.subject,
    totalUnresolvedDoubts: subject.totalUnresolvedDoubts,
    topics: subject.topics.map((topic: any) => topic.topic),
    doubts: subject.concepts.map((concept: any) => concept.concept),
  }));

  return {
    totalUnresolvedDoubts: result.totalUnresolvedDoubts,
    topics: result.topics,
    highestRiskTopic: result.highestRiskTopic,
    attentionLevel: result.attentionLevel,
    bySubject: grouped,
    liveCalculations: rows,
  };
}
