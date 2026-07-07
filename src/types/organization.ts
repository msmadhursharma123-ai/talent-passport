export type OrganizationType =
  | "School"
  | "Academy"
  | "College"
  | "University"
  | "Training Institute"
  | "NGO"
  | "Corporate";

export interface Organization {
  id: string;

  organizationCode: string;

  organizationName: string;

  organizationType: OrganizationType;

  boardId: string | null;

  academicYearId: string | null;

  email: string | null;

  phone: string | null;

  website: string | null;

  principalName: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  country: string;

  postalCode: string | null;

  logoUrl: string | null;

  isActive: boolean;

  createdBy: string | null;

  updatedBy: string | null;

  createdAt: string;

  updatedAt: string;
}