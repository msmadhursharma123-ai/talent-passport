export type TeacherAccountStatus =
  | "pending"
  | "active"
  | "inactive"
  | "suspended"
  | "archived";

export interface Teacher {

  id: string;

  teacherUuid: string;

  teacherId: string;

  authUserId: string | null;

  fullName: string;

  email: string;

  phone: string | null;

  organizationUuid: string | null;

  organizationName: string | null;

  schoolUuid: string | null;

  schoolName: string | null;

  boardUuid: string | null;

  department: string | null;

  designation: string | null;

  profileCompleted: boolean;

  isActive: boolean;

  accountStatus: TeacherAccountStatus;

  createdAt: string;

  updatedAt: string | null;

  lastLoginAt: string | null;
}