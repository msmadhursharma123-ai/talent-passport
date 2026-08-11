import {
  authenticateUser,
  corsHeaders,
  json,
  OTP_PURPOSES,
  resolveAuthenticatedStudent,
  sha256Hex,
  type OtpPurpose,
} from "../_shared/otp.ts";

function resolvePurpose(value: unknown): Exclude<OtpPurpose, "ONBOARDING_CONSENT"> {
  const purpose = String(value || "");

  if (
    (OTP_PURPOSES as readonly string[]).includes(purpose) &&
    purpose !== "ONBOARDING_CONSENT"
  ) {
    return purpose as Exclude<OtpPurpose, "ONBOARDING_CONSENT">;
  }

  throw new Error("Invalid parent action OTP purpose.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ authorized: false, error: "Method not allowed." }, 405);
  }

  try {
    const { supabase, user } = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));

    const purpose = resolvePurpose(body?.purpose);
    const verificationToken = String(body?.verificationToken || "").trim();

    if (!verificationToken) {
      return json(
        {
          authorized: false,
          error: "The one-time verification token is missing.",
        },
        400,
      );
    }

    const student = await resolveAuthenticatedStudent(supabase, user.id);
    const tokenHash = await sha256Hex(verificationToken);
    const now = new Date();

    const { data: challenge, error: lookupError } = await supabase
      .from("student_parent_otp_challenges")
      .select(
        "id, purpose, expires_at, verified_at, verification_token_hash, action_consumed_at",
      )
      .eq("student_uuid", student.student_uuid)
      .eq("purpose", purpose)
      .eq("verification_token_hash", tokenHash)
      .not("verified_at", "is", null)
      .is("action_consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!challenge) {
      return json(
        {
          authorized: false,
          error:
            "The parent verification token is invalid, expired, or has already been used.",
        },
        400,
      );
    }

    if (new Date(challenge.expires_at).getTime() < now.getTime()) {
      return json(
        {
          authorized: false,
          error: "The parent verification session has expired. Please verify again.",
        },
        400,
      );
    }

    const consumedAt = now.toISOString();

    // The token is one-time. The conditional update prevents two concurrent
    // requests from consuming the same authorization token.
    const { data: consumedRows, error: consumeError } = await supabase
      .from("student_parent_otp_challenges")
      .update({ action_consumed_at: consumedAt })
      .eq("id", challenge.id)
      .eq("student_uuid", student.student_uuid)
      .eq("purpose", purpose)
      .eq("verification_token_hash", tokenHash)
      .is("action_consumed_at", null)
      .select("id");

    if (consumeError) {
      throw new Error(consumeError.message);
    }

    if (!consumedRows?.length) {
      return json(
        {
          authorized: false,
          error: "This parent authorization has already been used.",
        },
        409,
      );
    }

    console.log("PARENT ACTION AUTHORIZED", {
      purpose,
      challengeId: challenge.id,
      studentUuid: student.student_uuid,
    });

    return json({
      authorized: true,
      consumedAt,
      purpose,
    });
  } catch (error) {
    console.error("CONSUME OTP ERROR", error);

    return json(
      {
        authorized: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to authorize the protected action.",
      },
      400,
    );
  }
});
