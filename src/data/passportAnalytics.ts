import { getSupabaseClient } from "../supabaseClient";
import { calculatePercentile } from "./percentileEngine";

export async function getPercentileData(
  passport: any
) {

  if (!passport) {
    return null;
  }

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } =
    await (supabase as any)
      .from("talent_passports_v2")
      .select(`
        creativity_score,
        communication_score,
        critical_thinking_score,
        team_score,
        combined_score
      `);

  if (error || !data) {

    console.error(
      "Percentile fetch failed",
      error
    );

    return null;

  }

  const creativityScores =
    data.map(
      (row: any) =>
        row.creativity_score ?? 0
    );

  const communicationScores =
    data.map(
      (row: any) =>
        row.communication_score ?? 0
    );

  const collaborationScores =
    data.map(
      (row: any) =>
        row.team_score ?? 0
    );

  const criticalThinkingScores =
    data.map(
      (row: any) =>
        row.critical_thinking_score ?? 0
    );

  const combinedScores =
    data.map(
      (row: any) =>
        row.combined_score ?? 0
    );

  return {

    creativity:
      calculatePercentile(
        passport.creativity_score ?? 0,
        creativityScores
      ),

    communication:
      calculatePercentile(
        passport.communication_score ?? 0,
        communicationScores
      ),

    collaboration:
      calculatePercentile(
        passport.team_score ?? 0,
        collaborationScores
      ),

    criticalThinking:
      calculatePercentile(
        passport.critical_thinking_score ?? 0,
        criticalThinkingScores
      ),

    overall:
      calculatePercentile(
        passport.combined_score ?? 0,
        combinedScores
      )

  };

}