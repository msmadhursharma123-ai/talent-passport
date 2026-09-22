import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";

export interface TeacherTeachingHistoryTeacher {
  teacherUuid: string;
  teacherName: string;
  subject: string;
  isActive: boolean;
}

export interface TeacherTeachingHistoryAssignment {
  id: string;
  teacherUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
}

export interface TeacherTeachingHistoryLog {
  id: string;
  teacherAssignmentUuid: string;
  logDate: string;
  topicName: string;
  conceptsCovered: string[];
  createdAt: string;
}

export interface TeacherTeachingHistoryData {
  teachers: TeacherTeachingHistoryTeacher[];
  assignments: TeacherTeachingHistoryAssignment[];
  logs: TeacherTeachingHistoryLog[];
  excludedDates: string[];
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

export async function getTeacherTeachingHistory(
  startDate: string,
  endDate: string,
  teacherUuid?: string,
): Promise<TeacherTeachingHistoryData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = String(identity.schoolUuid ?? "").trim();
  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error("Please select a valid start and end date.");
  }
  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date.");
  }

  const supabase = getClient();

  let teacherQuery = supabase
    .from("teachers_master")
    .select("teacher_uuid,full_name,school_uuid,subject,is_active")
    .eq("school_uuid", schoolUuid)
    .order("full_name", { ascending: true });

  if (teacherUuid) teacherQuery = teacherQuery.eq("teacher_uuid", teacherUuid);

  const assignmentQuery = supabase
    .from("teacher_classroom_assignments")
    .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,academic_year,is_active,created_at")
    .eq("school_uuid", schoolUuid)
    .order("class_name", { ascending: true })
    .order("section_name", { ascending: true })
    .order("subject_name", { ascending: true });

  const [teacherResult, assignmentResult] = await Promise.all([
    teacherQuery,
    assignmentQuery,
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;

  const teachers: TeacherTeachingHistoryTeacher[] = (teacherResult.data ?? []).map((row: any) => ({
    teacherUuid: String(row.teacher_uuid ?? ""),
    teacherName: String(row.full_name ?? "Teacher"),
    subject: String(row.subject ?? ""),
    isActive: row.is_active !== false,
  })).filter((row: TeacherTeachingHistoryTeacher) => Boolean(row.teacherUuid));

  const selectedTeacherIds = new Set(teachers.map((teacher) => teacher.teacherUuid));

  const assignments: TeacherTeachingHistoryAssignment[] = (assignmentResult.data ?? [])
    .map((row: any) => ({
      id: String(row.id ?? ""),
      teacherUuid: String(row.teacher_uuid ?? ""),
      className: String(row.class_name ?? ""),
      sectionName: String(row.section_name ?? ""),
      subjectName: String(row.subject_name ?? ""),
      academicYear: String(row.academic_year ?? ""),
      isActive: row.is_active !== false,
      createdAt: String(row.created_at ?? ""),
    }))
    .filter((row: TeacherTeachingHistoryAssignment) =>
      Boolean(row.id) && selectedTeacherIds.has(row.teacherUuid)
    );

  const assignmentIds = assignments.map((assignment) => assignment.id);

  let excludedDates: string[] = [];
  const holidayResult = await supabase
    .from("school_calendar_holidays")
    .select("holiday_date")
    .eq("school_uuid", schoolUuid)
    .gte("holiday_date", startDate)
    .lte("holiday_date", endDate);

  if (holidayResult.error) {
    throw holidayResult.error;
  }

  excludedDates = (holidayResult.data ?? [])
    .map((row: any) => String(row.holiday_date ?? "").trim())
    .filter(Boolean);

  if (!assignmentIds.length) {
    return { teachers, assignments, logs: [], excludedDates };
  }

  const { data, error } = await supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const logs: TeacherTeachingHistoryLog[] = (data ?? []).map((row: any) => ({
    id: String(row.id ?? ""),
    teacherAssignmentUuid: String(row.teacher_assignment_uuid ?? ""),
    logDate: String(row.log_date ?? ""),
    topicName: String(row.topic_name ?? ""),
    conceptsCovered: Array.isArray(row.concepts_covered)
      ? row.concepts_covered.map((item: unknown) => String(item ?? "").trim()).filter(Boolean)
      : [],
    createdAt: String(row.created_at ?? ""),
  })).filter((row: TeacherTeachingHistoryLog) => Boolean(row.id && row.teacherAssignmentUuid && row.logDate));

  return { teachers, assignments, logs, excludedDates };
}
