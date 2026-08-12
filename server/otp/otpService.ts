import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

export const CONSENT_VERSION = "2026-08-10-v1";

export const CONSENT_TEXT_SHA256 =
  "bba218e872c6a5da6ff13f57f9415d60055dacbe4b10110e4ec879bf92b0820e";

export type SmsProvider = "MOCK" | "MSG91";

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getProvider(): SmsProvider {
  const configured = String(process.env.SMS_PROVIDER || "MOCK").toUpperCase();

  if (configured === "MSG91") return "MSG91";

  return "MOCK";
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string): string {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export function safeOtpCompare(
  submittedOtp: string,
  storedHash: string
): boolean {
  const submittedHash = hashOtp(submittedOtp);

  const left = Buffer.from(submittedHash, "utf8");
  const right = Buffer.from(storedHash, "utf8");

  if (left.length !== right.length) return false;

  return crypto.timingSafeEqual(left, right);
}

export function normalizeIndianMobile(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(digits)) {
    throw new Error("Parent mobile number must contain exactly 10 digits.");
  }

  return `+91${digits}`;
}

export function maskPhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 4) return "••••";

  return `••••••${digits.slice(-4)}`;
}

export async function sendOtpThroughProvider(
  phone: string,
  otp: string
): Promise<{ provider: SmsProvider }> {
  const provider = getProvider();

  if (provider === "MOCK") {
    console.log(
      "============================================================"
    );
    console.log("TALENT PASSPORT OTP — MOCK SMS PROVIDER");
    console.log(`Phone: ${phone}`);
    console.log(`OTP: ${otp}`);
    console.log("Valid for: 5 minutes");
    console.log(
      "============================================================"
    );

    return { provider: "MOCK" };
  }

  /*
   * MSG91 PLACEHOLDER
   * ----------------------------------------------------------
   * Keep all MSG91-specific code here.
   *
   * Later, after MSG91 provides the credentials/template details,
   * replace this block with the official MSG91 API call.
   *
   * Suggested environment variables:
   *   MSG91_API_KEY
   *   MSG91_TEMPLATE_ID
   *   MSG91_SENDER_ID
   *
   * Do NOT expose these values to the browser.
   */

  if (provider === "MSG91") {
    throw new Error(
      "SMS_PROVIDER=MSG91 is selected, but the MSG91 adapter has not been configured yet."
    );
  }

  throw new Error("Unsupported SMS provider.");
}

export async function authenticateRequest(
  authorizationHeader: string | undefined
) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Authentication required.");
  }

  const accessToken = authorizationHeader.slice("Bearer ".length).trim();

  if (!accessToken) {
    throw new Error("Authentication required.");
  }

  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Invalid or expired authentication session.");
  }

  return { supabase, user };
}

export async function resolveAuthenticatedStudent(
  supabase: SupabaseClient,
  authUserId: string
) {
  /*
   * Primary resolution: canonical students_master auth link.
   */
  const { data: masterByAuth } = await supabase
    .from("students_master")
    .select(
      "id, student_uuid, student_id, student_name, student_email, phone, parent_phone, auth_user_id"
    )
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (masterByAuth?.student_uuid) {
    return {
      ...masterByAuth,
      /* Parent OTP uses the canonical parent number first.
       * `phone` remains the legacy fallback for older profiles. */
      phone:
        masterByAuth.parent_phone ??
        masterByAuth.phone,
    };
  }

  /*
   * Fallback for the current onboarding repository:
   * students.id is the Supabase auth user id and student_id is the
   * generated legacy-compatible student code.
   */
  const { data: studentRow } = await supabase
    .from("students")
    .select("id, student_id, student_email")
    .eq("id", authUserId)
    .maybeSingle();

  if (!studentRow?.student_id) {
    throw new Error("No student profile is linked to this account.");
  }

  const { data: masterByStudentCode } = await supabase
    .from("students_master")
    .select(
      "id, student_uuid, student_id, student_name, student_email, phone, parent_phone, auth_user_id"
    )
    .eq("student_id", studentRow.student_id)
    .maybeSingle();

  if (!masterByStudentCode?.student_uuid) {
    throw new Error("Student profile could not be resolved.");
  }

  return {
    ...masterByStudentCode,
    phone:
      masterByStudentCode.parent_phone ??
      masterByStudentCode.phone,
  };
}

export async function getConsentStatus(
  supabase: SupabaseClient,
  studentUuid: string
) {
  const { data, error } = await supabase
    .from("student_parental_consents")
    .select("consent_granted, verified_at, withdrawn_at, consent_version")
    .eq("student_uuid", studentUuid)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read parental consent status.");
  }

  return {
    verified:
      Boolean(data?.consent_granted) &&
      Boolean(data?.verified_at) &&
      !data?.withdrawn_at,
    verifiedAt: data?.verified_at ?? null,
    consentVersion: data?.consent_version ?? null,
  };
}

export async function createOtpChallenge(
  supabase: SupabaseClient,
  studentUuid: string,
  phone: string,
  otp: string
) {
  const provider = getProvider();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc(
    "create_student_parent_otp_challenge",
    {
      p_student_uuid: studentUuid,
      p_phone: phone,
      p_otp_hash: otpHash,
      p_expires_at: expiresAt,
      p_provider: provider,
      p_consent_version: CONSENT_VERSION,
    }
  );

  if (error) {
    throw new Error(
      error.message || "Unable to create OTP challenge."
    );
  }

  return {
    challengeId: data as string,
    expiresAt,
    provider,
  };
}

export async function verifyOtpAndRecordConsent(
  supabase: SupabaseClient,
  studentUuid: string,
  authUserId: string,
  submittedOtp: string
) {
  const { data: challenge, error } = await supabase
    .from("student_parent_otp_challenges")
    .select(
      "id, student_uuid, phone, otp_hash, expires_at, attempts, max_attempts, verified_at, consumed_at, consent_version"
    )
    .eq("student_uuid", studentUuid)
    .is("verified_at", null)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load OTP challenge.");
  }

  if (!challenge) {
    throw new Error("No active OTP was found. Please request a new code.");
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    await supabase
      .from("student_parent_otp_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", challenge.id);

    throw new Error("This OTP has expired. Please request a new code.");
  }

  if (challenge.attempts >= challenge.max_attempts) {
    throw new Error(
      "Too many incorrect attempts. Please request a new OTP."
    );
  }

  if (!/^\d{6}$/.test(submittedOtp)) {
    throw new Error("Please enter the 6-digit OTP.");
  }

  if (!safeOtpCompare(submittedOtp, challenge.otp_hash)) {
    const nextAttempts = challenge.attempts + 1;

    await supabase
      .from("student_parent_otp_challenges")
      .update({
        attempts: nextAttempts,
        consumed_at:
          nextAttempts >= challenge.max_attempts
            ? new Date().toISOString()
            : null,
      })
      .eq("id", challenge.id);

    throw new Error(
      nextAttempts >= challenge.max_attempts
        ? "Too many incorrect attempts. Please request a new OTP."
        : `Incorrect OTP. ${challenge.max_attempts - nextAttempts} attempts remaining.`
    );
  }

  const verifiedAt = new Date().toISOString();

  const { error: challengeUpdateError } = await supabase
    .from("student_parent_otp_challenges")
    .update({
      verified_at: verifiedAt,
      consumed_at: verifiedAt,
    })
    .eq("id", challenge.id);

  if (challengeUpdateError) {
    throw new Error("Unable to finalize OTP verification.");
  }

  const { error: consentError } = await supabase
    .from("student_parental_consents")
    .upsert(
      {
        student_uuid: studentUuid,
        auth_user_id: authUserId,
        parent_phone: challenge.phone,
        consent_version: CONSENT_VERSION,
        consent_text_sha256: CONSENT_TEXT_SHA256,
        consent_granted: true,
        verification_method: "SMS_OTP",
        verified_at: verifiedAt,
        withdrawn_at: null,
        updated_at: verifiedAt,
      },
      { onConflict: "student_uuid" }
    );

  if (consentError) {
    throw new Error(
      consentError.message || "Unable to save parental consent."
    );
  }

  return {
    verified: true,
    verifiedAt,
  };
}
