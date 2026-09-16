import { Capacitor } from "@capacitor/core";
import { NATIVE_APP_SCHEME } from "../services/platform/platformEnvironment";

const NATIVE_SCHEME = `${NATIVE_APP_SCHEME}:`;
const CONSUMED_DEEP_LINK_KEY = "tp.native.deepLink.fingerprints.v2";
const MAX_CONSUMED_DEEP_LINKS = 20;

/**
 * Return a compact deterministic fingerprint without storing the recovery
 * URL itself. This lets the native bootstrap remember that a deep link has
 * already been consumed while avoiding persistence of access/refresh tokens.
 */
function fingerprintDeepLink(rawUrl: string): string {
  // Two independent 32-bit FNV-style lanes give a compact 64-bit-class
  // fingerprint while remaining compatible with the project's ES2022 target.
  let hashA = 2166136261;
  let hashB = 2246822519;

  for (let index = 0; index < rawUrl.length; index += 1) {
    const code = rawUrl.charCodeAt(index);

    hashA ^= code;
    hashA = Math.imul(hashA, 16777619);

    hashB ^= code + index;
    hashB = Math.imul(hashB, 3266489917);
  }

  return `${(hashA >>> 0).toString(36)}-${(hashB >>> 0).toString(36)}`;
}

function readConsumedDeepLinks(): string[] {
  try {
    const stored = sessionStorage.getItem(CONSUMED_DEEP_LINK_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function hasConsumedDeepLink(rawUrl: string): boolean {
  const fingerprint = fingerprintDeepLink(rawUrl);

  try {
    return readConsumedDeepLinks().includes(fingerprint);
  } catch {
    // Storage can be unavailable in unusual WebView states. Deep-link
    // handling must continue rather than blocking password recovery.
    return false;
  }
}

function markDeepLinkConsumed(rawUrl: string): void {
  try {
    const fingerprint = fingerprintDeepLink(rawUrl);
    const previous = readConsumedDeepLinks().filter(
      (value) => value !== fingerprint
    );
    const next = [fingerprint, ...previous].slice(0, MAX_CONSUMED_DEEP_LINKS);

    sessionStorage.setItem(
      CONSUMED_DEEP_LINK_KEY,
      JSON.stringify(next)
    );
  } catch {
    // Non-fatal: native URL handling still proceeds if storage is unavailable.
  }
}

function normalizeIncomingAppUrl(rawUrl: string): string | null {
  if (!rawUrl || !rawUrl.startsWith(NATIVE_SCHEME)) return null;

  try {
    const parsed = new URL(rawUrl);
    const search = parsed.search || "";
    const hash = parsed.hash || "";

    const hashParams = new URLSearchParams(
      hash.startsWith("#") ? hash.slice(1) : hash
    );
    const isRecovery =
      search.includes("reset-password=1") ||
      hashParams.get("type") === "recovery" ||
      hashParams.has("access_token") ||
      hashParams.has("refresh_token") ||
      search.includes("code=");

    if (isRecovery) {
      const query = search ? search : "?reset-password=1";
      return `/${query}${hash}`;
    }

    // School invitation deep links can be handed to the existing hash route.
    if (
      parsed.hostname === "school-setup" ||
      parsed.pathname.includes("school-setup")
    ) {
      const token = new URLSearchParams(parsed.search).get("token");
      return token
        ? `/#school-setup?token=${encodeURIComponent(token)}`
        : "/#school-setup";
    }
  } catch (error) {
    console.warn("Unable to parse Talent Passport app URL.", error);
  }

  return null;
}


async function applyIncomingUrl(rawUrl: string | undefined): Promise<void> {
  if (!rawUrl) return;

  if (hasConsumedDeepLink(rawUrl)) return;

  const normalized = normalizeIncomingAppUrl(rawUrl);
  if (!normalized) return;

  if (Capacitor.getPlatform() === "android") {
    try {
      const parsed = new URL(rawUrl);
      const searchParams = new URLSearchParams(parsed.search);
      const hashParams = new URLSearchParams(
        parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash
      );

      const accessToken =
        hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken =
        hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { importAndroidPasswordRecoveryTokens } =
          await import("../services/platform/androidPasswordRecoveryService");
        const result = await importAndroidPasswordRecoveryTokens(
          accessToken,
          refreshToken
        );

        if (!result.success) {
          console.error(
            "ANDROID PASSWORD RECOVERY TOKEN IMPORT FAILED",
            result.error
          );
          // Do not mark a failed recovery URL as consumed. This allows the
          // normal Capacitor callback path to retry instead of permanently
          // discarding a valid one-time recovery URL.
          return;
        }

        // The token pair has now been imported into the existing application
        // Supabase client. Do not expose the tokens to the React URL anymore.
        markDeepLinkConsumed(rawUrl);
        window.location.replace("/?reset-password=1");
        return;
      }
    } catch (error) {
      console.error("ANDROID PASSWORD RECOVERY CALLBACK FAILED", error);
      return;
    }
  }

  markDeepLinkConsumed(rawUrl);
  window.location.replace(normalized);
}


export function initializeNativeAppBootstrap(): void {
  if (!Capacitor.isNativePlatform()) return;

  void import("@capacitor/app")
    .then(({ App }) => {
      void App.getLaunchUrl()
        .then(({ url }) => void applyIncomingUrl(url))
        .catch((error) => console.warn("Unable to read app launch URL.", error));

      void App.addListener("appUrlOpen", ({ url }) => {
        void applyIncomingUrl(url);
      });
    })
    .catch((error) => console.warn("Unable to initialize native app URL handling.", error));
}
