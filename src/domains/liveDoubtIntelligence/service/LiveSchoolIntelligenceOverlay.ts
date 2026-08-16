import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import type { SchoolIntelligenceSnapshot } from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import { buildSchoolIntelligenceSnapshot } from "../../schoolIntelligence/analytics/SchoolIntelligenceEngine";
import {
  getLiveDoubtsForSchool,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

export async function applyLiveSchoolIntelligenceOverlay(
  raw: SchoolIntelligenceRawData,
  baseSnapshot: SchoolIntelligenceSnapshot
): Promise<SchoolIntelligenceSnapshot> {
  try {
    const liveRows = await getLiveDoubtsForSchool(raw.schoolUuid);

    // The new layer is additive and fail-open. If the live table is not
    // installed yet, the existing school intelligence is returned exactly.
    if (!liveRows.length) return baseSnapshot;

    const reconciledRows = liveRows.filter(
      (row) => Boolean(row.last_reconciled_at)
    );

    if (!reconciledRows.length) return baseSnapshot;

    const overlayRaw: SchoolIntelligenceRawData = {
      ...raw,
      feedback: mergeFeedbackUnderstandingLevels(
        raw.feedback,
        reconciledRows
      ),
      doubts: mergePendingDoubtsWithLiveLedger(
        raw.doubts,
        reconciledRows
      ),
    };

    return buildSchoolIntelligenceSnapshot(overlayRaw);
  } catch (error) {
    // Never let the optional intelligence layer take down the existing
    // School Admin portal.
    console.error(
      "LIVE SCHOOL INTELLIGENCE OVERLAY FAILED — ORIGINAL SNAPSHOT PRESERVED",
      error
    );
    return baseSnapshot;
  }
}
