/* ============================================================
   PERCENTILE ENGINE

   Pure percentile calculation.
   Uses mid-rank handling for ties.

   No Repository
   No Identity
   No Supabase
============================================================ */

export function calculatePercentile(
  currentScore: number,
  allScores: readonly number[]
): number {

  const current = Number(currentScore);

  const validScores =
    allScores
      .map(score => Number(score))
      .filter(score => Number.isFinite(score));

  if (!Number.isFinite(current) || validScores.length === 0) {
    return 0;
  }

  /*
   * A one-student cohort has no meaningful relative ranking.
   * Return 50 because the student is exactly at the cohort median.
   */
  if (validScores.length === 1) {
    return 50;
  }

  const below =
    validScores.filter(
      score => score < current
    ).length;

  const equal =
    validScores.filter(
      score => score === current
    ).length;

  const percentile =
    ((below + equal * 0.5) / validScores.length) * 100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(percentile)
    )
  );
}
