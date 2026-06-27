/* ============================================================
   TPIF ENGINE

   Talent Passport Intelligence Framework

   Responsibilities

   • Strongest Skill
   • Weakest Skill
   • Growth Stage
   • Readiness
   • Growth Blockers
   • Coach Advice

   Pure Intelligence Engine

   No Repository
   No Identity
   No Supabase
============================================================ */

export interface PassportData {

  communication: number;

  leadership: number;

  criticalThinking: number;

  collaboration: number;

  confidence: number;

  overall: number;

}

export interface PassportScoreData {

  communication_score?: number;

  creativity_score?: number;

  critical_thinking_score?: number;

  team_score?: number;

  combined_score?: number;

}

export interface SkillScore {

  name: string;

  value: number;

}

const EXPLORER = 60;
const CONTRIBUTOR = 70;
const PERFORMER = 80;
const EMERGING_LEADER = 90;

function buildSkillScores(
  data: PassportScoreData
): SkillScore[] {

  return [

    {
      name: "Communication",
      value: data.communication_score ?? 0
    },

    {
      name: "Creativity",
      value: data.creativity_score ?? 0
    },

    {
      name: "Critical Thinking",
      value: data.critical_thinking_score ?? 0
    },

    {
      name: "Collaboration",
      value: data.team_score ?? 0
    }

  ];

}

/* ============================================================
   STRONGEST SKILL
============================================================ */

export function getStrongestSkill(
  data: PassportScoreData
): SkillScore {

  return [...buildSkillScores(data)]

    .sort(
      (a, b) => b.value - a.value
    )[0];

}

/* ============================================================
   WEAKEST SKILL
============================================================ */

export function getWeakestSkill(
  data: PassportScoreData
): SkillScore {

  return [...buildSkillScores(data)]

    .sort(
      (a, b) => a.value - b.value
    )[0];

}

/* ============================================================
   GROWTH STAGE
============================================================ */

export function getGrowthStage(
  data: PassportScoreData
): string {

  const score =
    data.combined_score ?? 0;

  if (score < EXPLORER)
    return "Explorer";

  if (score < CONTRIBUTOR)
    return "Contributor";

  if (score < PERFORMER)
    return "Performer";

  if (score < EMERGING_LEADER)
    return "Emerging Leader";

  return "School Leader";

}

/* ============================================================
   READINESS
============================================================ */

export function getReadiness(
  data: PassportData
) {

  return {

    leadership: Math.round(
      data.leadership * 0.4 +
      data.collaboration * 0.3 +
      data.confidence * 0.3
    ),

    communication: Math.round(
      data.communication * 0.7 +
      data.confidence * 0.3
    ),

    team: Math.round(
      data.collaboration * 0.7 +
      data.leadership * 0.3
    ),

    ownership: Math.round(
      data.leadership * 0.4 +
      data.criticalThinking * 0.4 +
      data.confidence * 0.2
    )

  };

}

/* ============================================================
   GROWTH BLOCKERS
============================================================ */

export function getGrowthBlockers(
  data: PassportData
): string[] {

  const blockers: string[] = [];

  if (data.collaboration < 70) {

    blockers.push(
      "Team-based participation frequency is below ideal range."
    );

  }

  if (data.leadership < 75) {

    blockers.push(
      "Leadership responsibilities are not yet consistent."
    );

  }

  if (data.criticalThinking < 70) {

    blockers.push(
      "Project ownership and structured problem solving need improvement."
    );

  }

  if (data.communication < 75) {

    blockers.push(
      "Public communication opportunities are lower than recommended."
    );

  }

  return blockers;

}

/* ============================================================
   COACH ADVICE
============================================================ */

export function getCoachAdvice(
  data: PassportScoreData
): string {

  const strongest =
    getStrongestSkill(data);

  const weakest =
    getWeakestSkill(data);

  return `

You already perform strongly in ${strongest.name}.

The next stage of growth will come from improving ${weakest.name}.

Focus on activities that strengthen ${weakest.name} while maintaining your advantage in ${strongest.name}.

`;

}