import { useCallback, useEffect, useState } from "react";

import type { Organization } from "../../../types/organization";

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  archiveOrganization,
  restoreOrganization,
  deleteOrganization,
} from "../repository/OrganizationRepository";

export function useOrganizationViewModel() {
  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadOrganizations =
    useCallback(async () => {
      setLoading(true);

      const data =
        await getOrganizations();

      setOrganizations(data);

      setLoading(false);
    }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  async function addOrganization(
    organization: Partial<Organization>
  ) {
    const created =
      await createOrganization(
        organization
      );

    if (created) {
      await loadOrganizations();
    }

    return created;
  }

  async function editOrganization(
    organizationId: string,
    updates: Partial<Organization>
  ) {
    const updated =
      await updateOrganization(
        organizationId,
        updates
      );

    if (updated) {
      await loadOrganizations();
    }

    return updated;
  }

  async function archive(
    organizationId: string
  ) {
    const success =
      await archiveOrganization(
        organizationId
      );

    if (success) {
      await loadOrganizations();
    }
  }

  async function restore(
    organizationId: string
  ) {
    const success =
      await restoreOrganization(
        organizationId
      );

    if (success) {
      await loadOrganizations();
    }
  }

  async function remove(
    organizationId: string
  ) {
    const success =
      await deleteOrganization(
        organizationId
      );

    if (success) {
      await loadOrganizations();
    }
  }

  return {
    organizations,

    loading,

    refresh: loadOrganizations,

    addOrganization,

    editOrganization,

    archive,

    restore,

    remove,
  };
}