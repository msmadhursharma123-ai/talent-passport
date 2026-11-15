import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import type { SchoolIntelligenceSnapshot } from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import { buildSchoolIntelligenceSnapshot } from "../../schoolIntelligence/analytics/SchoolIntelligenceEngine";
import {
  getSchoolIntelligenceLiveRows,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

/**
 * Returns the exact raw school-intelligence evidence after the existing Live
 * reconciliation overlay has been applied. This is deliberately kept as a
 * pure data-layer companion to the existing snapshot overlay so a detail view
 * can reuse the same evidence snapshot instead of issuing a second,
 * independently-timed database read.
 */
export async function getLiveOverlayRawData(
  raw: SchoolIntelligenceRawData,
  startDate?: string,
  endDateInclusive?: string
): Promise<SchoolIntelligenceRawData> {
  try {
    const liveRows = await getSchoolIntelligenceLiveRows(
      raw.schoolUuid,
      startDate,
      endDateInclusive
    );

    if (!liveRows.length) return raw;

    return {
      ...raw,
      feedback: mergeFeedbackUnderstandingLevels(raw.feedback, liveRows),
      doubts: mergePendingDoubtsWithLiveLedger(raw.doubts, liveRows, {
        includeUnmatchedLive: true,
      }),
    };
  } catch (error) {
    console.error(
      "LIVE SCHOOL INTELLIGENCE OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error
    );
    return raw;
  }
}

export async function applyLiveSchoolIntelligenceOverlay(
  raw: SchoolIntelligenceRawData,
  baseSnapshot: SchoolIntelligenceSnapshot,
  startDate?: string,
  endDateInclusive?: string
): Promise<SchoolIntelligenceSnapshot> {
  try {
    const overlayRaw = await getLiveOverlayRawData(
      raw,
      startDate,
      endDateInclusive
    );

    if (overlayRaw === raw) return baseSnapshot;
    return buildSchoolIntelligenceSnapshot(overlayRaw);
  } catch (error) {
    console.error(
      "LIVE SCHOOL INTELLIGENCE OVERLAY FAILED — ORIGINAL SNAPSHOT PRESERVED",
      error
    );
    return baseSnapshot;
  }
}
