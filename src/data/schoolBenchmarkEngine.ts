import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   SCHOOL BENCHMARK ENGINE

   Uses the authenticated server-side RPC:
   get_my_school_dna_benchmark

   IMPORTANT:
   We no longer fetch student_dna_profiles directly here.

   RLS correctly prevents one student from reading the DNA
   profiles of other students. The RPC performs the school-level
   aggregation server-side and returns only benchmark results.

   Existing public API remains unchanged.
============================================================ */

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getSchoolBenchmarks(
  passport: any
) {

  if (!passport) {
    return null;
  }

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    console.error(
      "School benchmark RPC: Supabase client unavailable"
    );

    return null;
  }

  console.log(
    "SCHOOL BENCHMARK ENGINE: calling get_my_school_dna_benchmark"
  );

  const { data, error } =
    await (supabase as any)
      .rpc(
        "get_my_school_dna_benchmark"
      );

  if (error) {

    console.error(
      "School benchmark RPC failed",
      error
    );

    return null;
  }

  console.log(
    "SCHOOL BENCHMARK ENGINE: RPC response",
    data
  );

  if (!data) {
    return null;
  }

  /*
   * Support the JSON/object response shape returned by the RPC.
   * The ViewModel continues receiving exactly the same benchmark
   * structure that it already expects.
   */

  return {

    creativity: {
      average:
        numeric(
          data?.creativity?.average
        ),

      percentile:
        numeric(
          data?.creativity?.percentile
        ),
    },

    communication: {
      average:
        numeric(
          data?.communication?.average
        ),

      percentile:
        numeric(
          data?.communication?.percentile
        ),
    },

    leadership: {
      average:
        numeric(
          data?.leadership?.average
        ),

      percentile:
        numeric(
          data?.leadership?.percentile
        ),
    },

    confidence: {
      average:
        numeric(
          data?.confidence?.average
        ),

      percentile:
        numeric(
          data?.confidence?.percentile
        ),
    },

    collaboration: {
      average:
        numeric(
          data?.collaboration?.average
        ),

      percentile:
        numeric(
          data?.collaboration?.percentile
        ),
    },

    criticalThinking: {
      average:
        numeric(
          data?.criticalThinking?.average
        ),

      percentile:
        numeric(
          data?.criticalThinking?.percentile
        ),
    },

    totalStudents:
      numeric(
        data?.totalStudents
      ),

    scope:
      data?.scope ??
      "school"

  };

}