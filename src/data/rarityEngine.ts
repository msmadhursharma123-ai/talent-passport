import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   TALENT DISTINCTIVENESS ENGINE

   Replaces the old score-band "rarity" logic.

   Distinctiveness is NOT another performance percentile.

   It measures how uncommon the student's complete six-skill
   profile is among students in the same class across the portal.

   The RPC:
   1. builds the same-class cohort,
   2. calculates the six-dimensional cohort centroid,
   3. measures every student's distance from that centroid,
   4. percentile-ranks the current student's distance.

   Higher = less common profile combination.
============================================================ */

export interface RarityResult {
  score: number;
  percentile: number;
  label: string;
  confidence: string;
  totalStudents: number;
  className: string;
  scope: string;
  distanceFromClassProfile: number;
}

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function calculateRarity(
  _score?: number
): Promise<RarityResult> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return {
      score: 0,
      percentile: 0,
      label: "Unavailable",
      confidence: "Low",
      totalStudents: 0,
      className: "",
      scope: "same-class-platform",
      distanceFromClassProfile: 0
    };
  }

  const { data, error } =
    await (supabase as any)
      .rpc(
        "get_my_talent_comparative_intelligence"
      );

  if (error) {
    console.error(
      "Talent distinctiveness RPC failed",
      error
    );

    return {
      score: 0,
      percentile: 0,
      label: "Unavailable",
      confidence: "Low",
      totalStudents: 0,
      className: "",
      scope: "same-class-platform",
      distanceFromClassProfile: 0
    };
  }

  const result =
    data?.distinctiveness ?? {};

  const score =
    numeric(result?.score);

  return {
    score,
    percentile: score,
    label:
      result?.label ??
      "Early Signal",
    confidence:
      result?.confidence ??
      "Low",
    totalStudents:
      numeric(result?.totalStudents),
    className:
      result?.className ?? "",
    scope:
      result?.scope ??
      "same-class-platform",
    distanceFromClassProfile:
      numeric(
        result?.distanceFromClassProfile
      )
  };
}
