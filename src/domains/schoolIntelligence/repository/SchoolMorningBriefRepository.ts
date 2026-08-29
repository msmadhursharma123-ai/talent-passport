import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";

export interface SchoolMorningBriefRawData {
  schoolUuid: string;
  schoolName: string;
  teachers: any[];
  assignments: any[];
  students: any[];
  logs: any[];
  feedback: any[];
  doubts: any[];
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

/**
 * Morning Brief data source.
 *
 * This is intentionally independent from the existing School Intelligence
 * repository contract/calculations. It only reads the same authoritative
 * tables and resolves classroom metadata through teacher assignment UUIDs.
 * No existing school-intelligence rows or calculations are changed.
 */
export async function getSchoolMorningBriefRawData(
  startDate: string,
  endDate: string,
): Promise<SchoolMorningBriefRawData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = String(identity.schoolUuid ?? "").trim();
  const schoolName = String(identity.schoolName ?? "").trim();
  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  const supabase = getClient();

  const [teacherResult, assignmentResult, studentResult] = await Promise.all([
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
      .select("student_uuid,student_name,school_uuid,school_name,class_name,section_name")
      .eq("school_uuid", schoolUuid),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;

  const teachers = teacherResult.data ?? [];
  // Keep the full school assignment history for this independent brief.
  // Historical classes taught during the selected week must remain rankable
  // even if an assignment has since been deactivated.
  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];
  const assignmentIds = assignments.map((row: any) => String(row.id ?? "")).filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      schoolUuid,
      schoolName,
      teachers,
      assignments,
      students,
      logs: [],
      feedback: [],
      doubts: [],
    };
  }

  const logsResult = await supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at,updated_at")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate);

  if (logsResult.error) throw logsResult.error;

  const assignmentById = new Map<string, any>(
    assignments.map((assignment: any) => [String(assignment.id), assignment]),
  );

  const logs = (logsResult.data ?? []).map((log: any) => {
    const assignment = assignmentById.get(String(log.teacher_assignment_uuid ?? ""));
    return {
      ...log,
      teacher_uuid: assignment?.teacher_uuid ?? null,
      class_name: assignment?.class_name ?? "",
      section_name: assignment?.section_name ?? "",
      subject_name: assignment?.subject_name ?? "",
    };
  });

  const logIds = logs.map((row: any) => String(row.id ?? "")).filter(Boolean);

  let feedback: any[] = [];
  if (logIds.length > 0) {
    const feedbackResult = await supabase
      .from("student_daily_feedback")
      .select("id,daily_log_uuid,student_uuid,submitted_at,teacher_uuid,school_uuid,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt")
      .eq("school_uuid", schoolUuid)
      .in("daily_log_uuid", logIds);

    if (feedbackResult.error) throw feedbackResult.error;
    feedback = feedbackResult.data ?? [];
  }

  const doubtsResult = await supabase
    .from("pending_teacher_doubts")
    .select("id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,status,student_response,school_name,class_name,section_name,subject_name,previous_topic_name,previous_difficult_concept,log_date,doubt_resolved,revision_checked_at,created_at")
    .eq("school_name", schoolName)
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate);

  if (doubtsResult.error) throw doubtsResult.error;

  return {
    schoolUuid,
    schoolName,
    teachers,
    assignments,
    students,
    logs,
    feedback,
    doubts: doubtsResult.data ?? [],
  };
}
