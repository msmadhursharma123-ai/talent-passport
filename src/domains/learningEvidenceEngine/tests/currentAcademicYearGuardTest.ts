import { resolveCurrentAcademicYear } from "../repository/CurrentAcademicYearGuard";
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
const active = { id: "year-1", school_uuid: "school-a", is_current: true, status: "ACTIVE", academic_year_code: "2026-2027", start_date: "2026-04-01" };
assert(resolveCurrentAcademicYear([active], "school-a").id === "year-1", "one active current year must resolve");
for (const [rows, school, message] of [
  [[{ ...active, status: "PLANNED" }], "school-a", "planned year must be rejected"],
  [[active, { ...active, id: "year-2" }], "school-a", "multiple current years must be rejected"],
  [[active], "school-b", "other-school year must be rejected"],
  [[], "school-a", "missing current year must be rejected"],
] as const) {
  let rejected = false;
  try { resolveCurrentAcademicYear(rows, school); } catch { rejected = true; }
  assert(rejected, message);
}
console.log("PASS: current academic-year uniqueness, status, and school-scope tests.");
