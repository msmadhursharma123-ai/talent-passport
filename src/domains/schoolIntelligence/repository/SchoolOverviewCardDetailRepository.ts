import { getSupabaseClient } from "../../../supabaseClient";
import { getSchoolIntelligenceRawData } from "./SchoolIntelligenceRepository";
import {
  getSchoolIntelligenceLiveRows,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import type { SchoolIntelligenceRawData } from "./SchoolIntelligenceRepository";

export interface SchoolOverviewCardDetailRawData extends SchoolIntelligenceRawData {
  schoolHolidays: Array<{ date: string; name: string; source: "SCHOOL" }>;
}

async function getSchoolHolidays(
  schoolUuid: string,
  startDate: string,
  endDate: string,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const result = await (supabase as any)
      .from("school_calendar_holidays")
      .select("holiday_date,holiday_name")
      .eq("school_uuid", schoolUuid)
      .gte("holiday_date", startDate)
      .lte("holiday_date", endDate)
      .order("holiday_date", { ascending: true });

    if (result.error) return [];
    return (result.data ?? []).map((row: any) => ({
      date: String(row.holiday_date ?? ""),
      name: String(row.holiday_name ?? "School Holiday"),
      source: "SCHOOL" as const,
    }));
  } catch {
    return [];
  }
}

export async function getSchoolOverviewCardDetailRawData(
  startDate: string,
  endDate: string,
): Promise<SchoolOverviewCardDetailRawData> {
  const raw = await getSchoolIntelligenceRawData(startDate, endDate);
  const schoolHolidays = await getSchoolHolidays(raw.schoolUuid, startDate, endDate);

  try {
    const liveRows = await getSchoolIntelligenceLiveRows(
      raw.schoolUuid,
      startDate,
      endDate,
    );

    return {
      ...raw,
      feedback: mergeFeedbackUnderstandingLevels(raw.feedback, liveRows),
      doubts: mergePendingDoubtsWithLiveLedger(raw.doubts, liveRows, {
        includeUnmatchedLive: true,
      }),
      schoolHolidays,
    };
  } catch (error) {
    console.error(
      "SCHOOL OVERVIEW CARD DETAIL LIVE OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error,
    );
    return { ...raw, schoolHolidays };
  }
}
