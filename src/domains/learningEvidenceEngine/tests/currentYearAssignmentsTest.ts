import { validateCurrentYearAssignments } from "../repository/CurrentYearAssignments";
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
const base = { id: "a1", school_uuid: "school-a", academic_year: "2026-2027", academic_year_id: "year-1", is_active: true };
const rows = validateCurrentYearAssignments([
  base,
  { ...base, id: "legacy-null", academic_year_id: null },
  { ...base, id: "legacy-trimmed-code", academic_year: "  2026-2027  ", academic_year_id: null },
  { ...base, id: "other-year-code", academic_year: "2025-2026" },
  { ...base, id: "inactive-current-year", is_active: false },
], "school-a", "year-1", "2026-2027");
assert(rows.length === 4, "must include all matching current-year assignments (including deactivated assignments with historical logs) and exclude other years");
assert(rows.some((row) => row.id === "legacy-null"), "legacy NULL assignment must be included only through exact school/year-code match");
assert(rows.some((row) => row.id === "legacy-trimmed-code"), "legacy assignment with surrounding code whitespace must match lower(btrim(...)) semantics");
assert(rows.some((row) => row.id === "inactive-current-year"), "deactivated assignment must remain eligible for historical log evidence when its year matches");
for (const [candidate, message] of [
  [{ ...base, school_uuid: "school-b" }, "cross-school assignment must fail closed"],
  [{ ...base, academic_year_id: "year-2" }, "conflicting non-null year ID must fail closed"],
] as const) {
  let rejected = false;
  try { validateCurrentYearAssignments([candidate], "school-a", "year-1", "2026-2027"); } catch { rejected = true; }
  assert(rejected, message);
}
console.log("PASS: current-year assignment selection includes only canonical year-code matches and handles legacy NULL IDs safely.");
