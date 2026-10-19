export interface CurrentYearAssignmentCandidate {
  id?: unknown;
  school_uuid?: unknown;
  academic_year?: unknown;
  academic_year_id?: unknown;
  is_active?: unknown;
}

function norm(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase("en");
}

/**
 * Validate assignments selected by the trigger's canonical school/year-code
 * relationship. Legacy NULL academic_year_id is accepted only when the school
 * and normalized academic_year code match the unique ACTIVE current year.
 * Explicit conflicting IDs or mismatched codes fail closed. Assignment activity
 * status is not a historical-evidence filter: logs remain reportable after an
 * assignment is deactivated, matching the audited monthly-review SQL.
 */
export function validateCurrentYearAssignments<T extends CurrentYearAssignmentCandidate>(
  rows: readonly T[],
  schoolUuid: string,
  academicYearId: string,
  academicYearCode: string,
): T[] {
  const school = String(schoolUuid ?? "").trim();
  const yearId = String(academicYearId ?? "").trim();
  const yearCode = norm(academicYearCode);
  if (!school || !yearId || !yearCode) {
    throw new Error("Learning Evidence Engine stopped: current-year assignment validation requires school, year ID, and year code.");
  }
  const accepted: T[] = [];
  for (const row of rows) {
    if (String(row.school_uuid ?? "").trim() !== school) {
      throw new Error("Learning Evidence Engine stopped: assignment candidate is outside the authenticated school scope.");
    }
    const linkedYearId = String(row.academic_year_id ?? "").trim();
    // Prefer the explicit foreign-key relationship when present. Legacy NULL IDs
    // remain eligible only when their year code matches the selected current year.
    // This avoids excluding valid linked assignments solely because an older
    // year-code label was formatted differently, without admitting another year.
    if (linkedYearId) {
      if (linkedYearId !== yearId) continue;
    } else if (norm(row.academic_year) !== yearCode) {
      continue;
    }
    if (row.id == null || !String(row.id).trim()) {
      throw new Error("Learning Evidence Engine stopped: a current-year assignment has no identifier.");
    }
    accepted.push(row);
  }
  return accepted;
}
