import { TalentDNA } from "./talentDNAEngine";

export function calculateCompositeDNA(
  questionnaireScores: any,
  achievementDNA: TalentDNA
) {

  return {

    communication:
      Math.round(
        (
          (questionnaireScores?.Communication || 0) * 0.4
        ) +
        (
          achievementDNA.communication * 0.6
        )
      ),

    leadership:
      Math.round(
        (
          (questionnaireScores?.Leadership || 0) * 0.4
        ) +
        (
          achievementDNA.leadership * 0.6
        )
      ),

    confidence:
      Math.round(
        (
          (questionnaireScores?.Confidence || 0) * 0.4
        ) +
        (
          achievementDNA.confidence * 0.6
        )
      ),

    collaboration:
      Math.round(
        (
          (questionnaireScores?.Collaboration || 0) * 0.4
        ) +
        (
          achievementDNA.collaboration * 0.6
        )
      ),

    criticalThinking:
      Math.round(
        (
          (questionnaireScores?.CriticalThinking || 0) * 0.4
        ) +
        (
          achievementDNA.criticalThinking * 0.6
        )
      ),

    creativity:
      Math.round(
        (
          (questionnaireScores?.Creativity || 0) * 0.4
        ) +
        (
          achievementDNA.creativity * 0.6
        )
      )

  };

}