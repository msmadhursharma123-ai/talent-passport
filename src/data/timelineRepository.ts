import { getSupabaseClient } from "../supabaseClient";

export async function getStudentAchievements(
  studentId: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) return [];

  const { data, error } =
    await (supabase as any)
      .from("student_timeline_achievements")
      .select("*")
      .eq("student_id", studentId)
      .order("achievement_year", {
        ascending: true
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function createAchievement(
  achievement: any
) {
  const supabase = getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_timeline_achievements")
      .insert([achievement])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateAchievement(
  id: string,
  payload: any
) {
  const supabase = getSupabaseClient();

  if (!supabase) return null;

  const { data, error } =
    await (supabase as any)
      .from("student_timeline_achievements")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function deleteAchievement(
  id: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) return false;

  const { error } =
    await (supabase as any)
      .from("student_timeline_achievements")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}