import { getStarPerformerPeriods } from "../repository/StarPerformerRepository";
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
