import type {
  MarketplacePartner
} from "../types/marketplace";

import {

  getMarketplacePartners,

  getFeaturedMarketplacePartners,

  searchMarketplacePartners,

  getMarketplacePartnersByCategoryAndSkill

} from "../data/marketplaceRepository";

/* ============================================================
   MARKETPLACE SERVICE

   Responsibilities

   • Business orchestration
   • Filtering
   • Recommendation ordering
   • Future personalization

   Never talks directly to Supabase.
   Always consumes repositories.
============================================================ */

/* ============================================================
   NORMALIZATION HELPERS
============================================================ */

function normalize(
  value: string
): string {

  return value.trim();

}

/* ============================================================
   GET ALL PARTNERS
============================================================ */

export async function
getMarketplacePartnersService():
Promise<MarketplacePartner[]> {

  return await getMarketplacePartners();

}

/* ============================================================
   GET FEATURED PARTNERS
============================================================ */

export async function
getFeaturedPartnersService():
Promise<MarketplacePartner[]> {

  return await getFeaturedMarketplacePartners();

}

/* ============================================================
   SEARCH PARTNERS
============================================================ */

export async function
searchPartnersService(
  keyword: string
): Promise<MarketplacePartner[]> {

  const searchTerm =
    normalize(keyword);

  if (!searchTerm) {

    return getMarketplacePartnersService();

  }

  return await searchMarketplacePartners(
    searchTerm
  );

}

/* ============================================================
   FILTER BY CATEGORY & SKILL
============================================================ */

export async function
getPartnersByCategoryAndSkill(

  category: string,

  skill: string

): Promise<MarketplacePartner[]> {

  const normalizedCategory =
    normalize(category);

  const normalizedSkill =
    normalize(skill);

  return await
    getMarketplacePartnersByCategoryAndSkill(

      normalizedCategory,

      normalizedSkill

    );

}

/* ============================================================
   RECOMMENDED PARTNERS

   Current Strategy

   1. Featured First
   2. Highest Rating

   Future

   • Identity-aware recommendations
   • Student DNA
   • Talent Passport
   • Skill Graph
============================================================ */

export async function
getRecommendedPartners(

  category: string,

  skill: string

): Promise<MarketplacePartner[]> {

  /*
    Future Auth

    const identity =
      requireIdentity();

    Personalize using:

    identity.studentUuid
    identity.studentCode
    identity.skills
    identity.passport
  */

  const partners =

    await getPartnersByCategoryAndSkill(

      category,

      skill

    );

  return [...partners].sort(

    (a, b) => {

      if (
        a.featured &&
        !b.featured
      ) {

        return -1;

      }

      if (
        !a.featured &&
        b.featured
      ) {

        return 1;

      }

      if (
        a.rating !==
        b.rating
      ) {

        return (
          b.rating -
          a.rating
        );

      }

      return a.name.localeCompare(
        b.name
      );

    }

  );

}