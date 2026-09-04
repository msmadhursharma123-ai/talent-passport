import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";

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

export async function publishWorksheetToStudents(
  plannerId: string
): Promise<PublishedWorksheet> {
  if (!plannerId?.trim()) throw new Error("Worksheet planner ID is required.");
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid || !teacher.schoolUuid) {
    throw new Error("Teacher identity is unavailable.");
  }

  const { data, error } = await client().rpc("publish_teacher_worksheet_v2", {
    p_planner_id: plannerId,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("The worksheet could not be published to students.");
  return mapRow(row);
}

export async function getTeacherPublishedWorksheetIds(plannerIds: string[] = []): Promise<string[]> {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid) return [];

  const scopedIds = Array.from(new Set(plannerIds.map(id => String(id).trim()).filter(Boolean)));
  const { data, error } = await client().rpc("get_teacher_published_worksheet_ids", {
    p_planner_ids: scopedIds.length ? scopedIds : null,
  });

  if (error) throw error;
  return Array.from(
    new Set(
      (data ?? [])
        .map((row: any) => String(row.source_planner_id ?? "").trim())
        .filter(Boolean)
    )
  );
}

