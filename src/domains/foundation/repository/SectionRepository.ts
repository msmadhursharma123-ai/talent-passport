import { getSupabaseClient } from "../../../supabaseClient";

import type { Section } from "../../../types/section";

import {
  mapSectionFromDatabase,
  mapSectionToDatabase,
} from "../../../services/sectionMapper";

/* ============================================================
   GET ALL SECTIONS
============================================================ */

export async function getSections(): Promise<Section[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("sections_master")
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
      )
    `)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET SECTIONS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapSectionFromDatabase
  );
}

/* ============================================================
   GET SECTION
============================================================ */

export async function getSectionById(
  sectionId: string
): Promise<Section | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("sections_master")
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
      )
    `)
    .eq("id", sectionId)
    .single();

  if (error) {
    console.error(
      "GET SECTION ERROR",
      error
    );

    return null;
  }

  return mapSectionFromDatabase(
    data
  );
}

/* ============================================================
   CHECK SECTION CODE
============================================================ */

export async function sectionCodeExists(
  sectionCode: string,
  classId: string,
  excludeSectionId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from("sections_master")
    .select("id")
    .eq("section_code", sectionCode)
    .eq("class_id", classId);

  if (excludeSectionId) {
    query = query.neq(
      "id",
      excludeSectionId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK SECTION CODE ERROR",
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}

/* ============================================================
   CREATE SECTION
============================================================ */

export async function createSection(
  section: Partial<Section>
): Promise<Section | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSectionToDatabase(section);

  delete (payload as any).id;

  if (
    payload.section_code &&
    payload.class_id &&
    await sectionCodeExists(
      payload.section_code,
      payload.class_id
    )
  ) {
    console.error(
      "SECTION CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("sections_master")
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
      )
    `)
    .single();

  if (error) {
    console.error(
      "CREATE SECTION ERROR",
      error
    );

    return null;
  }

  return mapSectionFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE SECTION
============================================================ */

export async function updateSection(
  sectionId: string,
  updates: Partial<Section>
): Promise<Section | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapSectionToDatabase(updates);

  delete (payload as any).id;

  if (
    payload.section_code &&
    payload.class_id &&
    await sectionCodeExists(
      payload.section_code,
      payload.class_id,
      sectionId
    )
  ) {
    console.error(
      "SECTION CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("sections_master")
    .update(payload)
    .eq("id", sectionId)
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
      )
    `)
    .single();

  if (error) {
    console.error(
      "UPDATE SECTION ERROR",
      error
    );

    return null;
  }

  return mapSectionFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE SECTION
============================================================ */

export async function archiveSection(
  sectionId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("sections_master")
    .update({
      is_active: false,
    })
    .eq("id", sectionId);

  if (error) {
    console.error(
      "ARCHIVE SECTION ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE SECTION
============================================================ */

export async function restoreSection(
  sectionId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("sections_master")
    .update({
      is_active: true,
    })
    .eq("id", sectionId);

  if (error) {
    console.error(
      "RESTORE SECTION ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE SECTION
============================================================ */

export async function deleteSection(
  sectionId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("sections_master")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error(
      "DELETE SECTION ERROR",
      error
    );

    return false;
  }

  return true;
}