import { getSchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import { buildSchoolIntelligenceSnapshot } from "../analytics/SchoolIntelligenceEngine";
import { applyLiveSchoolIntelligenceOverlay } from "../../liveDoubtIntelligence/service/LiveSchoolIntelligenceOverlay";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function buildSnapshotWithOptionalLiveLayer(
  customStartDate?: string,
  customEndDate?: string
) {
  const raw = await getSchoolIntelligenceRawData(
    customStartDate,
    customEndDate
  );

  const base = buildSchoolIntelligenceSnapshot(raw);

  // The live doubt layer is strictly additive. If its SQL/table is not
  // installed yet, or if it fails, the original school intelligence stays.
  // In particular, a live-doubt problem must never wipe the Daily Log feed.
  try {
    const overlaid = await applyLiveSchoolIntelligenceOverlay(
      raw,
      base,
      customStartDate,
      customEndDate
    );

    return {
      ...base,
      ...overlaid,
      // Teacher Intelligence is authoritative from teacher_daily_logs. If the
      // optional live overlay has no live-status payload, retain the base feed.
      teacherLiveStatus:
        Array.isArray(overlaid?.teacherLiveStatus) &&
        overlaid.teacherLiveStatus.length > 0
          ? overlaid.teacherLiveStatus
          : base.teacherLiveStatus,
    };
  } catch (error) {
    console.warn(
      "OPTIONAL LIVE SCHOOL INTELLIGENCE OVERLAY FAILED; USING BASE SCHOOL INTELLIGENCE",
      error
    );

    return base;
  }
}

export async function loadSchoolIntelligence(
  days?: 7 | 14 | 21 | 30 | 60 | 90,
  customStartDate?: string,
  customEndDate?: string
) {
  if (customStartDate || customEndDate) {
    return buildSnapshotWithOptionalLiveLayer(
      customStartDate,
      customEndDate
    );
  }

  if (!days) {
    return buildSnapshotWithOptionalLiveLayer();
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return buildSnapshotWithOptionalLiveLayer(
    isoDate(start),
    isoDate(end)
  );
}
