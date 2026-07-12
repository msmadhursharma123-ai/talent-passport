import { getSupabaseClient }
from "../../../supabaseClient";

import type {
  SubTopic,
  SubTopicRecord,
} from "../../../types/subTopic";

import {
  mapSubTopicRecord,
  mapSubTopicToRecord,
} from "../../../services/subTopicMapper";

/* ============================================================
   TABLE
============================================================ */

const TABLE =
  "subtopics_master";

/* ============================================================
   GET ALL
============================================================ */

export async function getSubTopics():
Promise<SubTopic[]> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from(TABLE)
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
        ),
        topics_master (
          topic_name
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
      "GET SUBTOPICS ERROR",
      error
    );

    return [];

  }

  return (
    (data ??
      []) as SubTopicRecord[]
  ).map(
    mapSubTopicRecord
  );

}

/* ============================================================
   CHECK CODE
============================================================ */

export async function
subTopicCodeExists(

  subTopicCode: string,

  topicId: string,

  excludeId?: string,

): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query =
    (supabase as any)
      .from(TABLE)
      .select(
        "id"
      )
      .eq(
        "subtopic_code",
        subTopicCode
      )
      .eq(
        "topic_id",
        topicId
      );

  if (
    excludeId
  ) {

    query =
      query.neq(
        "id",
        excludeId
      );

  }

    const {
    data,
    error,
  } =
    await query.limit(1);

  if (error) {

    console.error(
      "CHECK SUBTOPIC CODE ERROR",
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

export async function createSubTopic(
  subTopic: Partial<SubTopic>
): Promise<SubTopic | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSubTopicToRecord(
      subTopic
    );

  delete (payload as any).id;

  if (

    payload.subtopic_code &&

    payload.topic_id &&

    await subTopicCodeExists(

      payload.subtopic_code,

      payload.topic_id

    )

  ) {

    console.error(
      "SUBTOPIC CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from(TABLE)
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
        ),
        topics_master (
          topic_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "CREATE SUBTOPIC ERROR",
      error
    );

    return null;

  }

  return mapSubTopicRecord(
    data as SubTopicRecord
  );

}

/* ============================================================
   UPDATE
============================================================ */

export async function updateSubTopic(
  subTopicId: string,
  updates: Partial<SubTopic>
): Promise<SubTopic | null> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSubTopicToRecord(
      updates
    );

  delete (payload as any).id;

  if (

    payload.subtopic_code &&

    payload.topic_id &&

    await subTopicCodeExists(

      payload.subtopic_code,

      payload.topic_id,

      subTopicId

    )

  ) {

    console.error(
      "SUBTOPIC CODE ALREADY EXISTS"
    );

    return null;

  }

  const {
    data,
    error,
  } =
    await (supabase as any)
      .from(TABLE)
      .update(payload)
      .eq(
        "id",
        subTopicId
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
        ),
        topics_master (
          topic_name
        )
      `)
      .single();

  if (error) {

    console.error(
      "UPDATE SUBTOPIC ERROR",
      error
    );

    return null;

  }

  return mapSubTopicRecord(
    data as SubTopicRecord
  );

}

/* ============================================================
   ARCHIVE
============================================================ */

export async function archiveSubTopic(
  subTopicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(TABLE)
      .update({
        is_active: false,
      })
      .eq(
        "id",
        subTopicId
      );

  if (error) {

    console.error(
      "ARCHIVE SUBTOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   RESTORE
============================================================ */

export async function restoreSubTopic(
  subTopicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(TABLE)
      .update({
        is_active: true,
      })
      .eq(
        "id",
        subTopicId
      );

  if (error) {

    console.error(
      "RESTORE SUBTOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}

/* ============================================================
   DELETE
============================================================ */

export async function deleteSubTopic(
  subTopicId: string
): Promise<boolean> {

  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(TABLE)
      .delete()
      .eq(
        "id",
        subTopicId
      );

  if (error) {

    console.error(
      "DELETE SUBTOPIC ERROR",
      error
    );

    return false;

  }

  return true;

}