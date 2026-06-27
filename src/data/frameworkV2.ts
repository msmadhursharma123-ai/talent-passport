/* ============================================================
   FRAMEWORK V2

   Central Configuration

   Responsibilities

   • DNA Weights
   • Benchmarks
   • Participation Score Mapping

   No Identity
   No Repository
   No Supabase
============================================================ */

export const WEIGHTS = Object.freeze({

  personality: 0.30,

  interests: 0.25,

  improvement: 0.10,

  behavior: 0.15,

  participation: 0.10,

  goals: 0.10

} as const);

export const BENCHMARKS = Object.freeze({

  Creativity: 60,

  Communication: 60,

  Leadership: 55,

  Confidence: 55,

  Collaboration: 60,

  CriticalThinking: 60,

  Resilience: 50,

  Entrepreneurship: 45

} as const);

export const PARTICIPATION_SCORE = Object.freeze({

  Never: 20,

  Once: 40,

  Occasionally: 60,

  Frequently: 80,

  "Very Active": 100

} as const);