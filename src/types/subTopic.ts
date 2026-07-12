export interface SubTopic {

  id: string;

  organizationId: string;

  curriculumId: string;

  classId: string;

  sectionId: string;

  subjectId: string;

  chapterId: string;

  topicId: string;

  organizationName?: string;

  curriculumName?: string;

  className?: string;

  sectionName?: string;

  subjectName?: string;

  chapterName?: string;

  topicName?: string;

  subTopicCode: string;

  subTopicName: string;

  displayOrder: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

}

export interface SubTopicRecord {

  id: string;

  organization_id: string;

  curriculum_id: string;

  class_id: string;

  section_id: string;

  subject_id: string;

  chapter_id: string;

  topic_id: string;

  subtopic_code: string;

  subtopic_name: string;

  display_order: number;

  is_active: boolean;

  created_at?: string;

  updated_at?: string;

  organizations_master?: {

    organization_name: string;

  };

  curriculum_master?: {

    curriculum_name: string;

  };

  classes_master?: {

    class_name: string;

  };

  sections_master?: {

    section_name: string;

  };

  subjects_master?: {

    subject_name: string;

  };

  chapters_master?: {

    chapter_name: string;

  };

  topics_master?: {

    topic_name: string;

  };

}