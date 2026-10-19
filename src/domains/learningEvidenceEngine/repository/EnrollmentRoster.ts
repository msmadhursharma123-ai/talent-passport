import type { LearningEvidenceEnrollmentRow } from "../types/LearningEvidenceTypes";

function norm(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function classroomRosterKey(className: unknown, sectionName: unknown): string {
  return `${norm(className)}|${norm(sectionName)}`;
}

/**
 * Build a roster only from active, school- and academic-year-specific enrollment
 * rows. Never fall back to mutable students_master class/section fields.
 * Duplicate active enrollment for one student/year is a data-integrity error.
 */
export function buildVerifiedEnrollmentRoster(
  rows: readonly LearningEvidenceEnrollmentRow[],
  schoolUuid: string,
  academicYearId: string,
): ReadonlyMap<string, ReadonlySet<string>> {
  const school = String(schoolUuid ?? "").trim();
  const year = String(academicYearId ?? "").trim();
  if (!school || !year) throw new Error("Learning Evidence Engine stopped: school and academic-year scope are required for enrollment roster.");
  const seenStudent = new Set<string>();
  const roster = new Map<string, Set<string>>();
  for (const row of rows) {
    if (String(row.school_uuid ?? "").trim() !== school) {
      throw new Error("Learning Evidence Engine stopped: enrollment roster contains a row outside the authenticated school scope.");
    }
    if (String(row.school_academic_year_id ?? "").trim() !== year) {
      throw new Error("Learning Evidence Engine stopped: enrollment roster contains a row from another academic year.");
    }
    if (String(row.status ?? "").trim().toUpperCase() !== "ACTIVE") continue;
    const student = String(row.student_uuid ?? "").trim();
    const className = String(row.class_name ?? "").trim();
    const sectionName = String(row.section_name ?? "").trim();
    if (!student || !className || !sectionName) {
      throw new Error("Learning Evidence Engine stopped: an active enrollment is missing student, class, or section data.");
    }
    if (seenStudent.has(student)) {
      throw new Error("Learning Evidence Engine stopped: a student has multiple active enrollments in the same academic year.");
    }
    seenStudent.add(student);
    const key = classroomRosterKey(className, sectionName);
    const students = roster.get(key) ?? new Set<string>();
    students.add(student);
    roster.set(key, students);
  }
  if (seenStudent.size === 0) {
    throw new Error("Learning Evidence Engine stopped: no ACTIVE year-specific student enrollments were found; roster coverage cannot be verified.");
  }
  return roster;
}
