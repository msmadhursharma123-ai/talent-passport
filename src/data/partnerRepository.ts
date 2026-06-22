import { getSupabaseClient }
from "../supabaseClient";

export async function createPartner(
  partner: any
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("partner_profiles")
      .insert([partner])
      .select()
      .single();

  if (error) {
    console.error(
      "CREATE PARTNER ERROR",
      error
    );

    alert(
      JSON.stringify(error)
    );

    return null;
  }

  return data;
}

export async function findPartnerByEmail(
  email: string
) {
  const supabase =
    getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("partner_profiles")
      .select("*")
      .eq("email", email)
      .single();

  if (error) {
    return null;
  }

  return data;
}