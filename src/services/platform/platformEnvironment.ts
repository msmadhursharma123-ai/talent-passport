import { Capacitor } from "@capacitor/core";

// This exact custom-scheme redirect must be allow-listed in Supabase Auth Redirect URLs.
export const NATIVE_APP_SCHEME = "in.talentpassport.app";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPasswordResetRedirectUrl(): string {
  if (isNativeApp()) {
    return `${NATIVE_APP_SCHEME}://auth/reset-password?reset-password=1`;
  }

  return `${window.location.origin.replace(/\/$/, "")}/?reset-password=1`;
}
