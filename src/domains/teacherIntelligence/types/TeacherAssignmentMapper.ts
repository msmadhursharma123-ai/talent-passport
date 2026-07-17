import type { TeacherAssignment } from "./TeacherAssignment";

/* ============================================================
   MAP SUPABASE ROW TO TEACHER ASSIGNMENT
============================================================ */

export function mapTeacherAssignment(
  row: any
): TeacherAssignment {
  return {
    id: row.id,

    teacherUuid: row.teacher_uuid,

    schoolUuid: row.school_uuid,

  className: row.class_name,

sectionName: row.section_name,

subjectName: row.subject_name,

    academicYear: row.academic_year,

    isActive: row.is_active,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}