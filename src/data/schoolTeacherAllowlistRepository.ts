import { getSupabaseClient } from "../supabaseClient";

export type SchoolAccessStatus = "ACTIVE" | "REVOKED";

export interface SchoolTeacherAllowlistEntry {
  id?: string;
  schoolUuid: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  registered?: boolean;
  fullName?: string | null;
  accountStatus?: string | null;
  accessStatus?: SchoolAccessStatus | string | null;
}

function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }

export async function isTeacherEmailAlreadyRegistered(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim()) return false;

  const { data, error } = await (supabase as any).rpc(
    "is_teacher_email_already_registered",
    { p_email: normalizeEmail(email) }
  );

  if (error) {
    console.error("Teacher email duplicate check failed.", error);
    throw new Error("Unable to verify whether this teacher email is already registered.");
  }

  return data === true;
}

export async function isTeacherEmailAuthorized(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim()) return false;
  const { data, error } = await (supabase as any).rpc("is_teacher_email_authorized", { p_email: normalizeEmail(email) });
  if (error) { console.error("Teacher email authorization check failed.", error); return false; }
  return data === true;
}

export async function isTeacherEmailAuthorizedForSchool(email: string, schoolUuid: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim() || !schoolUuid) return false;
  const { data, error } = await (supabase as any).rpc("is_teacher_email_authorized_for_school", {
    p_email: normalizeEmail(email), p_school_uuid: schoolUuid,
  });
  if (error) { console.error("Teacher email/school authorization check failed.", error); return false; }
  return data === true;
}

export async function getTeacherAuthorizedSchools(email: string): Promise<Array<{ schoolUuid: string; schoolName: string; board: string }>> {
  const supabase = getSupabaseClient();
  if (!supabase || !email.trim()) return [];
  const { data, error } = await (supabase as any).rpc("get_teacher_authorized_schools", { p_email: normalizeEmail(email) });
  if (error) { console.error("Unable to load authorized teacher schools.", error); return []; }
  return (data ?? []).map((row: any) => ({ schoolUuid: String(row.school_uuid), schoolName: String(row.school_name ?? ""), board: String(row.board ?? "") }));
}

export async function getSchoolTeacherRosterForSchoolAdmin(schoolUuid: string): Promise<SchoolTeacherAllowlistEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return [];
  const { data, error } = await (supabase as any).rpc("get_school_teacher_access_roster_for_admin", { p_school_uuid: schoolUuid });
  if (error) { console.error("Unable to load school teacher roster.", error); return []; }
  return (data ?? []).map((row: any) => ({
    id: row.id, schoolUuid, email: normalizeEmail(String(row.email ?? "")),
    createdAt: row.invited_at ?? undefined, updatedAt: row.updated_at ?? undefined,
    registered: Boolean(row.registered), fullName: row.full_name ?? null,
    accountStatus: row.account_status ?? null, accessStatus: row.access_status ?? null,
  }));
}

export async function replaceSchoolTeacherAllowlistForSchoolAdmin(schoolUuid: string, emails: string[]): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return false;
  const normalizedEmails = Array.from(new Set(emails.map(normalizeEmail).filter(Boolean)));
  const { data, error } = await (supabase as any).rpc("replace_school_teacher_invites_for_admin", {
    p_school_uuid: schoolUuid, p_emails: normalizedEmails,
  });
  if (error) { console.error("Unable to update school teacher allowlist.", error); return false; }
  return data === true;
}

export async function revokeSchoolTeacherAccessForAdmin(schoolUuid: string, email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid || !email.trim()) return false;
  const { data, error } = await (supabase as any).rpc("set_school_teacher_access_status_for_admin", {
    p_school_uuid: schoolUuid, p_email: normalizeEmail(email), p_status: "REVOKED",
  });
  if (error) { console.error("Unable to revoke teacher access.", error); return false; }
  return data === true;
}

export async function restoreSchoolTeacherAccessForAdmin(schoolUuid: string, email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid || !email.trim()) return false;
  const { data, error } = await (supabase as any).rpc("set_school_teacher_access_status_for_admin", {
    p_school_uuid: schoolUuid, p_email: normalizeEmail(email), p_status: "ACTIVE",
  });
  if (error) { console.error("Unable to restore teacher access.", error); return false; }
  return data === true;
}

export async function getSchoolTeacherAllowlist(schoolUuid: string): Promise<string[]> {
  const rows = await getSchoolTeacherRosterForSchoolAdmin(schoolUuid);
  return rows.filter(row => String(row.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE").map(row => row.email);
}

export async function getAllSchoolTeacherAllowlist(): Promise<SchoolTeacherAllowlistEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await (supabase as any).from("school_teacher_invites").select("id,school_uuid,teacher_email,created_at,updated_at,status").order("teacher_email", { ascending: true });
  if (error) { console.error("Unable to load teacher allowlists.", error); return []; }
  return (data ?? []).map((row: any) => ({ id: row.id, schoolUuid: row.school_uuid, email: normalizeEmail(String(row.teacher_email ?? "")), createdAt: row.created_at ?? undefined, updatedAt: row.updated_at ?? undefined, accessStatus: row.status ?? "ACTIVE" }));
}

export async function saveSchoolTeacherAllowlist(schoolUuid: string, emails: string[]): Promise<boolean> {
  return replaceSchoolTeacherAllowlistForSchoolAdmin(schoolUuid, emails);
}
