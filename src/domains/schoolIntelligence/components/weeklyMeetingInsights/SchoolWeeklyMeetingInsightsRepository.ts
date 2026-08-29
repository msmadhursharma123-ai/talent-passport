import { getSupabaseClient } from "../../../../supabaseClient";
import { requireSchoolIdentity } from "../../../../services/identityService";

export interface SchoolWeeklyMeetingRawData {
  schoolUuid: string;
  schoolName: string;
  teachers: any[];
  assignments: any[];
  students: any[];
  logs: any[];
  feedback: any[];
  doubts: any[];
  planners: any[];
  schoolHolidays: Array<{ date: string; name: string; source: "SCHOOL" }>;
}

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

export async function getSchoolWeeklyMeetingRawData(
  startDate: string,
  endDate: string,
): Promise<SchoolWeeklyMeetingRawData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = String(identity.schoolUuid ?? "").trim();
  const schoolName = String(identity.schoolName ?? "").trim();
  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  const supabase = client();

  const [teacherResult, assignmentResult, studentResult, plannerResult] = await Promise.all([
    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,subject,is_active")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_uuid,class_name,section_name")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("academic_planner_documents")
      .select("id,school_uuid,teacher_uuid,planner_type,start_date,end_date,submitted_at,status")
      .eq("school_uuid", schoolUuid)
      .eq("planner_type", "lesson"),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;
  if (plannerResult.error) throw plannerResult.error;

  const teachers = teacherResult.data ?? [];
  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];
  const planners = plannerResult.data ?? [];

  const assignmentIds = assignments
    .map((row: any) => String(row.id ?? ""))
    .filter(Boolean);

  if (!assignmentIds.length) {
    return {
      schoolUuid,
      schoolName,
      teachers,
      assignments,
      students,
      logs: [],
      feedback: [],
      doubts: [],
      planners,
      schoolHolidays: await getSchoolCalendarHolidays(supabase, schoolUuid, startDate, endDate),
    };
  }

  const logsResult = await supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at,updated_at")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate);

  if (logsResult.error) throw logsResult.error;

  const logs = logsResult.data ?? [];
  const logIds = logs.map((row: any) => String(row.id ?? "")).filter(Boolean);

  let feedback: any[] = [];
  if (logIds.length) {
    const feedbackResult = await supabase
      .from("student_daily_feedback")
      .select(
        "id,daily_log_uuid,student_uuid,submitted_at,teacher_uuid,school_uuid,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt"
      )
      .eq("school_uuid", schoolUuid)
      .in("daily_log_uuid", logIds);

    if (feedbackResult.error) throw feedbackResult.error;
    feedback = feedbackResult.data ?? [];
  }

  const doubtResult = await supabase
    .from("pending_teacher_doubts")
    .select(
      "id,student_uuid,teacher_assignment_uuid,daily_log_uuid,status,student_response,doubt_resolved,revision_checked_at,created_at,log_date"
    )
    .eq("school_name", schoolName)
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate);

  if (doubtResult.error) throw doubtResult.error;

  return {
    schoolUuid,
    schoolName,
    teachers,
    assignments,
    students,
    logs,
    feedback,
    doubts: doubtResult.data ?? [],
    planners,
    schoolHolidays: await getSchoolCalendarHolidays(supabase, schoolUuid, startDate, endDate),
  };
}

async function getSchoolCalendarHolidays(
  supabase: any,
  schoolUuid: string,
  startDate: string,
  endDate: string,
): Promise<Array<{ date: string; name: string; source: "SCHOOL" }>> {
  try {
    const result = await supabase
      .from("school_calendar_holidays")
      .select("holiday_date,holiday_name")
      .eq("school_uuid", schoolUuid)
      .gte("holiday_date", startDate)
      .lte("holiday_date", endDate)
      .order("holiday_date", { ascending: true });

    if (result.error) {
      // The feature remains operational on projects that have not yet run the
      // optional school-calendar migration. Government/Sunday references are
      // still calculated independently by the analytics engine.
      console.warn("SCHOOL WEEKLY MEETING SCHOOL CALENDAR READ FAILED", result.error);
      return [];
    }

    return (result.data ?? []).map((row: any) => ({
      date: String(row.holiday_date),
      name: String(row.holiday_name ?? "School Holiday"),
      source: "SCHOOL" as const,
    }));
  } catch (error) {
    console.warn("SCHOOL WEEKLY MEETING SCHOOL CALENDAR READ FAILED", error);
    return [];
  }
}