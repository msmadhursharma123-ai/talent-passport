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

  const {
    data: authData
  } = await supabase.auth.getUser();

  const authUser =
    authData.user;

  if (!authUser) {
    console.error(
      "CREATE PARTNER: authenticated user not found."
    );
    return null;
  }

  const partnerId =
    partner.partner_id;

  /*
   * IMPORTANT:
   * Partner registration itself is onboarding. If the browser/laptop is
   * interrupted before the first Partner Portal render, the next attempt
   * must UPDATE the existing incomplete profile rather than create a
   * duplicate partner.
   */
  const {
    data: existingPartner
  } = await (supabase as any)
    .from("partner_profiles")
    .select("*")
    .eq(
      "auth_user_id",
      authUser.id
    )
    .maybeSingle();

  const partnerUuid =
    existingPartner?.partner_uuid ??
    crypto.randomUUID();

  const partnerPayload = {
    partner_id: partnerId,
    partner_uuid: partnerUuid,
    auth_user_id: authUser.id,
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
  };

  let data: any = null;
  let error: any = null;

  if (existingPartner) {

    const result =
      await (supabase as any)
        .from("partner_profiles")
        .update(partnerPayload)
        .eq(
          "partner_uuid",
          partnerUuid
        )
        .select()
        .single();

    data = result.data;
    error = result.error;

  } else {

    const result =
      await (supabase as any)
        .from("partner_profiles")
        .insert([partnerPayload])
        .select()
        .single();

    data = result.data;
    error = result.error;

    if (
      error?.code === "23505" &&
      String(error?.message ?? "")
        .toLowerCase()
        .includes("email")
    ) {

      const {
        data: duplicatePartner
      } = await (supabase as any)
        .from("partner_profiles")
        .select("*")
        .eq(
          "email",
          partner.email
        )
        .maybeSingle();

      if (
        duplicatePartner &&
        duplicatePartner.auth_user_id === authUser.id
      ) {

        const retry =
          await (supabase as any)
            .from("partner_profiles")
            .update(partnerPayload)
            .eq(
              "partner_uuid",
              duplicatePartner.partner_uuid
            )
            .select()
            .single();

        data = retry.data;
        error = retry.error;
      }
    }
  }

  if (error) {
    console.error(
      "CREATE / UPDATE PARTNER ERROR",
      error
    );
    return null;
  }

  if (!data) {
    return null;
  }

  /*
   * Keep partners_master synchronized with the same partner UUID.
   */
  const {
    error: masterError
  } =
    await (supabase as any)
      .from("partners_master")
      .upsert({
        partner_id:
          partnerId,
        partner_uuid:
          partnerUuid,
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

  /*
   * Marketplace partner:
   * update an existing row on onboarding retry; insert only on first
   * registration.
   */
  const {
    data: existingMarketplace
  } =
    await (supabase as any)
      .from("marketplace_partners")
      .select("id")
      .eq(
        "partner_uuid",
        partnerUuid
      )
      .maybeSingle();

  const marketplacePayload = {
    partner_uuid:
      partnerUuid,
    name:
      partner.partner_name,
    slug:
      partner.partner_name
        .toLowerCase()
        .replace(/\s+/g, "-"),
    description:
      partner.description ??
      "",
    city:
      partner.city ?? "",
    state:
      partner.state ?? "",
    country:
      "India",
    website:
      partner.website ?? null,
    email:
      partner.email,
    phone:
      partner.phone,
    category:
      partner.category ??
      "Activity Coaching",
    skills:
      partner.specialization ?? [],
    consultation_duration:
      45,
    consultation_credits:
      60,
    verified:
      true,
    featured:
      false,
    active:
      true
  };

  if (existingMarketplace?.id) {

    const {
      error: marketplaceError
    } =
      await (supabase as any)
        .from("marketplace_partners")
        .update(marketplacePayload)
        .eq(
          "id",
          existingMarketplace.id
        );

    if (marketplaceError) {
      console.error(
        "MARKETPLACE PARTNER UPDATE ERROR",
        marketplaceError
      );
    }

  } else {

    const {
      error: marketplaceError
    } =
      await (supabase as any)
        .from("marketplace_partners")
        .insert({
          id:
            crypto.randomUUID(),
          ...marketplacePayload
        });

    if (marketplaceError) {
      console.error(
        "MARKETPLACE PARTNER INSERT ERROR",
        marketplaceError
      );
    }
  }

  return {
    ...data,
    partner_uuid:
      partnerUuid
  };
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