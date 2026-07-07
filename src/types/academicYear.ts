export interface AcademicYear {
  id: string;

  organizationId: string;

  academicYearCode: string;

  academicYearName: string;

  startDate: string;

  endDate: string;

  isCurrent: boolean;

  displayOrder: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}