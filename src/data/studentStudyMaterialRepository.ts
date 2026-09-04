import { requireIdentity } from "../services/identityService";
import { getSupabaseClient } from "../supabaseClient";

export interface PublishedWorksheet {
  id: string;
  schoolUuid: string;
  teacherUuid: string;
  teacherName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  worksheetDate: string;
  title: string;
  chapterName: string;
  payload: Record<string, unknown>;
  sourcePlannerId: string;
  publishedAt: string;
}

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function mapRow(row: any): PublishedWorksheet {
  return {
    id: String(row.id),
    schoolUuid: String(row.school_uuid ?? ""),
    teacherUuid: String(row.teacher_uuid ?? ""),
    teacherName: String(row.teacher_name ?? "Teacher"),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    worksheetDate: String(row.worksheet_date ?? ""),
    title: String(row.title ?? "Worksheet"),
    chapterName: String(row.chapter_name ?? "Chapter 1"),
    payload: (row.payload ?? {}) as Record<string, unknown>,
    sourcePlannerId: String(row.source_planner_id ?? ""),
    publishedAt: String(row.published_at ?? ""),
  };
}

export async function getStudentPublishedWorksheets(): Promise<PublishedWorksheet[]> {
  const identity = requireIdentity();
  // The canonical class/section is resolved inside the server-side RPC from
  // auth.uid(). StudentIdentity uses `section` (not `sectionName`), and the
  // publication RPC is intentionally the source of truth for visibility.
  if (!identity.studentUuid) return [];

  // Resolve the student's canonical school/class/section on the server from
  // auth.uid(). This keeps the publication read isolated to the authenticated
  // student and avoids brittle exact-match client/RLS conditions when legacy
  // rows contain casing or whitespace differences.
  const { data, error } = await client().rpc("get_student_published_worksheets");

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
