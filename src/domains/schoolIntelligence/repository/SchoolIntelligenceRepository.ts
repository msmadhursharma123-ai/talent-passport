import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";

export interface SchoolIntelligenceRawData {
  schoolUuid: string;
  schoolName: string;
  teachers: any[];
  assignments: any[];
  logs: any[];
  feedback: any[];
  doubts: any[];
  students: any[];
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

export async function getSchoolIntelligenceRawData(
  startDate?: string,
  endDate?: string
): Promise<SchoolIntelligenceRawData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = identity.schoolUuid;
  const schoolName = identity.schoolName;
  const supabase = getClient();

  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  const [teacherResult, assignmentResult, studentResult] = await Promise.all([
    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,subject,is_active")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name")
      .eq("school_uuid", schoolUuid),

    // students_master currently has school_name, not school_uuid.
    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_name,class_name,section_name")
      .eq("school_name", schoolName),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;

  const teachers = teacherResult.data ?? [];
  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];
  const assignmentIds = assignments.map((x: any) => x.id).filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      schoolUuid, schoolName, teachers, assignments, students,
      logs: [], feedback: [], doubts: [],
    };
  }

  let logsQuery = supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,log_date,class_name,section_name,subject_name,concepts_covered")
    .in("teacher_assignment_uuid", assignmentIds);

  if (startDate) logsQuery = logsQuery.gte("log_date", startDate);
  if (endDate) logsQuery = logsQuery.lte("log_date", endDate);

  const logResult = await logsQuery;
  if (logResult.error) throw logResult.error;

  const logs = logResult.data ?? [];
  const logIds = logs.map((x: any) => x.id).filter(Boolean);

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

  // pending_teacher_doubts stores school_name and assignment UUID as text.
  let doubtsQuery = supabase
    .from("pending_teacher_doubts")
    .select("id,teacher_assignment_uuid,daily_log_uuid,status,school_name,class_name,section_name,subject_name,log_date,doubt_resolved")
    .eq("school_name", schoolName)
    .in("teacher_assignment_uuid", assignmentIds.map(String));

  if (startDate) doubtsQuery = doubtsQuery.gte("log_date", startDate);
  if (endDate) doubtsQuery = doubtsQuery.lte("log_date", endDate);

  const doubtResult = await doubtsQuery;
  if (doubtResult.error) throw doubtResult.error;

  return {
    schoolUuid,
    schoolName,
    teachers,
    assignments,
    logs,
    feedback,
    doubts: doubtResult.data ?? [],
    students,
  };
}
