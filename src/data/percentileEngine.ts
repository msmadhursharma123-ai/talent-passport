/* ============================================================
   PERCENTILE ENGINE

   Pure Statistical Engine

   Responsibilities

   • Calculate percentile
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

const DEFAULT_PERCENTILE = 50;

/* ============================================================
   CALCULATE PERCENTILE
============================================================ */

export function calculatePercentile(

  currentScore: number,

  allScores: readonly number[]

): number {

  if (

    allScores.length === 0

  ) {

    return DEFAULT_PERCENTILE;

  }

  const below =

    allScores.filter(

      score =>

        score < currentScore

    ).length;

  return Math.round(

    (below /

      allScores.length) *

    100

  );

}