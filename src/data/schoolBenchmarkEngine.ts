import { getSupabaseClient } from "../supabaseClient";

export async function getSchoolBenchmarks(
  passport: any
) {

  if (
  !passport ||
  !passport.normalizedScores
) {
  return null;
}

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } =
    await (supabase as any)
      .from("student_dna_profiles")
      .select("*");

  if (!data || data.length === 0) {
    return null;
  }

  const avg = (
    key: string
  ) =>
    Math.round(
      data.reduce(
        (
          sum: number,
          row: any
        ) =>
          sum +
          Number(
            row[key] || 0
          ),
        0
      ) / data.length
    );

  const percentile = (
    key: string,
    score: number
  ) => {

    const below =
      data.filter(
        (row: any) =>
          Number(
            row[key] || 0
          ) <= score
      ).length;

    return Math.round(
      (below /
        data.length) *
        100
    );
  };

  return {
    creativity: {
      average:
        avg(
          "creativity_score"
        ),

      percentile:
        percentile(
          "creativity_score",
          passport
            .normalizedScores
            .Creativity
        ),
    },

    communication: {
      average:
        avg(
          "communication_score"
        ),

      percentile:
        percentile(
          "communication_score",
          passport
            .normalizedScores
            .Communication
        ),
    },

    leadership: {
      average:
        avg(
          "leadership_score"
        ),

      percentile:
        percentile(
          "leadership_score",
          passport
            .normalizedScores
            .Leadership
        ),
    },

    confidence: {
      average:
        avg(
          "confidence_score"
        ),

      percentile:
        percentile(
          "confidence_score",
          passport
            .normalizedScores
            .Confidence
        ),
    },

    collaboration: {
      average:
        avg(
          "collaboration_score"
        ),

      percentile:
        percentile(
          "collaboration_score",
          passport
            .normalizedScores
            .Collaboration
        ),
    },

    criticalThinking: {
      average:
        avg(
          "critical_thinking_score"
        ),

      percentile:
        percentile(
          "critical_thinking_score",
          passport
            .normalizedScores
            .CriticalThinking
        ),
    },

    totalStudents:
      data.length,
  };
}