export type AcademicYearStatus = "PLANNED" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type AcademicYearOnboardingRole = "student" | "teacher";
export type AcademicYearOnboardingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface SchoolAcademicYear {
  id: string;
  schoolUuid: string;
  academicYearId: string | null;
  academicYearCode: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  isCurrent: boolean;
  onboardingOpen?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  closedAt?: string | null;
}

export interface AcademicYearOnboardingRecord {
  id: string;
  schoolUuid: string;
  schoolAcademicYearId: string;
  authUserId: string;
  role: AcademicYearOnboardingRole;
  studentUuid?: string | null;
  teacherUuid?: string | null;
  status: AcademicYearOnboardingStatus;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface AcademicYearContextSnapshot {
  schoolUuid: string;
  academicYear: SchoolAcademicYear;
  isHistorical: boolean;
  canMutateAcademicData: boolean;
}
