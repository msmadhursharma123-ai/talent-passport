export function getStudentDNA(
  passport:any,
  dna:any
){

  dna = dna || {};
  passport = passport || {};

  const communication =
    Math.round(
      ((passport.communication_score || 0) * 0.6) +
      ((dna.communication_score || 0) * 0.4)
    );

  const creativity =
    Math.round(
      ((passport.creativity_score || 0) * 0.6) +
      ((dna.creativity_score || 0) * 0.4)
    );

  const leadership =
    Math.round(
      (((passport.team_score || 0)) * 0.6) +
      ((dna.leadership_score || 0) * 0.4)
    );

  const collaboration =
    Math.round(
      (((passport.team_score || 0)) * 0.6) +
      ((dna.collaboration_score || 0) * 0.4)
    );

  const criticalThinking =
    Math.round(
      ((passport.critical_thinking_score || 0) * 0.6) +
      ((dna.critical_thinking_score || 0) * 0.4)
    );

  const confidence =
    Math.round(
      ((passport.combined_score || 0) * 0.6) +
      ((dna.confidence_score || 0) * 0.4)
    );

  const skills = [
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
      (a,b) => b.score - a.score
    )[0];

  const weakest =
    [...skills].sort(
      (a,b) => a.score - b.score
    )[0];

  let archetype = "Explorer";

  if(passport.combined_score >= 70)
    archetype = "Performer";

  if(passport.combined_score >= 80)
    archetype = "Emerging Leader";

  if(passport.combined_score >= 90)
    archetype = "School Leader";

  return {

    archetype,

    strongest,

    weakest,

    observations: [

      `Student demonstrates strongest signals in ${strongest.name}.`,

      `Performance consistency indicates developing ownership and initiative.`,

      `${weakest.name} remains the highest leverage area for future growth.`,

      `Competition behaviour suggests readiness for higher responsibility opportunities.`

    ],

    decisionStyle:
      leadership > 60
        ? "Action Oriented"
        : "Reflective Planner",

    learningStyle:
      creativity > 60
        ? "Experiential Learner"
        : "Structured Learner",

    communicationStyle:
      communication > 60
        ? "Expressive Communicator"
        : "Developing Communicator",

    leadershipStyle:
      leadership > 60
        ? "Influential Leader"
        : "Emerging Leader"

  };

}