export const ABSENT_FEEDBACK_OPTION = "I was absent.";
export const COMPLETE_FEEDBACK_OPTION = "I completely understood.";
export const PARTIAL_FEEDBACK_OPTION = "I partially understood.";
export const DID_NOT_UNDERSTAND_FEEDBACK_OPTION = "I didn't understand.";

export function isLearningUnderstandingLevel(value: unknown): boolean {
  const normalized = String(value ?? "").trim();
  return (
    normalized === COMPLETE_FEEDBACK_OPTION ||
    normalized === PARTIAL_FEEDBACK_OPTION ||
    normalized === DID_NOT_UNDERSTAND_FEEDBACK_OPTION
  );
}

export function isAbsentFeedback(value: unknown): boolean {
  return String(value ?? "").trim() === ABSENT_FEEDBACK_OPTION;
}
