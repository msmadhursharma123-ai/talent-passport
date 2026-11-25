import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentSchool, getCurrentTeacher } from "../../../services/identityService";

export interface TeacherDailyAbsence {
  id: string;
  teacherUuid: string;
  schoolUuid: string;
  absenceDate: string;
  markedAt: string;
}

const TABLE_NAME = "teacher_daily_absences";

function indiaDateKey(offsetDays = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 0);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 0);
  const date = new Date(Date.UTC(year, month - 1, day + offsetDays));

  return date.toISOString().slice(0, 10);
}

function mapAbsence(data: any): TeacherDailyAbsence {
  return {
    id: String(data.id),
    teacherUuid: String(data.teacher_uuid),
    schoolUuid: String(data.school_uuid),
    absenceDate: String(data.absence_date),
    markedAt: String(data.created_at ?? ""),
  };
}

/**
 * Teacher Portal: read the authenticated teacher's absence markers for the
 * requested dates. This is a separate attendance path; Daily Log data is
 * never changed by this feature.
 */
export async function getCurrentTeacherAbsences(
  absenceDates: string[]
): Promise<TeacherDailyAbsence[]> {
  const supabase: any = getSupabaseClient();
  const teacher = getCurrentTeacher();

  if (!supabase || !teacher?.teacherUuid || !absenceDates.length) return [];

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id,teacher_uuid,school_uuid,absence_date,created_at")
    .eq("teacher_uuid", teacher.teacherUuid)
    .in("absence_date", absenceDates);

  if (error) throw error;
  return (data ?? []).map(mapAbsence);
}

/**
 * Teacher Portal: read absence markers for a calendar month/date range.
 * This remains a read-only extension of the existing attendance repository.
 */
export async function getCurrentTeacherAbsencesForRange(
  startDate: string,
  endDate: string,
): Promise<TeacherDailyAbsence[]> {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return getCurrentTeacherAbsences(dates);
}

/**
 * Teacher Portal: mark the authenticated teacher absent for one or more dates.
 *
 * The database RLS policy remains the authorization boundary. The unique
 * (teacher_uuid, absence_date) constraint makes repeated submissions safe.
 */
export async function markCurrentTeacherAbsent(
  absenceDates: string[]
): Promise<TeacherDailyAbsence[]> {
  const supabase: any = getSupabaseClient();
  const teacher = getCurrentTeacher();

  if (!supabase) throw new Error("Supabase not configured.");
  if (!teacher?.teacherUuid) throw new Error("Teacher identity is unavailable.");
  if (!teacher.schoolUuid) throw new Error("Teacher school identity is unavailable.");

  const dates = Array.from(new Set(absenceDates.filter(Boolean))).sort();
  if (!dates.length) return [];

  const rows = dates.map((absenceDate) => ({
    teacher_uuid: teacher.teacherUuid,
    school_uuid: teacher.schoolUuid,
    absence_date: absenceDate,
  }));

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(rows)
    .select("id,teacher_uuid,school_uuid,absence_date,created_at");

  if (!error) return (data ?? []).map(mapAbsence);

  // The unique (teacher_uuid, absence_date) constraint makes this action
  // idempotent. If one or both selected dates already exist, read the selected
  // rows and treat the operation as successful for those dates.
  if (error.code === "23505") {
    const existing = await getCurrentTeacherAbsences(dates);
    const existingDates = new Set(existing.map((absence) => absence.absenceDate));
    const missingDates = dates.filter((date) => !existingDates.has(date));

    if (!missingDates.length) return existing;

    const retryRows = missingDates.map((absenceDate) => ({
      teacher_uuid: teacher.teacherUuid,
      school_uuid: teacher.schoolUuid,
      absence_date: absenceDate,
    }));
    const retry = await supabase
      .from(TABLE_NAME)
      .insert(retryRows)
      .select("id,teacher_uuid,school_uuid,absence_date,created_at");

    if (!retry.error) return [...existing, ...(retry.data ?? []).map(mapAbsence)];

    if (retry.error.code === "23505") {
      const finalRows = await getCurrentTeacherAbsences(dates);
      if (finalRows.length === dates.length) return finalRows;
    }
  }

  throw error;
}

/**
 * School Portal: fresh read of today's absence markers.
 *
 * The School Intelligence snapshot/cache is intentionally not changed. This
 * direct attendance read allows an absence to appear independently of the
 * normal intelligence refresh interval.
 */
export async function getSchoolTeacherAbsencesToday(): Promise<TeacherDailyAbsence[]> {
  const supabase: any = getSupabaseClient();
  const school = getCurrentSchool();

  if (!supabase || !school?.schoolUuid) return [];

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id,teacher_uuid,school_uuid,absence_date,created_at")
    .eq("school_uuid", school.schoolUuid)
    .eq("absence_date", indiaDateKey())
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapAbsence);
}
