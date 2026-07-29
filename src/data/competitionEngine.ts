/* ============================================================
   COMPETITION ENGINE

   Evidence-aware recommendation engine.

   IMPORTANT:
   - Portal usage alone never increases Talent DNA.
   - Recommendations use the student's CURRENT calibrated scores.
   - A competition can be recommended for fit OR development.
============================================================ */

export interface CompetitionDefinition {
  name: string;
  creativity: number;
  communication: number;
  confidence: number;
  leadership: number;
  collaboration: number;
  criticalThinking: number;
}

export interface PassportScores {
  Creativity: number;
  Communication: number;
  Confidence: number;
  Leadership: number;
  Collaboration: number;
  CriticalThinking: number;
}

interface CompetitionPassport {
  normalizedScores?: PassportScores;
  evidenceConfidence?: number;
}

export interface RecommendedCompetition extends CompetitionDefinition {
  score: number;
  fitScore: number;
  developmentScore: number;
  reason: string;
  mode: "Strength Match" | "Growth Opportunity" | "Balanced Match";
}

export const competitions: readonly CompetitionDefinition[] = [
  {
    name: "Storytelling League",
    creativity: 1,
    communication: 0.7,
    confidence: 0.4,
    leadership: 0.1,
    collaboration: 0.1,
    criticalThinking: 0.4
  },
  {
    name: "Debate Championship",
    creativity: 0.2,
    communication: 1,
    confidence: 0.8,
    leadership: 0.5,
    collaboration: 0.2,
    criticalThinking: 1
  },
  {
    name: "Entrepreneurship Challenge",
    creativity: 0.9,
    communication: 0.6,
    confidence: 0.5,
    leadership: 1,
    collaboration: 0.8,
    criticalThinking: 0.8
  },
  {
    name: "Model United Nations",
    creativity: 0.2,
    communication: 0.9,
    confidence: 0.8,
    leadership: 0.9,
    collaboration: 0.7,
    criticalThinking: 1
  }
] as const;

const DIMENSIONS: Array<{
  scoreKey: keyof PassportScores;
  competitionKey: keyof Omit<CompetitionDefinition, "name">;
  label: string;
}> = [
  { scoreKey: "Creativity", competitionKey: "creativity", label: "Creativity" },
  { scoreKey: "Communication", competitionKey: "communication", label: "Communication" },
  { scoreKey: "Confidence", competitionKey: "confidence", label: "Confidence" },
  { scoreKey: "Leadership", competitionKey: "leadership", label: "Leadership" },
  { scoreKey: "Collaboration", competitionKey: "collaboration", label: "Collaboration" },
  { scoreKey: "CriticalThinking", competitionKey: "criticalThinking", label: "Critical Thinking" }
];

function clamp100(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function topDimension(
  competition: CompetitionDefinition,
  scores: PassportScores,
  weakest = false
): string {
  const ranked = DIMENSIONS
    .map(item => ({
      label: item.label,
      relevance: Number(competition[item.competitionKey]) || 0,
      score: Number(scores[item.scoreKey]) || 0
    }))
    .filter(item => item.relevance > 0.35)
    .sort((a, b) =>
      weakest
        ? a.score - b.score
        : b.score * b.relevance - a.score * a.relevance
    );

  return ranked[0]?.label ?? "Talent DNA";
}

export function getRecommendedCompetitions(
  passport: CompetitionPassport
): RecommendedCompetition[] {

  const scores: PassportScores =
    passport.normalizedScores ?? {
      Creativity: 0,
      Communication: 0,
      Confidence: 0,
      Leadership: 0,
      Collaboration: 0,
      CriticalThinking: 0
    };

  const evidenceConfidence =
    clamp100(Number(passport.evidenceConfidence ?? 50));

  return competitions
    .map(competition => {
      let weightedStrength = 0;
      let weightedGap = 0;
      let weightTotal = 0;

      for (const item of DIMENSIONS) {
        const weight = Number(competition[item.competitionKey]) || 0;
        const value = clamp100(Number(scores[item.scoreKey]) || 0);

        weightedStrength += weight * value;
        weightedGap += weight * (100 - value);
        weightTotal += weight;
      }

      const fitScore =
        weightTotal > 0
          ? weightedStrength / weightTotal
          : 0;

      const developmentScore =
        weightTotal > 0
          ? weightedGap / weightTotal
          : 0;

      /*
       * Recommendations should primarily match demonstrated strengths,
       * while still creating a useful development pathway.
       * Low evidence confidence slightly reduces certainty; it does not
       * manufacture a higher recommendation score.
       */
      const blended =
        fitScore * 0.72 +
        developmentScore * 0.28;

      const confidenceFactor =
        0.85 + (evidenceConfidence / 100) * 0.15;

      const score =
        clamp100(blended * confidenceFactor);

      const strength =
        topDimension(competition, scores, false);

      const growth =
        topDimension(competition, scores, true);

      let mode: RecommendedCompetition["mode"] =
        "Balanced Match";

      if (fitScore >= developmentScore + 15) {
        mode = "Strength Match";
      } else if (developmentScore >= fitScore + 15) {
        mode = "Growth Opportunity";
      }

      const reason =
        mode === "Strength Match"
          ? `Strong match for current ${strength}.`
          : mode === "Growth Opportunity"
            ? `Useful next challenge to develop ${growth}.`
            : `Balances current ${strength} with development in ${growth}.`;

      return {
        ...competition,
        score,
        fitScore: clamp100(fitScore),
        developmentScore: clamp100(developmentScore),
        reason,
        mode
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
