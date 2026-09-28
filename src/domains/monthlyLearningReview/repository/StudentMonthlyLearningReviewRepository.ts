import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import { currentReviewMonth } from "../utils/MonthlyReviewDate";
import { getMyAcademicYearContext } from "../../academicYear/repositories/AcademicYearRepository";
import type {
  MonthlyLearningReviewCycle,
  MonthlyLearningReviewItem,
  MonthlyLearningReviewState,
  MonthlyReviewResponseState,
} from "../types/MonthlyLearningReviewTypes";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function mapCycle(row: any): MonthlyLearningReviewCycle {
  return {
    id: String(row.id),
    studentUuid: String(row.student_uuid),
    schoolUuid: String(row.school_uuid),
    academicYearId: row.academic_year_id ? String(row.academic_year_id) : null,
    reviewMonth: String(row.review_month),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    status: String(row.status).toUpperCase() as MonthlyLearningReviewCycle["status"],
    presentedAt: row.presented_at ?? null,
    completedAt: row.completed_at ?? null,
  };
}

function mapItem(row: any): MonthlyLearningReviewItem {
  return {
    id: String(row.id),
    cycleId: String(row.cycle_id),
    studentUuid: String(row.student_uuid),
    teacherUuid: row.teacher_uuid ? String(row.teacher_uuid) : null,
    teacherName: String(row.teacher_name ?? "Assigned teacher"),
    teacherAssignmentUuid: String(row.teacher_assignment_uuid),
    dailyLogUuid: String(row.daily_log_uuid),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    topicName: String(row.topic_name ?? ""),
    conceptName: String(row.concept_name ?? ""),
    logDate: String(row.log_date ?? ""),
    learningIdentityKey: String(row.learning_identity_key ?? ""),
    sourceType: row.source_type ? String(row.source_type).toUpperCase() as "TEACHER_LOG" | "LIVE" : undefined,
    sourceLiveId: row.source_live_id ? String(row.source_live_id) : null,
    sourceFeedbackId: row.source_feedback_id ? String(row.source_feedback_id) : null,
    responseState: row.response_state ? String(row.response_state).toUpperCase() as MonthlyReviewResponseState : null,
  };
}

export async function getStudentMonthlyLearningReviewState(
  reviewMonth = currentReviewMonth()
): Promise<MonthlyLearningReviewState> {
  const identity = requireIdentity();
  const academicYear = await getMyAcademicYearContext();
  if (!academicYear?.isCurrent || !academicYear.id) {
    return { cycle: null, items: [], pending: false };
  }
  const { data: cycleData, error: cycleError } = await client()
    .from("tp_monthly_learning_review_cycles")
    .select("*")
    .eq("student_uuid", identity.studentUuid)
    .eq("review_month", reviewMonth)
    .eq("academic_year_id", academicYear.id)
    .maybeSingle();
  if (cycleError) {
    if (String(cycleError.message ?? "").toLowerCase().includes("does not exist")) {
      return { cycle: null, items: [], pending: false };
    }
    throw cycleError;
  }
  if (!cycleData) {
    // No row means the month has not yet been materialized. The top-level gate
    // decides whether that is a first-day Monthly priority or an overdue
    // missed-first-day Monthly cycle; it must not be interpreted as an
    // already-pending cycle by every daily login.
    return { cycle: null, items: [], pending: false };
  }

  const cycle = mapCycle(cycleData);
  if (cycle.status === "COMPLETED") {
    return { cycle, items: [], pending: false };
  }

  const { data: itemData, error: itemError } = await client()
    .from("tp_monthly_learning_review_items")
    .select("*,tp_monthly_learning_review_responses(response_state,submitted_at,response_version)")
    .eq("cycle_id", cycle.id)
    .order("log_date", { ascending: true })
    .order("subject_name", { ascending: true })
    .order("topic_name", { ascending: true })
    .order("concept_name", { ascending: true });
  if (itemError) throw itemError;

  const items = (itemData ?? []).map((row: any) => {
    const responses = Array.isArray(row.tp_monthly_learning_review_responses)
      ? [...row.tp_monthly_learning_review_responses].sort((a, b) => Number(b.response_version ?? 0) - Number(a.response_version ?? 0))
      : [];
    return mapItem({ ...row, response_state: responses[0]?.response_state ?? null });
  });

  return { cycle, items, pending: true };
}

export async function openStudentMonthlyLearningReview(reviewMonth = currentReviewMonth()) {
  const { data, error } = await client().rpc("tp_open_student_monthly_learning_review", {
    p_review_month: reviewMonth,
  });
  if (error) throw error;
  return data as { cycle_id: string; status: string; item_count: number };
}

export async function submitStudentMonthlyLearningReview(
  cycleId: string,
  answers: Array<{ itemId: string; responseState: MonthlyReviewResponseState }>
) {
  const { data, error } = await client().rpc("tp_submit_student_monthly_learning_review", {
    p_cycle_id: cycleId,
    p_answers: answers,
  });
  if (error) throw error;
  return data;
}

export async function getStudentMonthlyProjectionRows(): Promise<any[]> {
  const identity = requireIdentity();
  const { data, error } = await client()
    .from("tp_learning_verification_projection")
    .select("*")
    .eq("student_uuid", identity.studentUuid);
  if (error) throw error;
  return data ?? [];
}

