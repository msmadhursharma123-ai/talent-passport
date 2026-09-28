export type MonthlyReviewResponseState = "RESOLVED" | "UNRESOLVED";
export type MonthlyReviewCycleStatus = "PENDING" | "PRESENTED" | "COMPLETED";

export interface MonthlyLearningReviewCycle {
  id: string;
  studentUuid: string;
  schoolUuid: string;
  academicYearId: string | null;
  reviewMonth: string;
  periodStart: string;
  periodEnd: string;
  status: MonthlyReviewCycleStatus;
  presentedAt: string | null;
  completedAt: string | null;
}

export interface MonthlyLearningReviewItem {
  id: string;
  cycleId: string;
  studentUuid: string;
  teacherUuid: string | null;
  teacherName: string;
  teacherAssignmentUuid: string;
  dailyLogUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  topicName: string;
  conceptName: string;
  logDate: string;
  learningIdentityKey: string;
  sourceType?: "TEACHER_LOG" | "LIVE";
  sourceLiveId?: string | null;
  sourceFeedbackId?: string | null;
  responseState?: MonthlyReviewResponseState | null;
}

export interface MonthlyLearningReviewState {
  cycle: MonthlyLearningReviewCycle | null;
  items: MonthlyLearningReviewItem[];
  pending: boolean;
}

export interface MonthlyOverlayRow {
  id: string;
  studentUuid: string;
  studentName: string;
  teacherUuid: string | null;
  teacherName: string;
  teacherAssignmentUuid: string;
  dailyLogUuid: string | null;
  className: string;
  sectionName: string;
  subjectName: string;
  topicName: string;
  conceptName: string;
  canonicalDate: string;
  isUnresolved: boolean;
  sourceLiveId: string | null;
  sourceMonthlyItemId: string | null;
  sourceProjectionId: string | null;
  learningIdentityKey: string;
  responseState: MonthlyReviewResponseState;
}

export interface StudentDailyVerificationRow extends MonthlyOverlayRow {
  doubtText: string;
}
