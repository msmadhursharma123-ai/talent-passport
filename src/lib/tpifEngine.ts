export interface PassportData {
  communication: number;
  leadership: number;
  criticalThinking: number;
  collaboration: number;
  confidence: number;
  overall: number;
}

export function getStrongestSkill(data:any){

  const scores = [
    {
      name:"Communication",
      value:data.communication_score
    },
    {
      name:"Creativity",
      value:data.creativity_score
    },
    {
      name:"Critical Thinking",
      value:data.critical_thinking_score
    },
    {
      name:"Collaboration",
      value:data.team_score
    }
  ];

  return scores.sort(
    (a,b)=>b.value-a.value
  )[0];
}

export function getWeakestSkill(data:any){

  const scores = [
    {
      name:"Communication",
      value:data.communication_score
    },
    {
      name:"Creativity",
      value:data.creativity_score
    },
    {
      name:"Critical Thinking",
      value:data.critical_thinking_score
    },
    {
      name:"Collaboration",
      value:data.team_score
    }
  ];

  return scores.sort(
    (a,b)=>a.value-b.value
  )[0];
}

export function getGrowthStage(data:any){

  const score =
    data.combined_score || 0;

  if(score < 60)
    return "Explorer";

  if(score < 70)
    return "Contributor";

  if(score < 80)
    return "Performer";

  if(score < 90)
    return "Emerging Leader";

  return "School Leader";
}

export function getReadiness(data: PassportData) {
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

export function getGrowthBlockers(data: PassportData) {
  const blockers: string[] = [];

  if (data.collaboration < 70)
    blockers.push(
      "Team-based participation frequency is below ideal range."
    );

  if (data.leadership < 75)
    blockers.push(
      "Leadership responsibilities are not yet consistent."
    );

  if (data.criticalThinking < 70)
    blockers.push(
      "Project ownership and structured problem solving need improvement."
    );

  if (data.communication < 75)
    blockers.push(
      "Public communication opportunities are lower than recommended."
    );

  return blockers;
}

export function getCoachAdvice(data:any){

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