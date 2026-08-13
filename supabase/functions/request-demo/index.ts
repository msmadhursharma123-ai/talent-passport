import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const clean = (value: unknown, max = 2000) =>
  String(value ?? "").trim().slice(0, max);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] ?? character));

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();

    const fullName = clean(body?.fullName, 120);
    const designation = clean(body?.designation, 120);
    const organizationName = clean(body?.organizationName, 180);
    const board = clean(body?.board, 80);
    const workEmail = clean(body?.workEmail, 180).toLowerCase();
    const phone = clean(body?.phone, 50);
    const requirement = clean(body?.requirement, 3000);
    const source =
      clean(body?.source, 120) || "Talent Passport public website";

    if (
      !fullName ||
      !designation ||
      !organizationName ||
      !board ||
      !workEmail ||
      !phone
    ) {
      return json({ error: "Please complete all required fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      return json({ error: "Please provide a valid work email." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const recipientEmail =
      Deno.env.get("DEMO_RECIPIENT_EMAIL") ||
      "msmadhursharma123@gmail.com";

    /*
     * TEMPORARY TEST SENDER
     *
     * You do not currently have a verified Talent Passport domain.
     * Therefore we deliberately do NOT read DEMO_SENDER_EMAIL here.
     *
     * Resend documents onboarding@resend.dev as a valid test sender.
     * Your current recipient is the Resend account email, so this lets
     * the Request Demo flow work before you verify a company domain.
     *
     * Later, after verifying your own domain in Resend, replace this
     * constant with the verified sender or move it back to a secret.
     */
    const senderEmail = "Talent Passport <onboarding@resend.dev>";

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error("REQUEST DEMO CONFIGURATION ERROR:", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
        hasResendApiKey: Boolean(resendApiKey),
        hasRecipientEmail: Boolean(recipientEmail),
      });

      return json(
        { error: "The demo request service is not configured yet." },
        500
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    /*
     * Save the lead first. This is intentionally done before email delivery
     * so a temporary mail-provider failure never destroys the lead.
     */
    const { data: requestRow, error: insertError } = await supabase
      .from("demo_requests")
      .insert({
        full_name: fullName,
        designation,
        organization_name: organizationName,
        board,
        work_email: workEmail,
        phone,
        requirement: requirement || null,
        source,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("DEMO REQUEST DB INSERT FAILED:", insertError);

      return json(
        {
          error:
            "We could not save your request. Please try again.",
        },
        500
      );
    }

    const requestId = String(requestRow.id);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#14213d;max-width:680px;margin:0 auto;padding:24px">
        <div style="border-bottom:3px solid #f4a825;padding-bottom:14px;margin-bottom:22px">
          <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#244f8f">
            TALENT PASSPORT
          </div>
          <h1 style="margin:7px 0 0;font-size:25px">New Demo Request</h1>
        </div>

        <p style="color:#64748b">
          A new school / organization has requested a Talent Passport walkthrough.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:18px">
          <tr>
            <td style="padding:9px 0;font-weight:700;width:180px">Name</td>
            <td style="padding:9px 0">${escapeHtml(fullName)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-weight:700">Designation</td>
            <td style="padding:9px 0">${escapeHtml(designation)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-weight:700">School / Organization</td>
            <td style="padding:9px 0">${escapeHtml(organizationName)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-weight:700">Board</td>
            <td style="padding:9px 0">${escapeHtml(board)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-weight:700">Work Email</td>
            <td style="padding:9px 0">${escapeHtml(workEmail)}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-weight:700">Phone / WhatsApp</td>
            <td style="padding:9px 0">${escapeHtml(phone)}</td>
          </tr>
        </table>

        <div style="margin-top:18px;padding:16px;border-radius:10px;background:#f6f9fd">
          <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#244f8f">
            SPECIFIC REQUIREMENT
          </div>
          <p style="white-space:pre-wrap;line-height:1.6;margin:8px 0 0">
            ${escapeHtml(requirement || "Not provided")}
          </p>
        </div>

        <p style="margin-top:24px;font-size:11px;color:#94a3b8">
          Request ID: ${escapeHtml(requestId)}<br/>
          Source: ${escapeHtml(source)}
        </p>
      </div>
    `;

    const text = [
      "New Talent Passport Demo Request",
      "",
      `Name: ${fullName}`,
      `Designation: ${designation}`,
      `School / Organization: ${organizationName}`,
      `Board: ${board}`,
      `Work Email: ${workEmail}`,
      `Phone / WhatsApp: ${phone}`,
      "",
      `Specific Requirement: ${requirement || "Not provided"}`,
      "",
      `Request ID: ${requestId}`,
      `Source: ${source}`,
    ].join("\n");

    let resendResponse: Response;

    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [recipientEmail],
          reply_to: workEmail,
          subject: `New Talent Passport Demo Request — ${organizationName}`,
          html,
          text,
        }),
      });
    } catch (mailNetworkError) {
      console.error("RESEND NETWORK ERROR:", mailNetworkError);

      return json(
        {
          error:
            "Your request was saved, but the email service could not be reached. Please try again.",
          requestId,
        },
        502
      );
    }

    const resendBodyText = await resendResponse.text();

    if (!resendResponse.ok) {
      /*
       * Keep the detailed provider response in server logs, not in the
       * browser. This makes future diagnosis possible without exposing
       * secrets or provider internals to visitors.
       */
      console.error("RESEND EMAIL FAILED:", {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        response: resendBodyText,
        requestId,
        recipientEmail,
        senderEmail,
      });

      return json(
        {
          error:
            "Your request was saved, but the notification email could not be sent. Please try again.",
          requestId,
        },
        502
      );
    }

    let resendData: unknown = null;

    try {
      resendData = resendBodyText ? JSON.parse(resendBodyText) : null;
    } catch {
      resendData = resendBodyText;
    }

    console.log("REQUEST DEMO COMPLETED:", {
      requestId,
      organizationName,
      emailSent: true,
      resend: resendData,
    });

    return json({
      success: true,
      requestId,
      message: "Demo request submitted successfully.",
    });
  } catch (error) {
    console.error("REQUEST DEMO FUNCTION FAILED:", error);

    return json(
      { error: "Unable to submit your request right now." },
      500
    );
  }
});
