import { getSupabaseClient } from "../supabaseClient";

/* ============================================================
   PASSPORT ANALYTICS

   Source:
   get_my_talent_comparative_intelligence()

   Cohort:
   same class across the Talent Passport platform

   IMPORTANT:
   This is deliberately different from School Positioning.
   School Positioning = same school + same class.
   Peer Position = same class + all schools.
============================================================ */

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
      numeric(peer?.creativity),

    communication:
      numeric(peer?.communication),

    leadership:
      numeric(peer?.leadership),

    confidence:
      numeric(peer?.confidence),

    collaboration:
      numeric(peer?.collaboration),

    criticalThinking:
      numeric(peer?.criticalThinking),

    overall:
      numeric(peer?.overall),

    totalStudents:
      numeric(peer?.totalStudents),

    className:
      peer?.className ?? "",

    scope:
      peer?.scope ??
      "same-class-platform"
  };
}
