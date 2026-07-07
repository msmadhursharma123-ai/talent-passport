import type { Organization } from "../types/organization";

/* ============================================================
   DATABASE → MODEL
============================================================ */

export function mapOrganizationFromDatabase(
  row: any
): Organization {
  return {
    id: row.id,

    organizationCode: row.organization_code,

    organizationName: row.organization_name,

    organizationType: row.organization_type,

    boardId: row.board_id,

    academicYearId: row.academic_year_id,

    email: row.email,

    phone: row.phone,

    website: row.website,

    principalName: row.principal_name,

    addressLine1: row.address_line_1,

    addressLine2: row.address_line_2,

    city: row.city,

    state: row.state,

    country: row.country,

    postalCode: row.postal_code,

    logoUrl: row.logo_url,

    isActive: row.is_active,

    createdBy: row.created_by,

    updatedBy: row.updated_by,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

function createOrganizationSlug(
  name?: string
) {
  return (
    name
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ?? ""
  );
}
/* ============================================================
   MODEL → DATABASE
============================================================ */

export function mapOrganizationToDatabase(
  organization: Partial<Organization>
) {
  return {
    ...(organization.id
      ? {
          id: organization.id,
        }
      : {}),

    organization_code:
      organization.organizationCode,

    organization_name:
      organization.organizationName,

organization_slug:
  createOrganizationSlug(
    organization.organizationName
  ),

    organization_type:
      organization.organizationType,

    board_id:
      organization.boardId,

    academic_year_id:
      organization.academicYearId,

    email:
      organization.email,

    phone:
      organization.phone,

    website:
      organization.website,

    principal_name:
      organization.principalName,

    address_line_1:
      organization.addressLine1,

    address_line_2:
      organization.addressLine2,

    city:
      organization.city,

    state:
      organization.state,

    country:
      organization.country,

    postal_code:
      organization.postalCode,

    logo_url:
      organization.logoUrl,

    is_active:
      organization.isActive,

    created_by:
      organization.createdBy,

    updated_by:
      organization.updatedBy,
  };
}