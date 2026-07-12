/* ============================================================
   TOPIC
============================================================ */

export interface Topic {

  id: string;

  organizationId: string;

  curriculumId: string;

  classId: string;

  sectionId: string;

  subjectId: string;

  chapterId: string;

  organizationName: string;

  curriculumName: string;

  className: string;

  sectionName: string;

  subjectName: string;

  chapterName: string;

  topicCode: string;

  topicName: string;

  displayOrder: number;

  isActive: boolean;

  createdBy?: string;

  updatedBy?: string;

  createdAt: string;

  updatedAt: string;

}

/* ============================================================
   DATABASE RECORD
============================================================ */

export interface TopicRecord {

  id: string;

  organization_id: string;

  curriculum_id: string;

  class_id: string;

  section_id: string;

  subject_id: string;

  chapter_id: string;

  organization_name?: string;

  curriculum_name?: string;

  class_name?: string;

  section_name?: string;

  subject_name?: string;

  chapter_name?: string;

  topic_code: string;

  topic_name: string;

  display_order: number;

  is_active: boolean;

  created_by?: string;

  updated_by?: string;

  created_at: string;

  updated_at: string;

}