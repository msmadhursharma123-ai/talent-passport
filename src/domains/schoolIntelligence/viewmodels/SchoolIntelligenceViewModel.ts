import { getSchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import { buildSchoolIntelligenceSnapshot } from "../analytics/SchoolIntelligenceEngine";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function loadSchoolIntelligence(days?: 30 | 60 | 90) {
  if (!days) {
    return buildSchoolIntelligenceSnapshot(await getSchoolIntelligenceRawData());
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return buildSchoolIntelligenceSnapshot(
    await getSchoolIntelligenceRawData(isoDate(start), isoDate(end))
  );
}
