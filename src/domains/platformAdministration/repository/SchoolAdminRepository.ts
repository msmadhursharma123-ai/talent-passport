import { getSupabaseClient } from "../../../supabaseClient";

export const SchoolAdminRepository = {

  async getAll() {

    const supabase = getSupabaseClient();

    if (!supabase) return [];

    const { data, error } =
      await (supabase as any)
        .from("school_admins_master")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return data ?? [];
  },

};