import { getSupabaseClient } from "../../../supabaseClient";

export interface SchoolRecord {
  schoolUuid: string;
  schoolName: string;
  board: string;
  city: string;
  isActive: boolean;
  studentProfileLimit: number;
  teacherProfileLimit: number;
  schoolAdminProfileLimit: number;
  studentProfilesUsed: number;
  teacherProfilesUsed: number;
  schoolAdminProfilesUsed: number;
}

export interface SchoolProfileLimits {
  studentProfileLimit: number;
  teacherProfileLimit: number;
  schoolAdminProfileLimit: number;
}

export async function getSchools(): Promise<SchoolRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await (supabase as any)
    .from("schools_master")
    .select(`
      school_uuid, school_name, board, city, account_status,
      student_profile_limit, teacher_profile_limit, school_admin_profile_limit,
      student_profiles_used, teacher_profiles_used, school_admin_profiles_used
    `)
    .order("school_name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((school: any) => ({
    schoolUuid: school.school_uuid,
    schoolName: school.school_name,
    board: school.board ?? "",
    city: school.city ?? "",
    isActive: school.account_status === "ACTIVE",
    studentProfileLimit: Number(school.student_profile_limit ?? 0),
    teacherProfileLimit: Number(school.teacher_profile_limit ?? 0),
    schoolAdminProfileLimit: Number(school.school_admin_profile_limit ?? 0),
    studentProfilesUsed: Number(school.student_profiles_used ?? 0),
    teacherProfilesUsed: Number(school.teacher_profiles_used ?? 0),
    schoolAdminProfilesUsed: Number(school.school_admin_profiles_used ?? 0),
  }));
}

export async function createSchool(
  schoolName: string,
  board: string,
  city: string,
  limits: SchoolProfileLimits
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await (supabase as any)
    .from("schools_master")
    .insert({
      school_name: schoolName.trim(),
      board: board.trim(),
      city: city.trim(),
      account_status: "ACTIVE",
      student_profile_limit: limits.studentProfileLimit,
      teacher_profile_limit: limits.teacherProfileLimit,
      school_admin_profile_limit: limits.schoolAdminProfileLimit,
      student_profiles_used: 0,
      teacher_profiles_used: 0,
      school_admin_profiles_used: 0,
    });

  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function updateSchool(
  schoolUuid: string,
  schoolName: string,
  board: string,
  city: string,
  limits: SchoolProfileLimits
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await (supabase as any)
    .from("schools_master")
    .update({
      school_name: schoolName.trim(),
      board: board.trim(),
      city: city.trim(),
      student_profile_limit: limits.studentProfileLimit,
      teacher_profile_limit: limits.teacherProfileLimit,
      school_admin_profile_limit: limits.schoolAdminProfileLimit,
    })
    .eq("school_uuid", schoolUuid);

  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function deactivateSchool(schoolUuid: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await (supabase as any)
    .from("schools_master")
    .update({ account_status: "INACTIVE" })
    .eq("school_uuid", schoolUuid);

  if (error) {
    console.error(error);
    return false;
  }
  return true;
}
