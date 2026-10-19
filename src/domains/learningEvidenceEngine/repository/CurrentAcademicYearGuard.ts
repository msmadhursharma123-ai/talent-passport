/** Resolve exactly one operational current year. A PLANNED or ambiguous year
 * must never be silently treated as the active reporting year. */
export interface CurrentAcademicYearRow {
  id?: unknown;
  school_uuid?: unknown;
  is_current?: unknown;
  status?: unknown;
  start_date?: unknown;
  academic_year_code?: unknown;
}

export function resolveCurrentAcademicYear(
  rows: readonly CurrentAcademicYearRow[],
  expectedSchoolUuid: string,
): CurrentAcademicYearRow {
  const schoolUuid = String(expectedSchoolUuid ?? "").trim();
  if (!schoolUuid) throw new Error("Learning Evidence Engine requires a non-empty school scope.");
  const scopedCurrent = rows.filter((row) =>
    String(row.school_uuid ?? "").trim() === schoolUuid && row.is_current === true
  );
  if (scopedCurrent.length !== 1) {
    throw new Error("Learning Evidence Engine stopped: exactly one current academic year must exist for this school.");
  }
  const year = scopedCurrent[0];
  if (!year.id) throw new Error("Learning Evidence Engine stopped: current academic year has no identifier.");
  if (String(year.status ?? "").trim().toUpperCase() !== "ACTIVE") {
    throw new Error("Learning Evidence Engine stopped: the current academic year is not ACTIVE.");
  }
  return year;
}
