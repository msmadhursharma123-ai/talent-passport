import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function corsJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const json = corsJson;

const clean = (value: unknown, max = 5000) =>
  String(value ?? "").trim().slice(0, max);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] ?? character));

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function reportHtml(report: any) {
  const subjects = Array.isArray(report?.subjects) ? report.subjects : [];
  const doubts = Array.isArray(report?.pendingDoubts) ? report.pendingDoubts : [];
  const discussion = Array.isArray(report?.discussionPoints) ? report.discussionPoints : [];

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:720px;margin:0 auto;padding:24px;background:#f8fafc">
    <div style="background:#143b73;color:#fff;border-radius:14px;padding:20px">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;color:#fdba74">TALENT PASSPORT</div>
      <h1 style="margin:7px 0 4px;font-size:24px">Parents Teacher Meeting Report</h1>
      <div style="font-size:12px;color:#dbeafe">${escapeHtml(clean(report?.schoolName, 180))} · ${escapeHtml(clean(report?.periodLabel, 80))}</div>
    </div>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:10px">
      <div style="font-size:20px;font-weight:800">${escapeHtml(clean(report?.studentName, 120))}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">Teacher: ${escapeHtml(clean(report?.teacherName, 120))}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">Class ${escapeHtml(clean(report?.className, 50))} · Section ${escapeHtml(clean(report?.sectionName, 50))}</div>
    </div>

    <table style="width:100%;border-collapse:separate;border-spacing:6px;margin-top:6px">
      <tr>
        <td style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px"><div style="font-size:9px;color:#64748b;font-weight:800">UNDERSTANDING</div><div style="font-size:20px;font-weight:800;margin-top:4px">${clean(report?.combinedUnderstandingPercentage, 10)}%</div></td>
        <td style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px"><div style="font-size:9px;color:#64748b;font-weight:800">RESPONSE RATE</div><div style="font-size:20px;font-weight:800;margin-top:4px">${clean(report?.overallResponseRate, 10)}%</div></td>
        <td style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px"><div style="font-size:9px;color:#64748b;font-weight:800">FEEDBACK DAYS</div><div style="font-size:20px;font-weight:800;margin-top:4px">${clean(report?.feedbackDays, 10)}</div></td>
        <td style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px"><div style="font-size:9px;color:#64748b;font-weight:800">PENDING DOUBTS</div><div style="font-size:20px;font-weight:800;margin-top:4px">${doubts.reduce((sum: number, group: any) => sum + Number(group?.count ?? 0), 0)}</div></td>
      </tr>
    </table>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:10px">
      <div style="font-size:11px;font-weight:800;color:#f97316;letter-spacing:1px">SUBJECT-WISE SNAPSHOT</div>
      ${subjects.map((subject: any) => `
        <div style="padding:10px 0;border-bottom:1px solid #eef2f7">
          <div style="font-size:13px;font-weight:800">${escapeHtml(clean(subject?.subject, 100))}</div>
          <div style="font-size:10px;color:#64748b;margin-top:3px">Understanding ${clean(subject?.understandingPercentage, 10)}% · ${clean(subject?.feedbackCount, 10)}/${clean(subject?.logsCount, 10)} responses · ${clean(subject?.responseRate, 10)}% response rate</div>
          <div style="font-size:10px;color:#64748b;margin-top:3px">Topics: ${escapeHtml(Array.isArray(subject?.topics) && subject.topics.length ? subject.topics.join(" · ") : "No topic recorded")}</div>
        </div>`).join("")}
    </div>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:10px">
      <div style="font-size:11px;font-weight:800;color:#f97316;letter-spacing:1px">CURRENT PENDING DOUBTS</div>
      ${doubts.length ? doubts.map((group: any) => `<div style="margin-top:8px"><div style="font-size:12px;font-weight:800">${escapeHtml(clean(group?.subject, 100))} · ${clean(group?.count, 10)}</div>${(group?.items ?? []).map((item: any) => `<div style="font-size:10px;color:#7f1d1d;margin-top:4px">${escapeHtml(clean(item?.topic, 180))} · ${escapeHtml(clean(item?.concept, 180))}</div>`).join("")}</div>`).join("") : `<div style="font-size:10px;color:#15803d;margin-top:8px">No current pending doubts are recorded.</div>`}
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin-top:10px">
      <div style="font-size:11px;font-weight:800;color:#c2410c;letter-spacing:1px">READY TO DISCUSS</div>
      ${discussion.map((point: any) => `<div style="font-size:10px;color:#7c2d12;margin-top:7px">• ${escapeHtml(clean(point, 600))}</div>`).join("")}
    </div>

    <div style="font-size:9px;color:#94a3b8;margin-top:18px">Prepared by Talent Passport. This report contains the student's academic classroom intelligence for the selected PTM period.</div>
  </div>`;
}

Deno.serve(async (request) => {
  // Browser preflight must always terminate at the function with HTTP 200.
  // The matching verify_jwt=false block is supplied in the PTM config patch;
  // authentication is then performed explicitly below using the bearer token.
  if (request.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Authentication is required." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("PTM_SENDER_EMAIL") || "Talent Passport <onboarding@resend.dev>";

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return json({ error: "PTM email service is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Invalid teacher session." }, 401);

    const { data: teacher, error: teacherError } = await supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,school_name,is_active,auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (teacherError) throw teacherError;
    if (!teacher || teacher.is_active === false) return json({ error: "Teacher access could not be verified." }, 403);

    const body = await request.json();
    const studentUuid = clean(body?.studentUuid, 100);
    const startDate = clean(body?.startDate, 10);
    const endDate = clean(body?.endDate, 10);
    const className = clean(body?.className, 80);
    const sectionName = clean(body?.sectionName, 80);
    const pdfBase64 = clean(body?.pdfBase64, 8_000_000);
    const report = body?.report ?? {};

    if (!studentUuid || !isValidDateKey(startDate) || !isValidDateKey(endDate) || startDate > endDate || !pdfBase64) {
      return json({ error: "A valid student, reporting period and PDF are required." }, 400);
    }

    if (pdfBase64.length > 7_500_000) {
      return json({ error: "The generated PTM PDF is too large to email." }, 413);
    }

    const { data: student, error: studentError } = await supabase
      .from("students_master")
      .select("student_uuid,student_name,student_email,school_uuid,school_name,class_name,section_name")
      .eq("student_uuid", studentUuid)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) return json({ error: "Student account could not be found." }, 404);

    const studentSection = String(student.section_name ?? "").trim();
    if (String(student.school_uuid ?? "") !== String(teacher.school_uuid ?? "")) return json({ error: "This student is outside the teacher's school boundary." }, 403);
    if (className && String(student.class_name ?? "") !== className) return json({ error: "Student class does not match the selected classroom." }, 403);
    if (sectionName && studentSection !== sectionName) return json({ error: "Student section does not match the selected classroom." }, 403);
    if (!student.student_email) return json({ error: "This student does not have a registered parent email." }, 400);

    const { data: assignment, error: assignmentError } = await supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,class_name,section_name,is_active")
      .eq("teacher_uuid", teacher.teacher_uuid)
      .eq("school_uuid", teacher.school_uuid)
      .eq("class_name", student.class_name)
      .eq("section_name", studentSection)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (assignmentError) throw assignmentError;
    if (!assignment) return json({ error: "The teacher is not currently assigned to this student's classroom." }, 403);

    const idempotencyKey = await sha256(`${teacher.teacher_uuid}|${student.student_uuid}|${startDate}|${endDate}`);
    const { data: existing, error: existingError } = await supabase
      .from("ptm_report_email_deliveries")
      .select("id,status,provider_message_id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing?.status === "SENT") {
      return json({ success: true, alreadySent: true, messageId: existing.provider_message_id ?? undefined });
    }

    if (existing?.id) {
      await supabase
        .from("ptm_report_email_deliveries")
        .update({ status: "SENDING", error_message: null, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("ptm_report_email_deliveries")
        .insert({
          idempotency_key: idempotencyKey,
          teacher_uuid: teacher.teacher_uuid,
          student_uuid: student.student_uuid,
          school_uuid: teacher.school_uuid,
          recipient_email: student.student_email,
          period_start: startDate,
          period_end: endDate,
          class_name: student.class_name,
          section_name: studentSection,
          provider: "resend",
          status: "SENDING",
        });
      if (insertError && insertError.code !== "23505") throw insertError;
    }

    const subject = `Parents Teacher Meeting Report · ${student.student_name} · ${teacher.school_name ?? student.school_name ?? "Talent Passport"}`;
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [student.student_email],
        subject,
        html: reportHtml({
          ...report,
          studentName: student.student_name,
          schoolName: teacher.school_name ?? student.school_name,
          teacherName: teacher.full_name,
          className: student.class_name,
          sectionName: studentSection,
        }),
        attachments: [
          {
            filename: `Talent-Passport-PTM-${String(student.student_name).replace(/[^a-z0-9]+/gi, "-")}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    const resendBody = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      await supabase
        .from("ptm_report_email_deliveries")
        .update({
          status: "FAILED",
          error_message: clean(resendBody?.message ?? resendBody?.error ?? "Email provider rejected the request.", 1000),
          updated_at: new Date().toISOString(),
        })
        .eq("idempotency_key", idempotencyKey);
      return json({ error: "The report could not be delivered right now. Please try again." }, 502);
    }

    const messageId = resendBody?.id ? String(resendBody.id) : null;
    await supabase
      .from("ptm_report_email_deliveries")
      .update({
        status: "SENT",
        provider_message_id: messageId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("idempotency_key", idempotencyKey);

    return json({ success: true, messageId: messageId ?? undefined });
  } catch (error: any) {
    console.error("SEND PTM REPORT FAILED", error);
    return json({ error: error?.message ?? "Unable to send the PTM report." }, 500);
  }
});
