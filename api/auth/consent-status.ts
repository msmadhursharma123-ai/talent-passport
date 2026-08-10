import {
  authenticateRequest,
  getConsentStatus,
  resolveAuthenticatedStudent,
} from "../../server/otp/otpService";

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const { supabase, user } = await authenticateRequest(
      req.headers.authorization
    );

    const student = await resolveAuthenticatedStudent(
      supabase,
      user.id
    );

    const status = await getConsentStatus(
      supabase,
      student.student_uuid
    );

    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error("CONSENT STATUS ERROR", error);

    return res.status(400).json({
      success: false,
      verified: false,
      error: error?.message ?? "Unable to read consent status.",
    });
  }
}
