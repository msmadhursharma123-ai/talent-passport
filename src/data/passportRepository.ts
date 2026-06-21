import {
  getSupabaseClient
} from "../supabaseClient";

export async function savePassport(
  scores: any,
  answers: any
) {
  const supabase = getSupabaseClient();

  if (!supabase) return;

  const profile = JSON.parse(
    localStorage.getItem("studentProfile") || "{}"
  );

  try {

    const studentId =
  profile.parent_email
    ?.toLowerCase()
    .replace("@", "_")
    .replace(/\./g, "_");

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

  console.log("PROFILE", profile);

console.log("SCORES", scores);

console.log({
  communication,
  creativity,
  leadership,
  confidence,
  collaboration,
  criticalThinking
});

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

    // ==========================
    // SAVE DNA PROFILE
    // ==========================

    const { error: dnaError } =
      await (supabase as any)
        .from("student_dna_profiles")
        .upsert(
          [{
            student_id: studentId,

            student_name:
              profile.student_name || "",

            student_email:
              profile.parent_email || "",

            school_name:
              profile.school_name || "",

            class_name:
              profile.class_name || "",

            dna_index: combined,

            participation_index: 0,

            reliability: 100,

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

    // ==========================
    // SAVE PASSPORT
    // ==========================

    const { error: passportError } =
      await (supabase as any)
        .from("talent_passports_v2")
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

  } catch (err) {
    console.error(
      "SAVE PASSPORT ERROR",
      err
    );
  }
}