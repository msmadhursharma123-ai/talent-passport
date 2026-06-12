import { getSupabaseClient }
from "../supabaseClient";

export async function uploadAchievementFile(
  bucket: string,
  file: File
) {
  const supabase =
    getSupabaseClient();

  if (!supabase)
    return null;

  const path =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from(bucket)
      .upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(path);

  return data.publicUrl;
}