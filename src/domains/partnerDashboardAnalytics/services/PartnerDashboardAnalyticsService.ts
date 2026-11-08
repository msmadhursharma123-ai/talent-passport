import { loadPartnerDashboardSourceData } from "../repository/PartnerDashboardAnalyticsRepository";
import type {
  PartnerDashboardAnalytics,
  PartnerDashboardRecentActivity,
  PartnerDashboardSchoolSummary,
} from "../types/PartnerDashboardAnalyticsModels";

function valueOf(row: any, ...keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
}

function schoolKey(value: string) {
  return value.trim().toLowerCase();
}

function buildSchools(source: Awaited<ReturnType<typeof loadPartnerDashboardSourceData>>) {
  const map = new Map<string, PartnerDashboardSchoolSummary>();

  const ensure = (name: string) => {
    const display = name.trim() || "Unknown school";
    const key = schoolKey(display);
    if (!map.has(key)) {
      map.set(key, {
        schoolName: display,
        leads: 0,
        incomingRequests: 0,
        allocatedStudents: 0,
        masterclasses: 0,
        admissions: 0,
        totalActivity: 0,
      });
    }
    return map.get(key)!;
  };

  for (const row of source.leads) {
    const school = ensure(valueOf(row, "school_name", "schoolName"));
    school.leads += 1;
    school.totalActivity += 1;
    if (String(row?.status ?? "") === "admission_completed") school.admissions += 1;
  }

  for (const row of source.incomingRequests) {
    const school = ensure(valueOf(row, "school_name", "schoolName"));
    school.incomingRequests += 1;
    school.totalActivity += 1;
  }

  for (const row of source.allocatedStudents) {
    const school = ensure(valueOf(row, "school_name", "schoolName"));
    school.allocatedStudents += 1;
  }

  for (const row of source.masterclassHistory) {
    const school = ensure(valueOf(row, "schoolName", "school_name"));
    school.masterclasses += 1;
    school.totalActivity += 1;
  }

  // Talent Discovery opportunities are activity for the school summary,
  // but are deliberately not added to any lead/allocated count.
  for (const row of source.opportunities) {
    const school = ensure(valueOf(row, "schoolName", "school_name"));
    school.totalActivity += 1;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.totalActivity !== a.totalActivity) return b.totalActivity - a.totalActivity;
    return a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: "base" });
  });
}

function buildRecentActivity(source: Awaited<ReturnType<typeof loadPartnerDashboardSourceData>>) {
  const activities: PartnerDashboardRecentActivity[] = [];

  source.incomingRequests.forEach((row: any) => {
    activities.push({
      id: `incoming:${String(row?.id ?? "")}`,
      type: "incoming_request",
      title: `${valueOf(row, "request_type") || "Incoming request"}`,
      studentName: valueOf(row, "requester_name", "student_name", "studentName"),
      schoolName: valueOf(row, "school_name", "schoolName"),
      status: valueOf(row, "status"),
      createdAt: valueOf(row, "created_at"),
    });
  });

  source.leads.forEach((row: any) => {
    activities.push({
      id: `lead:${String(row?.id ?? "")}`,
      type: "lead",
      title: "Student lead",
      studentName: valueOf(row, "student_name", "studentName"),
      schoolName: valueOf(row, "school_name", "schoolName"),
      status: valueOf(row, "status"),
      createdAt: valueOf(row, "created_at"),
    });
  });

  source.opportunities.forEach((row: any) => {
    activities.push({
      id: `opportunity:${String(row?.id ?? "")}`,
      type: "opportunity",
      title: valueOf(row, "title") || "Partner opportunity",
      studentName: valueOf(row, "studentName", "student_name"),
      schoolName: valueOf(row, "schoolName", "school_name"),
      status: valueOf(row, "status"),
      createdAt: valueOf(row, "createdAt", "created_at"),
    });
  });

  source.masterclassHistory.forEach((row: any) => {
    activities.push({
      id: `masterclass:${String(row?.id ?? "")}`,
      type: "masterclass",
      title: "Masterclass conducted",
      studentName: valueOf(row, "studentName", "student_name"),
      schoolName: valueOf(row, "schoolName", "school_name"),
      createdAt: valueOf(row, "verifiedAt", "verified_at"),
    });
  });

  return activities
    .filter((activity) => activity.createdAt)
    .sort((a, b) => {
      const dateDelta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDelta !== 0) return dateDelta;
      return b.id.localeCompare(a.id);
    })
    .slice(0, 10);
}

export async function loadPartnerDashboardAnalytics(): Promise<PartnerDashboardAnalytics> {
  const source = await loadPartnerDashboardSourceData();
  const schools = buildSchools(source);
  const recentActivity = buildRecentActivity(source);

  const scholarshipCount = source.opportunities.filter((row: any) => row.type === "Scholarship").length;
  const workshopCount = source.opportunities.filter((row: any) => row.type === "Workshop").length;
  const masterclassCount = source.masterclassHistory.length;

  // Partner Home's blue workshop KPI is a Partner Portal workshop metric.
  // The actual workshop dataset is partner_workshop_offers, represented here
  // as type === "Workshop" in source.opportunities. Masterclass check-ins are
  // a separate feature and must not be substituted for workshop activity.
  return {
    kpis: {
      totalStudentLeads: source.leads.length,
      workshopsConducted: workshopCount,
      scholarshipsOffered: scholarshipCount,
      totalAdmissionsGenerated: source.leads.filter(
        (row: any) => String(row?.status ?? "") === "admission_completed",
      ).length,
    },
    offers: {
      scholarshipCount,
      workshopCount,
      masterclassCount,
    },
    schools,
    recentActivity,
    lastUpdatedAt: new Date().toISOString(),
  };
}
