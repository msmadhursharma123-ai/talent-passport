import { buildVerifiedEnrollmentRoster, classroomRosterKey } from "../repository/EnrollmentRoster";
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
const rows = [
  { student_uuid: "s1", school_uuid: "school-a", school_academic_year_id: "year-a", class_name: "8", section_name: "A", status: "ACTIVE" },
  { student_uuid: "s2", school_uuid: "school-a", school_academic_year_id: "year-a", class_name: "8", section_name: "A", status: "ACTIVE" },
  { student_uuid: "s3", school_uuid: "school-a", school_academic_year_id: "year-a", class_name: "8", section_name: "B", status: "INACTIVE" },
];
const roster = buildVerifiedEnrollmentRoster(rows, "school-a", "year-a");
assert(roster.get(classroomRosterKey("8", "A"))?.size === 2, "active enrollment roster must include only active students in the matching classroom");
assert(!roster.has(classroomRosterKey("8", "B")), "inactive enrollment must not enter eligible roster");
for (const [bad, message] of [
  [[...rows, { ...rows[0], school_uuid: "school-b" }], "cross-school enrollment must fail closed"],
  [[...rows, { ...rows[0], school_academic_year_id: "year-b" }], "cross-year enrollment must fail closed"],
  [[...rows, { ...rows[0] }], "duplicate active enrollment must fail closed"],
  [[{ ...rows[0], class_name: "" }], "incomplete active enrollment must fail closed"],
  [[{ ...rows[2] }], "empty active roster must fail closed"],
] as const) {
  let rejected = false;
  try { buildVerifiedEnrollmentRoster(bad as any, "school-a", "year-a"); } catch { rejected = true; }
  assert(rejected, message);
}
console.log("PASS: active academic-year enrollment roster guards.");
