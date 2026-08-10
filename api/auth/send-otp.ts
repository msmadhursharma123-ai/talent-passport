import {
  authenticateRequest,
  CONSENT_VERSION,
  createOtpChallenge,
  generateOtp,
  normalizeIndianMobile,
  resolveAuthenticatedStudent,
  sendOtpThroughProvider,
} from "../../server/otp/otpService";

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const { supabase, user } = await authenticateRequest(
      req.headers.authorization
    );

    if (req.body?.consentAccepted !== true) {
      return res.status(400).json({
        success: false,
        error:
          "Parental consent must be accepted before an OTP can be sent.",
      });
    }

    const student = await resolveAuthenticatedStudent(
      supabase,
      user.id
    );

    if (!student.phone) {
      return res.status(400).json({
        success: false,
        error:
          "No parent mobile number is available in the student profile.",
      });
    }

    const phone = normalizeIndianMobile(student.phone);

    /*
     * Basic server-side resend protection:
     * do not generate another OTP if an OTP was sent in the last 45 seconds.
     */
    const { data: recentChallenge } = await supabase
      .from("student_parent_otp_challenges")
      .select("id, last_sent_at")
      .eq("student_uuid", student.student_uuid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      recentChallenge?.last_sent_at &&
      Date.now() - new Date(recentChallenge.last_sent_at).getTime() <
        45 * 1000
    ) {
      return res.status(429).json({
        success: false,
        error: "Please wait a few seconds before requesting another OTP.",
      });
    }

    const otp = generateOtp();

    const challenge = await createOtpChallenge(
      supabase,
      student.student_uuid,
      phone,
      otp
    );

    await sendOtpThroughProvider(phone, otp);

    return res.status(200).json({
      success: true,
      expiresAt: challenge.expiresAt,
      phoneMasked: phone.slice(0, 3) + "••••••" + phone.slice(-2),
      provider: challenge.provider,
      consentVersion: CONSENT_VERSION,
    });
  } catch (error: any) {
    console.error("SEND OTP ERROR", error);

    return res.status(400).json({
      success: false,
      error: error?.message ?? "Unable to send OTP.",
    });
  }
}
