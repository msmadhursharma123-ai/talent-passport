import {
  getStarPerformerPeriods,
  getStarPerformerSourceData,
  saveStarPerformerRows,
} from "../repository/StarPerformerRepository";
import { buildStarPerformerRows } from "../analytics/StarPerformerEngine";
import type { StarPerformerRow } from "../types/StarPerformerModels";

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Service orchestration only.
 *
 * The repository remains responsible for source access/persistence.
 * The analytics engine remains responsible for period/teacher scoring.
 * The page never changes existing portal data.
 */
export async function calculateStarPerformers(
  year = new Date().getFullYear()
): Promise<StarPerformerRow[]> {
  const [raw, periods] = await Promise.all([
    getStarPerformerSourceData(year),
    getStarPerformerPeriods(year),
  ]);

  const rows = buildStarPerformerRows(raw, periods, todayKey());

  try {
    await saveStarPerformerRows(rows);
  } catch (error) {
    // Persistence is historical caching only. The freshly calculated live-layer
    // result must remain usable if the optional snapshot table is unavailable.
    console.warn(
      "STAR PERFORMERS HISTORY PERSISTENCE FAILED — LIVE CALCULATION STILL AVAILABLE",
      error
    );
  }

  return rows;
}
