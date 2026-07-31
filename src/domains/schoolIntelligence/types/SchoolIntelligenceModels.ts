export type SchoolTrendRange = 30 | 60 | 90;
export type SchoolIntelligenceRange = SchoolTrendRange | "custom";

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
  partialUnderstandingRate: number;
  doubtRate: number;
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
  responseRate: number;
  completelyUnderstood: number;
  partiallyUnderstood: number;
  didntUnderstand: number;
  understandingRate: number;
  partialUnderstandingRate: number;
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
  partialUnderstandingRate: number;
  doubtRate: number;
}

export interface SchoolAcademicTrendPoint {
  date: string;
  responses: number;
  understandingRate: number;
  partialUnderstandingRate: number;
  doubtRate: number;
}


export interface SchoolDailyClassroomIntelligenceRow {
  assignmentUuid:string; teacherUuid:string; teacherName:string;
  classroom:string; className:string; sectionName:string; subjectName:string;
  latestLectureUuid:string; latestLectureDate:string; latestTopic:string;
  totalStudents:number; feedbackSubmitted:number; feedbackRemaining:number;
  completelyUnderstood:number; completelyUnderstoodRate:number;
  partiallyUnderstood:number; partiallyUnderstoodRate:number;
  didntUnderstand:number; didntUnderstandRate:number;
  classHealthScore:number; classHealthStatus:string;
  mostDifficultConcept:string; studentsRequiringAttention:string[];
}
export interface SchoolTeacherDailyIntelligence {
  teacherUuid:string; teacherName:string;
  classrooms:SchoolDailyClassroomIntelligenceRow[];
}


export interface SchoolTeacherLiveLecture {
  logUuid:string; assignmentUuid:string; className:string; sectionName:string;
  classroom:string; subjectName:string; topicName:string; conceptsCovered:string[];
  pageFrom:number|null; pageTo:number|null; homeworkGiven:boolean;
  activityConducted:boolean; teacherNotes:string; logDate:string; createdAt:string;
}
export interface SchoolTeacherLiveStatus {
  teacherUuid:string; teacherName:string; subjects:string[]; classrooms:string[];
  isPresentToday:boolean; todayLogCount:number; lastActivityAt:string;
  todayLectures:SchoolTeacherLiveLecture[];
}

export interface SchoolIntelligenceSnapshot {
  schoolUuid: string;
  schoolName: string;
  stats: SchoolOverviewStats;
  classrooms: SchoolClassroomHealthRow[];
  teachers: SchoolTeacherIntelligenceRow[];
  trends: SchoolAcademicTrendPoint[];
  dailyClassroomIntelligence: SchoolTeacherDailyIntelligence[];
  teacherLiveStatus: SchoolTeacherLiveStatus[];
  examPreparation: SchoolExamPreparationClassroom[];
}


export interface SchoolExamPreparationStudent {
  studentUuid:string; studentName:string; totalUnresolvedDoubts:number;
  topics:string[]; highestRiskTopic:string; attentionLevel:"HIGH"|"MEDIUM"|"LOW";
}
export interface SchoolExamPreparationSubject {
  assignmentUuid:string; subjectName:string; teacherUuid:string; teacherName:string;
  students:SchoolExamPreparationStudent[]; totalStudentsWithUnresolvedDoubts:number;
  doubtsPerKid:number; commonDoubts:string[];
}
export interface SchoolExamPreparationClassroom {
  classroomKey:string; classroom:string; className:string; sectionName:string;
  subjects:SchoolExamPreparationSubject[];
}
