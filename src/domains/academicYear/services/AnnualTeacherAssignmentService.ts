import { getSupabaseClient } from "../../../supabaseClient";
import { createTeacherAssignment } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import type { TeacherAssignment } from "../../teacherIntelligence/types/TeacherAssignment";

/**
 * Normal teacher assignment behavior remains untouched. This file contains
 * only the annual-onboarding path.
 */
export async function createAnnualTeacherAssignment(
  assignment: Partial<TeacherAssignment>
) {
  try {
    return await createTeacherAssignment(assignment);
  } catch (error: any) {
    if (String(error?.code ?? "") !== "23505") throw error;

    const supabase: any = getSupabaseClient();
    if (!supabase) throw error;

    const { data, error: occupancyError } = await supabase.rpc(
      "get_my_teacher_assignment_occupancy",
      {
        p_school_uuid: assignment.schoolUuid,
        p_academic_year_code: assignment.academicYear,
        p_class_name: assignment.className,
        p_section_name: assignment.sectionName,
        p_subject_name: assignment.subjectName,
      }
    );

    if (
      !occupancyError &&
      Array.isArray(data) &&
      data.some((row: any) => row.teacher_uuid === assignment.teacherUuid)
    ) {
      return true;
    }

    throw new Error("This classroom has already been assigned to another teacher.");
  }
}

/**
 * Atomic annual questionnaire save. The complete selection set is sent to a
 * single database transaction so a multi-class questionnaire can never leave
 * a half-written target-year assignment set because one later selection
 * failed.
 */
export async function saveAnnualTeacherAssignments(input: {
  academicYearId: string;
  assignments: Array<{
    className: string;
    sectionName: string;
    subjectName: string;
  }>;
}) {
  const supabase: any = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const payload = input.assignments.map((assignment) => ({
    class_name: assignment.className,
    section_name: assignment.sectionName,
    subject_name: assignment.subjectName,
  }));

  const { data, error } = await supabase.rpc(
    "save_teacher_academic_year_assignments",
    {
      p_school_academic_year_id: input.academicYearId,
      p_assignments: payload,
    }
  );

  if (error) throw error;
  return Number(data ?? 0);
}
