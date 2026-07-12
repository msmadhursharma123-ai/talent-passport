import type {
  Topic,
  TopicRecord,
} from "../types/topic";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapTopicRecord(
  record: TopicRecord
): Topic {

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

    chapterId:
      record.chapter_id,

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

    subjectName:
      record.subject_name ??
      "",

    chapterName:
      record.chapter_name ??
      "",

    topicCode:
      record.topic_code,

    topicName:
      record.topic_name,

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

export function mapTopicToRecord(
  topic: Partial<Topic>
): Partial<TopicRecord> {

  return {

    organization_id:
      topic.organizationId,

    curriculum_id:
      topic.curriculumId,

    class_id:
      topic.classId,

    section_id:
      topic.sectionId,

    subject_id:
      topic.subjectId,

    chapter_id:
      topic.chapterId,

    topic_code:
      topic.topicCode,

    topic_name:
      topic.topicName,

    display_order:
      topic.displayOrder,

    is_active:
      topic.isActive,

    created_by:
      topic.createdBy,

    updated_by:
      topic.updatedBy,

  };

}