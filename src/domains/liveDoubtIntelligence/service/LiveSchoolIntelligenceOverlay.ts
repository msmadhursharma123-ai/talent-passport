import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import type { SchoolIntelligenceSnapshot } from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import { buildSchoolIntelligenceSnapshot } from "../../schoolIntelligence/analytics/SchoolIntelligenceEngine";
import {
  getSchoolIntelligenceLiveRows,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

export async function applyLiveSchoolIntelligenceOverlay(
  raw: SchoolIntelligenceRawData,
  baseSnapshot: SchoolIntelligenceSnapshot,
  startDate?: string,
  endDateInclusive?: string
): Promise<SchoolIntelligenceSnapshot> {
  try {
    const liveRows = await getSchoolIntelligenceLiveRows(
      raw.schoolUuid,
      startDate,
      endDateInclusive
    );

    if (!liveRows.length) return baseSnapshot;

    // The Live ledger is the canonical first-loop state for the selected
    // historical window. Do NOT require last_reconciled_at here:
    // all 429 currently-unresolved rows in the production audit have
    // last_reconciled_at = NULL, and that timestamp is not an unresolved
    // eligibility gate. Resolution/reconciliation timestamps also must never
    // move an old doubt into today's analytics; the shared Live date filter
    // uses the original doubt date precedence.
    const overlayRaw: SchoolIntelligenceRawData = {
      ...raw,
      feedback: mergeFeedbackUnderstandingLevels(
        raw.feedback,
        liveRows
      ),
      doubts: mergePendingDoubtsWithLiveLedger(
        raw.doubts,
        liveRows,
        { includeUnmatchedLive: true }
      ),
    };

    return buildSchoolIntelligenceSnapshot(overlayRaw);
  } catch (error) {
    console.error(
      "LIVE SCHOOL INTELLIGENCE OVERLAY FAILED — ORIGINAL SNAPSHOT PRESERVED",
      error
    );
    return baseSnapshot;
  }
}
