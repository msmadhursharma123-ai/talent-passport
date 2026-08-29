export interface SchoolWeeklyMeetingHoliday {
  date: string;
  name: string;
  source: "SCHOOL" | "GOVERNMENT" | "CBSE_REFERENCE" | "SUNDAY";
}

export interface SchoolWeeklyMeetingTeacherMetric {
  teacherUuid: string;
  teacherName: string;
  subjects: string[];
  classrooms: string[];
  expectedLogs: number;
  submittedLogs: number;
  missedLogs: number;
  feedbackEligible: number;
  feedbackResponses: number;
  feedbackRate: number | null;
  understandingRate: number | null;
  doubtsAsked: number;
  doubtsResolved: number;
  doubtClosureRate: number | null;
  classHealthPercentage: number | null;
  latePlannerCount: number;
  latestLatePlannerSubmittedAt: string | null;
  latestLatePlannerDelayMinutes: number | null;
}

export interface SchoolWeeklyMeetingInsights {
  schoolUuid: string;
  schoolName: string;
  startDate: string;
  endDate: string;
  periodLabel: string;
  workingDays: string[];
  excludedHolidays: SchoolWeeklyMeetingHoliday[];
  teachersConsidered: number;
  expectedLectureCount: number;
  submittedLectureCount: number;
  missedLectureCount: number;
  missingDailyLogTeachers: SchoolWeeklyMeetingTeacherMetric[];
  leastFeedbackTeachers: SchoolWeeklyMeetingTeacherMetric[];
  leastUnderstandingTeachers: SchoolWeeklyMeetingTeacherMetric[];
  leastDoubtClosureTeachers: SchoolWeeklyMeetingTeacherMetric[];
  delayedLessonPlannerTeachers: SchoolWeeklyMeetingTeacherMetric[];
  highestClassHealthTeachers: SchoolWeeklyMeetingTeacherMetric[];
  highestFeedbackTeachers: SchoolWeeklyMeetingTeacherMetric[];
  highestDoubtClosureTeachers: SchoolWeeklyMeetingTeacherMetric[];
}