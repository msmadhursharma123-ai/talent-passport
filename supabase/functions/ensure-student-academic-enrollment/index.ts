// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.107.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeClass(value: unknown) {
  return clean(value).split(/\s+/)[0];
}

function normalizeSection(value: unknown) {
  return clean(value).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "POST is required." }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) {
      return json({ success: false, error: "Authentication is required." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Required Supabase environment variables are missing.");
      return json({ success: false, error: "Student enrollment service is not configured." }, 500);
    }

    const token = authorization.slice("Bearer ".length).trim();
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return json({ success: false, error: "The student session is invalid or expired. Please sign in again." }, 401);
    }

    const user = authData.user;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Resolve the student from the verified caller identity. Never trust
    // client-provided student UUID, school UUID, or academic-year ID.
    const { data: student, error: studentError } = await admin
      .from("students_master")
      .select("id, auth_user_id, student_uuid, school_uuid, school_name, class_name, section_name, roll_number")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (studentError) {
      throw new Error(`Unable to resolve the authenticated student profile: ${studentError.message}`);
    }

    if (!student) {
      return json({
        success: false,
        error: "Student profile is not complete yet. Please finish the student profile before enrollment.",
      }, 409);
    }

    if (!student.student_uuid || !student.school_uuid || !student.class_name ||
        !student.section_name || !student.roll_number) {
      return json({
        success: false,
        error: "The student profile is missing school, class, section, roll number, or student identity information.",
      }, 409);
    }

    const className = normalizeClass(student.class_name);
    const sectionName = normalizeSection(student.section_name);
    const rollNumber = clean(student.roll_number).toUpperCase();

    if (!className || !/^[A-G]$/.test(sectionName) || !rollNumber) {
      return json({ success: false, error: "The student profile has invalid class, section, or roll-number information." }, 409);
    }

    const { data: years, error: yearError } = await admin
      .from("school_academic_years")
      .select("id, school_uuid, academic_year_code, status, is_current")
      .eq("school_uuid", student.school_uuid)
      .eq("status", "ACTIVE")
      .eq("is_current", true);

    if (yearError) {
      throw new Error(`Unable to resolve the school's current academic year: ${yearError.message}`);
    }

    if (!years || years.length !== 1) {
      return json({
        success: false,
        error: years?.length
          ? "The school has multiple active current academic years. Contact the school administrator."
          : "The school has no active current academic year. Contact the school administrator.",
      }, 409);
    }

    const year = years[0];

    const { data: existing, error: existingError } = await admin
      .from("student_academic_enrollments")
      .select("id, student_uuid, school_uuid, school_academic_year_id, class_name, section_name, roll_number, status")
      .eq("student_uuid", student.student_uuid)
      .eq("school_uuid", student.school_uuid)
      .eq("school_academic_year_id", year.id);

    if (existingError) {
      throw new Error(`Unable to verify the student's academic-year enrollment: ${existingError.message}`);
    }

    if (existing && existing.length > 1) {
      return json({
        success: false,
        error: "Multiple enrollment records already exist for this student and current academic year. No records were changed.",
      }, 409);
    }

    if (existing?.length === 1) {
      const row = existing[0];
      const samePlacement =
        normalizeClass(row.class_name) === className &&
        normalizeSection(row.section_name) === sectionName &&
        clean(row.roll_number).toUpperCase() === rollNumber;

      if (row.status !== "ACTIVE" || !samePlacement) {
        return json({
          success: false,
          error: "An enrollment already exists for the current academic year but is inactive or conflicts with the student profile. No records were changed.",
        }, 409);
      }

      return json({
        success: true,
        created: false,
        enrollmentId: row.id,
        schoolAcademicYearId: year.id,
        academicYearCode: year.academic_year_code,
      });
    }

    const { data: enrollment, error: insertError } = await admin
      .from("student_academic_enrollments")
      .insert({
        student_uuid: student.student_uuid,
        school_uuid: student.school_uuid,
        school_academic_year_id: year.id,
        class_name: className,
        section_name: sectionName,
        roll_number: rollNumber,
        status: "ACTIVE",
      })
      .select("id")
      .single();

    if (insertError || !enrollment) {
      throw new Error(`Unable to create the student's current academic-year enrollment: ${insertError?.message ?? "No enrollment row returned."}`);
    }

    return json({
      success: true,
      created: true,
      enrollmentId: enrollment.id,
      schoolAcademicYearId: year.id,
      academicYearCode: year.academic_year_code,
    });
  } catch (error) {
    console.error("ENSURE STUDENT ACADEMIC ENROLLMENT ERROR", error);
    return json({
      success: false,
      error: error instanceof Error
        ? error.message
        : "Unable to verify or create the student's academic-year enrollment.",
    }, 500);
  }
});
