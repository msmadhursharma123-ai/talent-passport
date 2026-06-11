export const competitions = [
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
];

export function getRecommendedCompetitions(
  passport: any
) {
  return competitions
    .map((competition) => {

      const score =
        competition.creativity *
          passport.normalizedScores.Creativity +

        competition.communication *
          passport.normalizedScores.Communication +

        competition.confidence *
          passport.normalizedScores.Confidence +

        competition.leadership *
          passport.normalizedScores.Leadership +

        competition.collaboration *
          passport.normalizedScores.Collaboration +

        competition.criticalThinking *
          passport.normalizedScores.CriticalThinking;

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