import { getSupabaseClient } from "../../../supabaseClient";

import type { AcademicYear } from "../../../types/academicYear";

import {
  mapAcademicYearFromDatabase,
  mapAcademicYearToDatabase,
} from "../../../services/academicYearMapper";

/* ============================================================
   GET ALL ACADEMIC YEARS
============================================================ */

export async function getAcademicYears(): Promise<
  AcademicYear[]
> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } =
    await (supabase as any)
      .from(
        "academic_years_master"
      )
      .select("*")
      .order("display_order", {
        ascending: true,
      });

  if (error) {
    console.error(
      "GET ACADEMIC YEARS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapAcademicYearFromDatabase
  );
}

/* ============================================================
   GET ACADEMIC YEAR
============================================================ */

export async function getAcademicYearById(
  academicYearId: string
): Promise<AcademicYear | null> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } =
    await (supabase as any)
      .from(
        "academic_years_master"
      )
      .select("*")
      .eq("id", academicYearId)
      .single();

  if (error) {
    console.error(
      "GET ACADEMIC YEAR ERROR",
      error
    );

    return null;
  }

  return mapAcademicYearFromDatabase(
    data
  );
}

/* ============================================================
   CHECK CODE
============================================================ */

export async function academicYearCodeExists(
  academicYearCode: string,
  excludeAcademicYearId?: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from(
      "academic_years_master"
    )
    .select("id")
    .eq(
      "academic_year_code",
      academicYearCode
    );

  if (excludeAcademicYearId) {
    query = query.neq(
      "id",
      excludeAcademicYearId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK ACADEMIC YEAR CODE ERROR",
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

export async function createAcademicYear(
  academicYear: Partial<AcademicYear>
): Promise<AcademicYear | null> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapAcademicYearToDatabase(
      academicYear
    );

  if (
    payload.academic_year_code &&
    (await academicYearCodeExists(
      payload.academic_year_code
    ))
  ) {
    console.error(
      "ACADEMIC YEAR CODE ALREADY EXISTS"
    );

    return null;
  }

  const {
    data,
    error,
  } = await (supabase as any)
    .from(
      "academic_years_master"
    )
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(
      "CREATE ACADEMIC YEAR ERROR"
    );

    console.error(error);

    console.error("PAYLOAD");

    console.log(payload);

    return null;
  }

  return mapAcademicYearFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateAcademicYear(
  academicYearId: string,
  updates: Partial<AcademicYear>
): Promise<AcademicYear | null> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapAcademicYearToDatabase(
      updates
    );

  if (
    payload.academic_year_code &&
    (await academicYearCodeExists(
      payload.academic_year_code,
      academicYearId
    ))
  ) {
    console.error(
      "ACADEMIC YEAR CODE ALREADY EXISTS"
    );

    return null;
  }

  const {
    data,
    error,
  } = await (supabase as any)
    .from(
      "academic_years_master"
    )
    .update(payload)
    .eq(
      "id",
      academicYearId
    )
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE ACADEMIC YEAR ERROR",
      error
    );

    return null;
  }

  return mapAcademicYearFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE
============================================================ */

export async function archiveAcademicYear(
  academicYearId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(
        "academic_years_master"
      )
      .update({
        is_active: false,
      })
      .eq(
        "id",
        academicYearId
      );

  if (error) {
    console.error(
      "ARCHIVE ACADEMIC YEAR ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE
============================================================ */

export async function restoreAcademicYear(
  academicYearId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(
        "academic_years_master"
      )
      .update({
        is_active: true,
      })
      .eq(
        "id",
        academicYearId
      );

  if (error) {
    console.error(
      "RESTORE ACADEMIC YEAR ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE
============================================================ */

export async function deleteAcademicYear(
  academicYearId: string
): Promise<boolean> {
  const supabase =
    getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } =
    await (supabase as any)
      .from(
        "academic_years_master"
      )
      .delete()
      .eq(
        "id",
        academicYearId
      );

  if (error) {
    console.error(
      "DELETE ACADEMIC YEAR ERROR",
      error
    );

    return false;
  }

  return true;
}