import { getSupabaseClient } from "../supabaseClient";

import {
  requireIdentity,
  getTableIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */

function currentStudentId(): string {
  return getTableIdentity("student_dna_profiles");
}

function currentIdentity() {
  return requireIdentity();
}

/* ============================================================
   SAVE PASSPORT
============================================================ */

export async function savePassport(
  scores: any,
  answers: any
) {

  const supabase = getSupabaseClient();

  if (!supabase) return;

  const identity = currentIdentity();

  const studentId = currentStudentId();

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

    const {
      error: dnaError
    } =
      await (supabase as any)

        .from(
          "student_dna_profiles"
        )

        .upsert(

          [{

            student_id:
              studentId,

            student_name:
              identity.studentName,

            student_email:
              identity.parentEmail,

            school_name:
              identity.schoolName,

            class_name:
              identity.className,

            dna_index:
              combined,

            participation_index:
              0,

            reliability:
              100,

            creativity_score:
              creativity,

            communication_score:
              communication,

            leadership_score:
              leadership,

            confidence_score:
              confidence,

            collaboration_score:
              collaboration,

            critical_thinking_score:
              criticalThinking,

            strengths: [],

            growth_areas: [],

            answers

          }],

          {

            onConflict:
              "student_id"

          }

        );

    if (dnaError) {

      console.error(
        "DNA ERROR",
        dnaError
      );

      return;

    }

    /* ======================================================
       SAVE PASSPORT
    ====================================================== */

    const {
      error: passportError
    } =
      await (supabase as any)

        .from(
          "talent_passports_v2"
        )

        .upsert(

          [{

            student_id:
              studentId,

            communication_score:
              communication,

            creativity_score:
              creativity,

            critical_thinking_score:
              criticalThinking,

            team_score:
              collaboration,

            combined_score:
              combined,

            final_feedback:
              "Generated from DNA Questionnaire"

          }],

          {

            onConflict:
              "student_id"

          }

        );

    if (passportError) {

      console.error(
        "PASSPORT ERROR",
        passportError
      );

      return;

    }

    console.log(
      "DNA + PASSPORT SAVED"
    );

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

  const studentId =
    currentStudentId();

  const [

    passportResult,

    dnaResult,

    evaluationResult,

    submissionResult,

    projectResult,

    assessmentResult

  ] = await Promise.all([

    (supabase as any)

      .from(
        "talent_passports_v2"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      )

      .maybeSingle(),

    (supabase as any)

      .from(
        "student_dna_profiles"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      )

      .maybeSingle(),

    (supabase as any)

      .from(
        "evaluations"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      ),

    (supabase as any)

      .from(
        "submissions"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      ),

    (supabase as any)

      .from(
        "student_projects"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      ),

    (supabase as any)

      .from(
        "student_assessments"
      )

      .select("*")

      .eq(
        "student_id",
        studentId
      )

  ]);

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