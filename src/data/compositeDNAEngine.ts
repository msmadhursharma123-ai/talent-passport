import { TalentDNA } from "./talentDNAEngine";

/* ============================================================
   COMPOSITE DNA ENGINE

   Responsibilities

   • Merge Questionnaire DNA
   • Merge Achievement DNA
   • Pure computation
   • No Supabase
   • No Identity
   • No Repository
============================================================ */

export interface QuestionnaireScores {

  Communication?: number;

  Leadership?: number;

  Confidence?: number;

  Collaboration?: number;

  CriticalThinking?: number;

  Creativity?: number;

}

const QUESTIONNAIRE_WEIGHT = 0.4;

const ACHIEVEMENT_WEIGHT = 0.6;

/* ============================================================
   COMPOSITE DNA
============================================================ */

export function calculateCompositeDNA(

  questionnaireScores: QuestionnaireScores = {},

  achievementDNA: TalentDNA

) {

  return {

    communication:

      Math.round(

        (questionnaireScores.Communication ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.communication *

        ACHIEVEMENT_WEIGHT

      ),

    leadership:

      Math.round(

        (questionnaireScores.Leadership ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.leadership *

        ACHIEVEMENT_WEIGHT

      ),

    confidence:

      Math.round(

        (questionnaireScores.Confidence ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.confidence *

        ACHIEVEMENT_WEIGHT

      ),

    collaboration:

      Math.round(

        (questionnaireScores.Collaboration ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.collaboration *

        ACHIEVEMENT_WEIGHT

      ),

    criticalThinking:

      Math.round(

        (questionnaireScores.CriticalThinking ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.criticalThinking *

        ACHIEVEMENT_WEIGHT

      ),

    creativity:

      Math.round(

        (questionnaireScores.Creativity ?? 0) *

        QUESTIONNAIRE_WEIGHT +

        achievementDNA.creativity *

        ACHIEVEMENT_WEIGHT

      )

  };

}