import { PlatformUser } from "../types/platformUser";

export function mapPlatformUser(
  row: any,
): PlatformUser {

  return {

    id: row.id,

    authUserId: row.auth_user_id,

    name: row.name,

    email: row.email,

    phone: row.phone,

    role: row.role,

    status: row.status,

    organizationId: row.organization_id,

    organization: row.organization_name,

    avatarUrl: row.avatar_url,

    lastLogin: row.last_login,

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}