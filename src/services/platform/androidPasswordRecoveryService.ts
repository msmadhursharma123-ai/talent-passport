import { Capacitor } from "@capacitor/core";
import { getSupabaseClient } from "../../supabaseClient";

/**
 * Android-only password recovery bridge.
 *
 * Talent Passport's existing JavaScript Supabase client uses the implicit
 * browser flow. Android deep-link callbacks arrive through Capacitor rather
 * than through a normal browser navigation, so the normal URL detector cannot
 * be relied upon to consume the recovery hash. This helper explicitly imports
 * the access/refresh token pair into that SAME application client.
 *
 * Web and iOS never call this path.
 */
export function isAndroidPasswordRecovery(): boolean {
  return Capacitor.getPlatform() === "android";
}

export async function importAndroidPasswordRecoveryTokens(
  accessToken: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!isAndroidPasswordRecovery()) {
    return { success: false, error: "Android password recovery is not active." };
  }

  if (!accessToken || !refreshToken) {
    return { success: false, error: "Incomplete Android recovery session." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
