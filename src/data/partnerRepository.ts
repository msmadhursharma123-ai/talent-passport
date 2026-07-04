import { getSupabaseClient } from "../supabaseClient";

import {
  requireIdentity
} from "../services/identityService";

/* ============================================================
   REPOSITORY IDENTITY HELPERS
============================================================ */
function currentPartnerIdentity() {
    return null;
}

/* ============================================================
   CREATE PARTNER
============================================================ */

export async function createPartner(
  partner: any
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  /*
    Future Ready

    When Partner Auth is implemented,
    partner.partner_id can automatically
    come from Identity Kernel.
  */

const partnerId = partner.partner_id;

  /* =====================================
     SAVE TO partner_profiles
  ===================================== */

  const {
    data,
    error
  } =
    await (supabase as any)

      .from("partner_profiles")

      .insert([{

        partner_id:
          partnerId,

        institute_name:
          partner.partner_name,

        institute_city:
          partner.city ?? "",

        email:
          partner.email,

        mobile_number:
          partner.phone,

        skill_focus:
          partner.specialization ?? []

      }])

      .select()

      .single();

  if (error) {

    console.error(

      "CREATE PARTNER ERROR",

      error

    );

    return null;

  }

  /* =====================================
     SAVE TO partners_master
  ===================================== */

  const {
    error: masterError
  } =
    await (supabase as any)

      .from("partners_master")

      .upsert({

        partner_id:
          partnerId,

        partner_name:
          partner.partner_name,

        category:
          partner.category ??
          "Institute",

        description:
          partner.description ??
          "",

        website:
          partner.website ??
          "",

        email:
          partner.email,

        phone:
          partner.phone,

        specialization:
          partner.specialization ?? [],

        preferred_age_from:
          partner.preferred_age_from ?? null,

        preferred_age_to:
          partner.preferred_age_to ?? null,

        institute_area:
          partner.institute_area ?? "",

        status:
          "active"

      });

  if (masterError) {

    console.error(

      "PARTNERS MASTER ERROR",

      masterError

    );

  }

  return data;

}

/* ============================================================
   FIND PARTNER BY EMAIL
============================================================ */

export async function findPartnerByEmail(
  email: string
) {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data,
    error
  } =
    await (supabase as any)

      .from("partner_profiles")

      .select("*")

      .eq("email", email)

      .single();

  if (error) {
    return null;
  }

  return data;

}