import { getSupabaseClient } from "../../../supabaseClient";

import type { TeacherDailyLog } from "../types/TeacherDailyLog";
import { mapTeacherDailyLog } from "../types/TeacherDailyLogMapper";

const TABLE_NAME = "teacher_daily_logs";

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

const today = new Date()
.toISOString()
.split("T")[0];

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