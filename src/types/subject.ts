export interface Subject {
  id: string;

  organizationId: string;

  curriculumId: string;

  classId: string;

  sectionId: string;

  organizationName: string;

  curriculumName: string;

  className: string;

  sectionName: string;

  subjectCode: string;

  subjectName: string;

  displayOrder: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface SubjectRecord {
  id: string;

  organization_id: string;

  curriculum_id: string;

  class_id: string;

  section_id: string;

  organization_name?: string;

  curriculum_name?: string;

  class_name?: string;

  section_name?: string;

  subject_code: string;

  subject_name: string;

  display_order: number;

  is_active: boolean;

  created_at?: string;

  updated_at?: string;
}