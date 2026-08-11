import {
  authenticateUser,
  CONSENT_TEXT_SHA256,
  CONSENT_VERSION,
  constantTimeEqual,
  corsHeaders,
  generateVerificationToken,
  json,
  OTP_PURPOSES,
  resolveAuthenticatedStudent,
  sha256Hex,
  type OtpPurpose,
} from "../_shared/otp.ts";

function resolvePurpose(value: unknown): OtpPurpose {
  const purpose = String(value || "ONBOARDING_CONSENT");

  if ((OTP_PURPOSES as readonly string[]).includes(purpose)) {
    return purpose as OtpPurpose;
  }

  throw new Error("Invalid parent OTP purpose.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed." }, 405);
  }

  try {
    const { supabase, user } = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const purpose = resolvePurpose(body?.purpose);
    const challengeId = String(body?.challengeId || "").trim();

    if (body?.consentAccepted !== true) {
      return json(
        {
          success: false,
          verified: false,
          error:
            purpose === "ONBOARDING_CONSENT"
              ? "Please accept the parental consent notice before verifying the OTP."
              : "Please confirm parent/guardian approval before verifying the OTP.",
        },
        400,
      );
    }

    const otp = String(body?.otp ?? "").trim();

    if (!/^\d{6}$/.test(otp)) {
      return json(
        {
          success: false,
          verified: false,
          error: "Please enter the 6-digit OTP.",
        },
        400,
      );
    }

    const student = await resolveAuthenticatedStudent(supabase, user.id);

    // Action OTPs MUST identify the exact challenge created by Send OTP.
    // This prevents an OTP from another purpose or an older challenge from
    // being accepted accidentally.
    if (purpose !== "ONBOARDING_CONSENT" && !challengeId) {
      return json(
        {
          success: false,
          verified: false,
          error: "This verification session is missing. Please request a new OTP.",
        },
        400,
      );
    }

    let query = supabase
      .from("student_parent_otp_challenges")
      .select(
        "id, student_uuid, phone, otp_hash, expires_at, attempts, max_attempts, verified_at, consumed_at, consent_version, purpose, verification_token_hash, action_consumed_at",
      )
      .eq("student_uuid", student.student_uuid)
      .eq("purpose", purpose)
      .is("verified_at", null)
      .is("consumed_at", null);

    if (challengeId) {
      query = query.eq("id", challengeId);
    }

    const { data: challenge, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!challenge) {
      return json(
        {
          success: false,
          verified: false,
          error:
            `No active OTP challenge was found for ${purpose}. ` +
            "Please request a new OTP and use the latest code.",
        },
        400,
      );
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await supabase
        .from("student_parent_otp_challenges")
        .update({
          consumed_at: new Date().toISOString(),
          action_consumed_at: new Date().toISOString(),
        })
        .eq("id", challenge.id);

      return json(
        {
          success: false,
          verified: false,
          error: "This OTP has expired. Please request a new code.",
        },
        400,
      );
    }

    if (challenge.attempts >= challenge.max_attempts) {
      return json(
        {
          success: false,
          verified: false,
          error: "Too many incorrect attempts. Please request a new OTP.",
        },
        400,
      );
    }

    const submittedHash = await sha256Hex(otp);

    if (!constantTimeEqual(submittedHash, challenge.otp_hash)) {
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

      return json(
        {
          success: false,
          verified: false,
          error:
            nextAttempts >= challenge.max_attempts
              ? "Too many incorrect attempts. Please request a new OTP."
              : `Incorrect OTP. ${challenge.max_attempts - nextAttempts} attempts remaining.`,
        },
        400,
      );
    }

    const verifiedAt = new Date().toISOString();

    if (purpose === "ONBOARDING_CONSENT") {
      const { error: challengeUpdateError } = await supabase
        .from("student_parent_otp_challenges")
        .update({
          verified_at: verifiedAt,
          consumed_at: verifiedAt,
        })
        .eq("id", challenge.id);

      if (challengeUpdateError) {
        throw new Error(challengeUpdateError.message);
      }

      const { error: consentError } = await supabase
        .from("student_parental_consents")
        .upsert(
          {
            student_uuid: student.student_uuid,
            auth_user_id: user.id,
            parent_phone: challenge.phone,
            consent_version: CONSENT_VERSION,
            consent_text_sha256: CONSENT_TEXT_SHA256,
            consent_granted: true,
            verification_method: "SMS_OTP",
            verified_at: verifiedAt,
            withdrawn_at: null,
            updated_at: verifiedAt,
          },
          { onConflict: "student_uuid" },
        );

      if (consentError) {
        throw new Error(consentError.message);
      }

      return json({
        success: true,
        verified: true,
        verifiedAt,
        purpose,
        challengeId: challenge.id,
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenHash = await sha256Hex(verificationToken);

    const { error: challengeUpdateError } = await supabase
      .from("student_parent_otp_challenges")
      .update({
        verified_at: verifiedAt,
        consumed_at: verifiedAt,
        verification_token_hash: verificationTokenHash,
        action_consumed_at: null,
      })
      .eq("id", challenge.id)
      .eq("student_uuid", student.student_uuid)
      .eq("purpose", purpose);

    if (challengeUpdateError) {
      throw new Error(challengeUpdateError.message);
    }

    console.log("PARENT OTP VERIFIED", {
      purpose,
      challengeId: challenge.id,
      studentUuid: student.student_uuid,
    });

    return json({
      success: true,
      verified: true,
      verifiedAt,
      purpose,
      challengeId: challenge.id,
      verificationToken,
      expiresAt: challenge.expires_at,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR", error);

    return json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error ? error.message : "Unable to verify OTP.",
      },
      400,
    );
  }
});
