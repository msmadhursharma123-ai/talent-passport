import {
  TALENT_AREAS,
  OPTION_MAPPING,
  TalentScores,
} from "./talentFramework";

export function calculateTalentScores(
  answers: Record<number, any>
): TalentScores {

  const scores = {} as TalentScores;

  TALENT_AREAS.forEach((area) => {
    scores[area] = 0;
  });

  Object.values(answers).forEach((answer) => {

    const values = Array.isArray(answer)
      ? answer
      : [answer];

    values.forEach((value) => {

      console.log(
        "Processing Value:",
        value,
        typeof value
      );

      if (typeof value !== "string") {
        return;
      }

      const normalized =
        value.replace(/\s/g, "");

      const mapping =
        OPTION_MAPPING[normalized] ||
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

    });

  });

  return scores;
}