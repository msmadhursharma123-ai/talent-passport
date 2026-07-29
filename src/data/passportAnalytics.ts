import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   PASSPORT ANALYTICS

   Source:
   get_my_talent_comparative_intelligence()

   Peer cohort:
   same class across the Talent Passport platform.

   School Positioning is intentionally NOT calculated here.
============================================================ */

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp100(value: unknown): number {
  return Math.min(100, Math.max(0, Math.round(numeric(value))));
}

export async function getPercentileData(
  passport: any
) {

  if (!passport) {
    return null;
  }

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    console.error(
      "Passport analytics: Supabase client unavailable"
    );
    return null;
  }

  const { data, error } =
    await (supabase as any)
      .rpc(
        "get_my_talent_comparative_intelligence"
      );

  if (error) {
    console.error(
      "Peer position RPC failed",
      error
    );
    return null;
  }

  const peer =
    data?.peer;

  if (!peer) {
    return null;
  }

  return {
    creativity:
      clamp100(peer?.creativity),

    communication:
      clamp100(peer?.communication),

    leadership:
      clamp100(peer?.leadership),

    confidence:
      clamp100(peer?.confidence),

    collaboration:
      clamp100(peer?.collaboration),

    criticalThinking:
      clamp100(peer?.criticalThinking),

    overall:
      clamp100(peer?.overall),

    totalStudents:
      Math.max(
        0,
        Math.round(
          numeric(peer?.totalStudents)
        )
      ),

    className:
      String(
        peer?.className ??
        passport?.class_name ??
        ""
      ),

    scope:
      peer?.scope ??
      "same-class-platform"
  };
}
