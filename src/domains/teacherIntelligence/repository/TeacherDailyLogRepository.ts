import { getSupabaseClient } from "../../../supabaseClient";

import type { TeacherDailyLog } from "../types/TeacherDailyLog";
import { mapTeacherDailyLog } from "../types/TeacherDailyLogMapper";

const TABLE_NAME = "teacher_daily_logs";

/* =========================================================
   INDIA CLASSROOM BUSINESS DATE
========================================================= */
function getIndiaCalendarDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

/*
=========================================================
GET ALL DAILY LOGS
=========================================================
*/

export async function getTeacherDailyLogs(): Promise<
  TeacherDailyLog[]
> {
  const supabase = getSupabaseClient();

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

  return (data ?? []).map(mapTeacherDailyLog);
}

/*
=========================================================
GET LOGS BY TEACHER ASSIGNMENT
=========================================================
*/

export async function getTeacherDailyLogsByAssignment(
  teacherAssignmentUuid: string
): Promise<TeacherDailyLog[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq(
      "teacher_assignment_uuid",
      teacherAssignmentUuid
    )
  .order(
"created_at",
{
ascending:false
}
)

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeacherDailyLog);
}

export async function getTeacherDailyLogsByAssignments(
  teacherAssignmentUuids: string[]
): Promise<TeacherDailyLog[]> {

  const supabase = getSupabaseClient();

  if (
    !supabase ||
    teacherAssignmentUuids.length === 0
  ) {
    return [];
  }

  const uniqueAssignmentUuids =
    Array.from(
      new Set(
        teacherAssignmentUuids.filter(
          Boolean
        )
      )
    );

  if (
    uniqueAssignmentUuids.length === 0
  ) {
    return [];
  }

  const { data, error } =
    await supabase
      .from(TABLE_NAME)
      .select("*")
      .in(
        "teacher_assignment_uuid",
        uniqueAssignmentUuids
      )
      .order("log_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    mapTeacherDailyLog
  );
}

/*
  =========================================================
  PREVIOUS CLASS REFERENCE FOR ONE ASSIGNMENT

  This is a read-only helper for the Daily Log composer.
  It always returns the latest submitted log for this exact
  teacher assignment, including today's newly submitted log.
  =========================================================
*/

export async function getPreviousTeacherDailyLogByAssignment(
  teacherAssignmentUuid: string
): Promise<TeacherDailyLog | null> {
  const supabase = getSupabaseClient();

  if (!supabase || !teacherAssignmentUuid) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("teacher_assignment_uuid", teacherAssignmentUuid)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : null;
  return row ? mapTeacherDailyLog(row) : null;
}

/*
 =========================================================
 TODAY'S LOGS FOR ONE ASSIGNMENT
 =========================================================
*/

export async function getTodaysTeacherDailyLogsByAssignment(
teacherAssignmentUuid: string
): Promise<TeacherDailyLog[]> {

const supabase = getSupabaseClient();

if (!supabase) {
return [];
}

const today = getIndiaCalendarDateKey();

const { data, error } = await supabase
.from(TABLE_NAME)
.select("*")
.eq(
"teacher_assignment_uuid",
teacherAssignmentUuid
)
.eq(
"log_date",
today
)
.order("created_at", {
ascending: false,
});

if (error) {
throw error;
}

return (data ?? []).map(
mapTeacherDailyLog
);

}

/*
=========================================================
CREATE DAILY LOG
=========================================================
*/

export async function createTeacherDailyLog(
  dailyLog: Record<string, unknown>
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  const teacherAssignmentUuid = String(
    dailyLog.teacher_assignment_uuid ?? ""
  ).trim();

  const logDate = String(
    dailyLog.log_date ?? ""
  ).trim();

  if (!teacherAssignmentUuid) {
    throw new Error(
      "Teacher assignment is required to publish today's lecture."
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
    throw new Error(
      "Lecture business date is invalid. Please reopen the Daily Log and try again."
    );
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert(dailyLog as never);

  if (error) {
    throw error;
  }

  return true;
}

/*
=========================================================
UPDATE DAILY LOG
=========================================================
*/

export async function updateTeacherDailyLog(
  id: string,
  dailyLog: Record<string, unknown>
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .update(dailyLog as never)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/*
=========================================================
DELETE DAILY LOG
=========================================================
*/

export async function deleteTeacherDailyLog(
  id: string
) {
  const supabase = getSupabaseClient();

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