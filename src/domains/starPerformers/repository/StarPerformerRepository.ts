import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher, requireSchoolIdentity } from "../../../services/identityService";
import {
  getLiveDoubtsForTeacherAssignments,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import type { StarPerformerRow } from "../types/StarPerformerModels";

const TABLE = "school_star_performer_periods";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function dateKey(value: unknown) {
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

  return `${parts.find(p => p.type === "year")?.value ?? ""}-${parts.find(p => p.type === "month")?.value ?? ""}-${parts.find(p => p.type === "day")?.value ?? ""}`;
}

function sourceDate(row: any) {
  // pending_teacher_doubts persists the original classroom date in log_date.
  // The live reconciliation ledger may expose additional source-date fields,
  // so they remain safe fallbacks for live rows.
  return (
    row?.log_date ??
    row?.first_seen_at ??
    row?.latest_source_submitted_at ??
    row?.source_submitted_at ??
    row?.last_seen_at ??
    row?.created_at
  );
}

function inRange(value: unknown, start: string, end: string) {
  const key = dateKey(value);
  return Boolean(key) && key >= start && key <= end;
}

async function resolveSchoolContext() {
  const teacher = getCurrentTeacher();

  if (teacher?.schoolUuid) {
    return {
      schoolUuid: String(teacher.schoolUuid),
      schoolName: String(teacher.schoolName ?? ""),
      teacherUuid: String(teacher.teacherUuid ?? ""),
    };
  }

  const school = requireSchoolIdentity();

  if (!school?.schoolUuid) {
    throw new Error("Authenticated school UUID is missing.");
  }

  return {
    schoolUuid: String(school.schoolUuid),
    schoolName: String(school.schoolName ?? ""),
    teacherUuid: "",
  };
}

async function getSchoolOnboardingDate(schoolUuid: string): Promise<string> {
  const supabase = client();

  /*
   * The school master row is the authoritative school-account record. We use
   * select("*") deliberately here so this additive feature does not assume a
   * particular optional timestamp column name and create another 400 if the
   * project schema evolves. The existing school creation flow inserts the
   * school row first and returns its school_uuid.
   */
  try {
    const { data, error } = await supabase
      .from("schools_master")
      .select("*")
      .eq("school_uuid", schoolUuid)
      .maybeSingle();

    if (!error && data) {
      const candidate =
        data.created_at ??
        data.onboarded_at ??
        data.onboarding_date ??
        data.school_created_at ??
        data.account_created_at ??
        data.subscription_start_date;

      const key = dateKey(candidate);
      if (key) return key;
    }

    if (error) {
      console.warn("STAR PERFORMERS SCHOOL ONBOARDING LOOKUP FAILED", error);
    }
  } catch (error) {
    console.warn("STAR PERFORMERS SCHOOL ONBOARDING LOOKUP FAILED", error);
  }

  /*
   * School Admin rows can carry their own creation timestamp in installations
   * where the admin profile was created after the school master row. Never use
   * this to move the boundary earlier than the school master date.
   */
  try {
    const { data, error } = await supabase
      .from("school_admins")
      .select("*")
      .eq("school_uuid", schoolUuid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const key = dateKey(
        data.created_at ??
        data.onboarded_at ??
        data.onboarding_date ??
        data.account_created_at
      );
      if (key) return key;
    }
  } catch (error) {
    console.warn("STAR PERFORMERS SCHOOL ADMIN ONBOARDING LOOKUP FAILED", error);
  }

  /*
   * Final conservative fallback: subscription start is already part of the
   * existing school creation flow. If no creation timestamp is exposed, it is
   * preferable to start recognition here than to fabricate January history.
   */
  try {
    const { data } = await supabase
      .from("schools_master")
      .select("subscription_start_date")
      .eq("school_uuid", schoolUuid)
      .maybeSingle();

    const key = dateKey(data?.subscription_start_date);
    if (key) return key;
  } catch {
    // Keep the feature fail-safe below.
  }

  // Fail closed rather than showing pre-onboarding recognition periods.
  return dateKey(new Date());
}

async function fetchRawYearData(year: number) {
  const supabase = client();
  const context = await resolveSchoolContext();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const [teacherResult, assignmentResult, studentResult] = await Promise.all([
    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,is_active")
      .eq("school_uuid", context.schoolUuid),

    supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name")
      .eq("school_uuid", context.schoolUuid),

    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_uuid,class_name,section_name")
      .eq("school_uuid", context.schoolUuid),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;

  const teachers = teacherResult.data ?? [];
  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];

  const assignmentIds = assignments
    .map((assignment: any) => assignment.id)
    .filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      schoolUuid: context.schoolUuid,
      teachers,
      assignments,
      students,
      logs: [],
      feedback: [],
      doubts: [],
      liveRows: [],
    };
  }

  const [logsResult, doubtsResult, liveResult] = await Promise.all([
    supabase
      .from("teacher_daily_logs")
      .select(
        "id,teacher_assignment_uuid,topic_name,concepts_covered,log_date,created_at,updated_at"
      )
      .in("teacher_assignment_uuid", assignmentIds)
      .gte("log_date", startDate)
      .lte("log_date", endDate),

    supabase
      .from("pending_teacher_doubts")
      .select(
        "id,student_uuid,teacher_assignment_uuid,daily_log_uuid,status,student_response,log_date,doubt_resolved,revision_checked_at,created_at,previous_topic_name,previous_difficult_concept"
      )
      .in("teacher_assignment_uuid", assignmentIds)
      .gte("log_date", startDate)
      .lte("log_date", endDate),

    getLiveDoubtsForTeacherAssignments(assignmentIds.map(String)),
  ]);

  if (logsResult.error) throw logsResult.error;
  if (doubtsResult.error) throw doubtsResult.error;

  const logs = logsResult.data ?? [];
  const logIds = logs.map((log: any) => log.id).filter(Boolean);

  let feedback: any[] = [];

  if (logIds.length > 0) {
    const feedbackResult = await supabase
      .from("student_daily_feedback")
      .select(
        "id,daily_log_uuid,student_uuid,teacher_uuid,school_uuid,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt,submitted_at"
      )
      .eq("school_uuid", context.schoolUuid)
      .in("daily_log_uuid", logIds);

    if (feedbackResult.error) throw feedbackResult.error;
    feedback = feedbackResult.data ?? [];
  }

  /*
   * Reuse the exact live reconciliation machinery already used by School
   * Intelligence / Teaching Journal. No existing analytics code is modified.
   */
  let liveRows: any[] = [];

  try {
    liveRows = (liveResult ?? []).filter(
      (row: any) =>
        row?.last_reconciled_at &&
        inRange(sourceDate(row), startDate, endDate)
    );
  } catch (error) {
    console.error(
      "STAR PERFORMERS LIVE RECONCILIATION LOAD FAILED — BASE DATA PRESERVED",
      error
    );
  }

  const effectiveFeedback = mergeFeedbackUnderstandingLevels(
    feedback,
    liveRows
  );

  let effectiveDoubts = doubtsResult.data ?? [];

  try {
    effectiveDoubts = mergePendingDoubtsWithLiveLedger(
      effectiveDoubts,
      liveRows
    );
  } catch (error) {
    console.error(
      "STAR PERFORMERS LIVE DOUBT MERGE FAILED — BASE DOUBTS PRESERVED",
      error
    );
  }

  return {
    schoolUuid: context.schoolUuid,
    teachers,
    assignments,
    students,
    logs,
    feedback: effectiveFeedback,
    doubts: effectiveDoubts,
    liveRows,
  };
}

export async function getStarPerformerPeriods(year = new Date().getFullYear()) {
  const today = dateKey(new Date());
  const context = await resolveSchoolContext();
  const onboardingDate = await getSchoolOnboardingDate(context.schoolUuid);
  const { generateCalendarPeriods } = await import("../analytics/StarPerformerEngine");

  return generateCalendarPeriods(year, today, onboardingDate);
}

export async function getStarPerformerSourceData(year: number) {
  return fetchRawYearData(year);
}

export async function saveStarPerformerRows(rows: StarPerformerRow[]) {
  await persistStarPerformerRows(rows);
}

export async function getSavedStarPerformers(
  year = new Date().getFullYear()
): Promise<StarPerformerRow[]> {
  const context = await resolveSchoolContext();
  const supabase = client();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("school_uuid", context.schoolUuid)
    .gte("period_start", `${year}-01-01`)
    .lte("period_end", `${year}-12-31`)
    .order("period_start", { ascending: true });

  if (error) throw error;

  return (data ?? []).map(mapRow);
}

async function persistStarPerformerRows(rows: StarPerformerRow[]) {
  if (rows.length === 0) return;

  const supabase = client();

  const payload = rows.map(row => ({
    school_uuid: row.schoolUuid,
    period_type: row.periodType,
    period_key: row.periodKey,
    period_label: row.periodLabel,
    period_start: row.periodStart,
    period_end: row.periodEnd,
    teacher_uuid: row.teacherUuid,
    teacher_name: row.teacherName,
    classrooms: row.classrooms,
    understanding_percentage: row.understandingPercentage,
    doubt_closure_percentage: row.doubtClosurePercentage,
    class_health_percentage: row.classHealthPercentage,
    student_feedback_percentage: row.studentFeedbackPercentage,
    combined_score: row.combinedScore,
    is_complete: row.isComplete,
    calculated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from(TABLE)
    .upsert(payload, {
      onConflict: "school_uuid,period_type,period_key",
    });

  if (error) throw error;
}

function mapRow(row: any): StarPerformerRow {
  return {
    id: row.id,
    schoolUuid: String(row.school_uuid ?? ""),
    periodType: row.period_type === "month" ? "month" : "week",
    periodKey: String(row.period_key ?? ""),
    periodLabel: String(row.period_label ?? ""),
    periodStart: String(row.period_start ?? ""),
    periodEnd: String(row.period_end ?? ""),
    teacherUuid: row.teacher_uuid ? String(row.teacher_uuid) : null,
    teacherName: row.teacher_name ? String(row.teacher_name) : null,
    classrooms: Array.isArray(row.classrooms)
      ? row.classrooms.map((value: unknown) => String(value ?? "")).filter(Boolean)
      : [],
    understandingPercentage:
      row.understanding_percentage == null ? null : Number(row.understanding_percentage),
    doubtClosurePercentage:
      row.doubt_closure_percentage == null ? null : Number(row.doubt_closure_percentage),
    classHealthPercentage:
      row.class_health_percentage == null ? null : Number(row.class_health_percentage),
    studentFeedbackPercentage:
      row.student_feedback_percentage == null ? null : Number(row.student_feedback_percentage),
    combinedScore:
      row.combined_score == null ? null : Number(row.combined_score),
    isComplete: Boolean(row.is_complete),
    calculatedAt: row.calculated_at ?? undefined,
  };
}
