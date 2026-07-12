import { getSupabaseClient } from "../../../supabaseClient";

import type {
  Chapter,
} from "../../../types/chapter";

import {
  mapChapterRecord,
  mapChapterToRecord,
} from "../../../services/chapterMapper";

/* ============================================================
   GET ALL
============================================================ */

export async function getChapters(): Promise<
  Chapter[]
> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } =
    await (supabase as any)
      .from("chapters_master")
      .select(`
        *,
        organizations_master (
          organization_name
        ),
        curriculum_master (
          curriculum_name
        ),
        classes_master (
          class_name
        ),
        sections_master (
          section_name
        ),
        subjects_master (
          subject_name
        )
      `)
      .order(
        "display_order",
        {
          ascending: true,
        }
      );

  if (error) {
    console.error(
      "GET CHAPTERS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapChapterRecord
  );

}

/* ============================================================
   CHECK CHAPTER CODE
============================================================ */

export async function chapterCodeExists(
  chapterCode: string,
  subjectId: string,
  excludeChapterId?: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query =
    (supabase as any)
      .from("chapters_master")
      .select("id")
      .eq(
        "chapter_code",
        chapterCode
      )
      .eq(
        "subject_id",
        subjectId
      );

  if (excludeChapterId) {

    query =
      query.neq(
        "id",
        excludeChapterId
      );

  }

  const {
    data,
    error,
  } =
    await query.limit(1);

  if (error) {

    console.error(
      "CHECK CHAPTER CODE ERROR",
      error
    );

    return false;

  }

  return (
    (data?.length ?? 0) > 0
  );

}

/* ============================================================
   CREATE
============================================================ */

export async function createChapter(
  chapter: Partial<Chapter>
): Promise<Chapter | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapChapterToRecord(
      chapter
    );

  delete (payload as any).id;

  if (
    payload.chapter_code &&
    payload.subject_id &&
    await chapterCodeExists(
      payload.chapter_code,
      payload.subject_id
    )
  ) {

    console.error(
      "CHAPTER CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from("chapters_master")
      .insert([payload])
      .select(`
        *,
        organizations_master (
          organization_name
        ),
        curriculum_master (
          curriculum_name
        ),
        classes_master (
          class_name
        ),
        sections_master (
          section_name
        ),
        subjects_master (
          subject_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "CREATE CHAPTER ERROR",
      error
    );

    return null;

  }

  return mapChapterRecord(
    data
  );

}

/* ============================================================
   UPDATE
============================================================ */

export async function updateChapter(
  chapterId: string,
  updates: Partial<Chapter>
): Promise<Chapter | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapChapterToRecord(
      updates
    );

  delete (payload as any).id;

  if (
    payload.chapter_code &&
    payload.subject_id &&
    await chapterCodeExists(
      payload.chapter_code,
      payload.subject_id,
      chapterId
    )
  ) {

    console.error(
      "CHAPTER CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from("chapters_master")
      .update(payload)
      .eq(
        "id",
        chapterId
      )
      .select(`
        *,
        organizations_master (
          organization_name
        ),
        curriculum_master (
          curriculum_name
        ),
        classes_master (
          class_name
        ),
        sections_master (
          section_name
        ),
        subjects_master (
          subject_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "UPDATE CHAPTER ERROR",
      error
    );

    return null;

  }

  return mapChapterRecord(
    data
  );

}

/* ============================================================
   ARCHIVE
============================================================ */

export async function archiveChapter(
  chapterId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("chapters_master")
      .update({
        is_active: false,
      })
      .eq(
        "id",
        chapterId
      );

  if (error) {

    console.error(
      "ARCHIVE CHAPTER ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   RESTORE
============================================================ */

export async function restoreChapter(
  chapterId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("chapters_master")
      .update({
        is_active: true,
      })
      .eq(
        "id",
        chapterId
      );

  if (error) {

    console.error(
      "RESTORE CHAPTER ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   DELETE
============================================================ */

export async function deleteChapter(
  chapterId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("chapters_master")
      .delete()
      .eq(
        "id",
        chapterId
      );

  if (error) {

    console.error(
      "DELETE CHAPTER ERROR",
      error
    );

    return false;

  }

  return true;

}