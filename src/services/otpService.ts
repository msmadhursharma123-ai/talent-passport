import { getSupabaseClient } from "../supabaseClient";

export interface OtpSendResult {
  success: boolean;
  error?: string;
  expiresAt?: string;
  phoneMasked?: string;
  provider?: string;
  consentVersion?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  verified?: boolean;
  verifiedAt?: string;
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
    throw new Error("Your authentication session is missing. Please log in again.");
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    method,
    body: method === "POST" ? body ?? {} : undefined,
  });

  if (error) {
    /*
     * Supabase may return a FunctionsHttpError whose response body contains
     * our JSON error. Try to surface that message instead of the generic
     * "Failed to send a request" message.
     */
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
): Promise<OtpSendResult> {
  try {
    return await invoke<OtpSendResult>(
      "send-otp",
      { consentAccepted },
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
): Promise<OtpVerifyResult> {
  try {
    return await invoke<OtpVerifyResult>(
      "verify-otp",
      { otp, consentAccepted },
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
    return {
      verified: false,
    };
  }
}
