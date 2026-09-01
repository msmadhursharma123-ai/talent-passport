export type StudentStarPerformerTimeline =
  | "MONTH"
  | "LAST_30_DAYS"
  | "LAST_60_DAYS"
  | "LAST_90_DAYS"
  | "LAST_120_DAYS"
  | "CUSTOM";

export interface StudentStarPerformerClassroom {
  key: string;
  className: string;
  sectionName: string;
  label: string;
}

export interface StudentStarPerformerRow {
  rank: 1 | 2;
  studentUuid: string;
  studentName: string;
  className: string;
  sectionName: string;
  dailyFeedbackCredits: number;
  submittedFeedbackCount: number;
  missedFeedbackCount: number;
}

export interface StudentStarPerformerResult {
  startDate: string;
  endDate: string;
  classroomFilter: string;
  rows: StudentStarPerformerRow[];
  classrooms: StudentStarPerformerClassroom[];
  studentCount: number;
  calculatedAt: string;
}

export interface StudentStarPerformerSourceData {
  schoolUuid: string;
  students: Array<{
    student_uuid: string;
    student_name: string;
    school_uuid: string;
    class_name: string | null;
    section_name: string | null;
  }>;
  assignments: Array<{
    id: string;
    teacher_uuid: string | null;
    school_uuid: string;
    class_name: string | null;
    section_name: string | null;
    subject_name: string | null;
  }>;
  logs: Array<{
    id: string;
    teacher_assignment_uuid: string;
    log_date: string | null;
    class_name: string;
    section_name: string;
  }>;
  feedback: Array<{
    id: string;
    daily_log_uuid: string;
    student_uuid: string;
    submitted_at?: string | null;
  }>;
}
