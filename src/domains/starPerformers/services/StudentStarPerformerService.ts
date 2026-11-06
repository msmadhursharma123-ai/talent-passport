import { getStudentStarPerformerSourceData } from "../repository/StudentStarPerformerRepository";
import { calculateStudentStarPerformersFromSource, type StudentStarPerformerCalculationInput } from "./StudentStarPerformerCalculator";
import type { StudentStarPerformerResult } from "../types/StudentStarPerformerModels";

export type { StudentStarPerformerCalculationInput } from "./StudentStarPerformerCalculator";

/**
 * Existing Star Performer entry point. Calculation logic is unchanged; the
 * exact same pure calculator is now shared with the Partner Masterclass
 * verification flow so the partner cannot drift from the Student Star Performer.
 */
export async function calculateStudentStarPerformers(
  input: StudentStarPerformerCalculationInput,
): Promise<StudentStarPerformerResult> {
  const raw = await getStudentStarPerformerSourceData(input.startDate, input.endDate);
  return calculateStudentStarPerformersFromSource(raw, input);
}
