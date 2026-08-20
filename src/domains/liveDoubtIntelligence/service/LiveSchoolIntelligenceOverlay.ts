import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import type { SchoolIntelligenceSnapshot } from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import { buildSchoolIntelligenceSnapshot } from "../../schoolIntelligence/analytics/SchoolIntelligenceEngine";
import {
  getLiveDoubtsForSchool,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

function indiaDateKey(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  return `${parts.find(p => p.type === "year")?.value ?? ""}-${parts.find(p => p.type === "month")?.value ?? ""}-${parts.find(p => p.type === "day")?.value ?? ""}`;
}

function originalDoubtDate(row: any) {
  return (
    row?.first_seen_at ??
    row?.log_date ??
    row?.source_submitted_at ??
    row?.latest_source_submitted_at ??
    row?.created_at
  );
}

export async function applyLiveSchoolIntelligenceOverlay(
  raw: SchoolIntelligenceRawData,
  baseSnapshot: SchoolIntelligenceSnapshot,
  startDate?: string,
  endDateInclusive?: string
): Promise<SchoolIntelligenceSnapshot> {
  try {
    const liveRows = await getLiveDoubtsForSchool(raw.schoolUuid);

    if (!liveRows.length) return baseSnapshot;

    // The live row belongs to the historical day on which the doubt first
    // appeared. Resolution time must never move it into today's analytics.
    const reconciledRows = liveRows.filter((row) => {
      if (!row.last_reconciled_at) return false;
      if (!startDate && !endDateInclusive) return true;
      const date = indiaDateKey(originalDoubtDate(row));
      if (!date) return false;
      if (startDate && date < startDate) return false;
      if (endDateInclusive && date > endDateInclusive) return false;
      return true;
    });

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
    console.error(
      "LIVE SCHOOL INTELLIGENCE OVERLAY FAILED — ORIGINAL SNAPSHOT PRESERVED",
      error
    );
    return baseSnapshot;
  }
}
