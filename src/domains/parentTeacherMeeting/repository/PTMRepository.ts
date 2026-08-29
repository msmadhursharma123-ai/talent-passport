import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import {
  getLiveDoubtsForTeacherAssignments,
  mergeFeedbackUnderstandingLevels,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import type {
  PTMAssignment,
  PTMDateRange,
  PTMDoubt,
  PTMFeedback,
  PTMLog,
  PTMPreparedDataset,
  PTMStudent,
} from "../types/PTMModels";

const PRELOAD_DAYS = 90;

function dateKey(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  return `${parts.find((p) => p.type === "year")?.value ?? ""}-${parts.find((p) => p.type === "month")?.value ?? ""}-${parts.find((p) => p.type === "day")?.value ?? ""}`;
}

function todayIndia(): string {
  return dateKey(new Date());
}

function shiftDays(base: string, amount: number): string {
  const date = new Date(`${base}T00:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateKey(date);
}

function toUtcBoundary(date: string, endExclusive = false): string {
  const base = new Date(`${date}T00:00:00+05:30`);
  if (endExclusive) base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString();
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function mapAssignment(row: any): PTMAssignment {
  return {
    id: String(row.id),
    teacherUuid: String(row.teacher_uuid ?? ""),
    schoolUuid: String(row.school_uuid ?? ""),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    isActive: row.is_active !== false,
  };
}

function mapStudent(row: any, schoolName: string): PTMStudent {
  return {
    studentUuid: String(row.student_uuid ?? ""),
    studentName: String(row.student_name ?? "Student"),
    studentId: row.student_id ? String(row.student_id) : undefined,
    studentEmail: row.student_email ? String(row.student_email).trim() : null,
    schoolUuid: String(row.school_uuid ?? ""),
    schoolName: String(row.school_name ?? schoolName ?? ""),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
  };
}

function mapLog(row: any, assignmentMap: Map<string, PTMAssignment>): PTMLog {
  const assignment = assignmentMap.get(String(row.teacher_assignment_uuid ?? ""));
  return {
    id: String(row.id),
    teacherAssignmentUuid: String(row.teacher_assignment_uuid ?? ""),
    logDate: dateKey(row.log_date ?? row.created_at),
    topicName: String(row.topic_name ?? "").trim(),
    conceptsCovered: Array.isArray(row.concepts_covered) ? row.concepts_covered.map(String) : [],
    className: assignment?.className ?? "",
    sectionName: assignment?.sectionName ?? "",
    subjectName: assignment?.subjectName ?? "",
  };
}

function mapFeedback(row: any): PTMFeedback {
  return {
    id: String(row.id),
    dailyLogUuid: String(row.daily_log_uuid ?? ""),
    studentUuid: String(row.student_uuid ?? ""),
    submittedAt: row.submitted_at ?? null,
    subjectName: String(row.subject_name ?? ""),
    topicName: String(row.topic_name ?? ""),
    understandingLevel: String(row.understanding_level ?? ""),
    conceptsNotUnderstood: Array.isArray(row.concepts_not_understood)
      ? row.concepts_not_understood.map(String)
      : [],
  };
}

function mapDoubt(row: any): PTMDoubt {
  return {
    id: row.id ? String(row.id) : undefined,
    studentUuid: String(row.student_uuid ?? ""),
    teacherAssignmentUuid: String(row.teacher_assignment_uuid ?? ""),
    subjectName: String(row.subject_name ?? ""),
    topicName: row.previous_topic_name ?? row.topic_name ?? null,
    concept: row.previous_difficult_concept ?? row.doubt_concept ?? null,
    status: row.status ?? null,
    isUnresolved:
      typeof row.is_unresolved === "boolean"
        ? row.is_unresolved
        : String(row.status ?? "").toUpperCase() !== "RESOLVED" && row.doubt_resolved !== true,
    firstSeenAt:
      row.first_seen_at ??
      row.log_date ??
      row.source_submitted_at ??
      row.created_at ??
      null,
  };
}

async function queryLogs(
  assignmentIds: string[],
  startDate: string,
  endDate: string
): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase || assignmentIds.length === 0) return [];

  const { data, error } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", toUtcBoundary(startDate))
    .lt("log_date", toUtcBoundary(endDate, true))
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function queryFeedback(logIds: string[]): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase || logIds.length === 0) return [];

  const { data, error } = await (supabase as any)
    .from("student_daily_feedback")
    .select(
      "id,daily_log_uuid,student_uuid,submitted_at,subject_name,topic_name,understanding_level,concepts_not_understood"
    )
    .in("daily_log_uuid", logIds);

  if (error) throw error;
  return data ?? [];
}

async function queryCurrentDoubts(assignmentIds: string[]): Promise<PTMDoubt[]> {
  if (assignmentIds.length === 0) return [];

  try {
    const liveRows = await getLiveDoubtsForTeacherAssignments(assignmentIds);
    const live = (liveRows ?? [])
      .filter((row: any) => row.is_unresolved)
      .map(mapDoubt);

    if (live.length > 0) return live;
  } catch (error) {
    console.warn("PTM LIVE DOUBT READ FAILED — USING PENDING DOUBT FALLBACK", error);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await (supabase as any)
    .from("pending_teacher_doubts")
    .select(
      "id,student_uuid,teacher_assignment_uuid,subject_name,previous_topic_name,previous_difficult_concept,status,doubt_resolved,log_date,created_at"
    )
    .in("teacher_assignment_uuid", assignmentIds);

  if (error) throw error;

  return (data ?? []).map(mapDoubt).filter((row: PTMDoubt) => row.isUnresolved);
}

async function loadStudents(
  schoolUuid: string,
  schoolName: string,
  assignments: PTMAssignment[]
): Promise<PTMStudent[]> {
  const supabase = getSupabaseClient();
  if (!supabase || assignments.length === 0) return [];

  const classrooms = new Set(
    assignments.map((assignment) => `${assignment.className}|||${assignment.sectionName}`)
  );

  const { data, error } = await (supabase as any)
    .from("students_master")
    .select(
      "student_uuid,student_name,student_id,student_email,school_uuid,school_name,class_name,section_name"
    )
    .eq("school_uuid", schoolUuid);

  if (error) throw error;

  let rows = data ?? [];

  if (rows.length === 0 && schoolName) {
    const fallback = await (supabase as any)
      .from("students_master")
      .select(
        "student_uuid,student_name,student_id,student_email,school_uuid,school_name,class_name,section_name"
      )
      .eq("school_name", schoolName);
    if (fallback.error) throw fallback.error;
    rows = fallback.data ?? [];
  }

  return rows
    .map((row: any) => mapStudent(row, schoolName))
    .filter((student: PTMStudent) =>
      classrooms.has(`${student.className}|||${student.sectionName}`)
    );
}

export async function getPTMPreparedDataset(): Promise<PTMPreparedDataset> {
  const teacher = getCurrentTeacher();
  if (!teacher) throw new Error("Teacher identity is not available.");
  if (!teacher.teacherUuid) throw new Error("Teacher UUID is missing.");
  if (!teacher.schoolUuid) throw new Error("Teacher school UUID is missing.");

  const assignmentRows = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const assignments = assignmentRows
    .filter((assignment: any) => assignment.isActive !== false)
    .map((assignment: any) => mapAssignment({
      id: assignment.id,
      teacher_uuid: assignment.teacherUuid,
      school_uuid: assignment.schoolUuid,
      class_name: assignment.className,
      section_name: assignment.sectionName,
      subject_name: assignment.subjectName,
      is_active: assignment.isActive,
    }))
    .filter((assignment) => assignment.id);

  const assignmentIds = unique(assignments.map((assignment) => assignment.id));
  if (assignmentIds.length === 0) {
    return {
      teacherUuid: teacher.teacherUuid,
      teacherName: teacher.teacherName ?? "Teacher",
      schoolUuid: teacher.schoolUuid,
      schoolName: teacher.schoolName ?? "",
      assignments: [],
      students: [],
      logs: [],
      feedback: [],
      pendingDoubts: [],
    };
  }

  const today = todayIndia();
  const preloadStart = shiftDays(today, -PRELOAD_DAYS + 1);

  const [students, rawLogs, pendingDoubts] = await Promise.all([
    loadStudents(teacher.schoolUuid, teacher.schoolName ?? "", assignments),
    queryLogs(assignmentIds, preloadStart, today),
    queryCurrentDoubts(assignmentIds),
  ]);

  const assignmentMap = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const logs = rawLogs.map((row) => mapLog(row, assignmentMap));
  const rawFeedback = await queryFeedback(logs.map((log) => log.id));

  let effectiveFeedback = rawFeedback;
  try {
    const liveRows = await getLiveDoubtsForTeacherAssignments(assignmentIds);
    effectiveFeedback = mergeFeedbackUnderstandingLevels(
      rawFeedback,
      (liveRows ?? []).filter((row: any) => row.last_reconciled_at)
    );
  } catch (error) {
    console.warn("PTM FEEDBACK LIVE OVERLAY FAILED — ORIGINAL FEEDBACK PRESERVED", error);
  }

  return {
    teacherUuid: teacher.teacherUuid,
    teacherName: teacher.teacherName ?? "Teacher",
    schoolUuid: teacher.schoolUuid,
    schoolName: teacher.schoolName ?? "",
    assignments,
    students,
    logs,
    feedback: effectiveFeedback.map(mapFeedback),
    pendingDoubts,
  };
}

export async function getPTMDateRangeEvidence(
  assignmentIds: string[],
  startDate: string,
  endDate: string
): Promise<{ logs: PTMLog[]; feedback: PTMFeedback[] }> {
  const uniqueAssignmentIds = unique(assignmentIds.filter(Boolean));
  if (uniqueAssignmentIds.length === 0) return { logs: [], feedback: [] };

  const supabase = getSupabaseClient();
  if (!supabase) return { logs: [], feedback: [] };

  const { data: rawLogs, error: logsError } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at")
    .in("teacher_assignment_uuid", uniqueAssignmentIds)
    .gte("log_date", toUtcBoundary(startDate))
    .lt("log_date", toUtcBoundary(endDate, true))
    .order("log_date", { ascending: true });

  if (logsError) throw logsError;

  const { data: assignmentRows, error: assignmentError } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,is_active")
    .in("id", uniqueAssignmentIds);

  if (assignmentError) throw assignmentError;

  const assignmentMap = new Map(
    (assignmentRows ?? []).map((row: any) => [String(row.id), mapAssignment(row)])
  );

  const logs = (rawLogs ?? []).map((row: any) => mapLog(row, assignmentMap));
  const feedback = (await queryFeedback(logs.map((log) => log.id))).map(mapFeedback);

  return { logs, feedback };
}
