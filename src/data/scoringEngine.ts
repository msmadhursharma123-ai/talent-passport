import {
  TALENT_AREAS,
  OPTION_MAPPING,
  TalentScores
} from "./talentFramework";

/* ============================================================
   SCORING ENGINE

   Pure Talent Scoring Engine

   Responsibilities

   • Questionnaire scoring
   • Talent score calculation
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

export type QuestionnaireAnswers =
  Record<number, unknown>;

function normalizeAnswer(
  value: string
): string {

  return value.replace(/\s/g, "");

}

/* ============================================================
   CALCULATE TALENT SCORES
============================================================ */

export function calculateTalentScores(

  answers: QuestionnaireAnswers

): TalentScores {

  const scores = {} as TalentScores;

  TALENT_AREAS.forEach(

    area => {

      scores[area] = 0;

    }

  );

  Object.values(answers).forEach(

    answer => {

      const values =

        Array.isArray(answer)

          ? answer

          : [answer];

      values.forEach(

        value => {

          if (

            typeof value !== "string"

          ) {

            return;

          }

          const normalized =

            normalizeAnswer(value);

          const mapping =

            OPTION_MAPPING[normalized] ??

            OPTION_MAPPING[value];

          if (!mapping) {

            return;

          }

          Object.entries(mapping).forEach(

            ([area, points]) => {

              scores[
                area as keyof TalentScores
              ] += Number(points);

            }

          );

        }

      );

    }

  );

  return scores;

}