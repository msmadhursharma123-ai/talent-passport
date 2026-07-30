import { getSchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import { buildSchoolIntelligenceSnapshot } from "../analytics/SchoolIntelligenceEngine";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function loadSchoolIntelligence(
  days?: 7 | 14 | 21 | 30 | 60 | 90,
  customStartDate?: string,
  customEndDate?: string
) {
  if (customStartDate || customEndDate) {
    return buildSchoolIntelligenceSnapshot(
      await getSchoolIntelligenceRawData(customStartDate, customEndDate)
    );
  }

  if (!days) {
    return buildSchoolIntelligenceSnapshot(
      await getSchoolIntelligenceRawData()
    );
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return buildSchoolIntelligenceSnapshot(
    await getSchoolIntelligenceRawData(isoDate(start), isoDate(end))
  );
}
