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

  const safeName =
  file.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "");

const path =
  `${Date.now()}-${safeName}`;

console.log(
  "UPLOAD PATH:",
  path
);

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