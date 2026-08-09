import { getSupabaseClient } from "../supabaseClient";

export interface CompetitionAnnouncement {
  id: string;
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName: string | null;
  eventName: string;
  startsAt: string;
  endsAt: string;
  rules: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetitionAnnouncementInput {
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName?: string | null;
  eventName: string;
  startsAt: string;
  endsAt: string;
  rules?: string;
}

export interface CompetitionClassOption {
  className: string;
  sections: string[];
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase as any;
}

function mapAnnouncement(row: any): CompetitionAnnouncement {
  return {
    id: row.id,
    schoolUuid: row.school_uuid,
    schoolName: row.school_name,
    className: row.class_name,
    sectionName: row.section_name ?? null,
    eventName: row.event_name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rules: row.rules ?? null,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCompetitionClassOptions(
  schoolName: string
): Promise<CompetitionClassOption[]> {
  if (!schoolName?.trim()) return [];

  const supabase = getClient();

  const { data, error } = await supabase
    .from("students_master")
    .select("class_name,section_name")
    .eq("school_name", schoolName)
    .order("class_name", { ascending: true })
    .order("section_name", { ascending: true });

  if (error) {
    console.error("COMPETITION CLASS OPTIONS ERROR", error);
    return [];
  }

  const map = new Map<string, Set<string>>();

  for (const row of data ?? []) {
    const className = String(row.class_name ?? "").trim();
    if (!className) continue;

    if (!map.has(className)) {
      map.set(className, new Set<string>());
    }

    const sectionName = String(row.section_name ?? "").trim();
    if (sectionName) {
      map.get(className)!.add(sectionName);
    }
  }

  return Array.from(map.entries()).map(([className, sectionSet]) => ({
    className,
    sections: Array.from(sectionSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    ),
  }));
}

export async function createCompetitionAnnouncement(
  input: CompetitionAnnouncementInput
): Promise<CompetitionAnnouncement | null> {
  const supabase = getClient();

  if (!input.schoolUuid || !input.schoolName || !input.className) {
    throw new Error("School and class are required.");
  }

  if (!input.eventName.trim()) {
    throw new Error("Competition name is required.");
  }

  if (!input.startsAt || !input.endsAt) {
    throw new Error("Competition start and end time are required.");
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime())
  ) {
    throw new Error("Please enter valid competition dates and times.");
  }

  if (endsAt <= startsAt) {
    throw new Error("Competition end time must be after the start time.");
  }

  /*
   * IMPORTANT:
   * Do not insert directly into competition_control_events here.
   * The platform admin identity in this application is resolved from
   * public.admins, and the database now exposes a SECURITY DEFINER RPC which
   * performs the authoritative admin check and insert server-side.
   */
  const { data, error } = await supabase.rpc(
    "create_competition_announcement",
    {
      p_school_uuid: input.schoolUuid,
      p_school_name: input.schoolName.trim(),
      p_class_name: input.className.trim(),
      p_section_name: input.sectionName?.trim() || null,
      p_event_name: input.eventName.trim(),
      p_starts_at: startsAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
      p_rules: input.rules?.trim() || null,
    }
  );

  if (error) {
    console.error("CREATE COMPETITION ANNOUNCEMENT ERROR", error);
    throw new Error(error.message);
  }

  if (!data) return null;

  /* Supabase returns a single row for this function. */
  const row = Array.isArray(data) ? data[0] : data;

  return row ? mapAnnouncement(row) : null;
}

export async function getCompetitionAnnouncements(): Promise<
  CompetitionAnnouncement[]
> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("competition_control_events")
    .select("*")
    .order("starts_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET COMPETITION ANNOUNCEMENTS ERROR", error);
    return [];
  }

  return (data ?? []).map(mapAnnouncement);
}

export async function revokeCompetitionAnnouncement(
  announcementId: string
): Promise<boolean> {
  const supabase = getClient();

  if (!announcementId) return false;

  const { data, error } = await supabase.rpc(
    "revoke_competition_announcement",
    {
      p_announcement_id: announcementId,
    }
  );

  if (error) {
    console.error("REVOKE COMPETITION ANNOUNCEMENT ERROR", error);
    return false;
  }

  return data === true;
}

export async function getCompetitionAnnouncementForStudent(
  studentUuid: string
): Promise<CompetitionAnnouncement | null> {
  if (!studentUuid) return null;

  const supabase = getClient();

  const { data: student, error: studentError } = await supabase
    .from("students_master")
    .select("school_uuid,school_name,class_name,section_name")
    .eq("student_uuid", studentUuid)
    .single();

  if (studentError || !student) {
    if (studentError) {
      console.error("COMPETITION STUDENT PROFILE ERROR", studentError);
    }
    return null;
  }

  const schoolUuid = String(student.school_uuid ?? "").trim();
  const schoolName = String(student.school_name ?? "").trim();
  const className = String(student.class_name ?? "").trim();
  const sectionName = String(student.section_name ?? "").trim();

  if ((!schoolUuid && !schoolName) || !className) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("competition_control_events")
    .select("*")
    .eq("class_name", className)
    .match(schoolUuid ? { school_uuid: schoolUuid } : { school_name: schoolName })
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("starts_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("GET STUDENT COMPETITION ANNOUNCEMENT ERROR", error);
    return null;
  }

  const matching = (data ?? []).find((row: any) => {
    const configuredSection = String(row.section_name ?? "").trim();
    return !configuredSection || configuredSection === sectionName;
  });

  return matching ? mapAnnouncement(matching) : null;
}

export async function getCompetitionUpcomingAnnouncementForStudent(
  studentUuid: string
): Promise<CompetitionAnnouncement | null> {
  if (!studentUuid) return null;

  const supabase = getClient();

  const { data: student, error: studentError } = await supabase
    .from("students_master")
    .select("school_uuid,school_name,class_name,section_name")
    .eq("student_uuid", studentUuid)
    .single();

  if (studentError || !student) return null;

  const schoolUuid = String(student.school_uuid ?? "").trim();
  const schoolName = String(student.school_name ?? "").trim();
  const className = String(student.class_name ?? "").trim();
  const sectionName = String(student.section_name ?? "").trim();

  if ((!schoolUuid && !schoolName) || !className) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("competition_control_events")
    .select("*")
    .eq("class_name", className)
    .match(schoolUuid ? { school_uuid: schoolUuid } : { school_name: schoolName })
    .eq("is_active", true)
    .gt("starts_at", now)
    .order("starts_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("GET UPCOMING COMPETITION ERROR", error);
    return null;
  }

  const matching = (data ?? []).find((row: any) => {
    const configuredSection = String(row.section_name ?? "").trim();
    return !configuredSection || configuredSection === sectionName;
  });

  return matching ? mapAnnouncement(matching) : null;
}

export async function getCompetitionSubmittedPathways(
  controlId: string,
  studentUuid: string
): Promise<string[]> {
  if (!controlId || !studentUuid) return [];

  const supabase = getClient();

  const { data, error } = await supabase
    .from("competition_submission_claims")
    .select("pathway")
    .eq("control_id", controlId)
    .eq("student_uuid", studentUuid);

  if (error) {
    console.error("GET COMPETITION CLAIMS ERROR", error);
    return [];
  }

  return Array.from(
    new Set(
      (data ?? [])
        .map((row: any) => String(row.pathway ?? "").trim())
        .filter(Boolean)
    )
  );
}
