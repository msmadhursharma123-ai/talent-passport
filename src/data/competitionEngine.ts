/* ============================================================
   COMPETITION ENGINE

   Pure Recommendation Engine

   Responsibilities

   • Recommend competitions
   • Score competitions
   • Never talks to Supabase
   • Never resolves identity
   • Never performs authentication

============================================================ */

export interface CompetitionDefinition {

  name: string;

  creativity: number;

  communication: number;

  confidence: number;

  leadership: number;

  collaboration: number;

  criticalThinking: number;

}

interface PassportScores {

  Creativity: number;

  Communication: number;

  Confidence: number;

  Leadership: number;

  Collaboration: number;

  CriticalThinking: number;

}

interface CompetitionPassport {

  normalizedScores?: PassportScores;

}

export const competitions: readonly CompetitionDefinition[] = [

  {

    name: "Storytelling League",

    creativity: 1,

    communication: 0.4,

    confidence: 0.2,

    leadership: 0.1,

    collaboration: 0.1,

    criticalThinking: 0.6

  },

  {

    name: "Debate Championship",

    creativity: 0.2,

    communication: 1,

    confidence: 0.8,

    leadership: 0.6,

    collaboration: 0.2,

    criticalThinking: 0.9

  },

  {

    name: "Entrepreneurship Challenge",

    creativity: 0.8,

    communication: 0.6,

    confidence: 0.5,

    leadership: 1,

    collaboration: 0.7,

    criticalThinking: 0.8

  },

  {

    name: "Model United Nations",

    creativity: 0.2,

    communication: 0.9,

    confidence: 0.8,

    leadership: 0.8,

    collaboration: 0.6,

    criticalThinking: 1

  }

] as const;

/* ============================================================
   GET RECOMMENDED COMPETITIONS
============================================================ */

export function getRecommendedCompetitions(

  passport: CompetitionPassport

) {

  const scores =

    passport.normalizedScores ?? {

      Creativity: 0,

      Communication: 0,

      Confidence: 0,

      Leadership: 0,

      Collaboration: 0,

      CriticalThinking: 0

    };

  return competitions

    .map((competition) => {

      const score =

        competition.creativity *
        scores.Creativity +

        competition.communication *
        scores.Communication +

        competition.confidence *
        scores.Confidence +

        competition.leadership *
        scores.Leadership +

        competition.collaboration *
        scores.Collaboration +

        competition.criticalThinking *
        scores.CriticalThinking;

      return {

        ...competition,

        score: Math.round(score)

      };

    })

    .sort(

      (a, b) =>

        b.score - a.score

    )

    .slice(0, 3);

}