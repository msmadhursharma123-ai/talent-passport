import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   TALENT EVIDENCE REPOSITORY

   Phase 3 — Evidence Foundation

   Browser responsibilities:
   - READ authenticated student's evidence through secure RPC.
   - READ authenticated student's DNA history through secure RPC.
   - READ evidence summary through secure RPC.

   Browser does NOT:
   - choose student_uuid
   - insert evidence
   - edit evidence
   - manufacture DNA history

   Authentication is resolved server-side by:
   auth.uid() -> students_master -> student_uuid
============================================================ */

export type TalentDimension =
  | "Creativity"
  | "Communication"
  | "Leadership"
  | "Confidence"
  | "Collaboration"
  | "CriticalThinking";

export interface TalentEvidenceRecord {
  evidence_uuid: string;
  student_uuid: string;
  dimension: TalentDimension;
  observed_score: number;
  evidence_type: string;
  source: string;
  source_id: string | null;
  evaluator_type: string;
  confidence_weight: number;
  is_baseline: boolean;
  metadata: Record<string, unknown>;
  observed_at: string;
  created_at: string;
}

export interface TalentDNAHistoryRecord {
  snapshot_uuid: string;
  student_uuid: string;
  creativity_score: number;
  communication_score: number;
  leadership_score: number;
  confidence_score: number;
  collaboration_score: number;
  critical_thinking_score: number;
  overall_score: number;
  profile_confidence: number;
  snapshot_type:
    | "baseline"
    | "evidence_update"
    | "manual_recalculation"
    | "migration";
  trigger_evidence_uuid: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TalentEvidenceSummary {
  totalEvidence: number;
  sourceDiversity: number;
  dimensionCoverage: number;
  recentEvidence90Days: number;
  baselineEvidence: number;
}

function numeric(
  value: unknown,
  fallback = 0
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function normalizeEvidence(
  row: any
): TalentEvidenceRecord {
  return {
    evidence_uuid:
      String(row?.evidence_uuid ?? ""),

    student_uuid:
      String(row?.student_uuid ?? ""),

    dimension:
      row?.dimension as TalentDimension,

    observed_score:
      numeric(row?.observed_score),

    evidence_type:
      String(row?.evidence_type ?? ""),

    source:
      String(row?.source ?? ""),

    source_id:
      row?.source_id == null
        ? null
        : String(row.source_id),

    evaluator_type:
      String(row?.evaluator_type ?? "system"),

    confidence_weight:
      numeric(row?.confidence_weight, 0.5),

    is_baseline:
      Boolean(row?.is_baseline),

    metadata:
      row?.metadata &&
      typeof row.metadata === "object"
        ? row.metadata
        : {},

    observed_at:
      String(row?.observed_at ?? ""),

    created_at:
      String(row?.created_at ?? "")
  };
}

function normalizeHistory(
  row: any
): TalentDNAHistoryRecord {
  return {
    snapshot_uuid:
      String(row?.snapshot_uuid ?? ""),

    student_uuid:
      String(row?.student_uuid ?? ""),

    creativity_score:
      numeric(row?.creativity_score),

    communication_score:
      numeric(row?.communication_score),

    leadership_score:
      numeric(row?.leadership_score),

    confidence_score:
      numeric(row?.confidence_score),

    collaboration_score:
      numeric(row?.collaboration_score),

    critical_thinking_score:
      numeric(row?.critical_thinking_score),

    overall_score:
      numeric(row?.overall_score),

    profile_confidence:
      numeric(row?.profile_confidence),

    snapshot_type:
      row?.snapshot_type ??
      "evidence_update",

    trigger_evidence_uuid:
      row?.trigger_evidence_uuid == null
        ? null
        : String(row.trigger_evidence_uuid),

    metadata:
      row?.metadata &&
      typeof row.metadata === "object"
        ? row.metadata
        : {},

    created_at:
      String(row?.created_at ?? "")
  };
}

export async function getMyTalentEvidence():
Promise<TalentEvidenceRecord[]> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const {
    data,
    error
  } =
    await (supabase as any)
      .rpc(
        "get_my_talent_evidence"
      );

  if (error) {
    console.error(
      "get_my_talent_evidence failed",
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data.map(normalizeEvidence)
    : [];
}

export async function getMyTalentDNAHistory():
Promise<TalentDNAHistoryRecord[]> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const {
    data,
    error
  } =
    await (supabase as any)
      .rpc(
        "get_my_talent_dna_history"
      );

  if (error) {
    console.error(
      "get_my_talent_dna_history failed",
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data.map(normalizeHistory)
    : [];
}

export async function getMyTalentEvidenceSummary():
Promise<TalentEvidenceSummary> {

  const empty: TalentEvidenceSummary = {
    totalEvidence: 0,
    sourceDiversity: 0,
    dimensionCoverage: 0,
    recentEvidence90Days: 0,
    baselineEvidence: 0
  };

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return empty;
  }

  const {
    data,
    error
  } =
    await (supabase as any)
      .rpc(
        "get_my_talent_evidence_summary"
      );

  if (error) {
    console.error(
      "get_my_talent_evidence_summary failed",
      error
    );

    return empty;
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    return empty;
  }

  return {
    totalEvidence:
      numeric(data.totalEvidence),

    sourceDiversity:
      numeric(data.sourceDiversity),

    dimensionCoverage:
      numeric(data.dimensionCoverage),

    recentEvidence90Days:
      numeric(data.recentEvidence90Days),

    baselineEvidence:
      numeric(data.baselineEvidence)
  };
}

export async function getTalentEvidenceFoundationData() {

  const [
    evidence,
    dnaHistory,
    evidenceSummary
  ] =
    await Promise.all([
      getMyTalentEvidence(),
      getMyTalentDNAHistory(),
      getMyTalentEvidenceSummary()
    ]);

  return {
    evidence,
    dnaHistory,
    evidenceSummary
  };
}
