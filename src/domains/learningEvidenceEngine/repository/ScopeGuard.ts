/** Defense-in-depth check: a scoped Supabase query must never feed cross-school rows into a report. */
export function assertSchoolScope<T extends { school_uuid?: unknown }>(
  rows: readonly T[],
  expectedSchoolUuid: string,
  sourceLabel: string,
): void {
  const expected = String(expectedSchoolUuid).trim();
  if (!expected) throw new Error("Learning Evidence Engine requires a non-empty school scope.");
  const mismatched = rows.some((row) => String(row?.school_uuid ?? "").trim() !== expected);
  if (mismatched) {
    throw new Error(`Learning Evidence Engine stopped: ${sourceLabel} returned a row outside the authenticated school scope.`);
  }
}
