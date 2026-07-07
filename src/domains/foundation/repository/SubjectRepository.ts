import { getSupabaseClient } from "../../../supabaseClient";

import type {
  Subject,
  SubjectRecord,
} from "../../../types/subject";

import {
  mapSubjectRecord,
  mapSubjectToRecord,
} from "../../../services/subjectMapper";

/* ============================================================
   TABLE
============================================================ */

const TABLE = "subjects_master";

/* ============================================================
   GET ALL
============================================================ */

export async function getSubjects(): Promise<
  Subject[]
> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } =
    await (supabase as any)
      .from("subjects_master")
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
      "GET SUBJECTS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapSubjectRecord
  );
}
/* ============================================================
   CREATE
============================================================ */

export async function createSubject(
  subject: Partial<Subject>
): Promise<Subject | null> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSubjectToRecord(
      subject
    );

  delete (payload as any).id;

  if (
  payload.subject_code &&
  payload.section_id &&
  await subjectCodeExists(
    payload.subject_code,
    payload.section_id
  )
) {
  console.error(
    "SUBJECT CODE ALREADY EXISTS"
  );

  return null;
}

  const { data, error } =
    await (supabase as any)
      .from("subjects_master")
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
        )
      `)
      .single();

  if (error) {
    console.error(
      "CREATE SUBJECT ERROR",
      error
    );

    return null;
  }

  return mapSubjectRecord(
    data
  );
}

/* ============================================================
   CHECK SUBJECT CODE
============================================================ */

export async function subjectCodeExists(
  subjectCode: string,
  sectionId: string,
  excludeSubjectId?: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query =
    (supabase as any)
      .from("subjects_master")
      .select("id")
      .eq(
        "subject_code",
        subjectCode
      )
      .eq(
        "section_id",
        sectionId
      );

  if (excludeSubjectId) {
    query = query.neq(
      "id",
      excludeSubjectId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK SUBJECT CODE ERROR",
      error
    );

    return false;
  }

  return (
    (data?.length ?? 0) > 0
  );
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateSubject(
  subjectId: string,
  updates: Partial<Subject>
): Promise<Subject | null> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSubjectToRecord(
      updates
    );

  delete (payload as any).id;

if (
  payload.subject_code &&
  payload.section_id &&
  await subjectCodeExists(
    payload.subject_code,
    payload.section_id,
    subjectId
  )
) {
  console.error(
    "SUBJECT CODE ALREADY EXISTS"
  );

  return null;
}

  const { data, error } =
    await (supabase as any)
      .from("subjects_master")
      .update(payload)
      .eq("id", subjectId)
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
        )
      `)
      .single();

  if (error) {
    console.error(
      "UPDATE SUBJECT ERROR",
      error
    );

    return null;
  }

  return mapSubjectRecord(
    data
  );
}

/* ============================================================
   ARCHIVE
============================================================ */

export async function archiveSubject(
  subjectId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("subjects_master")
      .update({
        is_active: false,
      })
      .eq("id", subjectId);

  if (error) {
    console.error(
      "ARCHIVE SUBJECT ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE
============================================================ */

export async function restoreSubject(
  subjectId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("subjects_master")
      .update({
        is_active: true,
      })
      .eq("id", subjectId);

  if (error) {
    console.error(
      "RESTORE SUBJECT ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE
============================================================ */

export async function deleteSubject(
  subjectId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("subjects_master")
      .delete()
      .eq("id", subjectId);

  if (error) {
    console.error(
      "DELETE SUBJECT ERROR",
      error
    );

    return false;
  }

  return true;
}