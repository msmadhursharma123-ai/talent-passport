import type {
  Chapter,
  ChapterRecord,
} from "../types/chapter";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapChapterRecord(
  record: ChapterRecord
): Chapter {
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

    subjectId:
      record.subject_id,

    organizationName:
      record.organization_name ?? "",

    curriculumName:
      record.curriculum_name ?? "",

    className:
      record.class_name ?? "",

    sectionName:
      record.section_name ?? "",

    subjectName:
      record.subject_name ?? "",

    chapterCode:
      record.chapter_code,

    chapterName:
      record.chapter_name,

    displayOrder:
      record.display_order,

    isActive:
      record.is_active,

    createdBy:
      record.created_by,

    updatedBy:
      record.updated_by,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/* ============================================================
   DOMAIN → DATABASE
============================================================ */

export function mapChapterToRecord(
  chapter: Partial<Chapter>
): Partial<ChapterRecord> {
  return {
    id: chapter.id,

    organization_id:
      chapter.organizationId,

    curriculum_id:
      chapter.curriculumId,

    class_id:
      chapter.classId,

    section_id:
      chapter.sectionId,

    subject_id:
      chapter.subjectId,

    organization_name:
      chapter.organizationName,

    curriculum_name:
      chapter.curriculumName,

    class_name:
      chapter.className,

    section_name:
      chapter.sectionName,

    subject_name:
      chapter.subjectName,

    chapter_code:
      chapter.chapterCode,

    chapter_name:
      chapter.chapterName,

    display_order:
      chapter.displayOrder,

    is_active:
      chapter.isActive,

    created_by:
      chapter.createdBy,

    updated_by:
      chapter.updatedBy,

    created_at:
      chapter.createdAt,

    updated_at:
      chapter.updatedAt,
  };
}