import { getSupabaseClient } from "../supabaseClient";

import type {
  MarketplacePartner,
  MarketplaceMentor,
  PartnerGalleryImage
} from "../types/marketplace";

function mapPartner(partner: any): MarketplacePartner {

  return {

    ...partner,

    logoUrl:
      partner.logo_url ?? "",

    coverImageUrl:
      partner.cover_image_url ?? "",

    totalReviews:
      partner.total_reviews ?? 0,

    studentsMentored:
      partner.students_mentored ?? 0,

    experience:
      partner.years_experience ?? 0,

    consultationDuration:
      partner.consultation_duration ?? 45,

    credits:
      partner.consultation_credits ?? 60,

    skills:
      Array.isArray(partner.skills)
        ? partner.skills
        : [],

    languages:
      Array.isArray(partner.languages)
        ? partner.languages
        : [],

    specializations:
      Array.isArray(partner.specializations)
        ? partner.specializations
        : []

  };

}

function mapMentor(
  mentor: any
): MarketplaceMentor {

  return {

    ...mentor,

    fullName:
      mentor.full_name,

    partnerId:
      mentor.partner_id,

    profilePhoto:
      mentor.profile_photo,

    totalReviews:
      mentor.total_reviews ?? 0,

    studentsMentored:
      mentor.students_mentored ?? 0,

    consultationDuration:
      mentor.consultation_duration ?? 45,

    credits:
      mentor.consultation_credits ?? 60,

    languages:
      Array.isArray(mentor.languages)
        ? mentor.languages
        : [],

    specializations:
      Array.isArray(mentor.specializations)
        ? mentor.specializations
        : []

  };

}

/* ============================================================
   MARKETPLACE PARTNERS
============================================================ */



export async function getMarketplacePartners(): Promise<MarketplacePartner[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(mapPartner);

}

export async function getFeaturedMarketplacePartners(): Promise<MarketplacePartner[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("rating", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(mapPartner);

}

export async function getMarketplacePartnerById(
  partnerId: string
): Promise<MarketplacePartner | null> {

  const supabase = getSupabaseClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("*")
    .eq("id", partnerId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data
    ? mapPartner(data)
    : null;

}

export async function getMarketplacePartnerBySlug(
  slug: string
): Promise<MarketplacePartner | null> {

  const supabase = getSupabaseClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data
    ? mapPartner(data)
    : null;

}

/* ============================================================
   PARTNER MENTORS
============================================================ */

export async function getPartnerMentors(
  partnerId: string
): Promise<MarketplaceMentor[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partner_mentors")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(mapMentor);

}

/* ============================================================
   PARTNER GALLERY
============================================================ */

export async function getPartnerGallery(
  partnerId: string
): Promise<PartnerGalleryImage[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partner_gallery")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("active", true)
    .order("display_order", {
      ascending: true
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];

}

/* ============================================================
   SEARCH
============================================================ */

export async function searchMarketplacePartners(
  keyword: string
): Promise<MarketplacePartner[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("*")
    .or(
      `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
    )
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(mapPartner);

}

/* ============================================================
   FILTER BY CATEGORY & SKILL
============================================================ */

export async function getMarketplacePartnersByCategoryAndSkill(
  category: string,
  skill: string
): Promise<MarketplacePartner[]> {

  const supabase = getSupabaseClient();

  if (!supabase) return [];

  let query = supabase
    .from("marketplace_partners")
    .select("*")
    .eq("active", true)
    .eq("category", category);

  if (skill.trim() !== "") {
    query = query.contains("skills", [skill]);
  }

  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(mapPartner);

}