import { getSupabaseClient }
from "../supabaseClient";

/* ============================================================
   TIMELINE STORAGE

   Responsibilities

   • Upload achievement files
   • Return public URL

   Storage Helper

   No Identity
   No Repository
============================================================ */

function sanitizeFileName(
  fileName: string
): string {

  return fileName

    .trim()

    .replace(/\s+/g, "-")

    .replace(
      /[^a-zA-Z0-9.-]/g,
      ""
    );

}

export async function uploadAchievementFile(

  bucket: string,

  file: File

): Promise<string | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    return null;

  }

  const safeName =
    sanitizeFileName(
      file.name
    );

  const path =

    `${Date.now()}-${safeName}`;

  const { error } =

    await supabase.storage

      .from(bucket)

      .upload(path, file);

  if (error) {

    console.error(

      "UPLOAD ERROR",

      error

    );

    return null;

  }

  const { data } =

    supabase.storage

      .from(bucket)

      .getPublicUrl(path);

  return data.publicUrl;

}