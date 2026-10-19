import { getSupabaseClient } from "../../../supabaseClient";
import { requireTeacherIdentity } from "../../../services/identityService";
import { buildLearningEvidenceReport } from "../engine/buildLearningEvidenceReport";
import { readPaged, type ReadBudget } from "./BoundedRead";
import { assertSchoolScope } from "./ScopeGuard";
import { validateCurrentYearAssignments } from "./CurrentYearAssignments";
import { resolveCurrentAcademicYear } from "./CurrentAcademicYearGuard";
import { buildVerifiedEnrollmentRoster, classroomRosterKey } from "./EnrollmentRoster";
import { buildStudentEvidenceDetails } from "./StudentEvidenceDetails";
import type {
  LearningEvidenceAssignment,
  LearningEvidenceFeedbackRow,
  LearningEvidenceLogRow,
  LearningEvidenceReport,
} from "../types/LearningEvidenceTypes";

const ID_BATCH_SIZE = 100;
const MAX_WINDOW_DAYS = 30;

function isoDateInIndia(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function dateDiffDays(start: string, end: string): number {
  return Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}
function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}
function normalize(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}
function classroomKey(className: unknown, sectionName: unknown): string {
  return `${normalize(className)}|${normalize(sectionName)}`;
}


export interface TeacherLearningEvidenceReportOptions {
  /** Optional ISO date. Defaults to the last 30 days, India local date. */
  windowStart?: string;
  /** Optional ISO date. Defaults to India local date. */
  windowEnd?: string;
}

/**
 * Read-only, school-scoped report. It deliberately does not query backup tables,
 * assessment tables, Live Doubt Layer tables, or any RPC that mutates state.
 */
export async function getTeacherLearningEvidenceReport(
  options: TeacherLearningEvidenceReportOptions = {},
): Promise<LearningEvidenceReport> {
  const identity = requireTeacherIdentity();
  if (!identity?.schoolUuid || !identity?.teacherUuid) throw new Error("Learning Evidence Engine requires an authenticated teacher identity with school scope.");

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const client = supabase as any;
  const today = isoDateInIndia(new Date());
  const windowEnd = options.windowEnd ?? today;
  const defaultStart = isoDateInIndia(new Date(Date.parse(`${windowEnd}T00:00:00Z`) - (MAX_WINDOW_DAYS - 1) * 86_400_000));
  const windowStart = options.windowStart ?? defaultStart;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(windowStart) || !/^\d{4}-\d{2}-\d{2}$/.test(windowEnd)) {
    throw new Error("Learning Evidence Engine dates must use YYYY-MM-DD format.");
  }
  const span = dateDiffDays(windowStart, windowEnd);
  if (!Number.isFinite(span) || span < 0 || span >= MAX_WINDOW_DAYS) {
    throw new Error(`Learning Evidence Engine supports a maximum ${MAX_WINDOW_DAYS}-day inclusive window.`);
  }

  const schoolUuid = String(identity.schoolUuid);
  // Resolve the current academic year explicitly. SchoolIdentity does not carry
  // an academic-year identifier, so never infer it from class labels or dates.
  const currentYearResult = await client.from("school_academic_years")
    .select("id,school_uuid,is_current,status,start_date,academic_year_code")
    .eq("school_uuid", schoolUuid)
    .eq("is_current", true)
    .order("start_date", { ascending: false })
    .limit(2);
  if (currentYearResult.error) {
    throw new Error(`Learning Evidence Engine: failed to resolve current academic year: ${currentYearResult.error.message ?? String(currentYearResult.error)}`);
  }
  const currentYear = resolveCurrentAcademicYear(currentYearResult.data ?? [], schoolUuid);
  const academicYearCode = String(currentYear.academic_year_code ?? "").trim();
  if (!academicYearCode) throw new Error("Learning Evidence Engine stopped: current academic year has no academic-year code.");

  // Assignment academic_year is the established year-code column. The supplied
  // academic_year_guard_row() trigger evidence confirms academic_year_id is
  // populated on assignments, logs, and feedback; filter all three by the exact
  // current school_academic_years.id as well as their canonical linked IDs.
  // One budget is shared across every source and every ID batch in this report.
  const readBudget: ReadBudget = { totalRows: 0 };
  // The trigger resolves assignment years with lower(btrim(academic_year_code))
  // = lower(btrim(assignment.academic_year)). PostgREST ilike cannot express
  // that exact trim-based comparison: it would omit valid legacy values with
  // surrounding whitespace and treats %/_ in a code as pattern operators.
  // Fetch assignments within this school regardless of their current active flag.
  // Historical daily logs remain evidence after an assignment is deactivated; the
  // audited monthly-review SQL scopes by school/year/date and does not require
  // a.is_active=true. Apply canonical code and exact ID validation in code.
  // The shared read budget makes unusually large candidate sets fail closed.
  const assignmentCandidates = await readPaged<any>(
    () => client.from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,academic_year_id,class_name,section_name,subject_name,is_active")
      .eq("school_uuid", schoolUuid)
      .eq("teacher_uuid", String(identity.teacherUuid))
      .order("id", { ascending: true }),
    "teacher- and school-scoped classroom assignment candidates", readBudget,
  );
  assertSchoolScope(assignmentCandidates, schoolUuid, "classroom assignments");
  const assignmentsRaw = validateCurrentYearAssignments(assignmentCandidates, schoolUuid, String(currentYear.id), academicYearCode);
  if (assignmentsRaw.length === 0) {
    throw new Error("Learning Evidence Engine stopped: no classroom assignments were found for this teacher in the current academic year; the report cannot safely infer that there is no learning evidence.");
  }

  // The audited onboarding function writes student_academic_enrollments with
  // student_uuid, school_uuid, school_academic_year_id, class_name,
  // section_name and status='ACTIVE'. This is the canonical year-linked roster;
  // use mutable students_master profiles only in the zero-enrollment legacy compatibility path.
  const enrollmentRows = await readPaged<any>(
    () => client.from("student_academic_enrollments")
      .select("student_uuid,school_uuid,school_academic_year_id,class_name,section_name,status")
      .eq("school_uuid", schoolUuid)
      .eq("school_academic_year_id", currentYear.id)
      // Status is normalized case-insensitively by buildVerifiedEnrollmentRoster.
      // Do not filter with PostgREST's case-sensitive equality before validation.
      .order("student_uuid", { ascending: true }),
    "current-year active student enrollments", readBudget,
  );
  let eligibleStudentUuidsByClassroom: ReadonlyMap<string, ReadonlySet<string>>;
  let rosterSource: "academic_year_enrollments" | "legacy_master_profiles" = "academic_year_enrollments";
  if (enrollmentRows.length > 0) {
    // Year-linked rows remain authoritative. Never mix a partial or malformed
    // enrollment roster with mutable legacy profile data.
    eligibleStudentUuidsByClassroom = buildVerifiedEnrollmentRoster(enrollmentRows, schoolUuid, String(currentYear.id));
  } else {
    // Live diagnostics for this school show 29 master students and zero
    // enrollment rows for its ACTIVE/current year. Use a strictly school-scoped
    // compatibility roster only in this zero-row migration state.
    const masterRows = await readPaged<any>(
      () => client.from("students_master")
        .select("student_uuid,school_uuid,class_name,section_name,account_status")
        .eq("school_uuid", schoolUuid)
        .order("student_uuid", { ascending: true }),
      "school-scoped legacy student profile roster", readBudget,
    );
    assertSchoolScope(masterRows, schoolUuid, "legacy student profile roster");
    const fallback = new Map<string, Set<string>>();
    const seen = new Set<string>();
    for (const student of masterRows) {
      const id = String(student.student_uuid ?? "").trim();
      const status = String(student.account_status ?? "active").trim().toLowerCase();
      const className = String(student.class_name ?? "").trim();
      const sectionName = String(student.section_name ?? "").trim();
      if (!id || !className || !sectionName || !["active", "enabled"].includes(status)) continue;
      if (seen.has(id)) throw new Error("Learning Evidence Engine stopped: duplicate student UUID in legacy master-profile roster.");
      seen.add(id);
      const key = classroomRosterKey(className, sectionName);
      const members = fallback.get(key) ?? new Set<string>();
      members.add(id); fallback.set(key, members);
    }
    if (seen.size === 0) throw new Error("Learning Evidence Engine stopped: no year-linked enrollments or usable active legacy student profiles exist for this school.");
    eligibleStudentUuidsByClassroom = fallback;
    rosterSource = "legacy_master_profiles";
  }
  for (const row of assignmentsRaw) {
    const key = classroomRosterKey(row.class_name, row.section_name);
    if (!eligibleStudentUuidsByClassroom.has(key)) {
      throw new Error(`Learning Evidence Engine stopped: no ACTIVE academic-year enrollment roster exists for assigned classroom ${String(row.class_name ?? "")} / ${String(row.section_name ?? "")}.`);
    }
  }

  const assignmentIds = assignmentsRaw.map((row) => row.id).filter((id) => id != null);
  const assignmentById = new Map<string, LearningEvidenceAssignment>();
  const teacherUuids = Array.from(new Set(assignmentsRaw.map((row) => String(row.teacher_uuid ?? "")).filter(Boolean)));
  const teacherNames = new Map<string, string>();
  for (const teacherBatch of chunks(teacherUuids, ID_BATCH_SIZE)) {
    const teachers = await readPaged<any>(
      () => client.from("teachers_master")
        .select("teacher_uuid,full_name,school_uuid")
        .eq("school_uuid", schoolUuid)
        .in("teacher_uuid", teacherBatch)
        .order("teacher_uuid", { ascending: true }),
      "school-scoped teacher names", readBudget,
    );
    assertSchoolScope(teachers, schoolUuid, "teacher records");
    for (const teacher of teachers) teacherNames.set(String(teacher.teacher_uuid), String(teacher.full_name ?? "Teacher"));
  }
  for (const row of assignmentsRaw) {
    if (row.id == null || !row.teacher_uuid) continue;
    assignmentById.set(String(row.id), {
      id: row.id, teacher_uuid: String(row.teacher_uuid),
      teacher_name: teacherNames.get(String(row.teacher_uuid)) ?? "Teacher",
      class_name: String(row.class_name ?? ""), section_name: String(row.section_name ?? ""),
      subject_name: String(row.subject_name ?? ""), is_active: row.is_active,
    });
  }

  const logs: LearningEvidenceLogRow[] = [];
  for (const idBatch of chunks(assignmentIds, ID_BATCH_SIZE)) {
    const batchRows = await readPaged<any>(
      () => client.from("teacher_daily_logs")
        .select("id,teacher_assignment_uuid,academic_year_id,topic_name,concepts_covered,log_date,created_at")
        .in("teacher_assignment_uuid", idBatch)
        .gte("log_date", windowStart)
        .lte("log_date", windowEnd)
        .order("log_date", { ascending: true })
        .order("id", { ascending: true }),
      "date-bounded teacher daily logs", readBudget,
    );
    for (const row of batchRows) {
      // The audited trigger intentionally permits legacy rows to retain NULL
      // academic_year_id. The exact selected assignment establishes their year;
      // a non-null conflicting year is rejected.
      if (row.academic_year_id != null && String(row.academic_year_id) !== String(currentYear.id)) continue;
      logs.push(row);
    }
  }

  const feedback: LearningEvidenceFeedbackRow[] = [];
  const logIds = Array.from(new Set(logs.map((row) => String(row.id)).filter(Boolean)));
  for (const logIdBatch of chunks(logIds, ID_BATCH_SIZE)) {
    const batchRows = await readPaged<any>(
      () => client.from("student_daily_feedback")
        .select("id,daily_log_uuid,student_uuid,teacher_uuid,school_uuid,academic_year_id,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt,additional_note,submitted_at")
        .eq("school_uuid", schoolUuid)
        .in("daily_log_uuid", logIdBatch)
        .order("submitted_at", { ascending: true })
        .order("id", { ascending: true }),
      "school-scoped student feedback", readBudget,
    );
    assertSchoolScope(batchRows, schoolUuid, "student feedback");
    for (const row of batchRows) {
      // Legacy NULL year IDs are accepted only through the exact selected log
      // relationship. Explicitly conflicting academic-year IDs are excluded.
      if (row.academic_year_id != null && String(row.academic_year_id) !== String(currentYear.id)) continue;
      feedback.push(row);
    }
  }

  // The audited onboarding function establishes student_academic_enrollments
  // as the year-linked roster. Use it for membership and class strength; never
  // treat mutable students_master class/section profiles as year-specific historical truth unless the explicit zero-enrollment compatibility caveat applies.
  const report = buildLearningEvidenceReport({
    windowStart, windowEnd, assignments: Array.from(assignmentById.values()), logs, feedback,
    eligibleStudentUuidsByClassroom,
  });
  report.caveats.push(
    "Assignments are scoped to the exact current academic-year ID and matching academic-year code. Logs and feedback are linked to those assignments/logs; explicit conflicting year IDs are excluded. Legacy NULL year IDs are accepted only through the exact parent relationship described in the database trigger audit."
  );
  report.caveats.push(
    rosterSource === "academic_year_enrollments"
      ? "Eligible classroom strength uses ACTIVE student_academic_enrollments for the exact school academic-year ID. Feedback participation coverage counts eligible, non-absence respondents in the class/section/subject; it is not the share naming a particular concept."
      : "DATA-COMPATIBILITY LIMITATION: zero student_academic_enrollments rows exist for the current academic year. Roster membership and class strength therefore use active school-scoped students_master profiles (class_name/section_name). These mutable profiles are not a verified year-specific historical roster; backfill year-linked enrollments before relying on year-over-year comparisons. This fallback is used only when the selected year has zero enrollment rows, never for a partial enrollment roster."
  );
  // Resolve display names only for students already present in validated, year-scoped feedback. This is never used to establish enrollment or classroom membership.
  const detailStudentIds = Array.from(new Set(feedback.map((row) => String(row.student_uuid ?? "").trim()).filter((id) => id && Array.from(eligibleStudentUuidsByClassroom.values()).some((roster) => roster.has(id)))));
  const studentNamesByUuid = new Map<string, string>();
  for (const studentBatch of chunks(detailStudentIds, ID_BATCH_SIZE)) {
    const students = await readPaged<any>(
      () => client.from("students_master").select("student_uuid,student_name,school_uuid")
        .eq("school_uuid", schoolUuid).in("student_uuid", studentBatch).order("student_uuid", { ascending: true }),
      "school-scoped student display names", readBudget,
    );
    assertSchoolScope(students, schoolUuid, "student display names");
    for (const student of students) { const id=String(student.student_uuid ?? "").trim(); const name=String(student.student_name ?? "").trim(); if(id && name) studentNamesByUuid.set(id,name); }
  }
  const studentDetailsByFinding = buildStudentEvidenceDetails({ report, assignments: Array.from(assignmentById.values()), logs, feedback, eligibleStudentUuidsByClassroom, studentNamesByUuid });
  return Object.assign(report, { studentDetailsByFinding });
}
