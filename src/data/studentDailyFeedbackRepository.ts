import { getSupabaseClient } from "../supabaseClient";

import { requireIdentity } from "../services/identityService";

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

dailyLogUuid:string,
teacherUuid:string,
schoolUuid:string,
className:string,
sectionName:string,
subjectName:string,
topicName:string,

understandingLevel:string,

conceptsNotUnderstood:string[],

additionalNote:string | null

) {

console.log("REPOSITORY HIT");
    
  const supabase = getSupabaseClient();

  const identity = requireIdentity();


const hasDoubt =

conceptsNotUnderstood.length > 0;


    
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

 understanding_level:
understandingLevel,

concepts_not_understood:
conceptsNotUnderstood,

has_doubt:
hasDoubt,

additional_note:
additionalNote,

    });


if (error) {

logRepositoryError(
"INSERT ERROR",
error
);

throw error;

}


console.log(
"INSERT SUCCESS"
);

console.log(data);


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