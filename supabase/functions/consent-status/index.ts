import {
  authenticateUser,
  corsHeaders,
  json,
  resolveAuthenticatedStudent,
} from "../_shared/otp.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ verified: false, error: "Method not allowed." }, 405);
  }

  try {
    const { supabase, user } = await authenticateUser(req);
    const student = await resolveAuthenticatedStudent(supabase, user.id);

    const { data, error } = await supabase
      .from("student_parental_consents")
      .select("consent_granted, verified_at, withdrawn_at, consent_version")
      .eq("student_uuid", student.student_uuid)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return json({
      verified:
        Boolean(data?.consent_granted) &&
        Boolean(data?.verified_at) &&
        !data?.withdrawn_at,
      verifiedAt: data?.verified_at ?? null,
      consentVersion: data?.consent_version ?? null,
    });
  } catch (error) {
    console.error("CONSENT STATUS ERROR", error);

    return json(
      {
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to read parental consent status.",
      },
      400,
    );
  }
});
