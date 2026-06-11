import { TalentScores } from "./talentFramework";
import {
  calculateReliability
} from "./profileAnalyzer";
import {
  BENCHMARKS,
  PARTICIPATION_SCORE,
} from "./frameworkV2";

export interface PassportMetrics {
  dnaIndex: number;
  participationIndex: number;

  strengths: string[];
  growthAreas: string[];

  projectedScores: Record<string, number>;
  benchmarkDelta: Record<string, number>;
  normalizedScores: Record<string, number>;

  reliability: number;

  developmentPriorities: string[];
}

export function generatePassport(
  scores: TalentScores,
  answers: Record<number, any>
): PassportMetrics {

  const normalizedScores:
    Record<string, number> = {};

  Object.entries(scores).forEach(
    ([area, value]) => {

      const normalized =
        Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (Number(value) / 60) * 100
            )
          )
        );

      normalizedScores[area] =
        normalized;
    }
  );

 const participationKey =
  String(answers[9] || "Never");

const participationIndex =
  PARTICIPATION_SCORE[
    participationKey as keyof typeof PARTICIPATION_SCORE
  ] || 20;

  const dnaIndex =
    Math.round(
      Object.values(
        normalizedScores
      ).reduce(
        (a, b) => a + b,
        0
      ) /
        Object.keys(
          normalizedScores
        ).length
    );

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
      .map(
        ([name]) => name
      );

  const growthAreas =
    sorted
      .slice(-3)
      .map(
        ([name]) => name
      );

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
        ] || 0);
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
          ? 15
          : participationIndex >= 60
          ? 10
          : 5;

      projectedScores[area] =
        Math.min(
          100,
          value + growth
        );
    }
  );

  const developmentPriorities =
    growthAreas;
const reliability =
  calculateReliability(
    answers
  );
  return {
    dnaIndex,
    participationIndex,
    strengths,
    growthAreas,
    projectedScores,
    benchmarkDelta,
    normalizedScores,
    reliability,
    developmentPriorities,
  };
}