import { getSupabaseClient } from "../supabaseClient";

export type ParentOtpPurpose =
  | "ONBOARDING_CONSENT"
  | "MARKETPLACE_OUTBOUND"
  | "MARKETPLACE_INBOUND_ACCEPT"
  | "CONSULTATION_BOOKING";

export interface OtpSendResult {
  success: boolean;
  error?: string;
  expiresAt?: string;
  phoneMasked?: string;
  provider?: string;
  consentVersion?: string;
  purpose?: ParentOtpPurpose;
  challengeId?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  verified?: boolean;
  verifiedAt?: string;
  error?: string;
  verificationToken?: string;
  expiresAt?: string;
  purpose?: ParentOtpPurpose;
  challengeId?: string;
}

export interface ParentActionConsumeResult {
  authorized: boolean;
  consumedAt?: string;
  purpose?: ParentOtpPurpose;
  error?: string;
}

async function invoke<T>(
  functionName: string,
  body?: Record<string, unknown>,
  method: "POST" | "GET" = "POST",
): Promise<T> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.access_token) {
    throw new Error(
      "Your authentication session is missing. Please log in again.",
    );
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    method,
    body: method === "POST" ? body ?? {} : undefined,
  });

  if (error) {
    try {
      const context = (error as any).context;
      if (context?.json) {
        const payload = await context.json();
        if (payload?.error) {
          throw new Error(payload.error);
        }
      }
    } catch (nestedError) {
      if (nestedError instanceof Error && nestedError.message) {
        throw nestedError;
      }
    }

    throw new Error(error.message || `Unable to call ${functionName}.`);
  }

  return data as T;
}

export async function sendParentOtp(
  consentAccepted: boolean,
  purpose: ParentOtpPurpose = "ONBOARDING_CONSENT",
): Promise<OtpSendResult> {
  try {
    return await invoke<OtpSendResult>(
      "send-otp",
      { consentAccepted, purpose },
      "POST",
    );
  } catch (error: any) {
    return {
      success: false,
      error: error?.message ?? "Unable to send OTP.",
    };
  }
}

export async function verifyParentOtp(
  otp: string,
  consentAccepted: boolean,
  purpose: ParentOtpPurpose = "ONBOARDING_CONSENT",
  challengeId?: string,
): Promise<OtpVerifyResult> {
  try {
    return await invoke<OtpVerifyResult>(
      "verify-otp",
      { otp, consentAccepted, purpose, challengeId },
      "POST",
    );
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error?.message ?? "Unable to verify OTP.",
    };
  }
}

export async function sendParentActionOtp(
  purpose: Exclude<ParentOtpPurpose, "ONBOARDING_CONSENT">,
  consentAccepted: boolean,
): Promise<OtpSendResult> {
  return sendParentOtp(consentAccepted, purpose);
}

export async function verifyParentActionOtp(
  otp: string,
  purpose: Exclude<ParentOtpPurpose, "ONBOARDING_CONSENT">,
  consentAccepted: boolean,
  challengeId: string,
): Promise<OtpVerifyResult> {
  return verifyParentOtp(otp, consentAccepted, purpose, challengeId);
}

export async function consumeParentActionVerification(
  purpose: Exclude<ParentOtpPurpose, "ONBOARDING_CONSENT">,
  verificationToken: string,
): Promise<ParentActionConsumeResult> {
  try {
    return await invoke<ParentActionConsumeResult>(
      "consume-otp",
      { purpose, verificationToken },
      "POST",
    );
  } catch (error: any) {
    return {
      authorized: false,
      error:
        error?.message ?? "Unable to authorize the protected action.",
    };
  }
}

export async function getParentalConsentStatus(): Promise<{
  verified: boolean;
  verifiedAt?: string | null;
}> {
  try {
    return await invoke<{
      verified: boolean;
      verifiedAt?: string | null;
    }>("consent-status", undefined, "GET");
  } catch {
    return { verified: false };
  }
}
