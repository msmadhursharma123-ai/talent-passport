import { getSupabaseClient } from "../supabaseClient";
import { calculatePercentile } from "./percentileEngine";

export async function getPercentileData(
  passport: any
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } =
    await (supabase as any)
      .from(
        "student_dna_profiles"
      )
      .select("*");

  if (error || !data) {
    console.error(error);
    return null;
  }

  const creativityScores =
    data.map(
      (row: any) =>
        row.creativity_score || 0
    );

  const communicationScores =
    data.map(
      (row: any) =>
        row.communication_score || 0
    );

  const leadershipScores =
    data.map(
      (row: any) =>
        row.leadership_score || 0
    );

  const confidenceScores =
    data.map(
      (row: any) =>
        row.confidence_score || 0
    );

  return {

    creativity:
      calculatePercentile(
        passport.normalizedScores
          .Creativity,
        creativityScores
      ),

    communication:
      calculatePercentile(
        passport.normalizedScores
          .Communication,
        communicationScores
      ),

    leadership:
      calculatePercentile(
        passport.normalizedScores
          .Leadership,
        leadershipScores
      ),

    confidence:
      calculatePercentile(
        passport.normalizedScores
          .Confidence,
        confidenceScores
      ),
  };
}