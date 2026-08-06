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

    const url =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !serviceRoleKey) {

      return new Response(

        JSON.stringify({

          success: false,

          error:
            "Missing Supabase environment variables."

        }),

        {

          status: 500,

          headers: corsHeaders

        }

      );

    }

    const {

      role,
      email,
      password

    } = await req.json();

    console.log("======================================");
    console.log("UPDATE PASSWORD START");
    console.log("ROLE =", role);
    console.log("EMAIL =", email);
    console.log("PASSWORD LENGTH =", password?.length);
    console.log("======================================");

    if (!role) {

      return new Response(

        JSON.stringify({

          success: false,

          error: "Role is required."

        }),

        {

          status: 400,

          headers: corsHeaders

        }

      );

    }

    if (!email) {

      return new Response(

        JSON.stringify({

          success: false,

          error: "Email is required."

        }),

        {

          status: 400,

          headers: corsHeaders

        }

      );

    }

    if (!password) {

      return new Response(

        JSON.stringify({

          success: false,

          error: "Password is required."

        }),

        {

          status: 400,

          headers: corsHeaders

        }

      );

    }

    const supabase =
      createClient(
        url,
        serviceRoleKey
      );

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

      default:

        console.log("INVALID ROLE =", role);

        return new Response(

          JSON.stringify({

            success: false,

            error: "Invalid role."

          }),

          {

            status: 400,

            headers: corsHeaders

          }

        );

    }

    console.log("TABLE =", table);
    console.log("EMAIL COLUMN =", emailColumn);

    const {

      data: user,
      error: fetchError

    } = await supabase

      .from(table)

      .select("auth_user_id")

      .eq(emailColumn, email.trim())

      .maybeSingle();

    console.log("FETCH ERROR =", fetchError);
    console.log("USER =", user);

    if (fetchError) {

      console.error("DATABASE FETCH FAILED");
      console.error(fetchError);

      return new Response(

        JSON.stringify({

          success: false,

          error: fetchError.message

        }),

        {

          status: 500,

          headers: corsHeaders

        }

      );

    }

    if (!user) {

      console.error("NO USER FOUND");

      return new Response(

        JSON.stringify({

          success: false,

          error: "User not found."

        }),

        {

          status: 404,

          headers: corsHeaders

        }

      );

    }

    console.log("AUTH USER ID =", user.auth_user_id);

    if (!user.auth_user_id) {

      console.error("AUTH USER ID IS NULL");

      return new Response(

        JSON.stringify({

          success: false,

          error: "auth_user_id is missing."

        }),

        {

          status: 404,

          headers: corsHeaders

        }

      );

    }

    console.log("CALLING updateUserById...");

    const {

      data: updatedUser,
      error: updateError

    } = await supabase.auth.admin.updateUserById(

      user.auth_user_id,

      {

        password

      }

    );

    console.log("UPDATE RESULT =", updatedUser);
    console.log("UPDATE ERROR =", updateError);

    if (updateError) {

      console.error("PASSWORD UPDATE FAILED");
      console.error(updateError);

      return new Response(

        JSON.stringify({

          success: false,

          error: updateError.message

        }),

        {

          status: 500,

          headers: corsHeaders

        }

      );

    }

    console.log("PASSWORD UPDATED SUCCESSFULLY");

    return new Response(

      JSON.stringify({

        success: true

      }),

      {

        status: 200,

        headers: corsHeaders

      }

    );

  }

  catch (error: any) {

    console.error("OUTER CATCH");
    console.error(error);
    console.error(error?.stack);

    return new Response(

      JSON.stringify({

        success: false,

        error:
          error?.message ??
          "Unknown error."

      }),

      {

        status: 500,

        headers: corsHeaders

      }

    );

  }

});