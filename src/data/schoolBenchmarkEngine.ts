import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   SCHOOL BENCHMARK ENGINE

   Source:
   get_my_talent_comparative_intelligence()

   Cohort:
   same school + same class

   The browser supplies no school, class or student identifier.
   Authentication is resolved inside the RPC.
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
      "School benchmark: Supabase client unavailable"
    );
    return null;
  }

  const { data, error } =
    await (supabase as any)
      .rpc(
        "get_my_talent_comparative_intelligence"
      );

  if (error) {
    console.error(
      "School benchmark RPC failed",
      error
    );
    return null;
  }

  const school =
    data?.school;

  if (!school) {
    return null;
  }

  return {
    creativity: {
      average: numeric(school?.creativity?.average),
      percentile: numeric(school?.creativity?.percentile)
    },

    communication: {
      average: numeric(school?.communication?.average),
      percentile: numeric(school?.communication?.percentile)
    },

    leadership: {
      average: numeric(school?.leadership?.average),
      percentile: numeric(school?.leadership?.percentile)
    },

    confidence: {
      average: numeric(school?.confidence?.average),
      percentile: numeric(school?.confidence?.percentile)
    },

    collaboration: {
      average: numeric(school?.collaboration?.average),
      percentile: numeric(school?.collaboration?.percentile)
    },

    criticalThinking: {
      average: numeric(school?.criticalThinking?.average),
      percentile: numeric(school?.criticalThinking?.percentile)
    },

    totalStudents:
      numeric(school?.totalStudents),

    schoolName:
      school?.schoolName ?? "",

    className:
      school?.className ?? "",

    scope:
      school?.scope ??
      "same-school-same-class"
  };
}
