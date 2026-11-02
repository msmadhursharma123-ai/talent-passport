import { getSavedStarPerformers, getStarPerformerPeriods } from "../repository/StarPerformerRepository";
import { calculateStarPerformers } from "../services/StarPerformerService";
import type { StarPerformerPeriod, StarPerformerRow } from "../types/StarPerformerModels";

export interface StarPerformerViewModel {
  year: number;
  periods: StarPerformerPeriod[];
  rows: StarPerformerRow[];
}

export async function loadStarPerformerViewModel(
  year = new Date().getFullYear()
): Promise<StarPerformerViewModel> {
  const [periods, rows] = await Promise.all([
    getStarPerformerPeriods(year),
    calculateStarPerformers(year),
  ]);

  return { year, periods, rows };
}


/**
 * Teacher Portal must consume the school-wide published snapshot.
 * Teacher sessions can have different row-level access to teacher assignments,
 * logs, feedback and doubts; recalculating from each teacher's client session
 * can therefore produce different winners and overwrite the shared snapshot
 * with a partial school result. Only the School Admin calculation path should
 * calculate and publish the school-wide recognition rows.
 */
export async function loadTeacherStarPerformerViewModel(
  year = new Date().getFullYear()
): Promise<StarPerformerViewModel> {
  const [periods, rows] = await Promise.all([
    getStarPerformerPeriods(year),
    getSavedStarPerformers(year),
  ]);

  if (rows.length === 0) {
    throw new Error(
      "School-wide Star Performer results have not been published yet. Ask the School Admin to open Star Performers and calculate the recognition history."
    );
  }

  return { year, periods, rows };
}
