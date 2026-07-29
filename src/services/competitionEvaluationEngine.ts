// src/services/competitionEvaluationEngine.ts
//
// Phase 5 competition evaluation contract.
//
// CURRENT MODE:
// - No external AI/API call.
// - Six independent synthetic scores are generated deterministically from the
//   submission id, so retries/replays return the same evaluation.
// - This keeps development cost at zero while exercising the complete
//   evaluation -> evidence -> Talent DNA pipeline.
// - Replace only requestCompetitionEvaluation() when a real evaluator is
//   introduced later; the six-dimension contract can remain unchanged.

export const TALENT_DIMENSIONS = [
  "Creativity",
  "Communication",
  "Leadership",
  "Confidence",
  "Collaboration",
  "CriticalThinking",
] as const;

export type TalentDimension = (typeof TALENT_DIMENSIONS)[number];
export type DimensionScores = Record<TalentDimension, number>;

export interface CompetitionEvaluation {
  scores: DimensionScores;
  overallScore: number;
  feedback: string;
  evaluatorType: "ai" | "human" | "hybrid" | "synthetic";
  model: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export interface CompetitionSubmissionForEvaluation {
  id: string;
  student_id: string;
  pathway?: string | null;
  event_name?: string | null;
  description?: string | null;
  transcript?: string | null;
  video_url?: string | null;
}

function score(value: unknown, dimension: TalentDimension): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(
      `Evaluator returned an invalid ${dimension} score. Expected 0-100.`
    );
  }

  return Math.round(parsed);
}

export function validateCompetitionEvaluation(
  raw: any
): CompetitionEvaluation {
  if (!raw?.scores) {
    throw new Error("Evaluator returned no scores.");
  }

  const scores: DimensionScores = {
    Creativity: score(raw.scores.Creativity, "Creativity"),
    Communication: score(raw.scores.Communication, "Communication"),
    Leadership: score(raw.scores.Leadership, "Leadership"),
    Confidence: score(raw.scores.Confidence, "Confidence"),
    Collaboration: score(raw.scores.Collaboration, "Collaboration"),
    CriticalThinking: score(
      raw.scores.CriticalThinking,
      "CriticalThinking"
    ),
  };

  const overallScore = Math.round(
    TALENT_DIMENSIONS.reduce(
      (total, dimension) => total + scores[dimension],
      0
    ) / TALENT_DIMENSIONS.length
  );

  const feedback = String(raw.feedback ?? "").trim();

  if (!feedback) {
    throw new Error("Evaluator returned no feedback.");
  }

  const evaluatorType: CompetitionEvaluation["evaluatorType"] =
    raw.evaluatorType === "human" ||
    raw.evaluatorType === "hybrid" ||
    raw.evaluatorType === "synthetic"
      ? raw.evaluatorType
      : "ai";

  return {
    scores,
    overallScore,
    feedback,
    evaluatorType,
    model: String(raw.model ?? "unknown"),
    version: String(raw.version ?? "competition_v1"),
    metadata:
      raw.metadata && typeof raw.metadata === "object"
        ? raw.metadata
        : {},
  };
}

// Small deterministic hash. This deliberately avoids Math.random() so that
// the same submission can never receive different scores because of a retry.
function hash32(input: string): number {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

// Independent per-dimension score. Including the dimension in the seed is the
// important protection against Creativity accidentally inheriting Leadership.
function syntheticDimensionScore(
  submissionId: string,
  dimension: TalentDimension
): number {
  const hash = hash32(`${submissionId}::${dimension}::competition_v1`);

  // Development range: 68-92 inclusive.
  return 68 + (hash % 25);
}

export async function requestCompetitionEvaluation(
  _supabase: any,
  submission: CompetitionSubmissionForEvaluation
): Promise<CompetitionEvaluation> {
  if (!submission?.id) {
    throw new Error("Submission id is required for competition evaluation.");
  }

  if (!submission?.student_id) {
    throw new Error("Student id is required for competition evaluation.");
  }

  const raw = {
    scores: {
      Creativity: syntheticDimensionScore(submission.id, "Creativity"),
      Communication: syntheticDimensionScore(
        submission.id,
        "Communication"
      ),
      Leadership: syntheticDimensionScore(submission.id, "Leadership"),
      Confidence: syntheticDimensionScore(submission.id, "Confidence"),
      Collaboration: syntheticDimensionScore(
        submission.id,
        "Collaboration"
      ),
      CriticalThinking: syntheticDimensionScore(
        submission.id,
        "CriticalThinking"
      ),
    },
    feedback:
      "Development evaluation completed across all six Talent Passport dimensions.",
    evaluatorType: "synthetic",
    model: "deterministic-development-scorer",
    version: "competition_synthetic_v1",
    metadata: {
      submissionId: submission.id,
      pathway: submission.pathway ?? null,
      eventName: submission.event_name ?? null,
      scoringMode: "synthetic-development",
      replayStable: true,
      dimensions: [...TALENT_DIMENSIONS],
    },
  };

  return validateCompetitionEvaluation(raw);
}
