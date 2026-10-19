/**
 * Learning Evidence Engine — additive, read-only first-stage contract.
 * This module intentionally contains no student trust score and makes no
 * disciplinary or consequential decisions.
 */
export type EvidenceStatus =
  | "recurring_signal"
  | "limited_signal"
  | "insufficient_coverage"
  | "conflicting_or_incomplete_data";

export type IndependentAssessmentStatus = "not_connected" | "available_but_not_evaluated";


export interface LearningEvidenceEnrollmentRow {
  student_uuid?: unknown;
  school_uuid?: unknown;
  school_academic_year_id?: unknown;
  class_name?: unknown;
  section_name?: unknown;
  status?: unknown;
}

export interface LearningEvidenceFeedbackRow {
  id?: string | number;
  daily_log_uuid: string;
  student_uuid: string;
  teacher_uuid?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  subject_name?: string | null;
  topic_name?: string | null;
  understanding_level?: string | null;
  concepts_not_understood?: unknown;
  has_doubt?: boolean | null;
  additional_note?: string | null;
  submitted_at?: string | null;
  school_uuid?: string | null;
  academic_year_id?: string | null;
}

export interface LearningEvidenceLogRow {
  id: string | number;
  teacher_assignment_uuid: string | number;
  topic_name?: string | null;
  concepts_covered?: unknown;
  log_date?: string | null;
  created_at?: string | null;
  academic_year_id?: string | null;
}

export interface LearningEvidenceAssignment {
  id: string | number;
  teacher_uuid: string;
  teacher_name: string;
  class_name: string;
  section_name: string;
  subject_name: string;
  is_active?: boolean | null;
}

export interface LearningEvidenceFinding {
  key: string;
  className: string;
  sectionName: string;
  subjectName: string;
  topicName: string;
  concept: string;
  distinctStudentCount: number;
  distinctLectureCount: number;
  feedbackCount: number;
  eligibleStudentCount: number | null;
  feedbackCoveragePercent: number | null;
  firstObservedDate: string | null;
  lastObservedDate: string | null;
  status: EvidenceStatus;
  independentAssessmentStatus: IndependentAssessmentStatus;
  evidence: string[];
  limitations: string[];
}

export interface LearningEvidenceReport {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  source: "student_daily_feedback + teacher_daily_logs + teacher_classroom_assignments";
  readOnly: true;
  independentAssessmentStatus: IndependentAssessmentStatus;
  findings: LearningEvidenceFinding[];
  coverage: {
    eligibleRosterStatus: "verified" | "unavailable";
    assignments: number;
    dailyLogs: number;
    feedbackRows: number;
    distinctStudentsWithFeedback: number;
    distinctLecturesWithFeedback: number;
  };
  caveats: string[];
}


/** Individual, source-linked Loop 1 feedback evidence for a finding. Names are display labels only; roster eligibility remains enrollment-ledger based. */
export interface LearningEvidenceStudentDetail {
  studentUuid: string;
  studentName: string;
  date: string | null;
  understandingLevel: string;
  hasDoubt: boolean | null;
  additionalNote: string;
  feedbackId: string;
  dailyLogId: string;
}
export type LearningEvidenceReportWithStudentDetails = LearningEvidenceReport & { studentDetailsByFinding: Record<string, LearningEvidenceStudentDetail[]> };
