import type { MarketplacePartner } from "../types/marketplace";

import {
  getMarketplacePartners,
  getFeaturedMarketplacePartners,
  searchMarketplacePartners,
  getMarketplacePartnersByCategoryAndSkill
} from "../data/marketplaceRepository";

/* ============================================================
   MARKETPLACE SERVICE
============================================================ */

export async function getMarketplacePartnersService(): Promise<MarketplacePartner[]> {
  return await getMarketplacePartners();
}

export async function getFeaturedPartnersService(): Promise<MarketplacePartner[]> {
  return await getFeaturedMarketplacePartners();
}

export async function searchPartnersService(
  keyword: string
): Promise<MarketplacePartner[]> {

  if (!keyword.trim()) {
    return getMarketplacePartnersService();
  }

  return await searchMarketplacePartners(keyword);
}

/* ============================================================
   FILTER PARTNERS
============================================================ */

export async function getPartnersByCategoryAndSkill(
  category: string,
  skill: string
): Promise<MarketplacePartner[]> {

  return await getMarketplacePartnersByCategoryAndSkill(
    category,
    skill
  );

}

/* ============================================================
   FEATURED PARTNERS
============================================================ */

export async function getRecommendedPartners(
  category: string,
  skill: string
): Promise<MarketplacePartner[]> {

  const partners =
    await getPartnersByCategoryAndSkill(
      category,
      skill
    );

  return partners.sort(
    (a, b) => {

      if (a.featured && !b.featured)
        return -1;

      if (!a.featured && b.featured)
        return 1;

      return b.rating - a.rating;

    }
  );

}