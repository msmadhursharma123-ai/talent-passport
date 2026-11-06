export interface SchoolMorningBriefTeacherDailyMetric {
  teacherUuid: string;
  teacherName: string;
  understandingRate: number | null;
  doubtClosureRate: number | null;
  feedbackCount: number;
  doubtsAsked: number;
  doubtsResolved: number;
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
