import { getSupabaseClient } from "../../../supabaseClient";

import type { Organization } from "../../../types/organization";

import {
  mapOrganizationFromDatabase,
  mapOrganizationToDatabase,
} from "../../../services/organizationMapper";

/* ============================================================
   GET ALL ORGANIZATIONS
============================================================ */

export async function getOrganizations(): Promise<Organization[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("organizations_master")
    .select("*")
    .order("organization_name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET ORGANIZATIONS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapOrganizationFromDatabase
  );
}

/* ============================================================
   GET ORGANIZATION
============================================================ */

export async function getOrganizationById(
  organizationId: string
): Promise<Organization | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }


  
  const { data, error } = await (supabase as any)
    .from("organizations_master")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (error) {
    console.error(
      "GET ORGANIZATION ERROR",
      error
    );

    return null;
  }

  return mapOrganizationFromDatabase(
    data
  );
}

/* ============================================================
   CHECK ORGANIZATION CODE
============================================================ */

export async function organizationCodeExists(
  organizationCode: string,
  excludeOrganizationId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from("organizations_master")
    .select("id")
    .eq(
      "organization_code",
      organizationCode
    );

  if (excludeOrganizationId) {
    query = query.neq(
      "id",
      excludeOrganizationId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK ORGANIZATION CODE ERROR",
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}

/* ============================================================
   CREATE ORGANIZATION
============================================================ */

export async function createOrganization(
  organization: Partial<Organization>
): Promise<Organization | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

const payload =
  mapOrganizationToDatabase(
    organization
  );

if (
  payload.organization_code &&
  await organizationCodeExists(
    payload.organization_code
  )
) {
  console.error(
    "ORGANIZATION CODE ALREADY EXISTS"
  );

  return null;
}

  const { data, error } = await (supabase as any)
    .from("organizations_master")
    .insert([payload])
    .select()
    .single();

if (error) {
  console.error(
    "CREATE ORGANIZATION ERROR"
  );

  console.error(error);

  console.error("PAYLOAD");

  console.log(payload);

  return null;
}

  return mapOrganizationFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE ORGANIZATION
============================================================ */

export async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>
): Promise<Organization | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

const payload =
  mapOrganizationToDatabase(
    updates
  );

if (
  payload.organization_code &&
  await organizationCodeExists(
    payload.organization_code,
    organizationId
  )
) {
  console.error(
    "ORGANIZATION CODE ALREADY EXISTS"
  );

  return null;
}

  const { data, error } = await (supabase as any)
    .from("organizations_master")
    .update(payload)
    .eq("id", organizationId)
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE ORGANIZATION ERROR",
      error
    );

    return null;
  }

  return mapOrganizationFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE ORGANIZATION
============================================================ */

export async function archiveOrganization(
  organizationId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("organizations_master")
    .update({
      is_active: false,
    })
    .eq("id", organizationId);

  if (error) {
    console.error(
      "ARCHIVE ORGANIZATION ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE ORGANIZATION
============================================================ */

export async function restoreOrganization(
  organizationId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("organizations_master")
    .update({
      is_active: true,
    })
    .eq("id", organizationId);

  if (error) {
    console.error(
      "RESTORE ORGANIZATION ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE ORGANIZATION
============================================================ */

export async function deleteOrganization(
  organizationId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("organizations_master")
    .delete()
    .eq("id", organizationId);

  if (error) {
    console.error(
      "DELETE ORGANIZATION ERROR",
      error
    );

    return false;
  }

  return true;
}