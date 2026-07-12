import { PartnerRepository } from "../repository/PartnerRepository";

export const PartnerViewModel = {

  async loadPartners() {
    return PartnerRepository.getAll();
  },

};