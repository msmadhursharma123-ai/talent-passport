import { PlatformUserRepository } from "../repository/PlatformUserRepository";

export const PlatformAdministrationViewModel = {

  async loadUsers() {
    return PlatformUserRepository.getAll();
  },

  async getUser(id: string) {
    return PlatformUserRepository.getById(id);
  },

  async suspendUser(id: string) {
    return PlatformUserRepository.suspend(id);
  },

  async activateUser(id: string) {
    return PlatformUserRepository.activate(id);
  },

  async archiveUser(id: string) {
    return PlatformUserRepository.archive(id);
  },

};