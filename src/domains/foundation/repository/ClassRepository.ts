import { getSupabaseClient } from "../../../supabaseClient";

import type { Class } from "../../../types/class";

import {
  mapClassFromDatabase,
  mapClassToDatabase,
} from "../../../services/classMapper";

/* ============================================================
   GET ALL CLASSES
============================================================ */

export async function getClasses(): Promise<Class[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("classes_master")
    .select(`
      *,
      organizations_master (
        organization_name
      ),
      curriculum_master (
        curriculum_name
      )
    `)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET CLASSES ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapClassFromDatabase
  );
}

/* ============================================================
   GET CLASS
============================================================ */

export async function getClassById(
  classId: string
): Promise<Class | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("classes_master")
    .select(`
      *,
      organizations_master (
        organization_name
      ),
      curriculum_master (
        curriculum_name
      )
    `)
    .eq("id", classId)
    .single();

  if (error) {
    console.error(
      "GET CLASS ERROR",
      error
    );

    return null;
  }

  return mapClassFromDatabase(
    data
  );
}

/* ============================================================
   CHECK CLASS CODE
============================================================ */

export async function classCodeExists(
  classCode: string,
  excludeClassId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from("classes_master")
    .select("id")
    .eq(
      "class_code",
      classCode
    );

  if (excludeClassId) {
    query = query.neq(
      "id",
      excludeClassId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK CLASS CODE ERROR",
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}

/* ============================================================
   CREATE CLASS
============================================================ */

export async function createClass(
  item: Partial<Class>
): Promise<Class | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapClassToDatabase(
      item
    );

  delete (payload as any).id;

  if (
    payload.class_code &&
    await classCodeExists(
      payload.class_code
    )
  ) {
    console.error(
      "CLASS CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } =
    await (supabase as any)
      .from("classes_master")
      .insert([payload])
      .select(`
        *,
        organizations_master (
          organization_name
        ),
        curriculum_master (
          curriculum_name
        )
      `)
      .single();

  if (error) {
    console.error(
      "CREATE CLASS ERROR",
      error
    );

    return null;
  }

  return mapClassFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE CLASS
============================================================ */

export async function updateClass(
  classId: string,
  updates: Partial<Class>
): Promise<Class | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapClassToDatabase(
      updates
    );

  delete (payload as any).id;

  if (
    payload.class_code &&
    await classCodeExists(
      payload.class_code,
      classId
    )
  ) {
    console.error(
      "CLASS CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } =
    await (supabase as any)
      .from("classes_master")
      .update(payload)
      .eq("id", classId)
      .select(`
        *,
        organizations_master (
          organization_name
        ),
        curriculum_master (
          curriculum_name
        )
      `)
      .single();

  if (error) {
    console.error(
      "UPDATE CLASS ERROR",
      error
    );

    return null;
  }

  return mapClassFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE CLASS
============================================================ */

export async function archiveClass(
  classId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("classes_master")
      .update({
        is_active: false,
      })
      .eq("id", classId);

  if (error) {
    console.error(
      "ARCHIVE CLASS ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE CLASS
============================================================ */

export async function restoreClass(
  classId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("classes_master")
      .update({
        is_active: true,
      })
      .eq("id", classId);

  if (error) {
    console.error(
      "RESTORE CLASS ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE CLASS
============================================================ */

export async function deleteClass(
  classId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from("classes_master")
      .delete()
      .eq("id", classId);

  if (error) {
    console.error(
      "DELETE CLASS ERROR",
      error
    );

    return false;
  }

  return true;
}