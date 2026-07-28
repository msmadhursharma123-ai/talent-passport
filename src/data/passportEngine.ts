/* ============================================================
   PASSPORT ENGINE

   Pure Passport Analytics Engine

   Responsibilities

   • Normalize scores
   • Generate strengths
   • Growth areas
   • Benchmark delta
   • Projected scores

   No Repository
   No Identity
   No Supabase
============================================================ */

import { TalentScores } from "./talentFramework";

import {
  calculateReliability
} from "./profileAnalyzer";

import {
  BENCHMARKS,
  PARTICIPATION_SCORE
} from "./frameworkV2";

const HIGH_GROWTH = 15;
const MEDIUM_GROWTH = 10;
const LOW_GROWTH = 5;

function normalizeScore(
  value: number
): number {

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value)
    )
  );

}

export interface PassportMetrics {

  dnaIndex: number;

  participationIndex: number;

  strengths: string[];

  growthAreas: string[];

  projectedScores:
    Record<string, number>;

  benchmarkDelta:
    Record<string, number>;

  normalizedScores:
    Record<string, number>;

  reliability: number;

  developmentPriorities:
    string[];

}

export function generatePassport(

  scores: TalentScores,

  answers: Record<number, unknown>

): PassportMetrics {

  const normalizedScores:
    Record<string, number> = {};

  Object.entries(scores).forEach(

    ([area, value]) => {

      normalizedScores[area] =
        normalizeScore(
          Number(value)
        );

    }

  );

  const participationKey =
    String(
      answers[9] ??
      "Never"
    );

  const participationIndex =

    PARTICIPATION_SCORE[
      participationKey as keyof typeof PARTICIPATION_SCORE
    ] ?? 20;

  const normalizedValues =
    Object.values(
      normalizedScores
    );

  const dnaIndex =
    normalizedValues.length > 0

      ? Math.round(

          normalizedValues.reduce(
            (a, b) => a + b,
            0
          ) /

          normalizedValues.length

        )

      : 0;

  const sorted =

    Object.entries(
      normalizedScores
    ).sort(
      (a, b) =>
        Number(b[1]) -
        Number(a[1])
    );

  const strengths =
    sorted
      .slice(0, 3)
      .map(([name]) => name);

  const growthAreas =
    [...sorted]
      .reverse()
      .slice(0, 3)
      .map(([name]) => name);

  const benchmarkDelta:
    Record<string, number> = {};

  Object.entries(
    normalizedScores
  ).forEach(

    ([area, value]) => {

      benchmarkDelta[area] =
        value -

        (BENCHMARKS[
          area as keyof typeof BENCHMARKS
        ] ?? 0);

    }

  );

  const projectedScores:
    Record<string, number> = {};

  Object.entries(
    normalizedScores
  ).forEach(

    ([area, value]) => {

      const growth =

        participationIndex >= 80

          ? HIGH_GROWTH

          : participationIndex >= 60

          ? MEDIUM_GROWTH

          : LOW_GROWTH;

      projectedScores[area] =
        Math.min(
          100,
          value + growth
        );

    }

  );

  return {

    dnaIndex,

    participationIndex,

    strengths,

    growthAreas,

    projectedScores,

    benchmarkDelta,

    normalizedScores,

    reliability:
      calculateReliability(
        answers
      ),

    developmentPriorities:
      growthAreas

  };

}