import type {
  Subject,
  SubjectRecord,
} from "../types/subject";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapSubjectRecord(
  record: SubjectRecord
): Subject {
  return {
    id: record.id,

    organizationId:
      record.organization_id,

    curriculumId:
      record.curriculum_id,

    classId:
      record.class_id,

    sectionId:
      record.section_id,

    organizationName:
      record.organization_name ??
      "",

    curriculumName:
      record.curriculum_name ??
      "",

    className:
      record.class_name ??
      "",

    sectionName:
      record.section_name ??
      "",

    subjectCode:
      record.subject_code,

    subjectName:
      record.subject_name,

    displayOrder:
      record.display_order,

    isActive:
      record.is_active,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/* ============================================================
   DOMAIN → DATABASE
============================================================ */

export function mapSubjectToRecord(
  subject: Partial<Subject>
): Partial<SubjectRecord> {
  return {
    id: subject.id,

    organization_id:
      subject.organizationId,

    curriculum_id:
      subject.curriculumId,

    class_id:
      subject.classId,

    section_id:
      subject.sectionId,

    subject_code:
      subject.subjectCode,

    subject_name:
      subject.subjectName,

    display_order:
      subject.displayOrder,

    is_active:
      subject.isActive,
  };
}