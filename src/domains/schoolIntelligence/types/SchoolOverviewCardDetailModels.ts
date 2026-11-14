export type SchoolOverviewCardKey =
  | "understanding"
  | "activeDoubts"
  | "doubtClosure"
  | "responses"
  | "topicsTaught"
  | "activeTeachers"
  | "classesReporting"
  | "students";

export interface SchoolOverviewCardDetailPeriod {
  startDate: string;
  endDate: string;
}

export interface SchoolOverviewStudentContribution {
  studentUuid: string;
  studentName: string;
  eligibleObservations: number;
  responseObservations: number;
  completeObservations: number;
  partialObservations: number;
  didntUnderstandObservations: number;
  fullUnderstandingRate: number;
  healthContributionRate: number;
}

export interface SchoolOverviewAssignmentUnderstandingDetail {
  assignmentUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
  logsCount: number;
  eligibleStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  understandingRate: number;
  healthPercentage: number;
  students: SchoolOverviewStudentContribution[];
}

export interface SchoolOverviewUnderstandingSubjectGroup {
  className: string;
  sectionName: string;
  subjectName: string;
  assignmentUuids: string[];
  teacherNames: string[];
  logsCount: number;
  eligibleStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  understandingRate: number;
  healthPercentage: number;
  students: SchoolOverviewStudentContribution[];
}

export interface SchoolOverviewUnderstandingClassGroup {
  className: string;
  sectionName: string;
  logsCount: number;
  eligibleStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  understandingRate: number;
  healthPercentage: number;
  subjects: SchoolOverviewUnderstandingSubjectGroup[];
}

export interface SchoolOverviewUnderstandingDetail {
  cardValue: number;
  classSectionCount: number;
  eligibleStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  assignments: SchoolOverviewAssignmentUnderstandingDetail[];
  classGroups: SchoolOverviewUnderstandingClassGroup[];
}

export interface SchoolOverviewDoubtDetailRow {
  id: string;
  studentUuid: string;
  studentName: string;
  teacherName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  topic: string;
  subtopic: string;
  raisedDate: string;
  status: string;
  studentResponse: string;
  resolved: boolean;
}

export interface SchoolOverviewDoubtSubjectGroup {
  className: string;
  sectionName: string;
  subjectName: string;
  teacherNames: string[];
  doubtCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  rows: SchoolOverviewDoubtDetailRow[];
}

export interface SchoolOverviewDoubtClassGroup {
  className: string;
  sectionName: string;
  doubtCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  subjects: SchoolOverviewDoubtSubjectGroup[];
}

export interface SchoolOverviewResponseStudentRow {
  studentUuid: string;
  studentName: string;
  response: string;
}

export interface SchoolOverviewResponseSubjectGroup {
  assignmentUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherNames: string[];
  students: SchoolOverviewResponseStudentRow[];
}

export interface SchoolOverviewResponseDetail {
  cardValue: number;
  submittedLearningResponses: number;
  absentFeedbackObservations: number;
  days: SchoolOverviewResponseDayGroup[];
}

export interface SchoolOverviewResponseDayGroup {
  date: string;
  day: string;
  groups: SchoolOverviewResponseSubjectGroup[];
}

export interface SchoolOverviewTopicLogRow {
  logId: string;
  date: string;
  day: string;
  teacherName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  topic: string;
  subtopics: string[];
}

export interface SchoolOverviewTopicDayGroup {
  date: string;
  day: string;
  groups: Array<{
    assignmentUuid: string;
    className: string;
    sectionName: string;
    subjectName: string;
    teacherName: string;
    logs: SchoolOverviewTopicLogRow[];
  }>;
}

export interface SchoolOverviewTopicSubjectGroup {
  className: string;
  sectionName: string;
  subjectName: string;
  assignmentUuids: string[];
  teacherNames: string[];
  logsCount: number;
  logs: SchoolOverviewTopicLogRow[];
}

export interface SchoolOverviewTopicClassGroup {
  className: string;
  sectionName: string;
  logsCount: number;
  subjects: SchoolOverviewTopicSubjectGroup[];
}

export interface SchoolOverviewTeacherDetailRow {
  teacherUuid: string;
  teacherName: string;
  assignments: Array<{
    assignmentUuid: string;
    className: string;
    sectionName: string;
    subjectName: string;
  }>;
  expectedLogs: number;
  submittedLogs: number;
  missedLogs: number;
  classHealthPercentage: number | null;
  rank: number | null;
}

export interface SchoolOverviewClassDetailRow {
  className: string;
  sectionName: string;
}

export interface SchoolOverviewStudentGroup {
  className: string;
  sectionName: string;
  students: Array<{
    studentUuid: string;
    studentName: string;
  }>;
}

export interface SchoolOverviewCardDetailSnapshot {
  period: SchoolOverviewCardDetailPeriod;
  understanding: SchoolOverviewUnderstandingDetail;
  activeDoubts: SchoolOverviewDoubtDetailRow[];
  activeDoubtGroups: SchoolOverviewDoubtClassGroup[];
  doubtClosure: SchoolOverviewDoubtDetailRow[];
  doubtClosureGroups: SchoolOverviewDoubtClassGroup[];
  responses: SchoolOverviewResponseDetail;
  topicsTaught: SchoolOverviewTopicDayGroup[];
  topicClassSectionCount: number;
  topicClassGroups: SchoolOverviewTopicClassGroup[];
  activeTeachers: SchoolOverviewTeacherDetailRow[];
  classesReporting: SchoolOverviewClassDetailRow[];
  students: SchoolOverviewStudentGroup[];
  doubtsLoadFailed: boolean;
}
