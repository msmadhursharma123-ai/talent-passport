export type SchoolTrendRange = 30 | 60 | 90;

export interface SchoolOverviewStats {
  activeTeachers: number;
  totalStudents: number;
  classesReporting: number;
  topicsTaught: number;
  responses: number;
  completelyUnderstood: number;
  partiallyUnderstood: number;
  didntUnderstand: number;
  understandingRate: number;
  activeDoubts: number;
  resolvedDoubts: number;
  doubtResolutionRate: number;
}

export interface SchoolClassroomHealthRow {
  assignmentUuid: string;
  classroom: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherUuid: string;
  teacherName: string;
  topicsTaught: number;
  responses: number;
  completelyUnderstood: number;
  partiallyUnderstood: number;
  didntUnderstand: number;
  understandingRate: number;
  doubtRate: number;
}

export interface SchoolTeacherIntelligenceRow {
  teacherUuid: string;
  teacherName: string;
  subjects: string[];
  classrooms: string[];
  topicsTaught: number;
  responses: number;
  understandingRate: number;
  doubtRate: number;
}

export interface SchoolAcademicTrendPoint {
  date: string;
  responses: number;
  understandingRate: number;
  doubtRate: number;
}

export interface SchoolIntelligenceSnapshot {
  schoolUuid: string;
  schoolName: string;
  stats: SchoolOverviewStats;
  classrooms: SchoolClassroomHealthRow[];
  teachers: SchoolTeacherIntelligenceRow[];
  trends: SchoolAcademicTrendPoint[];
}
