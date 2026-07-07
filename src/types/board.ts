export interface Board {
  id: string;

  boardCode: string;

  boardName: string;

  shortName: string;

  description?: string;

  country?: string;

  educationLevel?: string;

  website?: string;

  displayOrder: number;

  isActive: boolean;

  createdBy?: string;

  updatedBy?: string;

  createdAt?: string;

  updatedAt?: string;
}