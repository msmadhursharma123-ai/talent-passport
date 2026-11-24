import { getSupabaseClient } from "../../../supabaseClient";
import type { MultiCrossQuestion, MultiCrossQuestionAttempt } from "../../../components/MultiCrossQuestionFlow";

export type Loop2MultiCrossQuestion = MultiCrossQuestion & {
  pending_doubt_uuid: string;
};

export type Loop2MultiCrossCapability =
  | "MULTI_CROSS"
  | "LEGACY_FALLBACK"
  | "BLOCKED"
  | "UNAVAILABLE";

export type Loop2MultiCrossQuestionAttempt = MultiCrossQuestionAttempt & {
  pending_doubt_uuid: string;
  student_uuid?: string;
  question_order: number;
  resolution_status?: "DISCUSSED" | "NOT DISCUSSED" | "DEFERRED_QUESTION_SET_CHANGED" | null;
};

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

async function signedQuestionImages(
  rows: any[],
): Promise<Loop2MultiCrossQuestion[]> {
  const supabase = client();

  return Promise.all(
    rows.map(async (row: any) => {
      if (!row.image_path) {
        return {
          ...row,
          id: String(row.id),
          daily_log_uuid: String(row.daily_log_uuid),
          pending_doubt_uuid: String(row.pending_doubt_uuid),
          question_order: Number(row.question_order),
          question_type: String(row.question_type),
          options: Array.isArray(row.options) ? row.options : row.options ?? null,
        };
      }

      try {
        const { data, error } = await supabase.storage
          .from("daily-log-cross-questions")
          .createSignedUrl(String(row.image_path), 60 * 60);

        if (error) throw error;

        return {
          ...row,
          id: String(row.id),
          daily_log_uuid: String(row.daily_log_uuid),
          pending_doubt_uuid: String(row.pending_doubt_uuid),
          question_order: Number(row.question_order),
          question_type: String(row.question_type),
          options: Array.isArray(row.options) ? row.options : row.options ?? null,
          image_url: data?.signedUrl ?? null,
        };
      } catch (error) {
        console.warn("LOOP-2 MULTI CROSS IMAGE URL FAILED", error);
        return {
          ...row,
          id: String(row.id),
          daily_log_uuid: String(row.daily_log_uuid),
          pending_doubt_uuid: String(row.pending_doubt_uuid),
          question_order: Number(row.question_order),
          question_type: String(row.question_type),
          options: Array.isArray(row.options) ? row.options : row.options ?? null,
          image_url: null,
        };
      }
    }),
  );
}

/**
 * Server-authoritative capability boundary.
 *
 * The client must never infer legacy fallback from an empty question array:
 * an empty array can also mean unauthorized, resolved, malformed, or missing.
 * Only an explicit LEGACY_FALLBACK result is allowed to enter the pre-existing
 * legacy Loop-2 path. Everything else fails closed.
 */
export async function getLoop2MultiCrossCapability(
  pendingDoubtUuid: string,
): Promise<Loop2MultiCrossCapability> {
  const supabase = client();

  const { data, error } = await supabase.rpc(
    "tp_loop2_multi_get_capability",
    { p_pending_doubt_uuid: pendingDoubtUuid },
  );

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  const capability = String(row?.capability ?? "UNAVAILABLE").toUpperCase();

  if (
    capability !== "MULTI_CROSS" &&
    capability !== "LEGACY_FALLBACK" &&
    capability !== "BLOCKED" &&
    capability !== "UNAVAILABLE"
  ) {
    throw new Error("Loop-2 Cross Question capability could not be verified.");
  }

  return capability as Loop2MultiCrossCapability;
}

export async function getLoop2MultiCrossQuestions(
  pendingDoubtUuid: string,
): Promise<Loop2MultiCrossQuestion[]> {
  const supabase = client();

  const { data, error } = await supabase.rpc(
    "tp_loop2_multi_get_cross_questions",
    { p_pending_doubt_uuid: pendingDoubtUuid },
  );

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  return signedQuestionImages(rows);
}

export async function getLoop2MultiCrossQuestionAttempts(
  pendingDoubtUuid: string,
): Promise<Loop2MultiCrossQuestionAttempt[]> {
  const supabase = client();

  const { data, error } = await supabase.rpc(
    "tp_loop2_multi_get_cross_question_attempts",
    { p_pending_doubt_uuid: pendingDoubtUuid },
  );

  if (error) throw error;

  return (Array.isArray(data) ? data : []).map((row: any) => ({
    ...row,
    pending_doubt_uuid: String(row.pending_doubt_uuid),
    daily_log_uuid: String(row.daily_log_uuid),
    question_uuid: String(row.question_uuid),
    student_uuid: row.student_uuid ? String(row.student_uuid) : undefined,
    question_order: Number(row.question_order),
    selected_value: String(row.selected_value ?? ""),
    is_correct: row.is_correct === true,
    attempted_at: row.attempted_at,
  }));
}

/**
 * Server-authoritative answer/progression boundary.
 *
 * The RPC owns:
 *   - authenticated student identity
 *   - pending-doubt ownership
 *   - Daily-Log/question provenance
 *   - capability >= 2
 *   - ordered progression
 *   - correctness
 *   - idempotent replay
 *   - wrong-terminal resolution
 *   - all-correct DISCUSSED resolution
 */
export async function recordLoop2MultiCrossQuestionAttempt(
  pendingDoubtUuid: string,
  questionUuid: string,
  selectedValue: string,
): Promise<Loop2MultiCrossQuestionAttempt> {
  const supabase = client();

  const { data, error } = await supabase.rpc(
    "tp_loop2_multi_record_cross_question_attempt",
    {
      p_pending_doubt_uuid: pendingDoubtUuid,
      p_question_uuid: questionUuid,
      p_selected_value: selectedValue,
    },
  );

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.question_uuid) {
    throw new Error("The Loop-2 Cross Question answer could not be confirmed.");
  }

  return {
    ...row,
    pending_doubt_uuid: String(row.pending_doubt_uuid),
    daily_log_uuid: String(row.daily_log_uuid),
    question_uuid: String(row.question_uuid),
    student_uuid: row.student_uuid ? String(row.student_uuid) : undefined,
    question_order: Number(row.question_order),
    selected_value: String(row.selected_value ?? ""),
    is_correct: row.is_correct === true,
    attempted_at: row.attempted_at,
    resolution_status: row.resolution_status ?? null,
  };
}
