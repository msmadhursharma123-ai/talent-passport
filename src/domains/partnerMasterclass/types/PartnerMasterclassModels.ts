export interface PartnerMasterclassVerificationCandidate {
  studentUuid: string;
  rollNumber: string;
  studentName: string;
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName: string;
  parentPhone: string;
  parentEmail: string;
  rank: number;
  totalCredits: number;
  masterclassMonth: string;
}

export interface PartnerMasterclassVerificationResult {
  verified: boolean;
  candidates: PartnerMasterclassVerificationCandidate[];
  message: string;
}

export interface PartnerMasterclassHistoryRow {
  id: string;
  partnerUuid: string;
  studentUuid: string;
  rollNumber: string;
  studentName: string;
  verifiedAt: string;
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName: string;
  parentPhone: string;
  parentEmail: string;
  masterclassMonth: string;
}

export interface PartnerMasterclassHistoryFilters {
  studentName: string;
  rollNumber: string;
  className: string;
  schoolName: string;
  month: string;
  year: string;
  timePeriod: PartnerMasterclassTimePeriod;
  customStart: string;
  customEnd: string;
}

export type PartnerMasterclassTimePeriod =
  | "LAST_30_DAYS"
  | "LAST_60_DAYS"
  | "LAST_90_DAYS"
  | "CUSTOM";
