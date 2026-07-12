import type {
  SubTopic,
  SubTopicRecord,
} from "../types/subTopic";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapSubTopicRecord(
  record: SubTopicRecord
): SubTopic {

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

    topicId:
      record.topic_id,

    organizationName:
      record.organizations_master
        ?.organization_name,

    curriculumName:
      record.curriculum_master
        ?.curriculum_name,

    className:
      record.classes_master
        ?.class_name,

    sectionName:
      record.sections_master
        ?.section_name,

    subjectName:
      record.subjects_master
        ?.subject_name,

    chapterName:
      record.chapters_master
        ?.chapter_name,

    topicName:
      record.topics_master
        ?.topic_name,

    subTopicCode:
      record.subtopic_code,

    subTopicName:
      record.subtopic_name,

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

export function mapSubTopicToRecord(
  subTopic: Partial<SubTopic>
): Partial<SubTopicRecord> {

  return {

    id:
      subTopic.id,

    organization_id:
      subTopic.organizationId,

    curriculum_id:
      subTopic.curriculumId,

    class_id:
      subTopic.classId,

    section_id:
      subTopic.sectionId,

    subject_id:
      subTopic.subjectId,

    chapter_id:
      subTopic.chapterId,

    topic_id:
      subTopic.topicId,

    subtopic_code:
      subTopic.subTopicCode,

    subtopic_name:
      subTopic.subTopicName,

    display_order:
      subTopic.displayOrder,

    is_active:
      subTopic.isActive,

    created_at:
      subTopic.createdAt,

    updated_at:
      subTopic.updatedAt,

  };

}