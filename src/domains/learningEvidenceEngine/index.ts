export { getSchoolLearningEvidenceReport } from "./repository/LearningEvidenceRepository";
export type { LearningEvidenceReportOptions } from "./repository/LearningEvidenceRepository";
export { buildLearningEvidenceReport } from "./engine/buildLearningEvidenceReport";
export type {
  EvidenceStatus,
  IndependentAssessmentStatus,
  LearningEvidenceAssignment,
  LearningEvidenceFeedbackRow,
  LearningEvidenceFinding,
  LearningEvidenceLogRow,
  LearningEvidenceReport,
} from "./types/LearningEvidenceTypes";

export { resolveCurrentAcademicYear } from "./repository/CurrentAcademicYearGuard";
