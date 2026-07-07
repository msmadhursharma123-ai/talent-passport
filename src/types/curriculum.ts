export interface Curriculum {
  id: string;

  organizationId: string;

organizationName?: string;

  curriculumCode: string;

  curriculumName: string;

  description?: string;

  displayOrder: number;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}