import {
  authenticateRequest,
  resolveAuthenticatedStudent,
  verifyOtpAndRecordConsent,
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
          "Please accept the parental consent notice before verifying the OTP.",
      });
    }

    const otp = String(req.body?.otp ?? "").trim();

    const student = await resolveAuthenticatedStudent(
      supabase,
      user.id
    );

    const result = await verifyOtpAndRecordConsent(
      supabase,
      student.student_uuid,
      user.id,
      otp
    );

    return res.status(200).json({
      success: true,
      verified: result.verified,
      verifiedAt: result.verifiedAt,
    });
  } catch (error: any) {
    console.error("VERIFY OTP ERROR", error);

    return res.status(400).json({
      success: false,
      verified: false,
      error: error?.message ?? "Unable to verify OTP.",
    });
  }
}
