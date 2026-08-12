import { getSupabaseClient } from "../supabaseClient";

export interface SchoolTeacherAllowlistEntry {
  id?: string;
  schoolUuid: string;
  email: string;
  createdAt?: string;
  registered?: boolean;
  fullName?: string | null;
  accountStatus?: string | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Public registration checkpoint.
 * Only returns true/false; it never exposes the school's roster.
 */
export async function isTeacherEmailAuthorized(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim()) return false;

  const { data, error } = await (supabase as any).rpc(
    "is_teacher_email_authorized",
    { p_email: normalizeEmail(email) }
  );

  if (error) {
    console.error("Teacher email authorization check failed.", error);
    return false;
  }

  return data === true;
}

/** Exact school checkpoint used by Teacher Profile Form and Repository. */
export async function isTeacherEmailAuthorizedForSchool(
  email: string,
  schoolUuid: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim() || !schoolUuid) return false;

  const { data, error } = await (supabase as any).rpc(
    "is_teacher_email_authorized_for_school",
    {
      p_email: normalizeEmail(email),
      p_school_uuid: schoolUuid,
    }
  );

  if (error) {
    console.error("Teacher email/school authorization check failed.", error);
    return false;
  }

  return data === true;
}

/**
 * Returns only schools to which this authenticated teacher email has been
 * explicitly approved. Used by Teacher Profile Form so unauthorized schools
 * never appear in the selector.
 */
export async function getTeacherAuthorizedSchools(email: string): Promise<Array<{
  schoolUuid: string;
  schoolName: string;
  board: string;
}>> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim()) return [];

  const { data, error } = await (supabase as any).rpc(
    "get_teacher_authorized_schools",
    { p_email: normalizeEmail(email) }
  );

  if (error) {
    console.error("Unable to load authorized teacher schools.", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    schoolUuid: String(row.school_uuid),
    schoolName: String(row.school_name ?? ""),
    board: String(row.board ?? ""),
  }));
}

/**
 * School Admin view. This is deliberately an RPC so the browser never gets
 * direct table access to another school's teacher roster.
 */
export async function getSchoolTeacherRosterForSchoolAdmin(
  schoolUuid: string
): Promise<SchoolTeacherAllowlistEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return [];

  const { data, error } = await (supabase as any).rpc(
    "get_school_teacher_roster_for_admin",
    { p_school_uuid: schoolUuid }
  );

  if (error) {
    console.error("Unable to load school teacher roster.", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    schoolUuid,
    email: normalizeEmail(String(row.email ?? "")),
    createdAt: row.invited_at ?? undefined,
    registered: Boolean(row.registered),
    fullName: row.full_name ?? null,
    accountStatus: row.account_status ?? null,
  }));
}

/**
 * School Admin writes the complete approved teacher roster for its own school.
 * Replacing the list keeps the UI simple: removed emails immediately lose the
 * ability to start teacher onboarding for that school.
 */
export async function replaceSchoolTeacherAllowlistForSchoolAdmin(
  schoolUuid: string,
  emails: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return false;

  const normalizedEmails = Array.from(
    new Set(emails.map(normalizeEmail).filter(Boolean))
  );

  const { data, error } = await (supabase as any).rpc(
    "replace_school_teacher_invites_for_admin",
    {
      p_school_uuid: schoolUuid,
      p_emails: normalizedEmails,
    }
  );

  if (error) {
    console.error("Unable to update school teacher allowlist.", error);
    return false;
  }

  return data === true;
}

/**
 * Legacy/platform-admin roster helper retained for compatibility with older
 * screens. It reads through the existing secure RPC rather than directly from
 * the protected table.
 */
export async function getSchoolTeacherAllowlist(
  schoolUuid: string
): Promise<string[]> {
  const rows = await getSchoolTeacherRosterForSchoolAdmin(schoolUuid);
  return rows.map(row => row.email);
}

/** Legacy platform-admin aggregate helper retained for compatibility. */
export async function getAllSchoolTeacherAllowlist(): Promise<SchoolTeacherAllowlistEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await (supabase as any).from("school_teacher_invites")
    .select("id,school_uuid,teacher_email,created_at")
    .order("teacher_email", { ascending: true });

  if (error) {
    console.error("Unable to load teacher allowlists.", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    schoolUuid: row.school_uuid,
    email: normalizeEmail(String(row.teacher_email ?? "")),
    createdAt: row.created_at ?? undefined,
  }));
}

/**
 * Legacy platform-admin write helper retained so older code can still compile.
 * New school-level management must use replaceSchoolTeacherAllowlistForSchoolAdmin.
 */
export async function saveSchoolTeacherAllowlist(
  schoolUuid: string,
  emails: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return false;

  const normalizedEmails = Array.from(
    new Set(emails.map(normalizeEmail).filter(Boolean))
  );

  const { data, error } = await (supabase as any).rpc(
    "save_school_teacher_invites",
    {
      p_school_uuid: schoolUuid,
      p_emails: normalizedEmails,
    }
  );

  if (error) {
    console.error("Unable to save school teacher allowlist.", error);
    return false;
  }

  return data === true;
}
