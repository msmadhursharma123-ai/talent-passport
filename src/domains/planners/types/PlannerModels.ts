export type PlannerType = "lesson" | "unit_test" | "exam_paper" | "worksheet";
export type PlannerStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface TeacherAssignmentOption {
  id: string;
  className: string;
  sectionName: string;
  subjectName: string;
  academicYear?: string;
}

export interface LessonBlock {
  id: string;
  type: "date" | "day" | "chapter" | "topic" | "subtopics" | "notes" | "image";
  value?: string;
  imageDataUrl?: string;
  imageName?: string;
}

export type QuestionType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "MATCH_COLUMNS"
  | "FILL_BLANK"
  | "TRUE_FALSE"
  | "IMAGE_BASED"
  | "UNSEEN_PASSAGE";

export interface MatchColumnItem {
  id: string;
  text: string;
}

export interface PassageQuestion {
  id: string;
  question: string;
  marks: number;
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
  options?: string[];
  /** Full sentence/passage before blanking. */
  fillSentence?: string;
  /** Exact word/phrase(s) removed from fillSentence. */
  blanks?: string[];
  statements?: string[];
  columnA?: MatchColumnItem[];
  columnB?: MatchColumnItem[];
  imageDataUrl?: string;
  imageName?: string;
  imageInstruction?: string;
  passage?: string;
  passageQuestions?: PassageQuestion[];
}

export interface LessonPlannerPayload {
  /** Exact case-sensitive chapter used for cross-school recommendations. */
  chapter?: string;
  blocks: LessonBlock[];
}

export interface QuestionPaperPayload {
  schoolName: string;
  totalMarks: number;
  timeAllowed: string;
  /** Single chapter for worksheets; retained optional for backward compatibility. */
  chapter?: string;
  /** Multiple exact case-sensitive chapters for unit tests and exam papers. */
  chapters?: string[];
  questions: QuestionItem[];
}

export interface PlannerRecommendation extends PlannerRecord {
  matchCount?: number;
  matchPercent?: number;
}

export interface PlannerRecord {
  id: string;
  schoolUuid: string;
  teacherUuid: string;
  teacherName: string;
  plannerType: PlannerType;
  title: string;
  templateKey: string;
  className: string;
  sectionName: string;
  subjectName: string;
  startDate: string;
  endDate: string;
  payload: LessonPlannerPayload | QuestionPaperPayload;
  status: PlannerStatus;
  reviewNote: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
