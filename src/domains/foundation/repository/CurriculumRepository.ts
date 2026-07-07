import { getSupabaseClient } from "../../../supabaseClient";

import type { Curriculum } from "../../../types/curriculum";

import {
  mapCurriculumFromDatabase,
  mapCurriculumToDatabase,
} from "../../../services/curriculumMapper";

/* ============================================================
   GET ALL CURRICULUMS
============================================================ */

export async function getCurriculums(): Promise<Curriculum[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
   .from("curriculum_master")
.select(`
  *,
  organizations_master (
    organization_name
  )
`)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET CURRICULUMS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapCurriculumFromDatabase
  );
}

/* ============================================================
   GET CURRICULUM
============================================================ */

export async function getCurriculumById(
  curriculumId: string
): Promise<Curriculum | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("curriculum_master")
.select(`
  *,
  organizations_master (
    organization_name
  )
`)
    .eq("id", curriculumId)
    .single();

  if (error) {
    console.error(
      "GET CURRICULUM ERROR",
      error
    );

    return null;
  }

  return mapCurriculumFromDatabase(
    data
  );
}

/* ============================================================
   CHECK CURRICULUM CODE
============================================================ */

export async function curriculumCodeExists(
  curriculumCode: string,
  excludeCurriculumId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from("curriculum_master")
    .select("id")
    .eq(
      "curriculum_code",
      curriculumCode
    );

  if (excludeCurriculumId) {
    query = query.neq(
      "id",
      excludeCurriculumId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK CURRICULUM CODE ERROR",
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}

/* ============================================================
   CREATE CURRICULUM
============================================================ */

export async function createCurriculum(
  curriculum: Partial<Curriculum>
): Promise<Curriculum | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapCurriculumToDatabase(
      curriculum
    );

  delete (payload as any).id;

  if (
    payload.curriculum_code &&
    await curriculumCodeExists(
      payload.curriculum_code
    )
  ) {
    console.error(
      "CURRICULUM CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("curriculum_master")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(
      "CREATE CURRICULUM ERROR",
      error
    );

    return null;
  }

  return mapCurriculumFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE CURRICULUM
============================================================ */

export async function updateCurriculum(
  curriculumId: string,
  updates: Partial<Curriculum>
): Promise<Curriculum | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapCurriculumToDatabase(
      updates
    );

  delete (payload as any).id;

  if (
    payload.curriculum_code &&
    await curriculumCodeExists(
      payload.curriculum_code,
      curriculumId
    )
  ) {
    console.error(
      "CURRICULUM CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("curriculum_master")
    .update(payload)
    .eq("id", curriculumId)
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE CURRICULUM ERROR",
      error
    );

    return null;
  }

  return mapCurriculumFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE CURRICULUM
============================================================ */

export async function archiveCurriculum(
  curriculumId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("curriculum_master")
    .update({
      is_active: false,
    })
    .eq("id", curriculumId);

  if (error) {
    console.error(
      "ARCHIVE CURRICULUM ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE CURRICULUM
============================================================ */

export async function restoreCurriculum(
  curriculumId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("curriculum_master")
    .update({
      is_active: true,
    })
    .eq("id", curriculumId);

  if (error) {
    console.error(
      "RESTORE CURRICULUM ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE CURRICULUM
============================================================ */

export async function deleteCurriculum(
  curriculumId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("curriculum_master")
    .delete()
    .eq("id", curriculumId);

  if (error) {
    console.error(
      "DELETE CURRICULUM ERROR",
      error
    );

    return false;
  }

  return true;
}