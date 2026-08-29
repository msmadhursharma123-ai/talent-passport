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
  responseRate: number;
  understandingRate: number;
  doubtClosureRate: number;
  combinedScore: number;
  logsCount: number;
  feedbackCount: number;
  doubtsAsked: number;
  doubtsResolved: number;
}

export interface SchoolMorningBrief {
  schoolUuid: string;
  schoolName: string;
  todayDate: string;
  todayDay: string;
  yesterdayDate: string;
  yesterdayDay: string;
  yesterdayLearningHealth: number | null;
  yesterdayDoubtClosureRate: number | null;
  yesterdayTeacherCount: number;
  yesterdayTeachers: SchoolMorningBriefTeacherDailyMetric[];
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  topClassrooms: SchoolMorningBriefClassroomMetric[];
  attentionClassrooms: SchoolMorningBriefClassroomMetric[];
}
