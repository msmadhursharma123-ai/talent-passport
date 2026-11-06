import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher, requireSchoolIdentity } from "../../../services/identityService";
import type { StudentStarPerformerSourceData } from "../types/StudentStarPerformerModels";

const PAGE_SIZE = 1000;
const CHUNK_SIZE = 100;

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function chunks<T>(values: T[], size = CHUNK_SIZE): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size));
  return result;
}

async function fetchPaged(buildQuery: (from: number, to: number) => any): Promise<any[]> {
  const result: any[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await buildQuery(from, to);
    if (error) throw error;

    const page = data ?? [];
    result.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return result;
}

async function resolveSchoolUuid(): Promise<string> {
  const teacher = getCurrentTeacher();
  if (teacher?.schoolUuid) return String(teacher.schoolUuid);

  const school = requireSchoolIdentity();
  const schoolUuid = String(school?.schoolUuid ?? "").trim();
  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");
  return schoolUuid;
}

/**
 * Completely additive source repository for Student Star Performers.
 *
 * It intentionally reads the authoritative student roster, classroom
 * assignments, teacher daily logs and student_daily_feedback tables. It does
 * not read or mutate student_wallets / credit_transactions because this
 * scorecard is specifically the Daily Feedback credit signal, not the
 * student's combined wallet balance.
 */
export async function getStudentStarPerformerSourceData(
  startDate: string,
  endDate: string,
): Promise<StudentStarPerformerSourceData> {
  const schoolUuid = await resolveSchoolUuid();
  const supabase = client();

  const [students, assignments] = await Promise.all([
    fetchPaged((from, to) =>
      supabase
        .from("students_master")
        .select("student_uuid,student_name,roll_number,school_uuid,class_name,section_name,created_at")
        .eq("school_uuid", schoolUuid)
        .range(from, to)
    ),
    fetchPaged((from, to) =>
      supabase
        .from("teacher_classroom_assignments")
        .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name")
        .eq("school_uuid", schoolUuid)
        .range(from, to)
    ),
  ]);

  const assignmentIds = assignments
    .map(row => String(row.id ?? "").trim())
    .filter(Boolean);

  let logs: any[] = [];
  for (const assignmentChunk of chunks(assignmentIds)) {
    const assignmentLogs = await fetchPaged((from, to) =>
      supabase
        .from("teacher_daily_logs")
        .select("id,teacher_assignment_uuid,log_date")
        .in("teacher_assignment_uuid", assignmentChunk)
        .gte("log_date", startDate)
        .lte("log_date", endDate)
        .order("log_date", { ascending: true })
        .range(from, to)
    );
    logs.push(...assignmentLogs);
  }

  const logIds = logs.map(row => String(row.id ?? "").trim()).filter(Boolean);
  let feedback: any[] = [];

  for (const logChunk of chunks(logIds)) {
    const feedbackRows = await fetchPaged((from, to) =>
      supabase
        .from("student_daily_feedback")
        .select("id,daily_log_uuid,student_uuid,understanding_level,submitted_at")
        .eq("school_uuid", schoolUuid)
        .in("daily_log_uuid", logChunk)
        .range(from, to)
    );
    feedback.push(...feedbackRows);
  }

  // Loop 2 credit is earned/penalized on the pending-doubt creation day,
  // not the original classroom log date. Include legacy rows whose creation
  // timestamp is absent and whose revision/log date is the calculator fallback.
  const loop2History: any[] = [];
  const loop2DateStart = `${startDate}T00:00:00+05:30`;
  const loop2DateEnd = `${endDate}T23:59:59.999+05:30`;
  const loop2DateFilter = [
    `and(created_at.gte.${loop2DateStart},created_at.lte.${loop2DateEnd})`,
    `and(created_at.is.null,revision_checked_at.gte.${loop2DateStart},revision_checked_at.lte.${loop2DateEnd})`,
    `and(created_at.is.null,revision_checked_at.is.null,log_date.gte.${startDate},log_date.lte.${endDate})`,
  ].join(",");

  for (const assignmentChunk of chunks(assignmentIds)) {
    const rows = await fetchPaged((from, to) =>
      supabase
        .from("pending_teacher_doubts")
        .select("id,student_uuid,student_response,status,created_at,revision_checked_at,log_date")
        .in("teacher_assignment_uuid", assignmentChunk)
        .or(loop2DateFilter)
        .order("created_at", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true })
        .range(from, to)
    );
    loop2History.push(...rows);
  }

  const assignmentById = new Map<string, any>(
    assignments.map(row => [String(row.id), row])
  );

  const normalizedLogs = logs
    .map(log => {
      const assignment = assignmentById.get(String(log.teacher_assignment_uuid ?? ""));
      if (!assignment) return null;

      return {
        id: String(log.id),
        teacher_assignment_uuid: String(log.teacher_assignment_uuid),
        log_date: log.log_date ?? null,
        class_name: String(assignment.class_name ?? "").trim(),
        section_name: String(assignment.section_name ?? "").trim(),
      };
    })
    .filter(Boolean) as StudentStarPerformerSourceData["logs"];

  return {
    schoolUuid,
    students: students.map(row => ({
      student_uuid: String(row.student_uuid ?? ""),
      student_name: String(row.student_name ?? "Student"),
      roll_number: row.roll_number == null ? null : String(row.roll_number).trim(),
      school_uuid: String(row.school_uuid ?? schoolUuid),
      class_name: row.class_name ?? null,
      section_name: row.section_name ?? null,
      created_at: row.created_at ?? null,
    })),
    assignments: assignments.map(row => ({
      id: String(row.id),
      teacher_uuid: row.teacher_uuid ? String(row.teacher_uuid) : null,
      school_uuid: String(row.school_uuid ?? schoolUuid),
      class_name: row.class_name ?? null,
      section_name: row.section_name ?? null,
      subject_name: row.subject_name ?? null,
    })),
    logs: normalizedLogs,
    feedback: feedback.map(row => ({
      id: String(row.id),
      daily_log_uuid: String(row.daily_log_uuid ?? ""),
      student_uuid: String(row.student_uuid ?? ""),
      understanding_level: row.understanding_level ?? null,
      submitted_at: row.submitted_at ?? null,
    })),
    loop2History: loop2History.map(row => ({
      id: String(row.id ?? ""),
      student_uuid: String(row.student_uuid ?? ""),
      student_response: row.student_response ?? null,
      status: row.status ?? null,
      created_at: row.created_at ?? null,
      revision_checked_at: row.revision_checked_at ?? null,
      log_date: row.log_date ?? null,
    })),
  };
}
