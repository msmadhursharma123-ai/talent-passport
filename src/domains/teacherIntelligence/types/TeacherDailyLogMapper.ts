import type { TeacherDailyLog } from "./TeacherDailyLog";

export function mapTeacherDailyLog(
  data: any
): TeacherDailyLog {
  return {
    id: data.id ?? "",

    teacherAssignmentUuid:
      data.teacher_assignment_uuid ?? "",

      className:
data.class_name ?? "",

sectionName:
data.section_name ?? "",

subjectName:
data.subject_name ?? "",

    topicName:
      data.topic_name ?? "",

    pageFrom:
      data.page_from ?? null,

    pageTo:
      data.page_to ?? null,

    homeworkGiven:
      data.homework_given ?? false,

    activityConducted:
      data.activity_conducted ?? false,

    teacherNotes:
      data.teacher_notes ?? "",

    logDate:
      data.log_date ?? "",

    createdAt:
      data.created_at ?? "",

    updatedAt:
      data.updated_at ?? "",
  };
}