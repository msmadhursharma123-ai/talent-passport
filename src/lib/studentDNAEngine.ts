/* ============================================================
   STUDENT DNA ENGINE

   Pure Student Intelligence Engine

   Responsibilities

   • Merge Passport + DNA
   • Calculate Student Archetype
   • Generate Behaviour Insights

   No Repository
   No Identity
   No Supabase
============================================================ */

const PASSPORT_WEIGHT = 0.6;
const DNA_WEIGHT = 0.4;

const STYLE_THRESHOLD = 60;

export interface PassportProfile {

  communication_score?: number;

  creativity_score?: number;

  team_score?: number;

  critical_thinking_score?: number;

  combined_score?: number;

}

export interface DNAProfile {

  communication_score?: number;

  creativity_score?: number;

  leadership_score?: number;

  collaboration_score?: number;

  critical_thinking_score?: number;

  confidence_score?: number;

}

export interface StudentSkill {

  name: string;

  score: number;

}

export function getStudentDNA(

  passport: PassportProfile = {},

  dna: DNAProfile = {}

) {

  const communication = Math.round(
    (passport.communication_score ?? 0) * PASSPORT_WEIGHT +
    (dna.communication_score ?? 0) * DNA_WEIGHT
  );

  const creativity = Math.round(
    (passport.creativity_score ?? 0) * PASSPORT_WEIGHT +
    (dna.creativity_score ?? 0) * DNA_WEIGHT
  );

  const leadership = Math.round(
    (passport.team_score ?? 0) * PASSPORT_WEIGHT +
    (dna.leadership_score ?? 0) * DNA_WEIGHT
  );

  const collaboration = Math.round(
    (passport.team_score ?? 0) * PASSPORT_WEIGHT +
    (dna.collaboration_score ?? 0) * DNA_WEIGHT
  );

  const criticalThinking = Math.round(
    (passport.critical_thinking_score ?? 0) * PASSPORT_WEIGHT +
    (dna.critical_thinking_score ?? 0) * DNA_WEIGHT
  );

  const confidence = Math.round(
    (passport.combined_score ?? 0) * PASSPORT_WEIGHT +
    (dna.confidence_score ?? 0) * DNA_WEIGHT
  );

  const skills: StudentSkill[] = [

    {
      name: "Communication",
      score: communication
    },

    {
      name: "Creativity",
      score: creativity
    },

    {
      name: "Leadership",
      score: leadership
    },

    {
      name: "Collaboration",
      score: collaboration
    },

    {
      name: "Critical Thinking",
      score: criticalThinking
    },

    {
      name: "Confidence",
      score: confidence
    }

  ];

  const strongest =
    [...skills].sort(
      (a, b) => b.score - a.score
    )[0];

  const weakest =
    [...skills].sort(
      (a, b) => a.score - b.score
    )[0];

  let archetype = "Explorer";

  if ((passport.combined_score ?? 0) >= 90) {

    archetype = "School Leader";

  } else if ((passport.combined_score ?? 0) >= 80) {

    archetype = "Emerging Leader";

  } else if ((passport.combined_score ?? 0) >= 70) {

    archetype = "Performer";

  }

  return {

    archetype,

    strongest,

    weakest,

    observations: [

      `Student demonstrates strongest signals in ${strongest.name}.`,

      "Performance consistency indicates developing ownership and initiative.",

      `${weakest.name} remains the highest leverage area for future growth.`,

      "Competition behaviour suggests readiness for higher responsibility opportunities."

    ],

    decisionStyle:

      leadership > STYLE_THRESHOLD

        ? "Action Oriented"

        : "Reflective Planner",

    learningStyle:

      creativity > STYLE_THRESHOLD

        ? "Experiential Learner"

        : "Structured Learner",

    communicationStyle:

      communication > STYLE_THRESHOLD

        ? "Expressive Communicator"

        : "Developing Communicator",

    leadershipStyle:

      leadership > STYLE_THRESHOLD

        ? "Influential Leader"

        : "Emerging Leader"

  };

}