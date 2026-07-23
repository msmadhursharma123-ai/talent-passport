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
    .eq("teacher_uuid", teacherUuid);

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