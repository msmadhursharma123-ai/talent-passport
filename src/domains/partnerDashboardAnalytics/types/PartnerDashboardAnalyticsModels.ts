export type PartnerDashboardActivityType =
  | "incoming_request"
  | "lead"
  | "masterclass"
  | "opportunity";

export interface PartnerDashboardKpis {
  totalStudentLeads: number;
  workshopsConducted: number;
  scholarshipsOffered: number;
  totalAdmissionsGenerated: number;
}

export interface PartnerDashboardOfferSummary {
  scholarshipCount: number;
  workshopCount: number;
  masterclassCount: number;
}

export interface PartnerDashboardSchoolSummary {
  schoolName: string;
  leads: number;
  incomingRequests: number;
  allocatedStudents: number;
  masterclasses: number;
  admissions: number;
  totalActivity: number;
}

export interface PartnerDashboardRecentActivity {
  id: string;
  type: PartnerDashboardActivityType;
  title: string;
  studentName?: string;
  schoolName?: string;
  status?: string;
  createdAt: string;
}

export interface PartnerDashboardAnalytics {
  kpis: PartnerDashboardKpis;
  offers: PartnerDashboardOfferSummary;
  schools: PartnerDashboardSchoolSummary[];
  recentActivity: PartnerDashboardRecentActivity[];
  lastUpdatedAt: string;
}

export interface PartnerDashboardAnalyticsSourceData {
  incomingRequests: any[];
  leads: any[];
  opportunities: any[];
  allocatedStudents: any[];
  masterclassHistory: any[];
}
