import { getSupabaseClient } from "../../../supabaseClient";

import type {
  Topic,
} from "../../../types/topic";

import {
  mapTopicRecord,
  mapTopicToRecord,
} from "../../../services/topicMapper";

/* ============================================================
   GET ALL
============================================================ */

export async function getTopics(): Promise<
  Topic[]
> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } =
    await (supabase as any)
      .from("topics_master")
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
        ),
        chapters_master (
          chapter_name
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
      "GET TOPICS ERROR",
      error
    );

    return [];

  }

  return (data ?? []).map(
    mapTopicRecord
  );

}

/* ============================================================
   CHECK TOPIC CODE
============================================================ */

export async function topicCodeExists(
  topicCode: string,
  chapterId: string,
  excludeTopicId?: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query =
    (supabase as any)
      .from("topics_master")
      .select("id")
      .eq(
        "topic_code",
        topicCode
      )
      .eq(
        "chapter_id",
        chapterId
      );

  if (excludeTopicId) {

    query =
      query.neq(
        "id",
        excludeTopicId
      );

  }

    const {
    data,
    error,
  } =
    await query.limit(1);

  if (error) {

    console.error(
      "CHECK TOPIC CODE ERROR",
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

export async function createTopic(
  topic: Partial<Topic>
): Promise<Topic | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapTopicToRecord(
      topic
    );

  delete (payload as any).id;

  if (
    payload.topic_code &&
    payload.chapter_id &&
    await topicCodeExists(
      payload.topic_code,
      payload.chapter_id
    )
  ) {

    console.error(
      "TOPIC CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from("topics_master")
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
        ),
        chapters_master (
          chapter_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "CREATE TOPIC ERROR",
      error
    );

    return null;

  }

  return mapTopicRecord(
    data
  );

}

/* ============================================================
   UPDATE
============================================================ */

export async function updateTopic(
  topicId: string,
  updates: Partial<Topic>
): Promise<Topic | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapTopicToRecord(
      updates
    );

  delete (payload as any).id;

  if (
    payload.topic_code &&
    payload.chapter_id &&
    await topicCodeExists(
      payload.topic_code,
      payload.chapter_id,
      topicId
    )
  ) {

    console.error(
      "TOPIC CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from("topics_master")
      .update(payload)
      .eq(
        "id",
        topicId
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
        ),
        chapters_master (
          chapter_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "UPDATE TOPIC ERROR",
      error
    );

    return null;

  }

  return mapTopicRecord(
    data
  );

}

/* ============================================================
   ARCHIVE
============================================================ */

export async function archiveTopic(
  topicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("topics_master")
      .update({
        is_active: false,
      })
      .eq(
        "id",
        topicId
      );

  if (error) {

    console.error(
      "ARCHIVE TOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   RESTORE
============================================================ */

export async function restoreTopic(
  topicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("topics_master")
      .update({
        is_active: true,
      })
      .eq(
        "id",
        topicId
      );

  if (error) {

    console.error(
      "RESTORE TOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   DELETE
============================================================ */

export async function deleteTopic(
  topicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("topics_master")
      .delete()
      .eq(
        "id",
        topicId
      );

  if (error) {

    console.error(
      "DELETE TOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}