export type ExamPreparationScope = "student" | "teacher" | "school";

export interface ExamPreparationDateRange {
  startDate?: string;
  endDateExclusive?: string;
}

export interface CanonicalExamPreparationOptions extends ExamPreparationDateRange {
  scope: ExamPreparationScope;
  studentUuid?: string;
  teacherAssignmentIds?: string[];
  schoolUuid?: string;
  subjectName?: string;
  activeAssignmentsOnly?: boolean;
}

export interface CanonicalExamPreparationRow {
  id: string;
  studentUuid: string;
  studentName: string;
  teacherUuid: string | null;
  teacherAssignmentUuid: string;
  dailyLogUuid: string | null;
  className: string;
  sectionName: string;
  subjectName: string;
  topicName: string;
  conceptName: string;
  canonicalDate: string;
  isUnresolved: true;
  source: "loop2" | "live";
  sourceFeedbackId: string | null;
  liveRowId: string | null;
}

export interface ExamPreparationStudentResult {
  studentUuid: string;
  studentName: string;
  totalUnresolvedDoubts: number;
  topics: string[];
  subtopics: string[];
  highestRiskTopic: string;
  attentionLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface ExamPreparationClassroomResult {
  classroom: string;
  students: ExamPreparationStudentResult[];
}

export interface SchoolExamPreparationStudentResult
  extends ExamPreparationStudentResult {}

export interface SchoolExamPreparationSubjectResult {
  assignmentUuid: string;
  subjectName: string;
  teacherUuid: string;
  teacherName: string;
  students: SchoolExamPreparationStudentResult[];
  totalStudentsWithUnresolvedDoubts: number;
  doubtsPerKid: number;
  commonDoubts: string[];
}

export interface SchoolExamPreparationClassroomResult {
  classroomKey: string;
  classroom: string;
  className: string;
  sectionName: string;
  subjects: SchoolExamPreparationSubjectResult[];
}
