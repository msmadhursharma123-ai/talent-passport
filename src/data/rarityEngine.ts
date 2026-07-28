/* ============================================================
   RARITY ENGINE

   Pure Classification Engine

   Responsibilities

   • Calculate rarity tier
   • Calculate percentile
   • No Repository
   • No Identity
   • No Supabase
============================================================ */

export interface RarityResult {

  percentile: number;

  label: string;

}

const RARITY_BANDS: ReadonlyArray<{

  minimumScore: number;

  percentile: number;

  label: string;

}> = [

  {

    minimumScore: 90,

    percentile: 95,

    label: "Exceptional"

  },

  {

    minimumScore: 80,

    percentile: 85,

    label: "Advanced"

  },

  {

    minimumScore: 70,

    percentile: 70,

    label: "Strong"

  },

  {

    minimumScore: 60,

    percentile: 55,

    label: "Average+"

  },

  {

    minimumScore: 50,

    percentile: 40,

    label: "Average"

  },

  {

    minimumScore: 0,

    percentile: 20,

    label: "Developing"

  }

];

/* ============================================================
   CALCULATE RARITY
============================================================ */

export function calculateRarity(

  score: number

): RarityResult {

  const safeScore =
    Number.isFinite(Number(score))
      ? Math.min(100, Math.max(0, Number(score)))
      : 0;

  const rarity =

    RARITY_BANDS.find(

      band =>

        safeScore >= band.minimumScore

    );

  return rarity ?? {

    percentile: 20,

    label: "Developing"

  };

}