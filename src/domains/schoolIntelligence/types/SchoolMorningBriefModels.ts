export interface SchoolMorningBriefTeacherDailyMetric {
  teacherUuid: string;
  teacherName: string;
  understandingRate: number | null;
  doubtClosureRate: number | null;
  feedbackCount: number;
  doubtsAsked: number;
  doubtsResolved: number;
}

export interface SchoolMorningBriefStudentStatusDetail {
  studentUuid: string;
  studentName: string;
  observationCount: number;
}

export interface SchoolMorningBriefDoubtDetail {
  id: string;
  studentUuid: string;
  studentName: string;
  teacherName: string;
  topic: string;
  doubt: string;
  date: string;
  resolved: boolean;
  source: "Loop 2" | "Live" | "Live reconciled";
}

export interface SchoolMorningBriefAssignmentDetail {
  assignmentId: string;
  teacherName: string;
  classroom: string;
  logsCount: number;
  learningHealth: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  doubtRate: number;
  doubtClosureRate: number;
  eligibleStudentObservations: number;
  completeStudents: SchoolMorningBriefStudentStatusDetail[];
  partialStudents: SchoolMorningBriefStudentStatusDetail[];
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[];
  responseStudents: SchoolMorningBriefStudentStatusDetail[];
  absentStudents: SchoolMorningBriefStudentStatusDetail[];
  noResponseStudents: SchoolMorningBriefStudentStatusDetail[];
  doubtDetails: SchoolMorningBriefDoubtDetail[];
}

export interface SchoolMorningBriefClassroomDetail {
  classroomKey: string;
  classroom: string;
  className: string;
  sectionName: string;
  subjectName: string;
  assignmentDetails: SchoolMorningBriefAssignmentDetail[];
}

export interface SchoolMorningBriefWeeklyDayDetail {
  date: string;
  day: string;
  logsCount: number;
  feedbackRate: number;
  understandingRate: number;
  doubtClosureRate: number;
  feedbackStudents: SchoolMorningBriefStudentStatusDetail[];
  understandingStudents: SchoolMorningBriefStudentStatusDetail[];
  partialStudents: SchoolMorningBriefStudentStatusDetail[];
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[];
  resolvedDoubtStudents: SchoolMorningBriefStudentStatusDetail[];
  unresolvedDoubtStudents: SchoolMorningBriefStudentStatusDetail[];
  doubtDetails: SchoolMorningBriefDoubtDetail[];
}

export interface SchoolMorningBriefClassroomMetric {
  classroomKey: string;
  classroom: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherNames: string[];
  responseRate: number;
  understandingRate: number;
  doubtClosureRate: number;
  combinedScore: number;
  logsCount: number;
  feedbackCount: number;
  doubtsAsked: number;
  doubtsResolved: number;
}

export interface SchoolMorningBriefDoubtClassMetric {
  key: string;
  className: string;
  sectionName: string;
  subjectName: string;
  classroom: string;
  teacherNames: string[];
  doubtRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  eligibleStudentObservations: number;
  doubtSignals: number;
  logsCount: number;
}

export interface SchoolMorningBriefMissingDailyLog {
  teacherUuid: string;
  teacherName: string;
  missedLogs: number;
  assignments: Array<{
    className: string;
    sectionName: string;
    subjectName: string;
  }>;
}

export interface SchoolMorningBrief {
  schoolUuid: string;
  schoolName: string;
  todayDate: string;
  todayDay: string;
  yesterdayDate: string;
  yesterdayDay: string;
  yesterdayLearningHealth: number | null;
  yesterdayUnderstandingRate: number | null;
  yesterdayDoubtClosureRate: number | null;
  yesterdayPartialUnderstandingRate: number | null;
  yesterdayDidntUnderstandRate: number | null;
  yesterdayDoubtRate: number | null;
  yesterdayTopDoubtClasses: SchoolMorningBriefDoubtClassMetric[];
  missingDailyLogs: SchoolMorningBriefMissingDailyLog[];
  yesterdayTeacherCount: number;
  yesterdayTeachers: SchoolMorningBriefTeacherDailyMetric[];
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  topClassrooms: SchoolMorningBriefClassroomMetric[];
  attentionClassrooms: SchoolMorningBriefClassroomMetric[];
}
