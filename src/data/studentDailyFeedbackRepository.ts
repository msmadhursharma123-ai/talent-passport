import { getSupabaseClient } from "../supabaseClient";

import { requireIdentity } from "../services/identityService";

const ABSENT_FEEDBACK_OPTION = "I was absent.";
import {
  syncStudentLiveDoubtLedger,
} from "../domains/liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

function logRepositoryError(
  title: string,
  error: any
) {
  console.log("================================");

  console.log(title);

  console.log(error);

  console.log("================================");
}

/* =========================================================

SUBMIT DAILY FEEDBACK

========================================================= */

export async function submitStudentDailyFeedback(
  dailyLogUuid: string,
  teacherUuid: string,
  schoolUuid: string,
  className: string,
  sectionName: string,
  subjectName: string,
  topicName: string,
  understandingLevel: string,
  conceptsNotUnderstood: string[],
  additionalNote: string | null
) {
  console.log("REPOSITORY HIT");

  const supabase = getSupabaseClient();
  const identity = requireIdentity();

  const isAbsent =
    String(understandingLevel ?? "").trim() === ABSENT_FEEDBACK_OPTION;

  // Absence is intentionally a neutral attendance outcome. Keep the existing
  // table/schema and public function contract, but prevent an absent response
  // from creating a doubt or carrying learning-gap notes into intelligence.
  const normalizedConceptsNotUnderstood = isAbsent
    ? []
    : conceptsNotUnderstood;
  const normalizedAdditionalNote = isAbsent
    ? null
    : additionalNote;
  const hasDoubt = normalizedConceptsNotUnderstood.length > 0;

  const { data, error } = await (supabase as any)
    .from("student_daily_feedback")
    .insert({
      daily_log_uuid: dailyLogUuid,
      student_uuid: identity.studentUuid,
      teacher_uuid: teacherUuid,
      school_uuid: schoolUuid,
      class_name: className,
      section_name: sectionName,
      subject_name: subjectName,
      topic_name: topicName,
      understanding_level: understandingLevel,
      concepts_not_understood: normalizedConceptsNotUnderstood,
      has_doubt: hasDoubt,
      additional_note: normalizedAdditionalNote,
    });

  if (error) {
    logRepositoryError("INSERT ERROR", error);
    throw error;
  }

  console.log("INSERT SUCCESS");
  console.log(data);

  // Additive live-layer synchronization. The existing first-loop INSERT
  // remains authoritative. We wait only for the optional mirror attempt so
  // that the live ledger is populated before the feedback flow returns, but
  // a live-layer failure can NEVER make a successful first-loop submission fail.
  try {
    await syncStudentLiveDoubtLedger();
  } catch (syncError) {
    console.error(
      "LIVE DOUBT LEDGER SYNC FAILED — FEEDBACK INSERT PRESERVED",
      syncError
    );
  }

  // Preserve the original public repository contract.
  return true;
}


/* =========================================================
   HAS ALREADY SUBMITTED

========================================================= */

export async function hasStudentSubmittedFeedback(

  dailyLogUuid: string

) {

  const supabase = getSupabaseClient();

  const identity = requireIdentity();


  const { data } = await (supabase as any)

    .from("student_daily_feedback")

    .select("id")

    .eq(

      "student_uuid",

      identity.studentUuid

    )

    .eq(

      "daily_log_uuid",

      dailyLogUuid

    )

    .maybeSingle();


  return !!data;

}



/* =========================================================

GET FEEDBACK BY LECTURE

========================================================= */

export async function getStudentFeedbackByLecture(

  dailyLogUuid: string

) {

  const supabase = getSupabaseClient();

  const identity = requireIdentity();


  const { data } = await (supabase as any)

    .from("student_daily_feedback")

    .select("*")

    .eq(

      "student_uuid",

      identity.studentUuid

    )

    .eq(

      "daily_log_uuid",

      dailyLogUuid

    )

    .maybeSingle();


  return data;

}



/* =========================================================

BATCH FEEDBACK FOR MULTIPLE LECTURES

Performance upgrade: the Daily Lecture Feedback page uses this
function instead of making one database request per lecture.
The existing getStudentFeedbackByLecture function remains unchanged
for every existing caller elsewhere in the project.

========================================================= */

export async function getStudentFeedbackForLectures(

  dailyLogUuids: string[]

) {

  const supabase = getSupabaseClient();

  const identity = requireIdentity();


  const ids = Array.from(

    new Set(

      (dailyLogUuids ?? [])

        .filter(Boolean)

        .map(String)

    )

  );


  if (ids.length === 0) {

    return [];

  }


  const { data, error } = await (supabase as any)

    .from("student_daily_feedback")

    .select(

      "id,daily_log_uuid,student_uuid,teacher_uuid,school_uuid,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt,additional_note,submitted_at"

    )

    .eq(

      "student_uuid",

      identity.studentUuid

    )

    .in(

      "daily_log_uuid",

      ids

    );


  if (error) {

    logRepositoryError(
      "BATCH FEEDBACK FETCH ERROR",
      error
    );

    throw error;

  }


  return data ?? [];

}


/* =========================================================

STUDENT FEEDBACK HISTORY

========================================================= */

export async function getStudentFeedbackHistory() {

  const supabase = getSupabaseClient();

  const identity = requireIdentity();


  const { data } = await (supabase as any)

    .from("student_daily_feedback")

    .select("*")

    .eq(

      "student_uuid",

      identity.studentUuid

    )

    .order(

      "submitted_at",

      {

        ascending: false,

      }

    );


  return data ?? [];

}
/* =========================================================
   LOOP-2 CREDIT / HISTORY SUPPORT

   Read-only additions for the Daily Feedback credit ledger.
   Existing Loop-1 submission/history functions remain unchanged.
========================================================= */

export interface StudentLoop2FeedbackRecord {
  id?: string | null;
  student_uuid?: string | null;
  subject_name?: string | null;
  previous_topic_name?: string | null;
  previous_difficult_concept?: string | null;
  log_date?: string | null;
  status?: string | null;
  student_response?: string | null;
  revision_checked_at?: string | null;
  created_at?: string | null;
}

export async function getStudentLoop2FeedbackHistory(): Promise<StudentLoop2FeedbackRecord[]> {
  const supabase = getSupabaseClient();
  const identity = requireIdentity();

  if (!supabase) return [];

  const { data, error } = await (supabase as any)
    .from("pending_teacher_doubts")
    .select(
      "id,student_uuid,subject_name,previous_topic_name,previous_difficult_concept,log_date,status,student_response,revision_checked_at,created_at"
    )
    .eq("student_uuid", identity.studentUuid)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("LOOP-2 FEEDBACK HISTORY FETCH ERROR", error);
    throw error;
  }

  return (data ?? []) as StudentLoop2FeedbackRecord[];
}

export async function getStudentFeedbackCreditStartDate(): Promise<string> {
  const supabase = getSupabaseClient();
  const identity = requireIdentity();

  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await (supabase as any)
    .from("students_master")
    .select("created_at")
    .eq("student_uuid", identity.studentUuid)
    .single();

  if (data?.created_at) {
    return String(data.created_at);
  }

  // Safe fallback for a transient students_master read problem. The
  // authenticated account creation timestamp is still preferable to
  // reverting to teacher-log history, which could create an invalid
  // negative starting balance.
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authData?.user?.created_at) {
    return String(authData.user.created_at);
  }

  console.error("STUDENT CREDIT START DATE FETCH ERROR", error ?? authError);
  throw error ?? authError ?? new Error("Student account creation date is unavailable.");
}
