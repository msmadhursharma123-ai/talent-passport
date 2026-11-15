export interface SchoolOverviewTableRowDetailPeriod {
  startDate: string;
  endDate: string;
}

export interface SchoolOverviewTableRowDetailMetricSummary {
  totalStudents: number;
  eligibleObservations: number;
  responseObservations: number;
  absentObservations: number;
  notRespondedObservations: number;
  completeObservations: number;
  partialObservations: number;
  didntUnderstandObservations: number;
  responseRate: number;
  studentsResponded: number;
  understandingRate: number;
  partialRate: number;
  doubtRate: number;
  doubtClosureRate: number;
  doubtsRaised: number;
  doubtsResolved: number;
  doubtsUnresolved: number;
  classHealthPercentage: number;
  lectureCount: number;
  doubtsUnavailable: boolean;
}

export interface SchoolOverviewTableRowDetailTopicLog {
  logId: string;
  date: string;
  day: string;
  teacherName: string;
  topic: string;
  subtopics: string[];
}

export interface SchoolOverviewTableRowDetailDay {
  date: string;
  day: string;
  topics: SchoolOverviewTableRowDetailTopicLog[];
  hasLessons: boolean;
  metrics: SchoolOverviewTableRowDetailMetricSummary;
}

export interface SchoolOverviewTableRowDetailStudent {
  studentUuid: string;
  studentName: string;
  eligibleObservations: number;
  responseObservations: number;
  absentObservations: number;
  notRespondedObservations: number;
  completeObservations: number;
  partialObservations: number;
  didntUnderstandObservations: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  doubtRate: number;
  learningHealthPercentage: number;
  doubtsRaised: number;
  doubtsResolved: number;
  doubtClosureRate: number;
}

export interface SchoolOverviewTableRowDetailSnapshot {
  period: SchoolOverviewTableRowDetailPeriod;
  assignmentUuid: string;
  classroom: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
  overall: SchoolOverviewTableRowDetailMetricSummary;
  tableRowTotalStudents: number;
  topics: SchoolOverviewTableRowDetailTopicLog[];
  students: SchoolOverviewTableRowDetailStudent[];
  days: SchoolOverviewTableRowDetailDay[];
  doubtsUnavailable: boolean;
}
