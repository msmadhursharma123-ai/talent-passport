import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import type { SchoolIntelligenceSnapshot } from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import { buildSchoolIntelligenceSnapshot } from "../../schoolIntelligence/analytics/SchoolIntelligenceEngine";
import {
  getSchoolIntelligenceCurrentStateLiveRows,
  getSchoolIntelligenceLiveRows,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedgerForReportingPeriod,
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
    const liveRows = await getSchoolIntelligenceCurrentStateLiveRows(
      raw.schoolUuid,
    );

    if (!liveRows.length) return raw;

    // Feedback retains the original period-scoped Live read contract. Only
    // doubt reconciliation needs the complete current-state Live population.
    const feedbackLiveRows = await getSchoolIntelligenceLiveRows(
      raw.schoolUuid,
      startDate,
      endDateInclusive,
    );

    return {
      ...raw,
      feedback: mergeFeedbackUnderstandingLevels(raw.feedback, feedbackLiveRows),
      doubts: mergePendingDoubtsWithLiveLedgerForReportingPeriod(
        raw.doubts,
        liveRows,
        { startDate, endDateInclusive },
      ),
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
