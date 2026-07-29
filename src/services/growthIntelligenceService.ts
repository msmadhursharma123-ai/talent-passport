import {
  getTalentEvidenceFoundationData,
} from "../data/talentEvidenceRepository";

import {
  buildEvidenceIntelligence,
} from "../data/talentEvidenceEngine";

import {
  buildGrowthIntelligenceProfile,
  type GrowthIntelligenceProfile,
} from "../engines/growthIntelligenceEngine";

import {
  getStudentEvidenceSnapshot,
} from "./studentEvidenceService";

/* ============================================================
   GROWTH INTELLIGENCE SERVICE

   Single read orchestration point.

   Combines:
   1. Existing authoritative Talent Evidence Foundation
   2. Existing Unified Student Evidence Snapshot
   3. Pure Growth Intelligence calculation

   No database writes.
   No DNA scoring changes.
============================================================ */

export async function getStudentGrowthIntelligence():
Promise<GrowthIntelligenceProfile> {

  const [
    foundation,
    unifiedEvidence,
  ] = await Promise.all([
    getTalentEvidenceFoundationData(),
    getStudentEvidenceSnapshot(),
  ]);

  const evidenceIntelligence =
    buildEvidenceIntelligence(
      foundation.evidence,
      foundation.dnaHistory,
      foundation.evidenceSummary
    );

  return buildGrowthIntelligenceProfile(
    evidenceIntelligence,
    unifiedEvidence
  );
}
