import { getSupabaseClient } from "../../../supabaseClient";
import type { StudentMasterclassHistoryResult } from "../types/StudentMasterclassModels";

export async function getStudentMasterclassHistory(): Promise<StudentMasterclassHistoryResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Unable to resolve the student session.");
  }

  const token = session?.access_token;
  if (!token) {
    throw new Error("Your student session has expired. Please log in again.");
  }

  const response = await fetch("/api/student-masterclass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "history" }),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      "Unable to load your masterclass history right now."
    );
  }

  return {
    rows: Array.isArray(payload?.rows) ? payload.rows : [],
  };
}
