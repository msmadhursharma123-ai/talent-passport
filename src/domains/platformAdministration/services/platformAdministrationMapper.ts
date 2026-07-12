import { PlatformUser, UserRole, UserStatus } from "../types/platformUser";

/* ==========================================================
   Helpers
========================================================== */

function normalizeRole(value: any): UserRole {
  switch ((value ?? "").toString().toLowerCase()) {
    case "student":
      return "student";

    case "teacher":
      return "teacher";

    case "parent":
      return "parent";

    case "partner":
      return "partner";

    case "school_admin":
    case "school admin":
      return "school_admin";

    case "platform_admin":
    case "platform admin":
      return "platform_admin";

    default:
      return "student";
  }
}

function normalizeStatus(value: any): UserStatus {
  switch ((value ?? "").toString().toLowerCase()) {
    case "active":
      return "active";

    case "pending":
      return "pending";

    case "suspended":
      return "suspended";

    case "archived":
      return "archived";

    default:
      return "pending";
  }
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find(
    value =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
}

/* ==========================================================
   Database Row -> PlatformUser
========================================================== */

export function mapPlatformUser(
  row: any,
): PlatformUser {

  return {

    id:
      row.id ??
      "",

    authUserId:
      firstDefined(
        row.auth_user_id,
        row.authUserId,
      ),

    name:
      firstDefined(
        row.name,
        row.full_name,
        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
      ) ?? "",

    email:
      row.email ?? "",

    phone:
      firstDefined(
        row.phone,
        row.mobile,
      ),

    role:
      normalizeRole(
        row.role,
      ),

    status:
      normalizeStatus(
        firstDefined(
          row.account_status,
          row.status,
        ),
      ),

    organizationId:
      firstDefined(
        row.organization_id,
        row.foundation_id,
      ),

    organization:
      firstDefined(
        row.organization,
        row.organization_name,
        row.foundation_name,
        row.school_name,
      ),

    avatarUrl:
      firstDefined(
        row.avatar_url,
        row.avatar,
      ),

    lastLogin:
      firstDefined(
        row.last_login,
        row.lastLogin,
      ),

    createdAt:
      firstDefined(
        row.created_at,
        row.createdAt,
      ),

    updatedAt:
      firstDefined(
        row.updated_at,
        row.updatedAt,
      ),

  };

}

/* ==========================================================
   PlatformUser -> Update DTO
========================================================== */

export function mapUpdatePayload(
  user: PlatformUser,
) {

  return {

    name: user.name,

    email: user.email,

    phone: user.phone,

    avatar_url: user.avatarUrl,

    account_status:
      user.status,

    organization_id:
      user.organizationId,

  };

}

/* ==========================================================
   Create Form -> Insert DTO
========================================================== */

export function mapCreatePayload(
  form: any,
) {

  return {

    first_name:
      form.firstName,

    last_name:
      form.lastName,

    email:
      form.email,

    phone:
      form.phone,

    role:
      normalizeRole(
        form.role,
      ),

    account_status:
      normalizeStatus(
        form.status,
      ),

    organization_id:
      form.organizationId,

  };

}

/* ==========================================================
   Drawer Model
========================================================== */

export function mapDrawerModel(
  user: PlatformUser,
) {

  return {

    ...user,

    displayName:
      user.name,

    initials:
      user.name
        .split(" ")
        .map(x => x[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),

  };

}

/* ==========================================================
   Table Row
========================================================== */

export function mapTableRow(
  user: PlatformUser,
) {

  return {

    id: user.id,

    name: user.name,

    email: user.email,

    role: user.role,

    organization:
      user.organization ?? "-",

    status:
      user.status,

    lastLogin:
      user.lastLogin ?? "-",

  };

}

/* ==========================================================
   Export Row
========================================================== */

export function mapExportRow(
  user: PlatformUser,
) {

  return {

    Name:
      user.name,

    Email:
      user.email,

    Phone:
      user.phone ?? "",

    Role:
      user.role,

    Status:
      user.status,

    Organization:
      user.organization ?? "",

    LastLogin:
      user.lastLogin ?? "",

    Created:
      user.createdAt ?? "",

  };

}