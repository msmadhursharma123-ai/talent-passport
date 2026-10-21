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

  const topicName = typeof dailyLog.topic_name === "string" ? dailyLog.topic_name.trim() : "";
  const conceptsCovered = Array.isArray(dailyLog.concepts_covered)
    ? dailyLog.concepts_covered.filter((value): value is string => typeof value === "string")
    : [];
  const pageFrom = dailyLog.page_from == null ? null : Number(dailyLog.page_from);
  const pageTo = dailyLog.page_to == null ? null : Number(dailyLog.page_to);
  const homeworkGiven = dailyLog.homework_given === true;
  const activityConducted = dailyLog.activity_conducted === true;
  const teacherNotes = dailyLog.teacher_notes == null ? null : String(dailyLog.teacher_notes);

  if (!topicName) throw new Error("Topic is required.");
  if (pageFrom !== null && (!Number.isInteger(pageFrom) || pageFrom < 0)) {
    throw new Error("Page from must be zero or a positive whole number.");
  }
  if (pageTo !== null && (!Number.isInteger(pageTo) || pageTo < 0)) {
    throw new Error("Page to must be zero or a positive whole number.");
  }
  if (pageFrom !== null && pageTo !== null && pageTo < pageFrom) {
    throw new Error("Page to cannot be less than Page from.");
  }

  // Use a narrowly scoped server-side RPC. Direct table UPDATE is not granted
  // to authenticated users in the supplied production grants export.
  // These V10 RPCs are installed by the accompanying SQL migration but are not
  // yet represented in the app's generated Supabase Database type. Narrowly
  // type this call boundary instead of weakening the client or project types.
  const updateRpc = supabase.rpc.bind(supabase) as unknown as (
    functionName: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: unknown | null }>;

  const { data, error } = await updateRpc("tp_v10_update_teacher_daily_log", {
    p_daily_log_id: id,
    p_topic_name: topicName,
    p_concepts_covered: conceptsCovered,
    p_page_from: pageFrom,
    p_page_to: pageTo,
    p_homework_given: homeworkGiven,
    p_activity_conducted: activityConducted,
    p_teacher_notes: teacherNotes,
  });

  if (error) throw error;
  if (data !== true) {
    throw new Error("Daily Log was not updated. It may be locked by student feedback, outside your permissions, or no longer available.");
  }
  return true;
}

/*
=========================================================
DELETE DAILY LOG
=========================================================
*/

export async function deleteTeacherDailyLog(id: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase not configured.");
  }

  // The RPC verifies auth.uid() against teachers_master and the log's assigned
  // teacher before it performs a guarded delete under SECURITY DEFINER.
  // Keep the type escape local to this V10 RPC; do not cast the entire client.
  const deleteRpc = supabase.rpc.bind(supabase) as unknown as (
    functionName: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: unknown | null }>;

  const { data, error } = await deleteRpc("tp_v10_delete_teacher_daily_log", {
    p_daily_log_id: id,
  });

  if (error) throw error;
  if (data !== true) {
    throw new Error("Daily Log was not deleted. It may be locked by student feedback, outside your permissions, or no longer available.");
  }
  return true;
}

/*
=========================================================
GET ALL LOGS BY ASSIGNMENTS — PAGINATED HISTORY READ

This is a separate read path for history/report screens. The
existing getTeacherDailyLogsByAssignments() remains unchanged
for current Daily Log behavior. Pagination avoids silently
truncating histories at the API's per-response row limit.
=========================================================
*/

export async function getTeacherDailyLogsByAssignmentsPaginated(
  teacherAssignmentUuids: string[]
): Promise<TeacherDailyLog[]> {
  const supabase = getSupabaseClient();
  if (!supabase || teacherAssignmentUuids.length === 0) {
    return [];
  }

  const uniqueAssignmentUuids = Array.from(
    new Set(teacherAssignmentUuids.filter(Boolean))
  );
  if (uniqueAssignmentUuids.length === 0) {
    return [];
  }

  const pageSize = 500;
  const allRows: any[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .in("teacher_assignment_uuid", uniqueAssignmentUuids)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const page = data ?? [];

    // Do not treat a short page as the end of the dataset: the Supabase
    // project may enforce a response cap smaller than pageSize. Continue
    // until an empty page is returned, advancing by the actual row count.
    if (page.length === 0) {
      break;
    }

    allRows.push(...page);
    from += page.length;
  }

  return allRows.map(mapTeacherDailyLog);
}
