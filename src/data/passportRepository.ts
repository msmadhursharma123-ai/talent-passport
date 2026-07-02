import { getSupabaseClient } from "../supabaseClient";

import {
    requireIdentity,
    getCurrentStudent
} from "../services/identityService";


/* ============================================================
   SAVE PASSPORT
============================================================ */

export async function savePassport(
  scores: any,
  answers: any
) {

console.log("========== SAVE PASSPORT START ==========");

  const supabase = getSupabaseClient();

  if (!supabase) return;

 const identity = requireIdentity();

console.log("IDENTITY", identity);

 const studentId = identity.studentUuid;

  console.log("studentId =", studentId);

console.log("identity =", identity);

console.log("identity.studentUuid =", identity.studentUuid);

console.log("identity.masterStudentId =", identity.masterStudentId);

console.log("identity.studentCode =", identity.studentCode);

  console.log("STUDENT ID", studentId);

  try {

    const communication =
      scores.Communication || 0;

    const creativity =
      scores.Creativity || 0;

    const leadership =
      scores.Leadership || 0;

    const confidence =
      scores.Confidence || 0;

    const collaboration =
      scores.Collaboration || 0;

    const criticalThinking =
      scores.CriticalThinking || 0;

    const combined =
      Math.round(

        (

          communication +

          creativity +

          leadership +

          confidence +

          collaboration +

          criticalThinking

        ) / 6

      );

   /* ======================================================
   SAVE DNA PROFILE
====================================================== */

console.log("Saving DNA...");

console.log("========== DNA UPSERT PAYLOAD ==========");

console.table({

    student_id: studentId,

    student_name: identity.studentName,

    student_email: identity.parentEmail,

    school_name: identity.schoolName,

    class_name: identity.className,

    dna_index: combined,

    participation_index: 0,

    reliability: 100,

    creativity_score: creativity,

    communication_score: communication,

    leadership_score: leadership,

    confidence_score: confidence,

    collaboration_score: collaboration,

    critical_thinking_score: criticalThinking

});

const {

    data: dnaData,

    error: dnaError

} = await (supabase as any)

    .from("student_dna_profiles")

    .upsert(

      [{

    student_id: studentId,

    student_name: identity.studentName,

    student_email: identity.parentEmail,

    school_name: identity.schoolName ?? "",

    class_name: identity.className ?? "",

    dna_index: combined,

    participation_index: 0,

    reliability: 100,

    creativity_score: creativity,

    communication_score: communication,

    leadership_score: leadership,

    confidence_score: confidence,

    collaboration_score: collaboration,

    critical_thinking_score: criticalThinking,

    strengths: [],

    growth_areas: [],

    answers

}],

        {

            onConflict: "student_id"

        }

    )

    .select();

console.log("DNA UPSERT DATA =", dnaData);

console.log("DNA UPSERT ERROR =", dnaError);

if (dnaError) {

    console.error("========== DNA UPSERT FAILED ==========");

    console.error(JSON.stringify(dnaError, null, 2));

    return;

}

console.log("DNA UPSERT SUCCESS");

  /* ======================================================
   SAVE PASSPORT
====================================================== */

console.log("Saving Passport...");

const {

    data: passportData,

    error: passportError

} = await (supabase as any)

    .from("talent_passports_v2")

    .upsert(

        [{

            student_id: studentId,

            student_uuid: studentId,

            communication_score: communication,

            creativity_score: creativity,

            critical_thinking_score: criticalThinking,

            team_score: collaboration,

            combined_score: combined,

            final_feedback:
                "Generated from DNA Questionnaire"

        }],

        {

            onConflict: "student_id"

        }

    )

    .select();

console.log("PASSPORT UPSERT DATA =", passportData);

console.log("PASSPORT UPSERT ERROR =", passportError);

console.log("STUDENT ID SAVED =", studentId);

if (passportError) {

    console.error("========== PASSPORT UPSERT FAILED ==========");

    console.error(JSON.stringify(passportError, null, 2));

    return;

}

console.log("DNA + PASSPORT SAVED");
  }

  catch (err) {

    console.error(
      "SAVE PASSPORT ERROR",
      err
    );

  }

}

/* ============================================================
   GROWTH PLAN DATA

   Loads every dataset required by GrowthPlan
   using the authenticated student's identity.

============================================================ */

export async function getGrowthPlanData() {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

const identity = requireIdentity();

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

console.log("====================================");
console.log("SUPABASE AUTH CHECK");
console.log("====================================");

console.log("SUPABASE USER ID =", user?.id);
console.log("IDENTITY AUTH USER =", identity.authUserId);
console.log("AUTH ERROR =", authError);

const studentId =
    identity.studentUuid;

console.log("====================================");
console.log("PASSPORT FETCH START");
console.log("====================================");

console.table({
    studentUuid: identity.studentUuid,
    studentCode: identity.studentCode,
    masterStudentId: identity.masterStudentId,
    studentName: identity.studentName
});

console.log(
    "CURRENT STUDENT ID",
    studentId
);

  const [

    passportResult,

    dnaResult,

    evaluationResult,

    submissionResult,

    projectResult,

    assessmentResult

] = await Promise.all([

    (supabase as any)
        .from("talent_passports_v2")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle(),

    (supabase as any)
        .from("student_dna_profiles")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle(),

    Promise.resolve({
        data: [],
        error: null
    }),

    (supabase as any)
        .from("submissions")
        .select("*")
        .eq("student_id", studentId),

    (supabase as any)
        .from("student_projects")
        .select("*")
        .eq("student_id", studentId),

    (supabase as any)
        .from("student_assessments")
        .select("*")
        .eq("student_id", studentId)

]);

  console.log(
    "PASSPORT RESULT",
    passportResult.data
);

console.log(
    "PASSPORT ERROR",
    passportResult.error
);

console.log("====================================");
console.log("DNA RESULT");
console.log(dnaResult.data);

console.log("DNA ERROR");
console.log(dnaResult.error);

console.log("====================================");

  return {

    passport:
      passportResult.data,

    dna:
      dnaResult.data,

    evaluations:
      evaluationResult.data || [],

    submissions:
      submissionResult.data || [],

    projects:
      projectResult.data || [],

    assessments:
      assessmentResult.data || []

  };

}