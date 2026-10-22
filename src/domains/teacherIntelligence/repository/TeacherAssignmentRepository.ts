import { getSupabaseClient } from "../../../supabaseClient";

import type { TeacherAssignment } from "../types/TeacherAssignment";
import { mapTeacherAssignment } from "../types/TeacherAssignmentMapper";

const TABLE_NAME = "teacher_classroom_assignments";

/*
=========================================================
GET ALL ASSIGNMENTS
=========================================================
*/

export async function getTeacherAssignments(): Promise<
  TeacherAssignment[]
> {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeacherAssignment);
}

/*
=========================================================
GET ASSIGNMENTS BY TEACHER
=========================================================
*/

export function filterTeacherAssignmentsToSchool(
  assignments: TeacherAssignment[],
  schoolUuid?: string | null
): TeacherAssignment[] {
  const school = String(schoolUuid ?? "").trim();
  if (!school) return assignments ?? [];
  return (assignments ?? []).filter(
    (assignment) => String(assignment.schoolUuid ?? "").trim() === school
  );
}

/**
 * Current operational assignments for a teacher.
 * Ended assignments remain in the database for audit/history, but must not
 * appear in current classroom selectors, daily-log forms, or active dashboards.
 */
export async function getTeacherAssignmentsByTeacher(
  teacherUuid: string
): Promise<TeacherAssignment[]> {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("teacher_uuid", teacherUuid)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeacherAssignment);
}

/**
 * Historical/audit assignments, including ended rows. Use only for screens
 * that intentionally need to display prior assignment context for old records.
 */
export async function getAllTeacherAssignmentsByTeacher(
  teacherUuid: string
): Promise<TeacherAssignment[]> {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("teacher_uuid", teacherUuid)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeacherAssignment);
}

/*
=========================================================
CREATE ASSIGNMENT
=========================================================
*/

export async function createTeacherAssignment(
  assignment: Partial<TeacherAssignment>
) {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([
{
teacher_uuid:
assignment.teacherUuid,

school_uuid:
assignment.schoolUuid,

class_name:
assignment.className,

section_name:
assignment.sectionName,

subject_name:
assignment.subjectName,

academic_year:
assignment.academicYear,

is_active:
assignment.isActive,

},
]);



  if (error) {

if (
error.code === "23505"
){

throw new Error(
"This classroom has already been assigned to another teacher."
);

}

throw error;

}

  return true;
}

/*
=========================================================
UPDATE ASSIGNMENT
=========================================================
*/

export async function updateTeacherAssignment(
  id: string,
  assignment: Partial<TeacherAssignment>
) {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

const { data: existingAssignment } = await supabase
.from(TABLE_NAME)
.select("id")
.eq(
    "school_uuid",
    assignment.schoolUuid
)
.eq(
    "academic_year",
    assignment.academicYear
)
.eq(
    "class_name",
    assignment.className
)
.eq(
    "section_name",
    assignment.sectionName
)
.eq(
    "subject_name",
    assignment.subjectName
)
.maybeSingle();


if (existingAssignment) {

throw new Error(

`A teacher profile already exists for:

School
Class ${assignment.className}
Section ${assignment.sectionName}
Subject ${assignment.subjectName}

Please select another classroom assignment.`

);

}

  const { error } = await supabase
    .from(TABLE_NAME)
    .update(assignment)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/*
=========================================================
DELETE ASSIGNMENT
=========================================================
*/

export async function deleteTeacherAssignment(
  id: string
) {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/*
=========================================================
ACTIVATE / DEACTIVATE
=========================================================
*/

export async function setAssignmentStatus(
  id: string,
  isActive: boolean
) {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function getTeacherAssignmentsForCurrentTeacher(
teacherUuid: string
) {

return getTeacherAssignmentsByTeacher(
teacherUuid
);

}

/*
=========================================================
CREATE MULTIPLE ASSIGNMENTS — ADDITIVE MULTI-SUBJECT PATH
---------------------------------------------------------
The existing createTeacherAssignment() function is intentionally untouched.
This helper is used only when a teacher selects more than one subject during
onboarding. Each row remains an independent assignment keyed by:
school + academic year + subject + class + section.
=========================================================
*/

export async function createTeacherAssignments(
  assignments: Array<Partial<TeacherAssignment>>
) {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  if (!assignments.length) {
    return true;
  }

  const payload = assignments.map((assignment) => ({
    teacher_uuid: assignment.teacherUuid,
    school_uuid: assignment.schoolUuid,
    class_name: assignment.className,
    section_name: assignment.sectionName,
    subject_name: assignment.subjectName,
    academic_year: assignment.academicYear,
    is_active: assignment.isActive,
  }));

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert(payload);

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "This classroom has already been assigned to another teacher."
      );
    }

    throw error;
  }

  return true;
}

/*
=========================================================
GET ASSIGNMENTS BY TEACHER + SUBJECT
---------------------------------------------------------
Optional additive helper for subject-aware teacher portal consumers.
Existing getTeacherAssignmentsByTeacher() remains unchanged.
=========================================================
*/

export async function getTeacherAssignmentsByTeacherAndSubject(
  teacherUuid: string,
  subjectName: string
): Promise<TeacherAssignment[]> {
  const supabase: any = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("teacher_uuid", teacherUuid)
    .eq("subject_name", subjectName)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeacherAssignment);
}

/*
=========================================================
SCHOOL ADMIN ASSIGNMENT HANDOVER — AUTHORIZED DATABASE RPCs
---------------------------------------------------------
These operations never delete or rewrite the previous assignment identity.
The database validates school-admin access, active academic year, and performs
transfer as one transaction. Do not replace these with direct table updates.
=========================================================
*/

export async function endTeacherClassroomAssignment(
  assignmentId: string,
  reason: string
): Promise<string> {
  const supabase: any = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const { data, error } = await supabase.rpc("end_teacher_classroom_assignment", {
    p_assignment_id: assignmentId,
    p_reason: reason,
  });
  if (error) throw error;
  if (!data) throw new Error("The database did not confirm that the assignment ended.");
  return String(data);
}

export async function transferTeacherClassroomAssignment(
  assignmentId: string,
  replacementTeacherUuid: string,
  reason: string
): Promise<string> {
  const supabase: any = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");

  const { data, error } = await supabase.rpc("transfer_teacher_classroom_assignment", {
    p_assignment_id: assignmentId,
    p_replacement_teacher_uuid: replacementTeacherUuid,
    p_reason: reason,
  });
  if (error) throw error;
  if (!data) throw new Error("The database did not return the replacement assignment ID.");
  return String(data);
}

export async function createTeacherClassroomAssignmentForAdmin(
  schoolUuid: string,
  teacherUuid: string,
  className: string,
  sectionName: string,
  subjectName: string
): Promise<string> {
  const supabase: any = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured.");
  const { data, error } = await supabase.rpc("create_teacher_classroom_assignment_for_admin", {
    p_school_uuid: schoolUuid,
    p_teacher_uuid: teacherUuid,
    p_class_name: className,
    p_section_name: sectionName,
    p_subject_name: subjectName,
  });
  if (error) throw error;
  if (!data) throw new Error("The database did not return the new assignment ID.");
  return String(data);
}
