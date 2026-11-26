import { getSupabaseClient } from "../../../supabaseClient";

export interface SchoolAdminCrossQuestionRow {
  id: string;
  daily_log_uuid: string;
  question_order: number;
  question_type: string;
  question_text: string | null;
  image_path: string | null;
  options: unknown;
}

const RPC_NAME = "tp_v11_multi_get_school_admin_cross_questions";
const CHUNK_SIZE = 500;

function normalizeRow(row: any): SchoolAdminCrossQuestionRow {
  return {
    id: String(row?.id ?? ""),
    daily_log_uuid: String(row?.daily_log_uuid ?? ""),
    question_order: Number.isFinite(Number(row?.question_order))
      ? Number(row.question_order)
      : 0,
    question_type: String(row?.question_type ?? "").trim(),
    question_text: row?.question_text == null ? null : String(row.question_text),
    image_path: row?.image_path ? String(row.image_path) : null,
    options: row?.options ?? null,
  };
}

/**
 * School Admin read boundary for the existing V11 multi-question table.
 *
 * The question rows are intentionally NOT selected from teacher_daily_logs:
 * multi-question data lives in daily_log_cross_questions. The DB RPC owns the
 * school-admin authorization boundary so this repository never broadens the
 * client-side school scope.
 */
export async function getSchoolAdminCrossQuestions(
  dailyLogUuids: string[],
): Promise<SchoolAdminCrossQuestionRow[]> {
  const supabase = getSupabaseClient();
  const ids = Array.from(new Set(dailyLogUuids.map(String).filter(Boolean)));

  if (!supabase || ids.length === 0) return [];

  const rows: SchoolAdminCrossQuestionRow[] = [];

  for (let start = 0; start < ids.length; start += CHUNK_SIZE) {
    const chunk = ids.slice(start, start + CHUNK_SIZE);
    const { data, error } = await (supabase as any).rpc(RPC_NAME, {
      p_daily_log_uuids: chunk,
    });

    if (error) throw error;

    for (const row of Array.isArray(data) ? data : []) {
      const normalized = normalizeRow(row);
      if (normalized.daily_log_uuid && normalized.id) rows.push(normalized);
    }
  }

  rows.sort(
    (a, b) =>
      a.daily_log_uuid.localeCompare(b.daily_log_uuid) ||
      a.question_order - b.question_order ||
      a.id.localeCompare(b.id),
  );

  return rows;
}


export interface SchoolAdminTeacherLogDetail {
  id: string;
  chapter_name: string | null;
  cross_question_text: string | null;
  cross_question_image_path: string | null;
}

export async function getSchoolAdminTeacherLogDetails(
  dailyLogUuids: string[],
): Promise<SchoolAdminTeacherLogDetail[]> {
  const supabase = getSupabaseClient();
  const ids = Array.from(new Set(dailyLogUuids.map(String).filter(Boolean)));
  if (!supabase || ids.length === 0) return [];

  const rows: SchoolAdminTeacherLogDetail[] = [];
  for (let start = 0; start < ids.length; start += CHUNK_SIZE) {
    const chunk = ids.slice(start, start + CHUNK_SIZE);
    const { data, error } = await (supabase as any)
      .from("teacher_daily_logs")
      .select("id,chapter_name,cross_question_text,cross_question_image_path")
      .in("id", chunk);
    if (error) throw error;
    for (const row of Array.isArray(data) ? data : []) {
      const id = String(row?.id ?? "");
      if (!id) continue;
      rows.push({
        id,
        chapter_name: row?.chapter_name == null ? null : String(row.chapter_name),
        cross_question_text: row?.cross_question_text == null ? null : String(row.cross_question_text),
        cross_question_image_path: row?.cross_question_image_path ? String(row.cross_question_image_path) : null,
      });
    }
  }
  return rows;
}

export function groupSchoolAdminCrossQuestionsByLog(
  rows: SchoolAdminCrossQuestionRow[],
): Record<string, SchoolAdminCrossQuestionRow[]> {
  const grouped: Record<string, SchoolAdminCrossQuestionRow[]> = {};

  for (const row of rows) {
    (grouped[row.daily_log_uuid] ??= []).push(row);
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort(
      (a, b) => a.question_order - b.question_order || a.id.localeCompare(b.id),
    );
  }

  return grouped;
}
