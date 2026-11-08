import { getSupabaseClient } from "../../../supabaseClient";
import { requirePartnerIdentity } from "../../../services/identityService";
import type { PartnerMasterclassHistoryRow } from "../../partnerMasterclass/types/PartnerMasterclassModels";
import type {
  PartnerDashboardAnalyticsSourceData,
} from "../types/PartnerDashboardAnalyticsModels";

const PAGE_SIZE = 1000;

function getSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase as any;
}

async function fetchAllPages(
  buildQuery: (from: number, to: number) => any,
): Promise<any[]> {
  const rows: any[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) return rows;
  }
}

async function resolveCanonicalPartnerUuid(
  supabase: any,
  partnerId: string,
  identityPartnerUuid: string,
): Promise<string> {
  // partner_id is the stable Partner Portal identifier used by the other
  // dashboard sources. The Masterclass ledger uses the canonical
  // partner_profiles.partner_uuid. Resolve that UUID from the profile so a
  // stale local identity cannot make only the Masterclass/workshop KPI read
  // as zero while the other Partner Home cards are correct.
  //
  // This resolver is deliberately best-effort: if the profile/master lookup
  // is unavailable, retain the already-authorized identity UUID rather than
  // turning an optional identity refresh into a dashboard-wide failure.
  try {
    const { data: profile, error: profileError } = await supabase
      .from("partner_profiles")
      .select("partner_uuid")
      .eq("partner_id", partnerId)
      .maybeSingle();

    if (!profileError && profile?.partner_uuid) {
      return String(profile.partner_uuid);
    }
  } catch {
    // Fall back to the authenticated identity below.
  }

  try {
    const { data: master, error: masterError } = await supabase
      .from("partners_master")
      .select("partner_uuid")
      .eq("partner_id", partnerId)
      .maybeSingle();

    if (!masterError && master?.partner_uuid) {
      return String(master.partner_uuid);
    }
  } catch {
    // Fall back to the authenticated identity below.
  }

  return identityPartnerUuid;
}

async function resolveMarketplacePartnerId(
  supabase: any,
  partnerUuid: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("marketplace_partners")
    .select("id")
    .eq("partner_uuid", partnerUuid)
    .maybeSingle();

  // A partner may legitimately have no marketplace_partners mapping yet.
  // Zero rows therefore means "no marketplace ID" and must fall back to the
  // existing text partner ID without producing a 406/PGRST116 console error.
  // Multiple rows remain an integrity error and are allowed to propagate.
  if (error) throw error;

  return data?.id ?? null;
}

async function mapMasterclassHistoryRows(rows: any[]): Promise<PartnerMasterclassHistoryRow[]> {
  return rows.map((row: any): PartnerMasterclassHistoryRow => ({
    id: String(row.id ?? ""),
    partnerUuid: String(row.partner_uuid ?? ""),
    studentUuid: String(row.student_uuid ?? ""),
    rollNumber: String(row.roll_number ?? ""),
    studentName: String(row.student_name ?? ""),
    verifiedAt: String(row.verified_at ?? ""),
    schoolUuid: String(row.school_uuid ?? ""),
    schoolName: String(row.school_name ?? ""),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    parentPhone: String(row.parent_phone ?? ""),
    parentEmail: String(row.parent_email ?? ""),
    masterclassMonth: String(row.masterclass_month ?? ""),
  }));
}

async function loadPartnerMasterclassHistoryDirect(
  supabase: any,
  partnerUuid: string,
): Promise<PartnerMasterclassHistoryRow[]> {
  // The existing Masterclass contract stores partner_uuid as the Partner
  // profile UUID. Do not substitute marketplace_partners.id here: that is a
  // different identifier and can be a different PostgreSQL type.
  const rows = await fetchAllPages((from, to) =>
    supabase
      .from("partner_masterclass_checkins_v9")
      .select(
        "id,partner_uuid,student_uuid,roll_number,student_name,verified_at,school_uuid,school_name,class_name,section_name,parent_phone,parent_email,masterclass_month",
      )
      .eq("partner_uuid", partnerUuid)
      .order("verified_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to),
  );

  return mapMasterclassHistoryRows(rows);
}

async function loadPartnerMasterclassHistoryViaApi(
  partnerUuid: string,
): Promise<PartnerMasterclassHistoryRow[]> {
  const supabase = getSupabase();
  const session = (await supabase.auth.getSession()).data?.session;
  const response = await fetch("/api/partner-masterclass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ action: "history", partnerUuid }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      String(payload?.message || `Masterclass history request failed (${response.status}).`),
    );
  }

  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  return mapMasterclassHistoryRows(rows);
}

async function loadPartnerMasterclassHistoryWithFallback(
  supabase: any,
  partnerUuid: string,
): Promise<PartnerMasterclassHistoryRow[]> {
  let directRows: PartnerMasterclassHistoryRow[] | null = null;
  let directError: unknown = null;

  try {
    directRows = await loadPartnerMasterclassHistoryDirect(supabase, partnerUuid);
  } catch (error) {
    directError = error;
  }

  // Direct Supabase access is preferred because it works in Vite-only local
  // development. The existing API remains the authoritative compatibility
  // fallback for deployments where RLS/service-role access requires the
  // server route.
  if (directRows && directRows.length > 0) return directRows;

  try {
    return await loadPartnerMasterclassHistoryViaApi(partnerUuid);
  } catch (apiError) {
    // Preserve the real source failure instead of converting it into a fake
    // zero. If direct access succeeded and legitimately returned zero rows,
    // zero is valid. Otherwise surface the source failure to the caller.
    if (directRows && directRows.length === 0 && !directError) return directRows;
    throw directError ?? apiError;
  }
}

function applyPartnerIdFilter(
  query: any,
  partnerTextId: string,
  marketplacePartnerId: string | null,
) {
  if (partnerTextId && marketplacePartnerId) {
    return query.or(
      `partner_id.eq.${partnerTextId},partner_id.eq.${marketplacePartnerId}`,
    );
  }

  if (partnerTextId) return query.eq("partner_id", partnerTextId);
  if (marketplacePartnerId) return query.eq("partner_id", marketplacePartnerId);

  throw new Error("Unable to resolve any partner identity.");
}

async function enrichConsultationDisplayData(
  supabase: any,
  rows: any[],
): Promise<any[]> {
  if (!Array.isArray(rows) || rows.length === 0) return rows ?? [];

  const cache = new Map<string, any>();

  async function resolveStudent(studentId: unknown) {
    if (!studentId) return null;
    const key = String(studentId);
    if (cache.has(key)) return cache.get(key);

    let student: any = null;

    try {
      const { data } = await supabase
        .from("students_master")
        .select(
          "student_uuid,student_id,student_name,student_email,phone,school_name,class_name",
        )
        .eq("student_uuid", key)
        .maybeSingle();
      student = data ?? null;
    } catch {
      student = null;
    }

    if (!student) {
      try {
        const { data } = await supabase
          .from("students_master")
          .select(
            "student_uuid,student_id,student_name,student_email,phone,school_name,class_name",
          )
          .eq("student_id", key)
          .maybeSingle();
        student = data ?? null;
      } catch {
        student = null;
      }
    }

    cache.set(key, student);
    return student;
  }

  return Promise.all(
    rows.map(async (row: any) => {
      if (String(row?.request_type ?? "").toLowerCase() !== "consultation") {
        return row;
      }

      const student = await resolveStudent(row?.student_uuid ?? row?.student_id);
      if (!student) return row;

      return {
        ...row,
        requester_name:
          row?.requester_name ||
          row?.student_name ||
          row?.studentName ||
          student.student_name ||
          "",
        school_name:
          row?.school_name ||
          row?.schoolName ||
          student.school_name ||
          "",
        class_name:
          row?.class_name ||
          row?.className ||
          student.class_name ||
          "",
      };
    }),
  );
}

async function loadIncomingRequests(
  supabase: any,
  partnerTextId: string,
  marketplacePartnerId: string | null,
) {
  return enrichConsultationDisplayData(
    supabase,
    await fetchAllPages((from, to) => {
      let query = supabase.from("partner_incoming_requests").select("*");
      query = applyPartnerIdFilter(query, partnerTextId, marketplacePartnerId);
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);
    }),
  );
}

async function loadPartnerLeads(
  supabase: any,
  partnerTextId: string,
  marketplacePartnerId: string | null,
) {
  return enrichConsultationDisplayData(
    supabase,
    await fetchAllPages((from, to) => {
      let query = supabase.from("partner_student_leads").select("*");
      query = applyPartnerIdFilter(query, partnerTextId, marketplacePartnerId);
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);
    }),
  );
}

async function loadAllocatedStudents(supabase: any, partnerId: string) {
  return fetchAllPages((from, to) =>
    supabase
      .from("partner_student_leads")
      .select("*")
      .eq("partner_id", partnerId)
      .in("status", ["allocated"])
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to),
  );
}

async function loadTalentDiscoveryTable(
  supabase: any,
  table: string,
  partnerTextId: string,
  marketplacePartnerId: string | null,
) {
  return fetchAllPages((from, to) => {
    let query = supabase.from(table).select("*");

    query = applyPartnerIdFilter(
      query,
      partnerTextId,
      marketplacePartnerId,
    );

    return query
      .eq("discarded", false)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);
  });
}

async function loadTalentDiscoveryOpportunities(
  supabase: any,
  partnerTextId: string,
  marketplacePartnerId: string | null,
) {
  const [scholarships, workshops, contacts] = await Promise.all([
    loadTalentDiscoveryTable(
      supabase,
      "partner_scholarship_offers",
      partnerTextId,
      marketplacePartnerId,
    ),
    loadTalentDiscoveryTable(
      supabase,
      "partner_workshop_offers",
      partnerTextId,
      marketplacePartnerId,
    ),
    loadTalentDiscoveryTable(
      supabase,
      "partner_contact_requests",
      partnerTextId,
      marketplacePartnerId,
    ),
  ]);

  return [
    ...scholarships.map((row: any) => ({
      id: row.id,
      type: "Scholarship" as const,
      title: row.offer_title ?? "Scholarship",
      studentId: row.student_id,
      studentName: row.student_name ?? "",
      schoolName: row.school_name ?? "",
      status: row.status ?? "Pending",
      createdAt: row.created_at,
    })),
    ...workshops.map((row: any) => ({
      id: row.id,
      type: "Workshop" as const,
      title: row.workshop_title ?? "Workshop",
      studentId: row.student_id,
      studentName: row.student_name ?? "",
      schoolName: row.school_name ?? "",
      status: row.status ?? "Pending",
      createdAt: row.created_at,
    })),
    ...contacts.map((row: any) => ({
      id: row.id,
      type: "Contact" as const,
      title: "Contact Request",
      studentId: row.student_id,
      studentName: row.student_name ?? "",
      schoolName: row.school_name ?? "",
      status: row.status ?? "Pending",
      createdAt: row.created_at,
    })),
  ].sort((a, b) => {
    const dateDelta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dateDelta !== 0) return dateDelta;
    return String(b.id).localeCompare(String(a.id));
  });
}

export async function loadPartnerDashboardSourceData(): Promise<PartnerDashboardAnalyticsSourceData> {
  const identity = requirePartnerIdentity();
  const partnerId = String(identity.partnerId ?? "");
  const partnerUuid = String(identity.partnerUuid ?? "");

  if (!partnerId || !partnerUuid) {
    throw new Error("Partner identity is missing.");
  }

  const supabase = getSupabase();
  const canonicalPartnerUuid = await resolveCanonicalPartnerUuid(
    supabase,
    partnerId,
    partnerUuid,
  );
  const marketplacePartnerId = await resolveMarketplacePartnerId(
    supabase,
    canonicalPartnerUuid,
  );

  const [incomingRequests, leads, opportunities, allocatedStudents, masterclassHistory] =
    await Promise.all([
      loadIncomingRequests(supabase, partnerId, marketplacePartnerId),
      loadPartnerLeads(supabase, partnerId, marketplacePartnerId),
      loadTalentDiscoveryOpportunities(
        supabase,
        partnerId,
        marketplacePartnerId,
      ),
      loadAllocatedStudents(supabase, partnerId),
      loadPartnerMasterclassHistoryWithFallback(
        supabase,
        canonicalPartnerUuid,
      ),
    ]);

  return {
    incomingRequests,
    leads,
    opportunities,
    allocatedStudents,
    masterclassHistory,
  };
}
