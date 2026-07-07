export interface Section {
  id: string;

  organizationId: string;
  organizationName: string;

  curriculumId: string;
  curriculumName: string;

  classId: string;
  className: string;

  sectionCode: string;
  sectionName: string;

  displayOrder: number;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}