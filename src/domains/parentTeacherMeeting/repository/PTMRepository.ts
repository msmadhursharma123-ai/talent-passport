import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";
import { getCanonicalPTMExamPreparationRows } from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import type { CanonicalExamPreparationRow } from "../../examPreparationIntelligence/canonical/ExamPreparationTypes";
import {
  getTeacherAssignmentsByTeacher,
  filterTeacherAssignmentsToSchool,
} from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import {
  getLiveDoubtsForTeacherAssignments,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import type {
  PTMAssignment,
  PTMDateRange,
  PTMDoubt,
  PTMDoubtLedgerRow,
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

const PENDING_DOUBT_ASSIGNMENT_CHUNK_SIZE = 8;
const PENDING_DOUBT_PAGE_SIZE = 750;
const LIVE_DOUBT_ASSIGNMENT_CHUNK_SIZE = 10;

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function queryPendingDoubtRows(
  assignmentIds: string[],
  options: {
    status?: string;
    columns: string;
  }
): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase || assignmentIds.length === 0) return [];

  const rows: any[] = [];
  const uniqueAssignmentIds = unique(assignmentIds.filter(Boolean));

  // pending_teacher_doubts is a high-volume Loop-2 ledger. Keep the PTM
  // read bounded by the same assignment scope, batch wide assignment lists,
  // and page each batch so a large classroom cannot turn the PTM preload into
  // a single long-running PostgREST statement.
  for (const assignmentChunk of chunk(
    uniqueAssignmentIds,
    PENDING_DOUBT_ASSIGNMENT_CHUNK_SIZE
  )) {
    for (let offset = 0; ; offset += PENDING_DOUBT_PAGE_SIZE) {
      let query = (supabase as any)
        .from("pending_teacher_doubts")
        .select(options.columns)
        .in("teacher_assignment_uuid", assignmentChunk)
        .order("log_date", { ascending: true })
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + PENDING_DOUBT_PAGE_SIZE - 1);

      if (options.status) {
        query = query.eq("status", options.status);
      }
      const { data, error } = await query;
      if (error) throw error;

      const page = Array.isArray(data) ? data : [];
      rows.push(...page);
      if (page.length < PENDING_DOUBT_PAGE_SIZE) break;
    }
  }

  return rows;
}

async function queryLiveDoubtsInChunks(assignmentIds: string[], strict = true): Promise<any[]> {
  const uniqueAssignmentIds = unique(assignmentIds.filter(Boolean));
  if (uniqueAssignmentIds.length === 0) return [];

  const rows: any[] = [];
  for (const assignmentChunk of chunk(
    uniqueAssignmentIds,
    LIVE_DOUBT_ASSIGNMENT_CHUNK_SIZE
  )) {
    rows.push(...(await getLiveDoubtsForTeacherAssignments(assignmentChunk, strict)));
  }
  return rows;
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

async function queryDoubtLedger(
  assignmentIds: string[],
  startDate?: string,
  endDate?: string
): Promise<{ ledger: PTMDoubtLedgerRow[]; currentDoubts: PTMDoubt[]; liveRows: any[] }> {
  const supabase = getSupabaseClient();
  if (!supabase || assignmentIds.length === 0) {
    return { ledger: [], currentDoubts: [], liveRows: [] };
  }

  const pendingRows = await queryPendingDoubtRows(assignmentIds, {
    columns:
      "id,student_uuid,teacher_assignment_uuid,daily_log_uuid,subject_name,previous_topic_name,previous_difficult_concept,status,student_response,doubt_resolved,log_date,created_at,revision_checked_at",
  });

  let effectiveRows = pendingRows;
  let liveRows: any[] = [];
  try {
    // Keep PTM doubt reconciliation on the exact shared Loop-2 + Live
    // reconciliation path used by Exam Preparation. Do not apply the PTM
    // period before reconciliation: a historical Loop-2 row must remain
    // available so a matching Live row can overlay its state before the
    // canonical historical date is evaluated. Pagination/chunking above keeps
    // this read statement-bounded without changing reconciliation semantics.
    liveRows = await queryLiveDoubtsInChunks(assignmentIds, true);
    effectiveRows = mergePendingDoubtsWithLiveLedger(
      pendingRows ?? [],
      liveRows ?? [],
      { includeUnmatchedLive: true }
    );
  } catch (error) {
    // Live evidence is an all-or-nothing overlay for a PTM evidence load.
    // If any assignment chunk fails, never return a partial Live set: that
    // could make some students/subjects look Live-reconciled while others
    // silently fall back to Loop-2. Preserve the established PTM fail-safe
    // by using the complete Loop-2 snapshot and no Live feedback overlay.
    liveRows = [];
    effectiveRows = pendingRows;
    console.warn(
      "PTM DOUBT LEDGER LIVE READ FAILED — USING LOOP-2 DATA",
      error
    );
  }

  const reconciledRows = effectiveRows
    .map((row: any) => {
      const logDate = dateKey(
        row?.log_date ??
          row?.first_seen_at ??
          row?.source_submitted_at ??
          row?.latest_source_submitted_at ??
          row?.created_at ??
          ""
      );
      const studentUuid = String(row?.student_uuid ?? "").trim();
      const teacherAssignmentUuid = String(row?.teacher_assignment_uuid ?? "").trim();
      if (!studentUuid || !teacherAssignmentUuid || !logDate) return null;

      // Apply the PTM period only after Loop-2 + Live reconciliation.
      // This preserves the existing reconciliation hierarchy and historical
      // date precedence while still keeping the returned PTM evidence scoped.
      if (startDate && logDate < startDate) return null;
      if (endDate && logDate > endDate) return null;

      return {
        raw: row,
        ledger: {
          id: String(row?.id ?? ""),
          studentUuid,
          teacherAssignmentUuid,
          subjectName: String(row?.subject_name ?? ""),
          topicName: row?.previous_topic_name ?? row?.topic_name ?? null,
          concept: row?.previous_difficult_concept ?? row?.doubt_concept ?? null,
          status: row?.status ?? null,
          studentResponse: row?.student_response ?? null,
          doubtResolved: row?.doubt_resolved === true,
          source: row?._live_only === true ? "live" : "loop2",
          logDate,
        } as PTMDoubtLedgerRow,
      };
    })
    .filter(Boolean) as Array<{ raw: any; ledger: PTMDoubtLedgerRow }>;

  const ledger = reconciledRows.map((row) => row.ledger);
  const currentDoubts = reconciledRows
    .filter(({ raw }) => {
      if (raw?._live_only === true) {
        return raw?.doubt_resolved !== true &&
          String(raw?.status ?? "").trim().toUpperCase() !== "RESOLVED" &&
          String(raw?.student_response ?? "").trim().toUpperCase() !== "DISCUSSED";
      }
      return String(raw?.status ?? "").trim().toUpperCase() === "NOT DISCUSSED" &&
        raw?.doubt_resolved !== true;
    })
    .map(({ raw }) => mapDoubt(raw))
    .filter((row: PTMDoubt) => row.isUnresolved !== false);

  return { ledger, currentDoubts, liveRows };
}

async function loadPeerAssignmentsForClassrooms(
  schoolUuid: string,
  classrooms: Set<string>,
  fallbackAssignments: PTMAssignment[]
): Promise<PTMAssignment[]> {
  if (!schoolUuid || classrooms.size === 0) return fallbackAssignments;

  const supabase = getSupabaseClient();
  if (!supabase) return fallbackAssignments;

  /*
   * PTM is a classroom-level discussion surface, not a subject-owner-only
   * surface. Once a teacher is legitimately assigned to a classroom, the
   * PTM student card must be able to assemble the same student's evidence
   * across every active subject assignment in that classroom.
   *
   * Scope is deliberately restricted to:
   *   1. the authenticated teacher's school, and
   *   2. classroom + section combinations already assigned to that teacher.
   *
   * No other classroom/school assignments are pulled into PTM.
   */
  const { data, error } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select(
      "id,teacher_uuid,school_uuid,class_name,section_name,subject_name,is_active"
    )
    .eq("school_uuid", schoolUuid)
    .eq("is_active", true);

  if (error) {
    /*
     * Preserve the existing PTM behavior if a deployment's RLS configuration
     * does not yet expose peer classroom assignments. This makes the upgrade
     * additive and prevents a permissions issue from breaking the existing
     * teacher PTM workspace.
     */
    console.warn(
      "PTM PEER ASSIGNMENT READ FAILED — USING CURRENT TEACHER ASSIGNMENTS",
      error
    );
    return fallbackAssignments;
  }

  const peerAssignments = (data ?? [])
    .map((row: any) => mapAssignment(row))
    .filter(
      (assignment: PTMAssignment) =>
        assignment.id &&
        assignment.isActive &&
        classrooms.has(`${assignment.className}|||${assignment.sectionName}`)
    );

  const byId = new Map<string, PTMAssignment>();
  [...fallbackAssignments, ...peerAssignments].forEach((assignment) => {
    if (assignment.id) byId.set(assignment.id, assignment);
  });

  return Array.from(byId.values());
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

  const assignmentRows = filterTeacherAssignmentsToSchool(
    await getTeacherAssignmentsByTeacher(teacher.teacherUuid),
    teacher.schoolUuid
  );
  const currentTeacherAssignments = assignmentRows
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

  const classrooms = new Set(
    currentTeacherAssignments.map(
      (assignment) => `${assignment.className}|||${assignment.sectionName}`
    )
  );

  /*
   * ADDITIVE PTM UPGRADE:
   * The authenticated teacher remains the gatekeeper for which classrooms
   * appear in PTM. Within those classrooms, load every active subject
   * assignment so the selected student's report can be assembled across
   * English, Maths, Hindi, Science, Social Science, etc.
   */
  const assignments = await loadPeerAssignmentsForClassrooms(
    teacher.schoolUuid,
    classrooms,
    currentTeacherAssignments
  );

  const assignmentIds: string[] = unique(assignments.map((assignment) => assignment.id));
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
      doubtLedger: [],
    };
  }

  const today = todayIndia();
  const preloadStart = shiftDays(today, -PRELOAD_DAYS + 1);

  const [students, rawLogs, doubtEvidence] = await Promise.all([
    loadStudents(teacher.schoolUuid, teacher.schoolName ?? "", assignments),
    queryLogs(assignmentIds, preloadStart, today),
    queryDoubtLedger(assignmentIds, preloadStart, today),
  ]);

  const { ledger: doubtLedger, currentDoubts: pendingDoubts, liveRows } = doubtEvidence;

  const assignmentMap = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const logs = rawLogs.map((row) => mapLog(row, assignmentMap));
  const rawFeedback = await queryFeedback(logs.map((log) => log.id));

  const effectiveFeedback = mergeFeedbackUnderstandingLevels(
    rawFeedback,
    liveRows ?? []
  );

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
    doubtLedger,
  };
}

export async function getPTMCanonicalExamPreparationRows(
  student: PTMStudent,
  assignments: PTMAssignment[],
  range: { startDate?: string; endDateExclusive?: string }
): Promise<CanonicalExamPreparationRow[]> {
  const relevantAssignmentIds = assignments
    .filter(
      (assignment) =>
        assignment.isActive &&
        assignment.schoolUuid === student.schoolUuid &&
        assignment.className.trim().toLowerCase() === student.className.trim().toLowerCase() &&
        assignment.sectionName.trim().toLowerCase() === student.sectionName.trim().toLowerCase()
    )
    .map((assignment) => assignment.id)
    .filter(Boolean);

  if (relevantAssignmentIds.length === 0) return [];

  return getCanonicalPTMExamPreparationRows({
    studentUuid: student.studentUuid,
    assignmentIds: relevantAssignmentIds,
    schoolUuid: student.schoolUuid,
    className: student.className,
    sectionName: student.sectionName,
    startDate: range.startDate,
    endDateExclusive: range.endDateExclusive,
  });
}

function mapLiveFeedbackOverlay(
  rawFeedback: any[],
  liveRows: any[]
): PTMFeedback[] {
  return mergeFeedbackUnderstandingLevels(rawFeedback, liveRows ?? []).map(mapFeedback);
}

export async function getPTMAllTimeEvidence(
  assignmentIds: string[]
): Promise<{ logs: PTMLog[]; feedback: PTMFeedback[]; doubts: PTMDoubtLedgerRow[] }> {
  const uniqueAssignmentIds = unique(assignmentIds.filter(Boolean));
  if (uniqueAssignmentIds.length === 0) return { logs: [], feedback: [], doubts: [] };

  const supabase = getSupabaseClient();
  if (!supabase) return { logs: [], feedback: [], doubts: [] };

  const { data: rawLogs, error: logsError } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at")
    .in("teacher_assignment_uuid", uniqueAssignmentIds)
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (logsError) throw logsError;

  const { data: assignmentRows, error: assignmentError } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,is_active")
    .in("id", uniqueAssignmentIds);

  if (assignmentError) throw assignmentError;

  const assignmentMap = new Map<string, PTMAssignment>(
    (assignmentRows ?? []).map((row: any): [string, PTMAssignment] => [
      String(row.id),
      mapAssignment(row),
    ])
  );

  const logs = (rawLogs ?? []).map((row: any) => mapLog(row, assignmentMap));
  const rawFeedback = await queryFeedback(logs.map((log) => log.id));
  const { ledger: doubts, liveRows } = await queryDoubtLedger(uniqueAssignmentIds);
  const feedback = mapLiveFeedbackOverlay(rawFeedback, liveRows);

  return { logs, feedback, doubts };
}

export async function getPTMDateRangeEvidence(
  assignmentIds: string[],
  startDate: string,
  endDate: string
): Promise<{ logs: PTMLog[]; feedback: PTMFeedback[]; doubts: PTMDoubtLedgerRow[] }> {
  const uniqueAssignmentIds = unique(assignmentIds.filter(Boolean));
  if (uniqueAssignmentIds.length === 0) return { logs: [], feedback: [], doubts: [] };

  const supabase = getSupabaseClient();
  if (!supabase) return { logs: [], feedback: [], doubts: [] };

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

  const assignmentMap = new Map<string, PTMAssignment>(
    (assignmentRows ?? []).map((row: any): [string, PTMAssignment] => [
      String(row.id),
      mapAssignment(row),
    ])
  );

  const logs = (rawLogs ?? []).map((row: any) => mapLog(row, assignmentMap));
  const rawFeedback = await queryFeedback(logs.map((log) => log.id));
  const { ledger: doubts, liveRows } = await queryDoubtLedger(uniqueAssignmentIds, startDate, endDate);
  const feedback = mapLiveFeedbackOverlay(rawFeedback, liveRows);

  return { logs, feedback, doubts };
}
