/** Canonical learning-analytics vocabulary. Values are persisted product contracts. */
export const LEARNING_FEEDBACK_OPTIONS = {
  ABSENT: "I was absent.",
  COMPLETE: "I completely understood.",
  PARTIAL: "I partially understood.",
  DID_NOT_UNDERSTAND: "I didn't understand.",
} as const;

export type LearningFeedbackCategory = "ABSENT" | "COMPLETE" | "PARTIAL" | "DID_NOT_UNDERSTAND" | "UNKNOWN";
export type DoubtResolutionSource = "RESOLVED_FLAG" | "RESOLVED_STATUS" | "DISCUSSED_RESPONSE" | "UNRESOLVED";

/**
 * Metric contract:
 * - Closure rate = resolved doubt rows / all doubt rows in the supplied scope.
 * - Learning rates use eligible roster observations after absence exclusion.
 * - Class health = (complete + 0.5 * partial) / eligible observations per lecture;
 *   aggregate class health is the arithmetic mean of lecture health percentages.
 * - Pooled rates and unweighted averages of subject/teacher rates are distinct metrics.
 */
