/* ============================================================
   CREDIT ENGINE

   Pure Credit Calculation Engine

   Responsibilities

   • Competition Credits
   • Achievement Credits
   • Portfolio Credits
   • Leaderboard Bonus

   No Identity
   No Repository
   No Supabase
============================================================ */

/* ============================================================
   CREDIT CONSTANTS
============================================================ */

const CREDIT_PER_ACTIVITY = 10;

const LEADERBOARD_BONUS = {

  FIRST: 50,

  SECOND: 30,

  THIRD: 20

} as const;

/* ============================================================
   COMPETITION CREDITS
============================================================ */

export function calculateCompetitionCredits(

  submissionsCount: number

): number {

  return submissionsCount *

    CREDIT_PER_ACTIVITY;

}

/* ============================================================
   ACHIEVEMENT CREDITS
============================================================ */

export function calculateAchievementCredits(

  achievementsCount: number,

  verifiedCount: number

): number {

  return (

    achievementsCount *

      CREDIT_PER_ACTIVITY +

    verifiedCount *

      CREDIT_PER_ACTIVITY

  );

}

/* ============================================================
   PORTFOLIO CREDITS
============================================================ */

export function calculatePortfolioCredits(

  performanceCount: number,

  projectCount: number,

  skillCount: number

): number {

  return (

    performanceCount *

      CREDIT_PER_ACTIVITY +

    projectCount *

      CREDIT_PER_ACTIVITY +

    skillCount *

      CREDIT_PER_ACTIVITY

  );

}

/* ============================================================
   LEADERBOARD BONUS
============================================================ */

export function calculateLeaderboardBonus(

  globalRank?: number

): number {

  switch (globalRank) {

    case 1:
      return LEADERBOARD_BONUS.FIRST;

    case 2:
      return LEADERBOARD_BONUS.SECOND;

    case 3:
      return LEADERBOARD_BONUS.THIRD;

    default:
      return 0;

  }

}

/* ============================================================
   DAILY FEEDBACK CREDITS

   Rule:
   +1 for every teacher daily log for which the student actually
   submitted feedback.

   -10 only when a teacher daily log was received by the student
   and its feedback was missed after that day was completed.

   A day with ZERO teacher logs is NOT a missed-feedback day.
   Holidays / no-teaching days therefore carry no penalty.
============================================================ */

const DAILY_FEEDBACK_CREDIT = 1;
const DAILY_FEEDBACK_MISSED_PENALTY = 10;

export interface DailyFeedbackLectureLog {
  id?: string | null;
  log_date?: string | null;
}

export interface DailyFeedbackRecord {
  daily_log_uuid?: string | null;
}

/**
 * Legacy pure calculator.
 *
 * Kept for compatibility with any existing callers.
 * New UI code should use calculateDailyFeedbackCreditSummaryFromLogs()
 * so the penalty is always tied to an actual teacher log.
 */
export function calculateDailyFeedbackCreditSummary(
  feedbackCount: number,
  missedFeedbackCount: number
) {
  const earnedCredits =
    Math.max(0, feedbackCount) *
    DAILY_FEEDBACK_CREDIT;

  const lostCredits =
    Math.max(0, missedFeedbackCount) *
    DAILY_FEEDBACK_MISSED_PENALTY;

  return {
    earnedCredits,
    lostCredits,
    totalCredits: earnedCredits - lostCredits,
  };
}

/**
 * Production daily-feedback calculator.
 *
 * IMPORTANT:
 * Feedback is only credit-eligible when its daily_log_uuid
 * belongs to a teacher log actually delivered to the student.
 *
 * Therefore:
 *   6 teacher logs + 6 feedbacks = +6
 *   6 teacher logs + 5 feedbacks = +5 -10
 *   0 teacher logs + 0 feedbacks = 0
 *   0 teacher logs + no feedback = 0
 *
 * Today's logs are eligible for +1 when feedback is already
 * submitted, but today's missing feedback is NOT penalized yet.
 */
export function calculateDailyFeedbackCreditSummaryFromLogs(
  lectureLogs: DailyFeedbackLectureLog[],
  feedbackHistory: DailyFeedbackRecord[],
  asOfDate: string
) {
  const validLogs = (lectureLogs ?? []).filter(
    (log) =>
      typeof log?.id === "string" &&
      log.id.trim().length > 0
  );

  const receivedLogIds = new Set(
    validLogs.map((log) => String(log.id))
  );

  /*
   * Only count feedback that belongs to an actual teacher log
   * delivered to this student.
   *
   * Set() also protects the wallet calculation from duplicate
   * feedback rows for the same lecture.
   */
  const submittedLogIds = new Set(
    (feedbackHistory ?? [])
      .map((feedback) =>
        typeof feedback?.daily_log_uuid === "string"
          ? feedback.daily_log_uuid
          : null
      )
      .filter(
        (logId): logId is string =>
          !!logId && receivedLogIds.has(logId)
      )
  );

  const missedFeedbackCount = validLogs.filter(
    (log) =>
      typeof log.log_date === "string" &&
      log.log_date < asOfDate &&
      !submittedLogIds.has(String(log.id))
  ).length;

  const earnedCredits =
    submittedLogIds.size *
    DAILY_FEEDBACK_CREDIT;

  const lostCredits =
    missedFeedbackCount *
    DAILY_FEEDBACK_MISSED_PENALTY;

  return {
    earnedCredits,
    lostCredits,
    totalCredits: earnedCredits - lostCredits,

    /* Useful for validation / future analytics */
    receivedLogCount: validLogs.length,
    submittedFeedbackCount: submittedLogIds.size,
    completedLogCount: validLogs.filter(
      (log) =>
        typeof log.log_date === "string" &&
        log.log_date < asOfDate
    ).length,
    missedFeedbackCount,
  };
}