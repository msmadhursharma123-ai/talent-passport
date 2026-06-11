import { getSupabaseClient } from "../supabaseClient";

export async function savePassport(
  passport: any,
  answers: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return;

  const profile = JSON.parse(
    localStorage.getItem(
      "studentProfile"
    ) || "{}"
  );

  try {

   const { error } =
  await (supabase as any)
    .from(
      "student_dna_profiles"
    )
    .upsert(
      [
        {
          student_id:
            localStorage.getItem(
              "student_id"
            ),

          student_name:
            profile.studentName || "",

          student_email:
            profile.parentEmail || "",

          school_name:
            profile.schoolName || "",

          class_name:
            profile.className || "",

          dna_index: 0,

          participation_index: 0,

          reliability: 0,

          creativity_score:
            passport.Creativity || 0,

          communication_score:
            passport.Communication || 0,

          leadership_score:
            passport.Leadership || 0,

          confidence_score:
            passport.Confidence || 0,

          collaboration_score:
            passport.Collaboration || 0,

          critical_thinking_score:
            passport.CriticalThinking || 0,

          strengths: [],

          growth_areas: [],

          answers: answers,
        },
      ],
            {
        onConflict:
          "student_id",
      }
    );

if (error) {
  console.error(
    "SUPABASE ERROR:",
    error
  );
  return;
}

console.log(
  "PASSPORT SAVED SUCCESSFULLY"
);

} catch (error) {

  console.error(
    "SAVE PASSPORT ERROR:",
    error
  );

}
}