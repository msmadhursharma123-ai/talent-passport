import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Supabase environment variables.",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const supabase = createClient(
      url,
      serviceRoleKey
    );

    const {
      role,
      email,
    } = await req.json();

    let table = "";
    let emailColumn = "";

    switch (role) {
      case "student":
        table = "students_master";
        emailColumn = "student_email";
        break;

      case "teacher":
        table = "teachers_master";
        emailColumn = "email";
        break;

     case "partner":
    table = "partner_profiles";
    emailColumn = "email";
    break;

      case "school":
        table = "school_admins";
        emailColumn = "email";
        break;

      case "admin":
        table = "admins";
        emailColumn = "admin_email";
        break;

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid role.",
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
    }

    const {
      data,
      error,
    } = await supabase
      .from(table)
      .select("id")
      .eq(emailColumn, email.trim())
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email not found.",
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: e.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});