import { PlatformAdminRepository } from "../repository/PlatformAdminRepository";

export const PlatformAdminViewModel = {

  async loadPlatformAdmins() {
    return PlatformAdminRepository.getAll();
  },

};