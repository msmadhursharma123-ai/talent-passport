import type {
  TalentDimension,
  TalentEvidenceRecord,
  TalentDNAHistoryRecord,
  TalentEvidenceSummary
} from "./talentEvidenceRepository";

/* ============================================================
   TALENT EVIDENCE ENGINE

   Phase 3 — Evidence Foundation

   Pure calculation layer.

   IMPORTANT:
   This engine does NOT change Talent DNA yet.
   It interprets the evidence foundation so the ViewModel can
   consume trustworthy evidence/history without duplicating logic.

   Evidence-weighted DNA calculation comes after baseline
   migration + verified source ingestion are in place.
============================================================ */

export interface DimensionEvidenceIntelligence {
  dimension: TalentDimension;
  evidenceCount: number;
  sourceCount: number;
  recentEvidenceCount: number;
  averageConfidenceWeight: number;
  latestObservedScore: number | null;
  latestObservedAt: string | null;
}

export interface EvidenceIntelligence {
  totalEvidence: number;
  sourceDiversity: number;
  dimensionCoverage: number;
  recentEvidence90Days: number;
  baselineEvidence: number;

  profileConfidence: number;
  profileConfidenceLabel:
    | "Early Profile"
    | "Developing"
    | "Established"
    | "High Confidence";

  dimensions: Record<
    TalentDimension,
    DimensionEvidenceIntelligence
  >;

  firstSnapshot:
    TalentDNAHistoryRecord | null;

  latestSnapshot:
    TalentDNAHistoryRecord | null;
}

const DIMENSIONS: TalentDimension[] = [
  "Creativity",
  "Communication",
  "Leadership",
  "Confidence",
  "Collaboration",
  "CriticalThinking"
];

function clamp100(
  value: number
): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value)
    )
  );
}

function dateMs(
  value: string | null | undefined
): number {
  if (!value) {
    return 0;
  }

  const parsed =
    new Date(value).getTime();

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function confidenceLabel(
  score: number
):
EvidenceIntelligence["profileConfidenceLabel"] {

  if (score >= 85) {
    return "High Confidence";
  }

  if (score >= 65) {
    return "Established";
  }

  if (score >= 40) {
    return "Developing";
  }

  return "Early Profile";
}

/*
 * Profile Confidence measures how trustworthy / mature the
 * profile is — NOT how talented the student is.
 *
 * Foundation weighting:
 * 30% evidence volume
 * 25% source diversity
 * 25% six-dimension coverage
 * 20% recent evidence
 *
 * Caps prevent raw activity spam from producing unlimited score.
 * Evaluator quality / cross-source consistency will be added when
 * verified evidence ingestion begins.
 */
export function calculateProfileConfidence(
  summary: TalentEvidenceSummary
): number {

  const volume =
    Math.min(
      1,
      summary.totalEvidence / 24
    );

  const diversity =
    Math.min(
      1,
      summary.sourceDiversity / 5
    );

  const coverage =
    Math.min(
      1,
      summary.dimensionCoverage / 6
    );

  const recency =
    Math.min(
      1,
      summary.recentEvidence90Days / 12
    );

  return clamp100(
    (
      volume * 0.30 +
      diversity * 0.25 +
      coverage * 0.25 +
      recency * 0.20
    ) * 100
  );
}

function buildDimensionIntelligence(
  dimension: TalentDimension,
  evidence: TalentEvidenceRecord[]
): DimensionEvidenceIntelligence {

  const rows =
    evidence
      .filter(
        row =>
          row.dimension === dimension
      )
      .sort(
        (a, b) =>
          dateMs(b.observed_at) -
          dateMs(a.observed_at)
      );

  const sources =
    new Set(
      rows.map(
        row =>
          `${row.evidence_type}:${row.source}`
      )
    );

  const recentCutoff =
    Date.now() -
    90 * 24 * 60 * 60 * 1000;

  const recentEvidenceCount =
    rows.filter(
      row =>
        dateMs(row.observed_at) >=
        recentCutoff
    ).length;

  const averageConfidenceWeight =
    rows.length > 0
      ? rows.reduce(
          (
            sum,
            row
          ) =>
            sum +
            Number(
              row.confidence_weight || 0
            ),
          0
        ) / rows.length
      : 0;

  const latest =
    rows[0] ?? null;

  return {
    dimension,
    evidenceCount:
      rows.length,

    sourceCount:
      sources.size,

    recentEvidenceCount,

    averageConfidenceWeight:
      Math.round(
        averageConfidenceWeight *
        100
      ) / 100,

    latestObservedScore:
      latest
        ? latest.observed_score
        : null,

    latestObservedAt:
      latest
        ? latest.observed_at
        : null
  };
}

export function buildEvidenceIntelligence(
  evidence: TalentEvidenceRecord[],
  dnaHistory: TalentDNAHistoryRecord[],
  summary: TalentEvidenceSummary
): EvidenceIntelligence {

  const orderedHistory =
    [...dnaHistory]
      .sort(
        (a, b) =>
          dateMs(a.created_at) -
          dateMs(b.created_at)
      );

  const profileConfidence =
    calculateProfileConfidence(
      summary
    );

  const dimensions =
    {} as Record<
      TalentDimension,
      DimensionEvidenceIntelligence
    >;

  for (
    const dimension
    of DIMENSIONS
  ) {
    dimensions[dimension] =
      buildDimensionIntelligence(
        dimension,
        evidence
      );
  }

  return {
    totalEvidence:
      summary.totalEvidence,

    sourceDiversity:
      summary.sourceDiversity,

    dimensionCoverage:
      summary.dimensionCoverage,

    recentEvidence90Days:
      summary.recentEvidence90Days,

    baselineEvidence:
      summary.baselineEvidence,

    profileConfidence,

    profileConfidenceLabel:
      confidenceLabel(
        profileConfidence
      ),

    dimensions,

    firstSnapshot:
      orderedHistory[0] ??
      null,

    latestSnapshot:
      orderedHistory[
        orderedHistory.length - 1
      ] ?? null
  };
}


/* ============================================================
   PHASE 4 — LIVE DNA EVOLUTION

   The database is authoritative for DNA evolution.
   This client layer normalizes secure authenticated RPC results.
   It never awards points locally.
============================================================ */

export interface CurrentTalentDNA {
  creativity: number;
  communication: number;
  leadership: number;
  confidence: number;
  collaboration: number;
  criticalThinking: number;
  overallScore: number;
  profileConfidence: number;
  evidenceSignalCount: number;
  raw: any;
}

export interface TalentDNAExplanation {
  rows: any[];
  raw: any;
}

function numberFrom(
  source: any,
  keys: string[],
  fallback = 0
): number {
  for (const key of keys) {
    const value = source?.[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function unwrapRpcObject(
  value: any
): any {
  if (Array.isArray(value)) {
    return value.length > 0
      ? value[0]
      : null;
  }

  return value ?? null;
}

export function normalizeCurrentTalentDNA(
  rpcValue: any,
  fallback: Partial<CurrentTalentDNA> = {}
): CurrentTalentDNA {

  const row =
    unwrapRpcObject(rpcValue) ?? {};

  const creativity =
    numberFrom(
      row,
      [
        "creativityScore",
        "creativity_score",
        "creativity",
        "Creativity"
      ],
      Number(
        fallback.creativity ?? 0
      )
    );

  const communication =
    numberFrom(
      row,
      [
        "communicationScore",
        "communication_score",
        "communication",
        "Communication"
      ],
      Number(
        fallback.communication ?? 0
      )
    );

  const leadership =
    numberFrom(
      row,
      [
        "leadershipScore",
        "leadership_score",
        "leadership",
        "Leadership"
      ],
      Number(
        fallback.leadership ?? 0
      )
    );

  const confidence =
    numberFrom(
      row,
      [
        "confidenceScore",
        "confidence_score",
        "confidence",
        "Confidence"
      ],
      Number(
        fallback.confidence ?? 0
      )
    );

  const collaboration =
    numberFrom(
      row,
      [
        "collaborationScore",
        "collaboration_score",
        "team_score",
        "collaboration",
        "Collaboration"
      ],
      Number(
        fallback.collaboration ?? 0
      )
    );

  const criticalThinking =
    numberFrom(
      row,
      [
        "criticalThinkingScore",
        "critical_thinking_score",
        "criticalThinking",
        "critical_thinking",
        "CriticalThinking"
      ],
      Number(
        fallback.criticalThinking ?? 0
      )
    );

  const calculatedOverall =
    (
      creativity +
      communication +
      leadership +
      confidence +
      collaboration +
      criticalThinking
    ) / 6;

  return {
    creativity:
      clamp100(creativity),

    communication:
      clamp100(communication),

    leadership:
      clamp100(leadership),

    confidence:
      clamp100(confidence),

    collaboration:
      clamp100(collaboration),

    criticalThinking:
      clamp100(criticalThinking),

    overallScore:
      clamp100(
        numberFrom(
          row,
          [
            "overallScore",
            "overall_score",
            "combined_score",
            "dna_index"
          ],
          calculatedOverall
        )
      ),

    profileConfidence:
      clamp100(
        numberFrom(
          row,
          [
            "profileConfidence",
            "profile_confidence",
            "evidence_confidence"
          ],
          Number(
            fallback.profileConfidence ?? 0
          )
        )
      ),

    evidenceSignalCount:
      Math.max(
        0,
        Math.round(
          numberFrom(
            row,
            [
              "evidence_signal_count",
              "evidenceSignalCount",
              "validated_evidence_count",
              "signal_count"
            ],
            Number(
              fallback.evidenceSignalCount ?? 0
            )
          )
        )
      ),

    raw:
      row
  };
}

export function normalizeTalentDNAExplanation(
  rpcValue: any
): TalentDNAExplanation {

  if (Array.isArray(rpcValue)) {
    return {
      rows: rpcValue,
      raw: rpcValue
    };
  }

  if (
    rpcValue &&
    Array.isArray(
      rpcValue.evidence
    )
  ) {
    return {
      rows:
        rpcValue.evidence,
      raw:
        rpcValue
    };
  }

  if (
    rpcValue &&
    Array.isArray(
      rpcValue.rows
    )
  ) {
    return {
      rows: rpcValue.rows,
      raw: rpcValue
    };
  }

  if (
    rpcValue &&
    Array.isArray(
      rpcValue.explanations
    )
  ) {
    return {
      rows:
        rpcValue.explanations,
      raw:
        rpcValue
    };
  }

  return {
    rows:
      rpcValue
        ? [rpcValue]
        : [],

    raw:
      rpcValue ?? null
  };
}
