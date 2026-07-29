import { getSupabaseClient } from "../supabaseClient";

import {
  requireIdentity
} from "../services/identityService";

import {
  getTalentEvidenceFoundationData
} from "./talentEvidenceRepository";

/* ============================================================
   SAVE PASSPORT

   Identity contract:
   - student_id   = legacy/business student code
   - student_uuid = canonical student identity used by RLS

   IMPORTANT:
   talent_passports_v2 RLS authorizes through student_uuid.
============================================================ */

export async function savePassport(
  scores: any,
  answers: any
) {

  console.log("========== SAVE PASSPORT START ==========");

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client is unavailable."
    );
  }

  const identity =
    requireIdentity();

  const studentUuid =
    identity.studentUuid;

  const studentCode =
    identity.studentCode;

  if (!studentUuid) {
    throw new Error(
      "Student UUID is missing from identity."
    );
  }

  /*
   * Preserve the legacy/business identifier when available.
   * The UUID remains the canonical identity and is always
   * written separately to student_uuid for RLS.
   *
   * UUID fallback keeps compatibility with older identities
   * that may not expose studentCode.
   */
  const passportStudentId =
    studentCode || studentUuid;

  console.log("IDENTITY", identity);
  console.log("studentUuid =", studentUuid);
  console.log("studentCode =", studentCode);
  console.log("passportStudentId =", passportStudentId);

  try {

    const communication =
      Number(scores?.Communication ?? 0);

    const creativity =
      Number(scores?.Creativity ?? 0);

    const leadership =
      Number(scores?.Leadership ?? 0);

    const confidence =
      Number(scores?.Confidence ?? 0);

    const collaboration =
      Number(scores?.Collaboration ?? 0);

    const criticalThinking =
      Number(scores?.CriticalThinking ?? 0);

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

       Do not change the existing DNA identity contract here.
       This table is already working with student UUID in
       student_id and is consumed elsewhere in the portal.
    ====================================================== */

    console.log("Saving DNA...");

    const {
      data: dnaData,
      error: dnaError
    } = await (supabase as any)

      .from("student_dna_profiles")

      .upsert(
        [{
          student_id:
            studentUuid,

          student_name:
            identity.studentName,

          student_email:
            identity.parentEmail,

          school_name:
            identity.schoolName ?? "",

          class_name:
            identity.className ?? "",

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

          strengths:
            [],

          growth_areas:
            [],

          answers
        }],
        {
          onConflict:
            "student_id"
        }
      )

      .select();

    console.log(
      "DNA UPSERT DATA =",
      dnaData
    );

    console.log(
      "DNA UPSERT ERROR =",
      dnaError
    );

    if (dnaError) {

      console.error(
        "========== DNA UPSERT FAILED =========="
      );

      console.error(
        JSON.stringify(
          dnaError,
          null,
          2
        )
      );

      throw dnaError;
    }

    console.log(
      "DNA UPSERT SUCCESS"
    );

    /* ======================================================
       SAVE TALENT PASSPORT

       talent_passports_v2 schema:
       student_id
       student_uuid
       communication_score
       creativity_score
       critical_thinking_score
       team_score
       combined_score
       final_feedback

       Leadership + Confidence intentionally remain in
       student_dna_profiles because talent_passports_v2
       does not contain those columns.
    ====================================================== */

    console.log(
      "Saving Passport..."
    );

    const passportPayload = {

      student_id:
        passportStudentId,

      student_uuid:
        studentUuid,

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
    };

    console.log(
      "PASSPORT UPSERT PAYLOAD =",
      passportPayload
    );

    const {
      data: passportData,
      error: passportError
    } = await (supabase as any)

      .from("talent_passports_v2")

      .upsert(
        [passportPayload],
        {
          onConflict:
            "student_id"
        }
      )

      .select();

    console.log(
      "PASSPORT UPSERT DATA =",
      passportData
    );

    console.log(
      "PASSPORT UPSERT ERROR =",
      passportError
    );

    if (passportError) {

      console.error(
        "========== PASSPORT UPSERT FAILED =========="
      );

      console.error(
        JSON.stringify(
          passportError,
          null,
          2
        )
      );

      throw passportError;
    }

    console.log(
      "DNA + PASSPORT SAVED"
    );

    return (
      passportData?.[0] ??
      true
    );

  }

  catch (err) {

    console.error(
      "SAVE PASSPORT ERROR",
      err
    );

    throw err;
  }
}

/* ============================================================
   GROWTH PLAN DATA

   Loads every dataset required by GrowthPlan using the
   authenticated student's canonical identity.

   Passport lookup uses student_uuid because that is the
   canonical identity and the column protected by RLS.

   Other repositories/tables retain their existing identity
   contracts so unrelated portal features are not changed.
============================================================ */

export async function getGrowthPlanData() {

  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const identity =
    requireIdentity();

  const studentUuid =
    identity.studentUuid;

  if (!studentUuid) {
    throw new Error(
      "Student UUID is missing from identity."
    );
  }

  const {
    data: { user },
    error: authError
  } =
    await supabase.auth.getUser();

  console.log(
    "===================================="
  );

  console.log(
    "SUPABASE AUTH CHECK"
  );

  console.log(
    "===================================="
  );

  console.log(
    "SUPABASE USER ID =",
    user?.id
  );

  console.log(
    "IDENTITY AUTH USER =",
    identity.authUserId
  );

  console.log(
    "AUTH ERROR =",
    authError
  );

  console.log(
    "===================================="
  );

  console.log(
    "PASSPORT FETCH START"
  );

  console.log(
    "===================================="
  );

  console.table({
    studentUuid:
      identity.studentUuid,

    studentCode:
      identity.studentCode,

    masterStudentId:
      identity.masterStudentId,

    studentName:
      identity.studentName
  });

  const [
    passportResult,
    dnaResult,
    evaluationResult,
    submissionResult,
    projectResult,
    assessmentResult,
    evidenceFoundationResult
  ] = await Promise.all([

    /*
     * Canonical passport lookup.
     * Existing rows were migrated/backfilled with student_uuid,
     * while new rows are now saved with student_uuid directly.
     */
    (supabase as any)
      .from(
        "talent_passports_v2"
      )
      .select("*")
      .eq(
        "student_uuid",
        studentUuid
      )
      .maybeSingle(),

    /*
     * Keep existing DNA repository contract unchanged.
     */
    (supabase as any)
      .from(
        "student_dna_profiles"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      )
      .maybeSingle(),

    /*
     * Existing build intentionally supplies an empty
     * evaluation collection here.
     */
    Promise.resolve({
      data: [],
      error: null
    }),

    /*
     * Keep the existing contracts of the remaining tables.
     */
    (supabase as any)
      .from(
        "submissions"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      ),

    (supabase as any)
      .from(
        "student_projects"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      ),

    (supabase as any)
      .from(
        "student_assessments"
      )
      .select("*")
      .eq(
        "student_id",
        studentUuid
      ),

    /*
     * Phase 3 — Evidence Foundation.
     *
     * Identity is resolved server-side by the secure evidence RPCs.
     * This repository only receives the authenticated student's:
     * evidence, DNA history and evidence summary.
     */
    getTalentEvidenceFoundationData()

  ]);

  console.log(
    "PASSPORT RESULT",
    passportResult.data
  );

  console.log(
    "PASSPORT ERROR",
    passportResult.error
  );

  console.log(
    "DNA RESULT",
    dnaResult.data
  );

  console.log(
    "DNA ERROR",
    dnaResult.error
  );

  /*
   * A passport query error must not silently become
   * "Talent Passport Not Found".
   */
  if (passportResult.error) {
    throw passportResult.error;
  }

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
      assessmentResult.data || [],

    evidence:
      evidenceFoundationResult.evidence || [],

    dnaHistory:
      evidenceFoundationResult.dnaHistory || [],

    evidenceSummary:
      evidenceFoundationResult.evidenceSummary || {
        totalEvidence: 0,
        sourceDiversity: 0,
        dimensionCoverage: 0,
        recentEvidence90Days: 0,
        baselineEvidence: 0
      }

  };
}
