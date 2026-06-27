/* ============================================================
   TALENT DNA ENGINE

   Pure Achievement Analysis Engine

   Responsibilities

   • Achievement → DNA conversion
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

export interface Achievement {

  verification_status?: string;

  activity_category?: string;

  achievement_level?: string;

}

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

const MAX_SCORE = 100;

const LEVEL_MULTIPLIERS = {

  national: 2.5,

  state: 2,

  district: 1.5,

  inter: 1.2

} as const;

function getMultiplier(
  level: string
): number {

  if (level.includes("national"))
    return LEVEL_MULTIPLIERS.national;

  if (level.includes("state"))
    return LEVEL_MULTIPLIERS.state;

  if (level.includes("district"))
    return LEVEL_MULTIPLIERS.district;

  if (level.includes("inter"))
    return LEVEL_MULTIPLIERS.inter;

  return 1;

}

function clamp(
  value: number
): number {

  return Math.min(
    MAX_SCORE,
    Math.round(value)
  );

}

/* ============================================================
   CALCULATE TALENT DNA
============================================================ */

export function calculateTalentDNA(

  achievements: readonly Achievement[]

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

    achievement => {

      if (

        achievement.verification_status !==

        "Verified"

      ) {

        return;

      }

      const category =

        (achievement.activity_category ?? "")
          .toLowerCase();

      const level =

        (achievement.achievement_level ?? "")
          .toLowerCase();

      const multiplier =
        getMultiplier(level);

      if (category.includes("debate")) {

        dna.communication += 10 * multiplier;
        dna.confidence += 8 * multiplier;
        dna.criticalThinking += 9 * multiplier;
        dna.leadership += 3 * multiplier;

      }

      if (category.includes("mun")) {

        dna.communication += 8 * multiplier;
        dna.leadership += 8 * multiplier;
        dna.collaboration += 6 * multiplier;
        dna.criticalThinking += 7 * multiplier;

      }

      if (category.includes("sports")) {

        dna.discipline += 10 * multiplier;
        dna.leadership += 7 * multiplier;
        dna.collaboration += 8 * multiplier;
        dna.confidence += 7 * multiplier;

      }

      if (category.includes("drama")) {

        dna.communication += 8 * multiplier;
        dna.confidence += 10 * multiplier;
        dna.creativity += 8 * multiplier;

      }

      if (category.includes("music")) {

        dna.creativity += 10 * multiplier;
        dna.discipline += 5 * multiplier;

      }

      if (category.includes("art")) {

        dna.creativity += 10 * multiplier;
        dna.initiative += 5 * multiplier;

      }

      if (category.includes("quiz")) {

        dna.criticalThinking += 10 * multiplier;
        dna.communication += 4 * multiplier;

      }

      if (category.includes("olympiad")) {

        dna.criticalThinking += 10 * multiplier;
        dna.discipline += 7 * multiplier;

      }

    }

  );

  Object.keys(dna).forEach(

    key => {

      dna[
        key as keyof TalentDNA
      ] = clamp(

        dna[
          key as keyof TalentDNA
        ]

      );

    }

  );

  return dna;

}