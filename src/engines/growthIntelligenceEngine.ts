import type {
  TalentDimension,
  TalentDNAHistoryRecord,
} from "../data/talentEvidenceRepository";

import type {
  EvidenceIntelligence,
} from "../data/talentEvidenceEngine";

/* ============================================================
   GROWTH INTELLIGENCE ENGINE

   Consolidation layer above the evidence system.

   Responsibilities:
   - Compare baseline DNA with latest DNA
   - Describe direction of growth across the six Talent dimensions
   - Surface strengths and growth opportunities
   - Carry evidence confidence / maturity
   - Carry unified evidence-source participation
   - NEVER award Talent DNA points
   - NEVER write to Supabase

   The existing Talent DNA / evidence foundation remains authoritative.
============================================================ */

export type GrowthDirection =
  | "Improving"
  | "Stable"
  | "Declining"
  | "No History";

export interface UnifiedEvidenceSnapshotLike {
  portfolio?: {
    performances?: number;
    projects?: number;
    skills?: number;
    total?: number;
  };
  timeline?: {
    achievements?: number;
    verified?: number;
    withProof?: number;
  };
  competitions?: {
    submissions?: number;
  };
  credits?: {
    transactions?: number;
    lifetimeEarned?: number;
  };
  academic?: Record<string, unknown> | null;
  intelligence?: {
    growthEngagement?: unknown;
    achievementStrength?: unknown;
    profileConfidence?: unknown;
    academicEvidence?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DimensionGrowth {
  dimension: TalentDimension;
  baseline: number | null;
  current: number | null;
  change: number | null;
  direction: GrowthDirection;
  evidenceCount: number;
  sourceCount: number;
  recentEvidenceCount: number;
  averageConfidenceWeight: number;
}

export interface GrowthIntelligenceProfile {
  baselineSnapshot: TalentDNAHistoryRecord | null;
  currentSnapshot: TalentDNAHistoryRecord | null;

  baselineOverall: number | null;
  currentOverall: number | null;
  overallChange: number | null;
  overallDirection: GrowthDirection;

  profileConfidence: number;
  profileConfidenceLabel:
    EvidenceIntelligence["profileConfidenceLabel"];

  totalEvidence: number;
  sourceDiversity: number;
  dimensionCoverage: number;
  recentEvidence90Days: number;

  dimensions: Record<TalentDimension, DimensionGrowth>;

  strongestDimensions: TalentDimension[];
  growthOpportunities: TalentDimension[];
  improvingDimensions: TalentDimension[];
  decliningDimensions: TalentDimension[];

  evidenceSources: {
    portfolioItems: number;
    achievements: number;
    verifiedAchievements: number;
    competitionSubmissions: number;
    creditTransactions: number;
    lifetimeCreditsEarned: number;
    hasAcademicEvidence: boolean;
  };

  supportingIntelligence:
    UnifiedEvidenceSnapshotLike["intelligence"];
}

const DIMENSIONS: TalentDimension[] = [
  "Creativity",
  "Communication",
  "Leadership",
  "Confidence",
  "Collaboration",
  "CriticalThinking",
];

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function snapshotScore(
  snapshot: TalentDNAHistoryRecord | null,
  dimension: TalentDimension
): number | null {
  if (!snapshot) return null;

  const map: Record<TalentDimension, keyof TalentDNAHistoryRecord> = {
    Creativity: "creativity_score",
    Communication: "communication_score",
    Leadership: "leadership_score",
    Confidence: "confidence_score",
    Collaboration: "collaboration_score",
    CriticalThinking: "critical_thinking_score",
  };

  return numeric(snapshot[map[dimension]]);
}

function direction(
  change: number | null,
  hasHistory: boolean
): GrowthDirection {
  if (!hasHistory || change === null) return "No History";
  if (change >= 2) return "Improving";
  if (change <= -2) return "Declining";
  return "Stable";
}

function hasAcademicEvidence(
  snapshot: UnifiedEvidenceSnapshotLike
): boolean {
  if (snapshot.academic && typeof snapshot.academic === "object") {
    return Object.keys(snapshot.academic).length > 0;
  }

  return Boolean(
    snapshot.intelligence?.academicEvidence
  );
}

export function buildGrowthIntelligenceProfile(
  evidence: EvidenceIntelligence,
  unified: UnifiedEvidenceSnapshotLike
): GrowthIntelligenceProfile {
  const baselineSnapshot = evidence.firstSnapshot;
  const currentSnapshot = evidence.latestSnapshot;

  const hasHistory =
    Boolean(baselineSnapshot && currentSnapshot);

  const dimensions =
    {} as Record<TalentDimension, DimensionGrowth>;

  for (const dimension of DIMENSIONS) {
    const baseline =
      snapshotScore(baselineSnapshot, dimension);

    const current =
      snapshotScore(currentSnapshot, dimension);

    const change =
      baseline !== null && current !== null
        ? Math.round((current - baseline) * 100) / 100
        : null;

    const evidenceDimension =
      evidence.dimensions[dimension];

    dimensions[dimension] = {
      dimension,
      baseline,
      current,
      change,
      direction: direction(change, hasHistory),
      evidenceCount:
        evidenceDimension?.evidenceCount ?? 0,
      sourceCount:
        evidenceDimension?.sourceCount ?? 0,
      recentEvidenceCount:
        evidenceDimension?.recentEvidenceCount ?? 0,
      averageConfidenceWeight:
        evidenceDimension?.averageConfidenceWeight ?? 0,
    };
  }

  const baselineOverall =
    baselineSnapshot
      ? numeric(baselineSnapshot.overall_score)
      : null;

  const currentOverall =
    currentSnapshot
      ? numeric(currentSnapshot.overall_score)
      : null;

  const overallChange =
    baselineOverall !== null && currentOverall !== null
      ? Math.round(
          (currentOverall - baselineOverall) * 100
        ) / 100
      : null;

  const rankedCurrent =
    DIMENSIONS
      .map(dimension => ({
        dimension,
        score: dimensions[dimension].current,
      }))
      .filter(
        row => row.score !== null
      )
      .sort(
        (a, b) =>
          numeric(b.score) - numeric(a.score)
      );

  const rankedChange =
    DIMENSIONS
      .map(dimension => ({
        dimension,
        change: dimensions[dimension].change,
      }))
      .filter(
        row => row.change !== null
      );

  const strongestDimensions =
    rankedCurrent
      .slice(0, 3)
      .map(row => row.dimension);

  const growthOpportunities =
    [...rankedCurrent]
      .reverse()
      .slice(0, 3)
      .map(row => row.dimension);

  const improvingDimensions =
    rankedChange
      .filter(row => numeric(row.change) >= 2)
      .sort(
        (a, b) =>
          numeric(b.change) - numeric(a.change)
      )
      .map(row => row.dimension);

  const decliningDimensions =
    rankedChange
      .filter(row => numeric(row.change) <= -2)
      .sort(
        (a, b) =>
          numeric(a.change) - numeric(b.change)
      )
      .map(row => row.dimension);

  return {
    baselineSnapshot,
    currentSnapshot,

    baselineOverall,
    currentOverall,
    overallChange,
    overallDirection:
      direction(overallChange, hasHistory),

    profileConfidence:
      evidence.profileConfidence,

    profileConfidenceLabel:
      evidence.profileConfidenceLabel,

    totalEvidence:
      evidence.totalEvidence,

    sourceDiversity:
      evidence.sourceDiversity,

    dimensionCoverage:
      evidence.dimensionCoverage,

    recentEvidence90Days:
      evidence.recentEvidence90Days,

    dimensions,

    strongestDimensions,
    growthOpportunities,
    improvingDimensions,
    decliningDimensions,

    evidenceSources: {
      portfolioItems:
        numeric(unified.portfolio?.total),

      achievements:
        numeric(unified.timeline?.achievements),

      verifiedAchievements:
        numeric(unified.timeline?.verified),

      competitionSubmissions:
        numeric(unified.competitions?.submissions),

      creditTransactions:
        numeric(unified.credits?.transactions),

      lifetimeCreditsEarned:
        numeric(unified.credits?.lifetimeEarned),

      hasAcademicEvidence:
        hasAcademicEvidence(unified),
    },

    supportingIntelligence:
      unified.intelligence ?? {},
  };
}
