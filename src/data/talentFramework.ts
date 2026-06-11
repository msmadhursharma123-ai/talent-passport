export const TALENT_AREAS = [
  "Communication",
  "Leadership",
  "Creativity",
  "CriticalThinking",
  "Collaboration",
  "Confidence",
  "Resilience",
  "Entrepreneurship",
] as const;

export type TalentArea =
  typeof TALENT_AREAS[number];

export type TalentScores = {
  [key in TalentArea]: number;
};
export const OPTION_MAPPING: Record<
  string,
  Record<string, number>
> = {
  Leader: {
    Leadership: 10,
    Collaboration: 5,
  },

  Confident: {
    Confidence: 10,
    Communication: 5,
  },

  Creative: {
    Creativity: 10,
  },

  Curious: {
    CriticalThinking: 10,
  },

  Artistic: {
    Creativity: 10,
  },

  TeamPlayer: {
    Collaboration: 10,
  },

  ProblemSolver: {
    CriticalThinking: 10,
  },

  "Public Speaking": {
    Communication: 10,
    Confidence: 10,
  },

  Debate: {
    Communication: 10,
    CriticalThinking: 10,
  },

  Coding: {
    CriticalThinking: 10,
  },

  Robotics: {
    CriticalThinking: 10,
    Entrepreneurship: 5,
  },

  Theatre: {
    Communication: 10,
    Confidence: 10,
    Creativity: 10,
  },

  Sports: {
    Leadership: 5,
    Resilience: 10,
    Collaboration: 5,
  },

  Reading: {
    CriticalThinking: 5,
  },

  Writing: {
  Communication: 10,
  Creativity: 5,
},

Analytical: {
  CriticalThinking: 10,
},

Independent: {
  Confidence: 5,
  Entrepreneurship: 5,
},

Athletic: {
  Resilience: 10,
},

Shy: {
  Confidence: -5,
},

"Loves Performing": {
  Communication: 10,
  Confidence: 10,
},

Singing: {
  Creativity: 10,
  Confidence: 5,
},

Music: {
  Creativity: 10,
},

Dance: {
  Creativity: 10,
  Confidence: 5,
},

Art: {
  Creativity: 10,
},

"Build Confidence": {
  Confidence: 10,
},

"Discover Talents": {
  Creativity: 5,
},

"Improve Communication": {
  Communication: 10,
},

"Leadership Development": {
  Leadership: 10,
},

Recognition: {
  Confidence: 5,
},

Scholarships: {
  CriticalThinking: 5,
},

"Portfolio Building": {
  Entrepreneurship: 5,
},

"Future Career Discovery": {
  Entrepreneurship: 10,
}
};