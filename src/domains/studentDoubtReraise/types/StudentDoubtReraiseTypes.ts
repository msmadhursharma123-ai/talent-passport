export interface StudentDoubtReraiseRecord {
  id: string;
  student_uuid: string;
  school_uuid: string;
  teacher_uuid: string | null;
  teacher_assignment_uuid: string;
  class_name: string | null;
  section_name: string | null;
  subject_name: string;
  topic_name: string;
  subtopic_name: string;
  reraised_at: string;
  created_at: string;
  updated_at: string;
  source_type: "loop2" | "live" | "monthly" | null;
  source_live_id: string | null;
  source_feedback_id: string | null;
}

export interface StudentDoubtReraiseInsert {
  student_uuid: string;
  school_uuid: string;
  teacher_uuid: string | null;
  teacher_assignment_uuid: string;
  class_name: string | null;
  section_name: string | null;
  subject_name: string;
  topic_name: string;
  subtopic_name: string;
  source_type: "loop2" | "live" | "monthly" | null;
  source_live_id: string | null;
  source_feedback_id: string | null;
}

export interface StudentReraiseCandidate {
  id: string;
  studentUuid: string;
  teacherUuid: string | null;
  teacherAssignmentUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  canonicalDate: string;
  sourceType: "loop2" | "live" | "monthly";
  sourceLiveId: string | null;
  sourceFeedbackId: string | null;
}
