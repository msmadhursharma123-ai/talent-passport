import { getSupabaseClient } from "../supabaseClient";

export interface StudentOnboardingConfiguration {
  parentOtpEnabled: boolean;
  questionnaireEnabled: boolean;
}

const DEFAULT_CONFIGURATION: StudentOnboardingConfiguration = {
  parentOtpEnabled: true,
  questionnaireEnabled: true,
};

export async function getStudentOnboardingConfiguration(
  schoolUuid: string
): Promise<StudentOnboardingConfiguration> {
  const normalizedSchoolUuid = String(schoolUuid ?? "").trim();
  const supabase = getSupabaseClient();

  if (!supabase || !normalizedSchoolUuid) {
    return { ...DEFAULT_CONFIGURATION };
  }

  try {
    const { data, error } = await (supabase as any)
      .from("school_student_onboarding_config")
      .select("parent_otp_enabled,questionnaire_enabled")
      .eq("school_uuid", normalizedSchoolUuid)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error(
          "Unable to load student onboarding configuration.",
          error
        );
      }
      return { ...DEFAULT_CONFIGURATION };
    }

    return {
      parentOtpEnabled: Boolean(data.parent_otp_enabled),
      questionnaireEnabled: Boolean(data.questionnaire_enabled),
    };
  } catch (error) {
    console.error(
      "Student onboarding configuration lookup failed.",
      error
    );
    return { ...DEFAULT_CONFIGURATION };
  }
}

export async function saveStudentOnboardingConfiguration(
  schoolUuid: string,
  configuration: StudentOnboardingConfiguration
): Promise<boolean> {
  const normalizedSchoolUuid = String(schoolUuid ?? "").trim();
  const supabase = getSupabaseClient();

  if (!supabase || !normalizedSchoolUuid) {
    return false;
  }

  try {
    const { error } = await (supabase as any)
      .from("school_student_onboarding_config")
      .upsert(
        {
          school_uuid: normalizedSchoolUuid,
          parent_otp_enabled: Boolean(configuration.parentOtpEnabled),
          questionnaire_enabled: Boolean(configuration.questionnaireEnabled),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "school_uuid" }
      );

    if (error) {
      console.error(
        "Unable to save student onboarding configuration.",
        error
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Student onboarding configuration save failed.",
      error
    );
    return false;
  }
}
