import { createClient } from "@supabase/supabase-js";
const PAGE_SIZE = 1000;
type HistoryRecord = {
  id: string;
  roll_number: string | null;
  verified_at: string | null;
  school_uuid: string | null;
  class_name: string | null;
  section_name: string | null;
  masterclass_month: string | null;
  partner_uuid: string | null;
  credits_won: number | null;
  rank_out_of_5: number | null;
};

function adminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server Supabase configuration is missing.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function fetchPaged(buildQuery: (from: number, to: number) => any): Promise<any[]> {
  const result: any[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const page = data ?? [];
    result.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return result;
}

async function authenticatedStudentUuid(req: any, supabase: any) {
  const auth = String(req.headers.authorization ?? "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Authentication required.");

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) throw new Error("Authentication required.");

  const { data: student, error } = await supabase
    .from("students_master")
    .select("student_uuid")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!student?.student_uuid) throw new Error("Student identity is not authorized.");

  return String(student.student_uuid);
}


export default async function handler(req: any, res: any) {
  try {
    const supabase = adminClient();
    const studentUuid = await authenticatedStudentUuid(req, supabase);
    const action = String(req.body?.action ?? "history");

    if (action !== "history") {
      return res.status(400).json({ message: "Unsupported action." });
    }

    const records = await fetchPaged((from, to) =>
      supabase
        .from("partner_masterclass_checkins_v9")
        .select("id,roll_number,verified_at,school_uuid,class_name,section_name,masterclass_month,partner_uuid,credits_won,rank_out_of_5")
        .eq("student_uuid", studentUuid)
        .order("verified_at", { ascending: false })
        .range(from, to)
    ) as HistoryRecord[];

    if (!records.length) {
      return res.status(200).json({ rows: [] });
    }

    const partnerIds = Array.from(
      new Set(
        records
          .map(row => String(row.partner_uuid ?? "").trim())
          .filter(Boolean)
      )
    );

    const { data: partners, error: partnersError } = partnerIds.length
      ? await supabase
          .from("partner_profiles")
          .select("partner_uuid,institute_name")
          .in("partner_uuid", partnerIds)
      : { data: [], error: null };

    if (partnersError) throw partnersError;

    const partnerNameById = new Map<string, string>(
      (partners ?? []).map((row: any) => [
        String(row.partner_uuid ?? ""),
        String(row.institute_name ?? "Talent Partner"),
      ])
    );

    const rows: any[] = [];

    for (const record of records) {
      rows.push({
        id: String(record.id),
        rollNumber: String(record.roll_number ?? "").trim(),
        month: String(record.masterclass_month ?? ""),
        masterclassDate: String(record.verified_at ?? ""),
        partnerName: partnerNameById.get(String(record.partner_uuid ?? "")) ?? "Talent Partner",
        creditsWon: record.credits_won == null ? null : Number(record.credits_won),
        rank: record.rank_out_of_5 == null ? null : Number(record.rank_out_of_5),
      });
    }

    return res.status(200).json({ rows });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Unable to load the student masterclass record.",
    });
  }
}
