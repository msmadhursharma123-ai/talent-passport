// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.107.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function text(value: unknown) { return String(value ?? "").trim(); }
function roll(value: unknown) { return text(value).toUpperCase(); }
function email(value: unknown) { return text(value); }

function validate(row: any) {
  if (!roll(row.rollNumber)) return "Roll number is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email(row.email))) return "Enter a valid email ID.";
  if (text(row.password).length < 6) return "Password must contain at least 6 characters.";
  if (text(row.password) !== text(row.confirmPassword)) return "Password and confirm password do not match.";
  if (!text(row.studentName)) return "Student name is required.";
  if (!/^\d{10}$/.test(text(row.studentMobile))) return "Student mobile must contain exactly 10 digits.";
  if (!/^\d{10}$/.test(text(row.parentMobile))) return "Parent mobile must contain exactly 10 digits.";
  if (text(row.studentMobile) === text(row.parentMobile)) return "Student and parent mobile numbers cannot be the same.";
  if (!text(row.className)) return "Class is required.";
  if (!/^[A-G]$/.test(roll(row.section))) return "Section must be a single letter from A to G.";
  if (!/^\d+$/.test(text(row.age))) return "Age must be numeric.";
  if (!text(row.gender)) return "Gender is required.";
  if (!text(row.favouriteActivity)) return "Favourite activity is required.";
  if (!text(row.residenceCity)) return "Residence city is required.";
  return null;
}

async function rpcBoolean(name: string, params: Record<string, unknown>) {
  const { data, error } = await admin.rpc(name, params);
  if (error) throw error;
  return data === true;
}

async function getCapacity(schoolUuid: string) {
  const { data, error } = await admin.rpc("get_school_profile_capacity", { p_school_uuid: schoolUuid });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

async function createOne(schoolUuid: string, schoolName: string, row: any, rowNumber: number) {
  const normalizedRoll = roll(row.rollNumber);
  const studentEmail = email(row.email);
  const password = text(row.password);
  const normalizedSection = roll(row.section);
  const normalizedClassName = text(row.className).split(/\s+/)[0];

  const authorized = await rpcBoolean("is_student_roll_authorized_for_school", {
    p_roll_number: normalizedRoll,
    p_school_uuid: schoolUuid,
  });
  if (!authorized) return { rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This roll number is not approved and active for this school." };

  const rollRegistered = await rpcBoolean("is_student_roll_already_registered", { p_roll_number: normalizedRoll });
  if (rollRegistered) return { rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This roll number is already registered to a Student Portal account." };

  const emailRegistered = await rpcBoolean("is_student_email_already_registered", { p_email: studentEmail });
  if (emailRegistered) return { rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This email is already registered to a Student Portal account." };

  const studentCode = studentEmail.toLowerCase().replace("@", "_").replace(/\./g, "_");
  let authUserId: string | null = null;
  let studentUuid: string | null = null;

  try {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: studentEmail,
      password,
      email_confirm: true,
      user_metadata: {
        tp_role: "student",
        tp_portal_activated: true,
        student_roll_number: normalizedRoll,
        tp_school_assigned_account: true,
      },
    });
    if (authError || !authData?.user) throw authError ?? new Error("Unable to create authentication account.");
    authUserId = authData.user.id;

    const { data: studentRow, error: studentError } = await admin
      .from("students")
      .insert([{
        id: authUserId,
        student_name: text(row.studentName),
        parent_email: studentEmail,
        student_mobile: text(row.studentMobile),
        parent_phone: text(row.parentMobile),
        school_name: schoolName,
        class_name: text(row.className),
        student_age: Number(text(row.age)),
        gender: text(row.gender),
        favourite_activity: text(row.favouriteActivity),
        residence_city: text(row.residenceCity),
        residence_area: text(row.area),
        student_email: studentEmail,
        student_id: studentCode,
      }])
      .select("student_uuid")
      .single();

    if (studentError || !studentRow?.student_uuid) throw studentError ?? new Error("Student profile could not be created.");
    studentUuid = studentRow.student_uuid;

    const { error: masterError } = await admin
      .from("students_master")
      .insert([{
        student_id: studentCode,
        auth_user_id: authUserId,
        student_uuid: studentUuid,
        student_name: text(row.studentName),
        student_email: studentEmail,
        school_uuid: schoolUuid,
        school_name: schoolName,
        roll_number: normalizedRoll,
        class_name: normalizedClassName,
        section_name: normalizedSection,
        student_mobile: text(row.studentMobile),
        phone: text(row.parentMobile),
        parent_phone: text(row.parentMobile),
        student_age: Number(text(row.age)),
        gender: text(row.gender),
        favourite_activity: text(row.favouriteActivity),
        residence_city: text(row.residenceCity),
        residence_area: text(row.area),
      }]);

    if (masterError) throw masterError;

    return { rowNumber, rollNumber: normalizedRoll, email: studentEmail, studentName: text(row.studentName), success: true };
  } catch (error) {
    if (studentUuid) await admin.from("students").delete().eq("student_uuid", studentUuid);
    if (authUserId) await admin.auth.admin.deleteUser(authUserId);
    return { rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: error?.message ?? "Unable to create this student account." };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "POST is required." }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ success: false, error: "Authentication session is required." }, 401);

    const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) return json({ success: false, error: "Authentication session is required." }, 401);

    // Validate the exact user JWT supplied by the browser. Using the server-side
    // service-role client here removes any dependency on the browser/publishable
    // key for user-token validation; the service-role key never leaves Supabase.
    const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
    if (authError || !authData.user) {
      console.error("ASSIGN_STUDENT_ACCOUNTS_AUTH_FAILED", authError);
      return json({ success: false, error: "Your school admin session is invalid or expired." }, 401);
    }

    const body = await req.json();
    const schoolUuid = text(body?.schoolUuid);
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (!schoolUuid || !rows.length) return json({ success: false, error: "School and student rows are required." }, 400);
    if (rows.length > 500) return json({ success: false, error: "A maximum of 500 students can be assigned in one batch." }, 400);

    const { data: schoolAdmin, error: schoolError } = await admin
      .from("school_admins")
      .select("school_uuid,school_name,account_status,auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .eq("school_uuid", schoolUuid)
      .maybeSingle();
    if (schoolError || !schoolAdmin) return json({ success: false, error: "This school admin is not authorized for the selected school." }, 403);
    // Match the existing authentication service: Temporary/PENDING accounts are not
    // rejected here; only explicitly suspended/inactive school-admin accounts are blocked.
    // School-level ACTIVE status is separately enforced by get_school_profile_capacity below.
    const adminAccountStatus = String(schoolAdmin.account_status ?? "active").toLowerCase();
    if (adminAccountStatus === "suspended" || adminAccountStatus === "inactive") {
      return json({ success: false, error: "The school admin account is not active." }, 403);
    }

    const seenRolls = new Set<string>();
    const seenEmails = new Set<string>();
    const prepared: any[] = [];
    const preliminaryResults: any[] = [];

    rows.forEach((row: any, index: number) => {
      const rowNumber = index + 1;
      const validationError = validate(row);
      const normalizedRoll = roll(row?.rollNumber);
      const studentEmail = email(row?.email);
      if (validationError) {
        preliminaryResults.push({ rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: validationError });
        return;
      }
      if (seenRolls.has(normalizedRoll)) {
        preliminaryResults.push({ rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "Duplicate roll number in this batch." });
        return;
      }
      if (seenEmails.has(studentEmail.toLowerCase())) {
        preliminaryResults.push({ rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "Duplicate email ID in this batch." });
        return;
      }
      seenRolls.add(normalizedRoll);
      seenEmails.add(studentEmail.toLowerCase());
      prepared.push({ row, rowNumber });
    });

    // Preflight the database-backed approval and identity checks before any
    // Auth account is created. This means unapproved rolls, duplicate rolls,
    // and duplicate emails are skipped without consuming school capacity.
    const eligible: any[] = [];
    for (const item of prepared) {
      const normalizedRoll = roll(item.row.rollNumber);
      const studentEmail = email(item.row.email);
      const authorized = await rpcBoolean("is_student_roll_authorized_for_school", {
        p_roll_number: normalizedRoll,
        p_school_uuid: schoolUuid,
      });
      if (!authorized) {
        preliminaryResults.push({ rowNumber: item.rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This roll number is not approved and active for this school." });
        continue;
      }
      const rollRegistered = await rpcBoolean("is_student_roll_already_registered", { p_roll_number: normalizedRoll });
      if (rollRegistered) {
        preliminaryResults.push({ rowNumber: item.rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This roll number is already registered to a Student Portal account." });
        continue;
      }
      const emailRegistered = await rpcBoolean("is_student_email_already_registered", { p_email: studentEmail });
      if (emailRegistered) {
        preliminaryResults.push({ rowNumber: item.rowNumber, rollNumber: normalizedRoll, email: studentEmail, success: false, error: "This email is already registered to a Student Portal account." });
        continue;
      }
      eligible.push(item);
    }

    const capacity = await getCapacity(schoolUuid);
    if (!capacity || String(capacity.account_status ?? "").toUpperCase() !== "ACTIVE") return json({ success: false, error: "The selected school is not active or its capacity could not be verified." }, 400);
    const remaining = Number(capacity.student_profiles_remaining ?? 0);
    if (eligible.length > remaining) {
      return json({ success: false, error: `The school has capacity for ${remaining} more student profile${remaining === 1 ? "" : "s"}, but ${eligible.length} approved and otherwise valid rows were submitted. No accounts were created.` }, 409);
    }

    const createdResults: any[] = [];
    for (const item of eligible) {
      createdResults.push(await createOne(schoolUuid, schoolAdmin.school_name ?? "", item.row, item.rowNumber));
    }

    const results = [...preliminaryResults, ...createdResults].sort((a, b) => a.rowNumber - b.rowNumber);
    const createdCount = results.filter(r => r.success).length;
    return json({ success: true, results, createdCount, skippedCount: results.length - createdCount });
  } catch (error) {
    console.error("assign-student-accounts failed", error);
    return json({ success: false, error: error?.message ?? "Unable to assign student accounts." }, 500);
  }
});
