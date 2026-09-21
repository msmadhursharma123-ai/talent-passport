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
  understanding_level?: string | null;
}

export interface DailyFeedbackLoop2Record {
  id?: string | null;
  subject_name?: string | null;
  previous_topic_name?: string | null;
  previous_difficult_concept?: string | null;
  log_date?: string | null;
  status?: string | null;
  student_response?: string | null;
  revision_checked_at?: string | null;
  created_at?: string | null;
}

export interface DailyFeedbackCreditOptions {
  studentCreatedAt?: string | null;
  loop2History?: DailyFeedbackLoop2Record[];
}

function dateKey(value: unknown) {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

export function isStudentLoop2Response(row: DailyFeedbackLoop2Record) {
  const response = String(row?.student_response ?? "").trim().toUpperCase();

  if (response === "NOT DISCUSSED") return true;
  if (response !== "DISCUSSED") return false;

  /*
   * A teacher-covered Loop-2 doubt is auto-written as RESOLVED/DISCUSSED
   * in the existing engine at the same moment the ledger row is created.
   * A genuine student response is recorded later through the student action.
   * Keep those existing semantics intact while preventing an auto-resolution
   * from being mistaken for a student-earned +1.
   */
  const createdAt = Date.parse(String(row?.created_at ?? ""));
  const checkedAt = Date.parse(String(row?.revision_checked_at ?? ""));

  if (Number.isNaN(createdAt) || Number.isNaN(checkedAt)) return false;

  return checkedAt - createdAt > 1000;
}

function loop2DueDate(row: DailyFeedbackLoop2Record) {
  // The pending-doubt creation day is the day Loop 2 becomes available.
  // The original lecture date is historical context, not the due date.
  return dateKey(row?.created_at ?? row?.revision_checked_at ?? row?.log_date);
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
  asOfDate: string,
  options: DailyFeedbackCreditOptions = {}
) {
  const studentCreatedDate = dateKey(options.studentCreatedAt);
  const isAfterStudentCreation = (value: unknown) => {
    const key = dateKey(value);
    if (!key) return false;
    return !studentCreatedDate || key >= studentCreatedDate;
  };

  const validLogs = (lectureLogs ?? []).filter(
    (log) =>
      typeof log?.id === "string" &&
      log.id.trim().length > 0 &&
      isAfterStudentCreation(log.log_date)
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
  // An absence is a recorded attendance exception, not a learning response.
  // It must therefore be excluded from BOTH credit earning and missed-feedback
  // penalty calculations. This is deliberately based on the existing
  // understanding_level field so no schema change is required.
  const absentLogIds = new Set(
    (feedbackHistory ?? [])
      .filter(
        (feedback) =>
          String(feedback?.understanding_level ?? "").trim() ===
          "I was absent."
      )
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

  const submittedLogIds = new Set(
    (feedbackHistory ?? [])
      .filter(
        (feedback) =>
          String(feedback?.understanding_level ?? "").trim() !==
          "I was absent."
      )
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
      dateKey(log.log_date) < asOfDate &&
      !submittedLogIds.has(String(log.id)) &&
      !absentLogIds.has(String(log.id))
  ).length;

  const earnedLoop1Credits =
    submittedLogIds.size * DAILY_FEEDBACK_CREDIT;

  const lostLoop1Credits =
    missedFeedbackCount * DAILY_FEEDBACK_MISSED_PENALTY;

  const validLoop2 = (options.loop2History ?? []).filter((row) => {
    const id = String(row?.id ?? "").trim();
    return !!id && isAfterStudentCreation(loop2DueDate(row));
  });

  const submittedLoop2Ids = new Set(
    validLoop2
      .filter(isStudentLoop2Response)
      .map((row) => String(row.id))
  );

  const missedLoop2ResponseCount = validLoop2.filter((row) => {
    const dueDate = loop2DueDate(row);
    return (
      !!dueDate &&
      dueDate < asOfDate &&
      String(row?.status ?? "").trim().toUpperCase() === "PENDING" &&
      !submittedLoop2Ids.has(String(row.id))
    );
  }).length;

  const earnedLoop2Credits =
    submittedLoop2Ids.size * DAILY_FEEDBACK_CREDIT;

  const lostLoop2Credits =
    missedLoop2ResponseCount * DAILY_FEEDBACK_MISSED_PENALTY;

  const earnedCredits =
    earnedLoop1Credits + earnedLoop2Credits;

  const lostCredits =
    lostLoop1Credits + lostLoop2Credits;

  return {
    earnedCredits,
    lostCredits,
    totalCredits: earnedCredits - lostCredits,

    earnedLoop1Credits,
    lostLoop1Credits,
    earnedLoop2Credits,
    lostLoop2Credits,

    /* Useful for validation / future analytics */
    receivedLogCount: validLogs.length,
    submittedFeedbackCount: submittedLogIds.size,
    submittedLoop2ResponseCount: submittedLoop2Ids.size,
    completedLogCount: validLogs.filter(
      (log) =>
        typeof log.log_date === "string" &&
        dateKey(log.log_date) < asOfDate
    ).length,
    missedFeedbackCount,
    missedLoop2ResponseCount,
    studentCreatedDate,
  };
}
