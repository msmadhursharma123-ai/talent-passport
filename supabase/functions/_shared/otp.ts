import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const CONSENT_VERSION = "2026-08-10-v1";
export const CONSENT_TEXT_SHA256 =
  "bba218e872c6a5da6ff13f57f9415d60055dacbe4b10110e4ec879bf92b0820e";

export type OtpPurpose =
  | "ONBOARDING_CONSENT"
  | "MARKETPLACE_OUTBOUND"
  | "MARKETPLACE_INBOUND_ACCEPT"
  | "CONSULTATION_BOOKING";

export const OTP_PURPOSES = [
  "ONBOARDING_CONSENT",
  "MARKETPLACE_OUTBOUND",
  "MARKETPLACE_INBOUND_ACCEPT",
  "CONSULTATION_BOOKING",
] as const;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function getAdminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase Edge Function environment is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function authenticateUser(req: Request) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Authentication required.");
  }

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    throw new Error("Authentication required.");
  }

  const supabase = getAdminClient();

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
  authUserId: string,
) {
  const { data: masterByAuth, error: authLookupError } = await supabase
    .from("students_master")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (authLookupError) {
    throw new Error(authLookupError.message);
  }

  if (masterByAuth?.student_uuid) {
    return {
      ...masterByAuth,
      phone:
        masterByAuth.parent_phone ||
        masterByAuth.parent_mobile ||
        masterByAuth.phone,
    };
  }

  const { data: studentRow, error: studentLookupError } = await supabase
    .from("students")
    .select("id, student_id, student_email")
    .eq("id", authUserId)
    .maybeSingle();

  if (studentLookupError) {
    throw new Error(studentLookupError.message);
  }

  if (!studentRow?.student_id) {
    throw new Error("No student profile is linked to this account.");
  }

  const { data: masterByStudentCode, error: codeLookupError } = await supabase
    .from("students_master")
    .select("*")
    .eq("student_id", studentRow.student_id)
    .maybeSingle();

  if (codeLookupError) {
    throw new Error(codeLookupError.message);
  }

  if (!masterByStudentCode?.student_uuid) {
    throw new Error("Student profile could not be resolved.");
  }

  return {
    ...masterByStudentCode,
    phone:
      masterByStudentCode.parent_phone ||
      masterByStudentCode.parent_mobile ||
      masterByStudentCode.phone,
  };
}

export function normalizeIndianMobile(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (!/^\d{10}$/.test(digits)) {
    throw new Error("Parent mobile number must contain exactly 10 digits.");
  }

  return `+91${digits}`;
}

export function maskPhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `+91 ••••••${digits.slice(-4)}`;
}

export function generateOtp(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(1))[0];
  return String(100000 + (bytes % 900000));
}

export function generateVerificationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export function getOtpDeliveryProvider(): "MOCK" | "MSG91" {
  return String(Deno.env.get("SMS_PROVIDER") || "MOCK").toUpperCase() ===
    "MSG91"
    ? "MSG91"
    : "MOCK";
}

// Backward-compatible alias used by older Edge Function versions.
export const getProvider = getOtpDeliveryProvider;

export async function sendOtpThroughProvider(
  phone: string,
  otp: string,
): Promise<"MOCK" | "MSG91"> {
  const provider = getOtpDeliveryProvider();

  if (provider === "MOCK") {
    console.log("============================================================");
    console.log("TALENT PASSPORT OTP — MOCK SMS PROVIDER");
    console.log(`Phone: ${phone}`);
    console.log(`OTP: ${otp}`);
    console.log("Valid for: 5 minutes");
    console.log("============================================================");
    return "MOCK";
  }

  throw new Error(
    "SMS_PROVIDER=MSG91 is selected, but the MSG91 adapter is not configured yet.",
  );
}
