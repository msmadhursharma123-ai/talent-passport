export type TalentDNA = {
  communication: number;
  leadership: number;
  confidence: number;
  collaboration: number;
  criticalThinking: number;
  creativity: number;
  discipline: number;
  initiative: number;
};

export function calculateTalentDNA(
  achievements: any[]
): TalentDNA {

  const dna: TalentDNA = {
    communication: 0,
    leadership: 0,
    confidence: 0,
    collaboration: 0,
    criticalThinking: 0,
    creativity: 0,
    discipline: 0,
    initiative: 0
  };

  achievements.forEach(
    (achievement) => {
if (
  achievement.verification_status !==
  "Verified"
) {
  return;
}

      const category =
        (
          achievement.activity_category ||
          ""
        ).toLowerCase();

      const level =
        (
          achievement.achievement_level ||
          ""
        ).toLowerCase();

      let multiplier = 1;

      if (
        level.includes(
          "national"
        )
      )
        multiplier = 2.5;

      else if (
        level.includes(
          "state"
        )
      )
        multiplier = 2;

      else if (
        level.includes(
          "district"
        )
      )
        multiplier = 1.5;

      else if (
        level.includes(
          "inter"
        )
      )
        multiplier = 1.2;

      if (
        category.includes(
          "debate"
        )
      ) {

        dna.communication +=
          10 * multiplier;

        dna.confidence +=
          8 * multiplier;

        dna.criticalThinking +=
          9 * multiplier;

        dna.leadership +=
          3 * multiplier;
      }

      if (
        category.includes(
          "mun"
        )
      ) {

        dna.communication +=
          8 * multiplier;

        dna.leadership +=
          8 * multiplier;

        dna.collaboration +=
          6 * multiplier;

        dna.criticalThinking +=
          7 * multiplier;
      }

      if (
        category.includes(
          "sports"
        )
      ) {

        dna.discipline +=
          10 * multiplier;

        dna.leadership +=
          7 * multiplier;

        dna.collaboration +=
          8 * multiplier;

        dna.confidence +=
          7 * multiplier;
      }

      if (
        category.includes(
          "drama"
        )
      ) {

        dna.communication +=
          8 * multiplier;

        dna.confidence +=
          10 * multiplier;

        dna.creativity +=
          8 * multiplier;
      }

      if (
        category.includes(
          "music"
        )
      ) {

        dna.creativity +=
          10 * multiplier;

        dna.discipline +=
          5 * multiplier;
      }

      if (
        category.includes(
          "art"
        )
      ) {

        dna.creativity +=
          10 * multiplier;

        dna.initiative +=
          5 * multiplier;
      }

      if (
        category.includes(
          "quiz"
        )
      ) {

        dna.criticalThinking +=
          10 * multiplier;

        dna.communication +=
          4 * multiplier;
      }

      if (
        category.includes(
          "olympiad"
        )
      ) {

        dna.criticalThinking +=
          10 * multiplier;

        dna.discipline +=
          7 * multiplier;
      }
    }
  );

  Object.keys(dna).forEach(
    (key) => {

      dna[
        key as keyof TalentDNA
      ] = Math.min(
        100,
        Math.round(
          dna[
            key as keyof TalentDNA
          ]
        )
      );
    }
  );

  return dna;
}