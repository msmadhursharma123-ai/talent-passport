import { getSupabaseClient } from "../supabaseClient";

export type SchoolProfileRole = "student" | "teacher" | "school_admin";

export async function checkSchoolProfileCapacity(
  schoolUuid: string,
  role: SchoolProfileRole
): Promise<{ allowed: boolean; message?: string }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { allowed: false, message: "Unable to verify school profile capacity." };
  }

  const { data, error } = await (supabase as any).rpc(
    "get_school_profile_capacity",
    { p_school_uuid: schoolUuid }
  );

  if (error) {
    console.error("SCHOOL CAPACITY CHECK ERROR", error);
    return { allowed: false, message: "Unable to verify school profile capacity." };
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return { allowed: false, message: "The selected school could not be found." };
  }

  if (String(row.account_status ?? "").toUpperCase() !== "ACTIVE") {
    return {
      allowed: false,
      message: "The selected school is not active. Please contact school administration."
    };
  }

  const remaining =
    role === "student"
      ? Number(row.student_profiles_remaining ?? 0)
      : role === "teacher"
      ? Number(row.teacher_profiles_remaining ?? 0)
      : Number(row.school_admin_profiles_remaining ?? 0);

  if (remaining <= 0) {
    const label =
      role === "student" ? "Student" :
      role === "teacher" ? "Teacher" :
      "School Admin";

    return {
      allowed: false,
      message: `${label} profile limit exhausted. Please contact school administration for creating the profile.`
    };
  }

  return { allowed: true };
}
