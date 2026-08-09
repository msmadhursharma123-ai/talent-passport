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

   +1 for every successfully submitted academic feedback.
   -10 for every missed feedback attached to a completed
   teacher daily log.
============================================================ */

const DAILY_FEEDBACK_CREDIT = 1;
const DAILY_FEEDBACK_MISSED_PENALTY = 10;

export function calculateDailyFeedbackCreditSummary(
  feedbackCount: number,
  missedFeedbackCount: number
) {

  const earnedCredits =
    Math.max(0, feedbackCount) * DAILY_FEEDBACK_CREDIT;

  const lostCredits =
    Math.max(0, missedFeedbackCount) * DAILY_FEEDBACK_MISSED_PENALTY;

  return {
    earnedCredits,
    lostCredits,
    totalCredits: earnedCredits - lostCredits,
  };
}

