/* ============================================================
   PROFILE ANALYZER

   Pure Reliability Engine

   Responsibilities

   • Analyze questionnaire consistency
   • Calculate reliability score
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

const INITIAL_SCORE = 100;

const MINIMUM_SCORE = 40;

const MAJOR_PENALTY = 15;

const MINOR_PENALTY = 10;

export type QuestionnaireAnswers =
  Record<number, unknown>;

function getMultiSelectAnswer(

  answers: QuestionnaireAnswers,

  question: number

): string[] {

  const value = answers[question];

  return Array.isArray(value)
    ? value
    : [];

}

/* ============================================================
   CALCULATE RELIABILITY
============================================================ */

export function calculateReliability(

  answers: QuestionnaireAnswers

): number {

  let score = INITIAL_SCORE;

  const q3 =
    getMultiSelectAnswer(
      answers,
      3
    );

  const q6 =
    getMultiSelectAnswer(
      answers,
      6
    );

  const stage =
    Number(
      answers[7] ?? 5
    );

  const friends =
    Number(
      answers[8] ?? 5
    );

  /* --------------------------------------------
     Shy but high stage confidence
  -------------------------------------------- */

  if (

    q3.includes("Shy") &&

    stage >= 8

  ) {

    score -= MAJOR_PENALTY;

  }

  /* --------------------------------------------
     Confident but low social confidence
  -------------------------------------------- */

  if (

    q3.includes("Confident") &&

    friends <= 3

  ) {

    score -= MAJOR_PENALTY;

  }

  /* --------------------------------------------
     Leadership contradiction
  -------------------------------------------- */

  if (

    q3.includes("Leader") &&

    q6.includes("Leadership")

  ) {

    score -= MINOR_PENALTY;

  }

  return Math.max(

    score,

    MINIMUM_SCORE

  );

}