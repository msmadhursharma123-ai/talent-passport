import { UserRole } from "../types/platformUser";

/* ==========================================================
   PLATFORM ADMINISTRATION CONFIGURATION
   Single source of truth for every registry.
========================================================== */

export interface RoleConfiguration {

  role: UserRole;

  displayName: string;

  pluralName: string;

  table: string;

  view: string;

  primaryKey: string;

  authIdColumn: string;

  statusColumn: string;

  organizationColumn: string;

  organizationNameColumn: string;

  emailColumn: string;

  phoneColumn: string;

  avatarColumn: string;

  createdAtColumn: string;

  updatedAtColumn: string;

  lastLoginColumn: string;

  supportsSchool: boolean;

  supportsDepartment: boolean;

  supportsClass: boolean;

  supportsSection: boolean;

  supportsSubject: boolean;

  supportsChildren: boolean;

  supportsPartnerCategory: boolean;

  supportsPermissions: boolean;

}

/* ==========================================================
   ROLE CONFIGURATION
========================================================== */

export const ROLE_CONFIGURATION: Record<UserRole, RoleConfiguration> = {

  student: {

    role: "student",

    displayName: "Student",

    pluralName: "Students",

    table: "students_master",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "account_status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: true,

    supportsDepartment: false,

    supportsClass: true,

    supportsSection: true,

    supportsSubject: false,

    supportsChildren: false,

    supportsPartnerCategory: false,

    supportsPermissions: false,

  },

  teacher: {

    role: "teacher",

    displayName: "Teacher",

    pluralName: "Teachers",

    table: "teachers_master",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "account_status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: true,

    supportsDepartment: true,

    supportsClass: false,

    supportsSection: false,

    supportsSubject: true,

    supportsChildren: false,

    supportsPartnerCategory: false,

    supportsPermissions: false,

  },

  parent: {

    role: "parent",

    displayName: "Parent",

    pluralName: "Parents",

    table: "parents_master",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "account_status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: true,

    supportsDepartment: false,

    supportsClass: false,

    supportsSection: false,

    supportsSubject: false,

    supportsChildren: true,

    supportsPartnerCategory: false,

    supportsPermissions: false,

  },

  partner: {

    role: "partner",

    displayName: "Partner",

    pluralName: "Partners",

    table: "partners_master",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: false,

    supportsDepartment: false,

    supportsClass: false,

    supportsSection: false,

    supportsSubject: false,

    supportsChildren: false,

    supportsPartnerCategory: true,

    supportsPermissions: false,

  },

  school_admin: {

    role: "school_admin",

    displayName: "School Administrator",

    pluralName: "School Administrators",

    table: "school_admins",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "account_status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: true,

    supportsDepartment: true,

    supportsClass: false,

    supportsSection: false,

    supportsSubject: false,

    supportsChildren: false,

    supportsPartnerCategory: false,

    supportsPermissions: true,

  },

  platform_admin: {

    role: "platform_admin",

    displayName: "Platform Administrator",

    pluralName: "Platform Administrators",

    table: "platform_admins",

    view: "platform_users_view",

    primaryKey: "id",

    authIdColumn: "auth_user_id",

    statusColumn: "account_status",

    organizationColumn: "organization_id",

    organizationNameColumn: "organization",

    emailColumn: "email",

    phoneColumn: "phone",

    avatarColumn: "avatar_url",

    createdAtColumn: "created_at",

    updatedAtColumn: "updated_at",

    lastLoginColumn: "last_login",

    supportsSchool: false,

    supportsDepartment: true,

    supportsClass: false,

    supportsSection: false,

    supportsSubject: false,

    supportsChildren: false,

    supportsPartnerCategory: false,

    supportsPermissions: true,

  },

};

/* ==========================================================
   COMMON STATUS VALUES
========================================================== */

export const USER_STATUSES = [

  "active",

  "pending",

  "suspended",

  "archived",

] as const;

/* ==========================================================
   LOOKUPS
========================================================== */

export function getRoleConfiguration(role: UserRole): RoleConfiguration {

  return ROLE_CONFIGURATION[role];

}

export function getTableName(role: UserRole): string {

  return ROLE_CONFIGURATION[role].table;

}

export function getStatusColumn(role: UserRole): string {

  return ROLE_CONFIGURATION[role].statusColumn;

}

export function getOrganizationColumn(role: UserRole): string {

  return ROLE_CONFIGURATION[role].organizationColumn;

}

export function getViewName(): string {

  return "platform_users_view";

}