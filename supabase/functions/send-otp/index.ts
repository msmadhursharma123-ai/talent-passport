import {
  authenticateUser,
  CONSENT_VERSION,
  corsHeaders,
  generateOtp,
  getProvider,
  json,
  maskPhone,
  normalizeIndianMobile,
  resolveAuthenticatedStudent,
  sendOtpThroughProvider,
  sha256Hex,
} from "../_shared/otp.ts";

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

    if (body?.consentAccepted !== true) {
      return json(
        {
          success: false,
          error: "Parental consent must be accepted before an OTP can be sent.",
        },
        400,
      );
    }

    const student = await resolveAuthenticatedStudent(supabase, user.id);

    if (!student.phone) {
      return json(
        {
          success: false,
          error:
            "No parent mobile number is available in the student profile.",
        },
        400,
      );
    }

    const phone = normalizeIndianMobile(student.phone);

    const { data: recentChallenge, error: recentError } = await supabase
      .from("student_parent_otp_challenges")
      .select("id, last_sent_at")
      .eq("student_uuid", student.student_uuid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentError) {
      throw new Error(recentError.message);
    }

    if (
      recentChallenge?.last_sent_at &&
      Date.now() - new Date(recentChallenge.last_sent_at).getTime() < 45_000
    ) {
      return json(
        {
          success: false,
          error: "Please wait a few seconds before requesting another OTP.",
        },
        429,
      );
    }

    const otp = generateOtp();
    const otpHash = await sha256Hex(otp);
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
    const provider = getProvider();
    const sentAt = new Date().toISOString();

    // Retire any older active challenge before creating the new one.
    const { error: consumeError } = await supabase
      .from("student_parent_otp_challenges")
      .update({ consumed_at: sentAt })
      .eq("student_uuid", student.student_uuid)
      .is("consumed_at", null)
      .is("verified_at", null);

    if (consumeError) {
      throw new Error(consumeError.message);
    }

    const { error: insertError } = await supabase
      .from("student_parent_otp_challenges")
      .insert({
        student_uuid: student.student_uuid,
        phone,
        otp_hash: otpHash,
        expires_at: expiresAt,
        provider,
        consent_version: CONSENT_VERSION,
        last_sent_at: sentAt,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    await sendOtpThroughProvider(phone, otp);

    return json({
      success: true,
      expiresAt,
      phoneMasked: maskPhone(phone),
      provider,
      consentVersion: CONSENT_VERSION,
    });
  } catch (error) {
    console.error("SEND OTP ERROR", error);

    return json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to send OTP.",
      },
      400,
    );
  }
});
