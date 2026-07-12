import { PlatformUser, UserRole } from "../types/platformUser";

import { PlatformUserRepository } from "../repository/PlatformUserRepository";

/* ==========================================================
   PRIVATE HELPERS
========================================================== */

async function ensureUserExists(
  id: string,
): Promise<PlatformUser> {

  const user =
    await PlatformUserRepository.getById(id);

  if (!user) {

    throw new Error(
      "User not found.",
    );

  }

  return user;

}

/* ==========================================================
   SERVICE
========================================================== */

export const PlatformAdministrationService = {

  /* ======================================================
     READ
  ====================================================== */

  async loadUsers() {

    return PlatformUserRepository.getAll();

  },

  async loadUser(
    id: string,
  ) {

    return ensureUserExists(id);

  },

  async loadUsersByRole(
    role: UserRole,
  ) {

    return PlatformUserRepository.getByRole(
      role,
    );

  },

  async loadUsersByOrganization(
    organizationId: string,
  ) {

    return PlatformUserRepository.getByOrganization(
      organizationId,
    );

  },

  async refresh() {

    return PlatformUserRepository.refresh();

  },

  /* ======================================================
     DASHBOARD
  ====================================================== */

  async getStatistics() {

    return PlatformUserRepository.getStatistics();

  },

  async getOrganizations() {

    return PlatformUserRepository.getOrganizations();

  },

  async getRoles() {

    return PlatformUserRepository.getRoles();

  },

  /* ======================================================
     PART 2 STARTS HERE
  ====================================================== */

  /* ======================================================
     CREATE
  ====================================================== */

  async createUser(
    role: UserRole,
    form: any,
  ) {

    return PlatformUserRepository.create(
      role,
      form,
    );

  },

  /* ======================================================
     UPDATE
  ====================================================== */

  async updateUser(
    user: PlatformUser,
  ) {

    await ensureUserExists(user.id);

    return PlatformUserRepository.update(
      user,
    );

  },

  /* ======================================================
     DELETE
  ====================================================== */

  async deleteUser(
    role: UserRole,
    id: string,
  ) {

    await ensureUserExists(id);

    await PlatformUserRepository.delete(
      role,
      id,
    );

  },

  async bulkDelete(
    role: UserRole,
    ids: string[],
  ) {

    if (!ids.length) {

      return;

    }

    await PlatformUserRepository.deleteMany(
      role,
      ids,
    );

  },

  /* ======================================================
     STATUS
  ====================================================== */

  async activateUser(
    id: string,
  ) {

    const user =
      await ensureUserExists(id);

    return PlatformUserRepository.activate(
      user,
    );

  },

  async suspendUser(
    id: string,
  ) {

    const user =
      await ensureUserExists(id);

    return PlatformUserRepository.suspend(
      user,
    );

  },

  async archiveUser(
    id: string,
  ) {

    const user =
      await ensureUserExists(id);

    return PlatformUserRepository.archive(
      user,
    );

  },

  /* ======================================================
     BULK STATUS
  ====================================================== */

  async bulkActivate(
    role: UserRole,
    ids: string[],
  ) {

    if (!ids.length) {

      return;

    }

    await PlatformUserRepository.activateMany(
      role,
      ids,
    );

  },

  async bulkSuspend(
    role: UserRole,
    ids: string[],
  ) {

    if (!ids.length) {

      return;

    }

    await PlatformUserRepository.suspendMany(
      role,
      ids,
    );

  },

  async bulkArchive(
    role: UserRole,
    ids: string[],
  ) {

    if (!ids.length) {

      return;

    }

    await PlatformUserRepository.archiveMany(
      role,
      ids,
    );

  },

  /* ======================================================
     ASSIGNMENTS
  ====================================================== */


  /* ======================================================
     PART 3 STARTS HERE
  ====================================================== */

    /* ======================================================
     EXPORT
  ====================================================== */

  async exportUsers() {

    return PlatformUserRepository.exportRows();

  },

  /* ======================================================
     DASHBOARD
  ====================================================== */

  async getDashboard() {

    return PlatformUserRepository.getStatistics();

  },

  /* ======================================================
     LOOKUPS
  ====================================================== */

  async getAvailableRoles() {

    return PlatformUserRepository.getRoles();

  },

  async getAvailableOrganizations() {

    return PlatformUserRepository.getOrganizations();

  },

  /* ======================================================
     REFRESH
  ====================================================== */

  async refreshUsers() {

    return PlatformUserRepository.refresh();

  },

  /* ======================================================
     FUTURE AUTHENTICATION
     (implemented later)
  ====================================================== */

  /*
  async resetPassword(...) {}

  async unlockUser(...) {}

  async sendInvite(...) {}

  async resendInvitation(...) {}
  */

  /* ======================================================
     FUTURE ROLE MIGRATION
     (implemented later)
  ====================================================== */

  /*
  async changeUserRole(...) {}

  This will migrate a user between master tables
  and therefore is intentionally NOT implemented
  in the repository.
  */

};
