import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   PASSPORT ANALYTICS

   Uses the authenticated server-side RPC:
   get_my_school_dna_benchmark

   IMPORTANT:
   Percentile analytics must not read student_dna_profiles
   directly from the student's browser.

   The RPC calculates school-relative intelligence server-side
   while RLS continues protecting individual student DNA rows.

   Existing public API remains unchanged.
============================================================ */

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getPercentileData(
  passport: any
) {

  if (!passport) {
    return null;
  }

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    console.error(
      "Passport analytics RPC: Supabase client unavailable"
    );

    return null;
  }

  console.log(
    "PASSPORT ANALYTICS: calling get_my_school_dna_benchmark"
  );

  const { data, error } =
    await (supabase as any)
      .rpc(
        "get_my_school_dna_benchmark"
      );

  if (error) {

    console.error(
      "Passport analytics RPC failed",
      error
    );

    return null;
  }

  console.log(
    "PASSPORT ANALYTICS: RPC response",
    data
  );

  if (!data) {
    return null;
  }

  const creativity =
    numeric(
      data?.creativity?.percentile
    );

  const communication =
    numeric(
      data?.communication?.percentile
    );

  const leadership =
    numeric(
      data?.leadership?.percentile
    );

  const confidence =
    numeric(
      data?.confidence?.percentile
    );

  const collaboration =
    numeric(
      data?.collaboration?.percentile
    );

  const criticalThinking =
    numeric(
      data?.criticalThinking?.percentile
    );

  /*
   * Preserve the existing `overall` field expected by consumers.
   *
   * The six dimension percentiles themselves come directly from
   * the school-level RPC.
   */

  const overall =
    Math.round(
      (
        creativity +
        communication +
        leadership +
        confidence +
        collaboration +
        criticalThinking
      ) / 6
    );

  return {

    creativity,

    communication,

    leadership,

    confidence,

    collaboration,

    criticalThinking,

    overall,

    totalStudents:
      numeric(
        data?.totalStudents
      )

  };

}