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

            typeof value !== "string" &&
            typeof value !== "number"

          ) {

            return;

          }

          const stringValue =
            String(value);

          const normalized =
            normalizeAnswer(stringValue);

          const mapping =

            OPTION_MAPPING[normalized] ??

            OPTION_MAPPING[stringValue];

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

  /* Normalize raw questionnaire points to the canonical 0–100 scale.
     60 raw points is the full-scale already defined by passportEngine. */
  TALENT_AREAS.forEach(area => {
    scores[area] = Math.min(
      100,
      Math.max(0, Math.round((scores[area] / 60) * 100))
    );
  });

  return scores;

}
