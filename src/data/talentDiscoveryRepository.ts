import { getSupabaseClient } from "../supabaseClient";

export interface TalentDiscoveryOpportunity {
  id: string;
  type: "Scholarship" | "Workshop" | "Contact";
  title: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  className?: string;
  partnerId: string;
  status: string;
  createdAt: string;
}

function getSupabase() {
  return getSupabaseClient() as any;
}

export async function getScholarshipOffers(
  partnerId: string
): Promise<TalentDiscoveryOpportunity[]> {
const supabase = getSupabase();

const { data, error } = await supabase
    .from("partner_scholarship_offers")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("discarded", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Scholarship Repository Error", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: "Scholarship",
    title: row.offer_title ?? "Scholarship",
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    schoolName: row.school_name ?? "",
    className: "",
    partnerId: row.partner_id,
    status: row.status ?? "Pending",
    createdAt: row.created_at,
  }));
}

export async function getWorkshopOffers(
  partnerId: string
): Promise<TalentDiscoveryOpportunity[]> {
const supabase = getSupabase();

const { data, error } = await supabase
    .from("partner_workshop_offers")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("discarded", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Workshop Repository Error", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: "Workshop",
    title: row.workshop_title ?? "Workshop",
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    schoolName: row.school_name ?? "",
    className: row.class_name ?? "",
    partnerId: row.partner_id,
    status: row.status ?? "Pending",
    createdAt: row.created_at,
  }));
}

export async function getContactRequests(
  partnerId: string
): Promise<TalentDiscoveryOpportunity[]> {
 const supabase = getSupabase();

const { data, error } = await supabase
    .from("partner_contact_requests")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("discarded", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Contact Repository Error", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: "Contact",
    title: "Contact Request",
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    schoolName: row.school_name ?? "",
    className: row.class_name ?? "",
    partnerId: row.partner_id,
    status: row.status ?? "Pending",
    createdAt: row.created_at,
  }));
}

export async function getTalentDiscoveryTimeline(
  partnerId: string
): Promise<TalentDiscoveryOpportunity[]> {

  const [
    scholarships,
    workshops,
    contacts
  ] = await Promise.all([
    getScholarshipOffers(partnerId),
    getWorkshopOffers(partnerId),
    getContactRequests(partnerId),
  ]);

  return [
    ...scholarships,
    ...workshops,
    ...contacts,
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}