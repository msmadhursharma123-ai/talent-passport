import { getSupabaseClient } from "../supabaseClient";

export type PortalRole = "student" | "teacher";

export const STUDENT_FEATURES = [
  { key: "dna-radar", label: "User DNA Radar" },
  { key: "homeboard", label: "Home Board" },
  { key: "timeline", label: "Timeline" },
  { key: "portfolio", label: "Portfolio" },
  { key: "competitions", label: "Competitions" },
  { key: "opportunities", label: "Opportunities" },
  { key: "mauke-pe-chauka", label: "Mauke Pe Chauka" },
  { key: "my-analysis", label: "My Analysis" },
  { key: "growth-plan", label: "Growth Plan" },
] as const;

export const TEACHER_FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "daily-log", label: "Daily Log" },
  { key: "teaching-journal", label: "Teaching Journal" },
  { key: "my-classroom", label: "My Classroom" },
  { key: "exam-preparation", label: "Exam Prep" },
] as const;

const defaultsFor = (role: PortalRole) =>
  role === "student"
    ? STUDENT_FEATURES.map(x => x.key)
    : TEACHER_FEATURES.map(x => x.key);

export async function getSchoolFeatureKeys(
  schoolUuid: string,
  role: PortalRole
): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return defaultsFor(role);

  const { data, error } = await (supabase as any)
    .from("school_portal_features")
    .select("feature_key,enabled")
    .eq("school_uuid", schoolUuid)
    .eq("portal_role", role);

  if (error) {
    console.error("Unable to load school portal configuration.", error);
    // Preserve the existing portal instead of blanking it because of a
    // temporary configuration/RLS/network error.
    return defaultsFor(role);
  }

  // Existing schools created before this feature have no rows until the
  // migration/backfill is run. Treat that state as legacy = all enabled.
  if (!data || data.length === 0) return defaultsFor(role);

  return data
    .filter((row: any) => row.enabled)
    .map((row: any) => String(row.feature_key));
}

export async function getSchoolFeatureConfiguration(schoolUuid: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      student: defaultsFor("student"),
      teacher: defaultsFor("teacher"),
    };
  }

  const { data, error } = await (supabase as any)
    .from("school_portal_features")
    .select("portal_role,feature_key,enabled")
    .eq("school_uuid", schoolUuid);

  if (error) {
    console.error("Unable to load school portal configuration.", error);
    return {
      student: defaultsFor("student"),
      teacher: defaultsFor("teacher"),
    };
  }

  if (!data || data.length === 0) {
    return {
      student: defaultsFor("student"),
      teacher: defaultsFor("teacher"),
    };
  }

  return {
    student: data
      .filter((x: any) => x.portal_role === "student" && x.enabled)
      .map((x: any) => String(x.feature_key)),
    teacher: data
      .filter((x: any) => x.portal_role === "teacher" && x.enabled)
      .map((x: any) => String(x.feature_key)),
  };
}

/** Platform Admin only: save the complete configuration for a school. */
export async function saveSchoolFeatures(
  schoolUuid: string,
  studentKeys: string[],
  teacherKeys: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return false;

  const rows = [
    ...STUDENT_FEATURES.map(x => ({
      school_uuid: schoolUuid,
      portal_role: "student",
      feature_key: x.key,
      enabled: studentKeys.includes(x.key),
      updated_at: new Date().toISOString(),
    })),
    ...TEACHER_FEATURES.map(x => ({
      school_uuid: schoolUuid,
      portal_role: "teacher",
      feature_key: x.key,
      enabled: teacherKeys.includes(x.key),
      updated_at: new Date().toISOString(),
    })),
  ];

  const { error } = await (supabase as any)
    .from("school_portal_features")
    .upsert(rows, {
      onConflict: "school_uuid,portal_role,feature_key",
    });

  if (error) {
    console.error("Unable to save school portal configuration.", error);
    return false;
  }

  return true;
}
