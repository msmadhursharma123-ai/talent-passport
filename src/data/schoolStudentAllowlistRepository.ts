import { getSupabaseClient } from "../supabaseClient";

export type SchoolAccessStatus = "ACTIVE" | "REVOKED";

export interface SchoolStudentAllowlistEntry {
  id?: string;
  schoolUuid: string;
  rollNumber: string;
  createdAt?: string;
  updatedAt?: string;
  registered?: boolean;
  studentName?: string | null;
  accountStatus?: string | null;
  accessStatus?: SchoolAccessStatus | string | null;
}

function normalizeRollNumber(value: string): string {
  return value.trim().toUpperCase();
}

export async function isStudentRollAuthorized(rollNumber: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !rollNumber.trim()) return false;
  const { data, error } = await (supabase as any).rpc(
    "is_student_roll_authorized",
    { p_roll_number: normalizeRollNumber(rollNumber) }
  );
  if (error) {
    console.error("Student roll authorization check failed.", error);
    return false;
  }
  return data === true;
}

export async function isStudentRollAuthorizedForSchool(
  rollNumber: string,
  schoolUuid: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !rollNumber.trim() || !schoolUuid) return false;
  const { data, error } = await (supabase as any).rpc(
    "is_student_roll_authorized_for_school",
    {
      p_roll_number: normalizeRollNumber(rollNumber),
      p_school_uuid: schoolUuid,
    }
  );
  if (error) {
    console.error("Student roll/school authorization check failed.", error);
    return false;
  }
  return data === true;
}

export async function getStudentAuthorizedSchools(rollNumber: string): Promise<Array<{
  schoolUuid: string;
  schoolName: string;
  board: string;
}>> {
  const supabase = getSupabaseClient();
  if (!supabase || !rollNumber.trim()) return [];
  const { data, error } = await (supabase as any).rpc(
    "get_student_authorized_schools",
    { p_roll_number: normalizeRollNumber(rollNumber) }
  );
  if (error) {
    console.error("Unable to load authorized student schools.", error);
    return [];
  }
  return (data ?? []).map((row: any) => ({
    schoolUuid: String(row.school_uuid),
    schoolName: String(row.school_name ?? ""),
    board: String(row.board ?? ""),
  }));
}

export async function getSchoolStudentRosterForSchoolAdmin(
  schoolUuid: string
): Promise<SchoolStudentAllowlistEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return [];
  const { data, error } = await (supabase as any).rpc(
    "get_school_student_access_roster_for_admin",
    { p_school_uuid: schoolUuid }
  );
  if (error) {
    console.error("Unable to load school student roster.", error);
    return [];
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    schoolUuid,
    rollNumber: normalizeRollNumber(String(row.roll_number ?? "")),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    registered: Boolean(row.registered),
    studentName: row.student_name ?? null,
    accountStatus: row.account_status ?? null,
    accessStatus: row.access_status ?? null,
  }));
}

export async function replaceSchoolStudentAllowlistForSchoolAdmin(
  schoolUuid: string,
  rollNumbers: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid) return false;
  const normalizedRollNumbers = Array.from(
    new Set(rollNumbers.map(normalizeRollNumber).filter(Boolean))
  );
  const { data, error } = await (supabase as any).rpc(
    "replace_school_student_rolls_for_admin",
    { p_school_uuid: schoolUuid, p_roll_numbers: normalizedRollNumbers }
  );
  if (error) {
    console.error("Unable to update school student allowlist.", error);
    return false;
  }
  return data === true;
}

export async function revokeSchoolStudentAccessForAdmin(
  schoolUuid: string,
  rollNumber: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid || !rollNumber.trim()) return false;
  const { data, error } = await (supabase as any).rpc(
    "set_school_student_access_status_for_admin",
    { p_school_uuid: schoolUuid, p_roll_number: normalizeRollNumber(rollNumber), p_status: "REVOKED" }
  );
  if (error) {
    console.error("Unable to revoke student access.", error);
    return false;
  }
  return data === true;
}

export async function restoreSchoolStudentAccessForAdmin(
  schoolUuid: string,
  rollNumber: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !schoolUuid || !rollNumber.trim()) return false;
  const { data, error } = await (supabase as any).rpc(
    "set_school_student_access_status_for_admin",
    { p_school_uuid: schoolUuid, p_roll_number: normalizeRollNumber(rollNumber), p_status: "ACTIVE" }
  );
  if (error) {
    console.error("Unable to restore student access.", error);
    return false;
  }
  return data === true;
}

export async function getSchoolStudentAllowlist(schoolUuid: string): Promise<string[]> {
  const rows = await getSchoolStudentRosterForSchoolAdmin(schoolUuid);
  return rows.filter(row => String(row.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE")
    .map(row => row.rollNumber).filter(Boolean);
}
