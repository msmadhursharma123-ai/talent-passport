import { getSupabaseClient } from "../supabaseClient";

/* =========================================================
   LOOP-1 UNFINISHED FEEDBACK DRAFT

   This is a separate recovery layer. It is never a submitted feedback row,
   never awards credits, and never participates in any Learning/Exam
   Canonical calculation. The browser remains RPC-only for this draft.
========================================================= */

export type StudentLoop1FeedbackDraftServerRow = {
  daily_log_uuid: string;
  payload: Record<string, unknown>;
  updated_at: string;
  client_id: string;
  client_revision: number;
  client_updated_at: string;
};

export async function getStudentLoop1FeedbackDraft(
  dailyLogUuid: string
): Promise<StudentLoop1FeedbackDraftServerRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any).rpc(
    "tp_loop1_get_student_feedback_draft",
    { p_daily_log_uuid: dailyLogUuid }
  );

  if (error) {
    console.error("LOOP1 DRAFT LOAD ERROR", error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.daily_log_uuid || !row?.payload) return null;

  return {
    daily_log_uuid: String(row.daily_log_uuid),
    payload: row.payload as Record<string, unknown>,
    updated_at: String(row.updated_at ?? ""),
    client_id: typeof row.client_id === "string" ? row.client_id : "",
    client_revision: Number.isSafeInteger(row.client_revision) ? Number(row.client_revision) : 0,
    client_updated_at: typeof row.client_updated_at === "string" ? row.client_updated_at : "",
  };
}

export async function saveStudentLoop1FeedbackDraft(
  dailyLogUuid: string,
  payload: Record<string, unknown>,
  clientId: string,
  clientRevision: number,
  clientUpdatedAt: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await (supabase as any).rpc(
    "tp_loop1_save_student_feedback_draft",
    {
      p_daily_log_uuid: dailyLogUuid,
      p_payload: payload,
      p_client_id: clientId,
      p_client_revision: clientRevision,
      p_client_updated_at: clientUpdatedAt,
    }
  );

  if (error) {
    console.error("LOOP1 DRAFT SAVE ERROR", error);
    return false;
  }

  return true;
}

export async function deleteStudentLoop1FeedbackDraft(
  dailyLogUuid: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await (supabase as any).rpc(
    "tp_loop1_delete_student_feedback_draft",
    { p_daily_log_uuid: dailyLogUuid }
  );

  if (error) {
    console.error("LOOP1 DRAFT DELETE ERROR", error);
    return false;
  }

  return true;
}
