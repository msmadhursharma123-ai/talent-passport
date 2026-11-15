import { getSchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import { buildSchoolIntelligenceSnapshot } from "../analytics/SchoolIntelligenceEngine";
import { getLiveOverlayRawData } from "../../liveDoubtIntelligence/service/LiveSchoolIntelligenceOverlay";
import type { SchoolIntelligenceSnapshot } from "../types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import { getCurrentSchool } from "../../../services/identityService";
import { readSchoolPageCache, writeSchoolPageCache } from "../schoolPageCache";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function schoolCacheKey(
  schoolUuid: string | undefined,
  startDate?: string,
  endDate?: string,
) {
  if (!schoolUuid) return undefined;
  return [
    "school-intelligence-v3",
    schoolUuid,
    startDate ?? "default",
    endDate ?? "default",
  ].join("|");
}

function schoolDetailRawCacheKey(
  schoolUuid: string | undefined,
  startDate?: string,
  endDate?: string,
) {
  const snapshotKey = schoolCacheKey(schoolUuid, startDate, endDate);
  return snapshotKey ? `${snapshotKey}|detail-raw-v1` : undefined;
}

async function buildSnapshotWithOptionalLiveLayer(
  customStartDate?: string,
  customEndDate?: string
): Promise<{ snapshot: SchoolIntelligenceSnapshot; detailRaw: SchoolIntelligenceRawData }> {
  const raw = await getSchoolIntelligenceRawData(
    customStartDate,
    customEndDate
  );

  const base = {
    ...buildSchoolIntelligenceSnapshot(raw),
    doubtsLoadFailed: raw.doubtsLoadFailed,
  };

  // The Live layer remains strictly additive. The important V15 contract is
  // that the exact overlaid raw evidence used to calculate the page snapshot
  // is retained beside that snapshot for any row-detail popup opened from the
  // same page. This removes the previous second-fetch race/divergence.
  const detailRaw = await getLiveOverlayRawData(
    raw,
    customStartDate,
    customEndDate,
  );

  if (detailRaw === raw) {
    return { snapshot: base, detailRaw };
  }

  // Preserve the original School Intelligence failure-isolation contract: if
  // the live-overlay snapshot itself cannot be built, the page must retain
  // the base snapshot and the popup must receive the same base raw evidence.
  // Returning overlaid raw evidence with a base snapshot would recreate the
  // very table/detail divergence V15 is designed to eliminate.
  try {
    const overlaid = {
      ...buildSchoolIntelligenceSnapshot(detailRaw),
      doubtsLoadFailed: detailRaw.doubtsLoadFailed,
    };

    return {
      snapshot: {
        ...base,
        ...overlaid,
        teacherLiveStatus:
          Array.isArray(overlaid?.teacherLiveStatus) &&
          overlaid.teacherLiveStatus.length > 0
            ? overlaid.teacherLiveStatus
            : base.teacherLiveStatus,
      },
      detailRaw,
    };
  } catch (error) {
    console.warn(
      "OPTIONAL LIVE SCHOOL INTELLIGENCE SNAPSHOT BUILD FAILED; USING BASE SCHOOL INTELLIGENCE",
      error,
    );
    return { snapshot: base, detailRaw: raw };
  }
}


export async function loadSchoolIntelligenceWithDetailRaw(
  days?: 7 | 14 | 21 | 30 | 60 | 90,
  customStartDate?: string,
  customEndDate?: string,
  options?: { forceRefresh?: boolean }
): Promise<{ snapshot: SchoolIntelligenceSnapshot; detailRaw: SchoolIntelligenceRawData }> {
  let startDate = customStartDate;
  let endDate = customEndDate;

  if (!startDate && !endDate && days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    startDate = isoDate(start);
    endDate = isoDate(end);
  }

  const schoolUuid = getCurrentSchool()?.schoolUuid;
  const cacheKey = schoolCacheKey(schoolUuid, startDate, endDate);
  const detailRawKey = schoolDetailRawCacheKey(schoolUuid, startDate, endDate);

  if (!options?.forceRefresh && cacheKey && detailRawKey) {
    const cached = readSchoolPageCache<SchoolIntelligenceSnapshot>(cacheKey);
    const cachedDetailRaw = readSchoolPageCache<SchoolIntelligenceRawData>(detailRawKey);
    // A snapshot without its matching raw evidence is not a valid V15 cache
    // entry for this page: rebuild both together so popup and table cannot
    // silently diverge.
    if (cached && cachedDetailRaw) return { snapshot: cached, detailRaw: cachedDetailRaw };
  }

  const { snapshot, detailRaw } = await buildSnapshotWithOptionalLiveLayer(
    startDate,
    endDate,
  );

  if (cacheKey) writeSchoolPageCache(cacheKey, snapshot);
  if (detailRawKey) writeSchoolPageCache(detailRawKey, detailRaw);
  return { snapshot, detailRaw };
}

export async function loadSchoolIntelligence(
  days?: 7 | 14 | 21 | 30 | 60 | 90,
  customStartDate?: string,
  customEndDate?: string,
  options?: { forceRefresh?: boolean }
): Promise<SchoolIntelligenceSnapshot> {
  const result = await loadSchoolIntelligenceWithDetailRaw(
    days,
    customStartDate,
    customEndDate,
    options,
  );
  return result.snapshot;
}
