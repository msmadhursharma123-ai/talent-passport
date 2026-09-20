import { getSupabaseClient } from "../supabaseClient";
import type { AssignStudentAccountRow } from "../services/bulkStudentAccountFileParser";

export interface StudentAccountAssignmentResult {
  rowNumber: number;
  rollNumber: string;
  email: string;
  success: boolean;
  studentName?: string;
  error?: string;
}

export interface AssignStudentAccountsResponse {
  success: boolean;
  results: StudentAccountAssignmentResult[];
  createdCount: number;
  skippedCount: number;
  error?: string;
}

/**
 * Ensure the browser is holding a current Supabase user session before a
 * privileged Edge Function call. The school-admin UI can remain mounted for
 * longer than the access-token lifetime; the Supabase client can refresh the
 * session without changing the authenticated identity.
 */
async function getFreshSchoolAdminAccessToken(supabase: any): Promise<string> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Unable to read the school admin session. Please log in again.");
  }

  let session = sessionData?.session ?? null;

  if (!session) {
    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError || !refreshed?.session) {
      throw new Error("Your school admin session has expired. Please log in again.");
    }

    session = refreshed.session;
  } else {
    const expiresAt = Number(session.expires_at ?? 0);
    const now = Math.floor(Date.now() / 1000);

    // Refresh proactively when the access token is expired or within 60s of
    // expiry. This avoids sending an already-expired JWT to the Edge Function.
    if (!expiresAt || expiresAt <= now + 60) {
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !refreshed?.session) {
        throw new Error("Your school admin session has expired. Please log in again.");
      }

      session = refreshed.session;
    }
  }

  if (!session.access_token) {
    throw new Error("Your school admin session is unavailable. Please log in again.");
  }

  return session.access_token;
}

export async function assignStudentAccountsForSchoolAdmin(
  schoolUuid: string,
  rows: AssignStudentAccountRow[],
): Promise<AssignStudentAccountsResponse> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!schoolUuid) throw new Error("School identity could not be resolved.");

  const accessToken = await getFreshSchoolAdminAccessToken(supabase);

  const { data, error } = await supabase.functions.invoke(
    "assign-student-accounts",
    {
      body: {
        schoolUuid,
        rows,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    try {
      const context = (error as any).context;
      if (context?.json) {
        const payload = await context.json();
        if (payload?.error) throw new Error(payload.error);
      }
    } catch (nestedError) {
      if (nestedError instanceof Error && nestedError.message) throw nestedError;
    }
    throw new Error(error.message || "Unable to assign student accounts.");
  }

  if (!data?.success && !Array.isArray(data?.results)) {
    throw new Error(data?.error || "Unable to assign student accounts.");
  }

  return data as AssignStudentAccountsResponse;
}
