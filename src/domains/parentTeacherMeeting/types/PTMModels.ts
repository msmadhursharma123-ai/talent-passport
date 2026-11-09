export type PTMTimePreset =
  | "ALL"
  | "7"
  | "14"
  | "21"
  | "30"
  | "60"
  | "90"
  | "CUSTOM";

export interface PTMDateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface PTMAssignment {
  id: string;
  teacherUuid: string;
  schoolUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  isActive: boolean;
}

export interface PTMStudent {
  studentUuid: string;
  studentName: string;
  studentId?: string;
  studentEmail?: string | null;
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName: string;
}

export interface PTMLog {
  id: string;
  teacherAssignmentUuid: string;
  logDate: string;
  topicName: string;
  conceptsCovered: string[];
  className: string;
  sectionName: string;
  subjectName: string;
}

export interface PTMFeedback {
  id: string;
  dailyLogUuid: string;
  studentUuid: string;
  submittedAt?: string | null;
  subjectName: string;
  topicName: string;
  understandingLevel: string;
  conceptsNotUnderstood: string[];
}

export interface PTMDoubt {
  id?: string;
  studentUuid: string;
  teacherAssignmentUuid: string;
  subjectName: string;
  topicName?: string | null;
  concept?: string | null;
  status?: string | null;
  isUnresolved?: boolean;
  firstSeenAt?: string | null;
}

export interface PTMSubjectMetric {
  subject: string;
  logsCount: number;
  feedbackCount: number;
  responseRate: number;
  fullyUnderstood: number;
  partiallyUnderstood: number;
  didntUnderstand: number;
  understandingPercentage: number;
  partialUnderstandingPercentage: number;
  didntUnderstandPercentage: number;
  doubtPercentage: number;
  doubtClosurePercentage: number;
  topics: string[];
  unresolvedDoubtCount: number;
  unresolvedDoubts: Array<{ topic: string; concept: string }>;
}

export interface PTMDoubtLedgerRow {
  id: string;
  studentUuid: string;
  teacherAssignmentUuid: string;
  subjectName: string;
  topicName?: string | null;
  concept?: string | null;
  status?: string | null;
  studentResponse?: string | null;
  doubtResolved?: boolean;
  /** Provenance after shared Loop-2 + Live reconciliation. Live-only rows are not part of the closure denominator. */
  source: "loop2" | "live";
  logDate: string;
}

export interface PTMPendingDoubtGroup {
  subject: string;
  count: number;
  items: Array<{
    topic: string;
    concept: string;
  }>;
}

export interface PTMReport {
  student: PTMStudent;
  teacherName: string;
  schoolName: string;
  period: PTMDateRange;
  combinedUnderstandingPercentage: number;
  combinedFullUnderstandingPercentage: number;
  combinedPartialUnderstandingPercentage: number;
  combinedDidntUnderstandPercentage: number;
  totalTopicsTaught: number;
  totalSubtopicsTaught: number;
  combinedDoubtPercentage: number;
  unresolvedDoubtCount: number;
  doubtClosurePercentage: number;
  totalLogs: number;
  totalFeedbackResponses: number;
  overallResponseRate: number;
  feedbackDays: number;
  subjects: PTMSubjectMetric[];
  pendingDoubts: PTMPendingDoubtGroup[];
  discussionPoints: string[];
  generatedAt: string;
}

export interface PTMPreparedDataset {
  teacherUuid: string;
  teacherName: string;
  schoolUuid: string;
  schoolName: string;
  assignments: PTMAssignment[];
  students: PTMStudent[];
  logs: PTMLog[];
  feedback: PTMFeedback[];
  pendingDoubts: PTMDoubt[];
  doubtLedger: PTMDoubtLedgerRow[];
}

export interface PTMEmailResult {
  success: boolean;
  alreadySent?: boolean;
  messageId?: string;
  error?: string;
}
