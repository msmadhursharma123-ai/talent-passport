/* ==========================================================
   PLATFORM USER
========================================================== */

export type UserRole =
  | "student"
  | "teacher"
  | "school_admin"
  | "partner"
  | "parent"
  | "platform_admin";

export type UserStatus =
  | "active"
  | "pending"
  | "suspended"
  | "archived";

export interface PlatformUser {

  id: string;

  authUserId?: string;

  name: string;

  email: string;

  phone?: string;

  role: UserRole;

  status: UserStatus;

  organizationId?: string;

  organization?: string;

  avatarUrl?: string;

  lastLogin?: string;

  createdAt?: string;

  updatedAt?: string;

}