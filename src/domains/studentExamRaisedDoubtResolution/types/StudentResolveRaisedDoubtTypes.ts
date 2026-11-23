import type { CanonicalExamPreparationRow } from "../../examPreparationIntelligence/canonical/ExamPreparationTypes";

export type StudentResolveRaisedDoubtTimeFilter = "30" | "60" | "90" | "CUSTOM";

export interface StudentResolveRaisedDoubtRange {
  subjectName?: string;
  startDate?: string;
  endDateExclusive?: string;
}

export interface StudentResolveRaisedDoubtGroup {
  key: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  rows: CanonicalExamPreparationRow[];
  dates: string[];
}

export interface StudentResolveRaisedDoubtResolution {
  canonicalRowId: string;
  pendingDoubtId: string | null;
  liveRowId: string | null;
  studentUuid: string;
  teacherAssignmentUuid: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  canonicalDate: string;
}
