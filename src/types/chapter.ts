export interface ChapterRecord {
  id: string;

  organization_id: string;

  curriculum_id: string;

  class_id: string;

  section_id: string;

  subject_id: string;

  organization_name?: string;

  curriculum_name?: string;

  class_name?: string;

  section_name?: string;

  subject_name?: string;

  chapter_code: string;

  chapter_name: string;

  display_order: number;

  is_active: boolean;

  created_by?: string;

  updated_by?: string;

  created_at?: string;

  updated_at?: string;
}

export interface Chapter {
  id: string;

  organizationId: string;

  curriculumId: string;

  classId: string;

  sectionId: string;

  subjectId: string;

  organizationName?: string;

  curriculumName?: string;

  className?: string;

  sectionName?: string;

  subjectName?: string;

  chapterCode: string;

  chapterName: string;

  displayOrder: number;

  isActive: boolean;

  createdBy?: string;

  updatedBy?: string;

  createdAt?: string;

  updatedAt?: string;
}