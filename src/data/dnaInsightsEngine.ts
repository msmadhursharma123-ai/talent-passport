/* ============================================================
   DNA INSIGHTS ENGINE

   Pure Insight Engine

   Responsibilities

   • DNA Confidence
   • Strongest Skill
   • Weakest Skill
   • Future Readiness

   No Repository
   No Identity
   No Supabase
============================================================ */

export interface DNAProfile {

  communication: number;

  leadership: number;

  confidence: number;

  collaboration: number;

  criticalThinking: number;

  creativity: number;

}

export type DNAConfidence =
  | "High"
  | "Medium"
  | "Low";

/* ============================================================
   DNA CONFIDENCE
============================================================ */

export function getDNAConfidence(

  verifiedCount: number

): DNAConfidence {

  if (verifiedCount >= 10) {

    return "High";

  }

  if (verifiedCount >= 5) {

    return "Medium";

  }

  return "Low";

}

/* ============================================================
   STRONGEST SKILL
============================================================ */

export function getStrongestSkill(

  dna: DNAProfile

): keyof DNAProfile {

  return Object.keys(dna).reduce(

    (best, current) =>

      dna[current as keyof DNAProfile] >

      dna[best as keyof DNAProfile]

        ? current

        : best

  ) as keyof DNAProfile;

}

/* ============================================================
   WEAKEST SKILL
============================================================ */

export function getWeakestSkill(

  dna: DNAProfile

): keyof DNAProfile {

  return Object.keys(dna).reduce(

    (worst, current) =>

      dna[current as keyof DNAProfile] <

      dna[worst as keyof DNAProfile]

        ? current

        : worst

  ) as keyof DNAProfile;

}

/* ============================================================
   FUTURE READINESS SCORE
============================================================ */

export function getFutureReadinessScore(

  dna: DNAProfile

): number {

  const values =

    Object.values(dna);

  const total =

    values.reduce(

      (sum, value) =>

        sum + value,

      0

    );

  return Math.round(

    total /

    values.length

  );

}