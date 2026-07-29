import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   SCHOOL BENCHMARK ENGINE

   Source:
   get_my_talent_comparative_intelligence()

   Cohort:
   same school + same class.

   Authentication and cohort identity are resolved inside RPC.
============================================================ */

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp100(value: unknown): number {
  return Math.min(100, Math.max(0, Math.round(numeric(value))));
}

function benchmarkDimension(value: any) {
  return {
    average:
      Math.round(
        numeric(value?.average)
      ),

    percentile:
      clamp100(
        value?.percentile
      )
  };
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
    creativity:
      benchmarkDimension(
        school?.creativity
      ),

    communication:
      benchmarkDimension(
        school?.communication
      ),

    leadership:
      benchmarkDimension(
        school?.leadership
      ),

    confidence:
      benchmarkDimension(
        school?.confidence
      ),

    collaboration:
      benchmarkDimension(
        school?.collaboration
      ),

    criticalThinking:
      benchmarkDimension(
        school?.criticalThinking
      ),

    totalStudents:
      Math.max(
        0,
        Math.round(
          numeric(
            school?.totalStudents
          )
        )
      ),

    schoolName:
      String(
        school?.schoolName ??
        passport?.school_name ??
        ""
      ),

    className:
      String(
        school?.className ??
        passport?.class_name ??
        ""
      ),

    scope:
      school?.scope ??
      "same-school-same-class"
  };
}
