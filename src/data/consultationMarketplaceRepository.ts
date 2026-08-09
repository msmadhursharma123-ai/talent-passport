import {
  getSupabaseClient,
} from "../supabaseClient";

import {
  requirePartnerIdentity,
} from "./identityService";

/* ============================================================
   CONSULTATION REPOSITORY
   ------------------------------------------------------------
   This repository is ONLY for Consultation.
   Marketplace must never import from here.
============================================================ */

export async function resolveConsultationMarketplacePartnerId(
  partnerUuid?: string
): Promise<string | null> {

  const supabase = getSupabaseClient() as any;

  if (!supabase) return null;

  const identity = requirePartnerIdentity();

  const uuid =
    partnerUuid ??
    identity.partnerUuid;

  if (!uuid) return null;

  const {
    data,
    error,
  } = await supabase
    .from("marketplace_partners")
    .select("id")
    .eq("partner_uuid", uuid)
    .maybeSingle();

  if (error) {
    console.error(
      "CONSULTATION MARKETPLACE PARTNER RESOLVE ERROR",
      error
    );
    return null;
  }

  return data?.id ?? null;
}

/* ============================================================
   Resolve Partner Profile UUID
============================================================ */

export async function resolveConsultationPartnerUuid() {

  const identity =
    requirePartnerIdentity();

  return identity.partnerUuid;
}

/* ============================================================
   Resolve Partner Text ID
============================================================ */

export async function resolveConsultationPartnerTextId() {

  const identity =
    requirePartnerIdentity();

  return identity.partnerId;
}