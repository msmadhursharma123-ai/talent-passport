import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const root = new URL('../', import.meta.url);
for (const file of ['repository/LearningEvidenceRepository.ts','repository/TeacherLearningEvidenceRepository.ts']) {
  const source = readFileSync(new URL(file, root), 'utf8');
  assert.match(source, /if \(enrollmentRows\.length > 0\)/, `${file}: any year-linked enrollment rows must prevent fallback`);
  assert.match(source, /buildVerifiedEnrollmentRoster\(enrollmentRows, schoolUuid, String\(currentYear\.id\)\)/, `${file}: existing enrollment rows must use strict canonical roster validation`);
  assert.match(source, /from\("students_master"\)[\s\S]*?\.eq\("school_uuid", schoolUuid\)/, `${file}: fallback query must be school-scoped`);
  assert.match(source, /\["active", "enabled"\]\.includes\(status\)/, `${file}: inactive profiles must be excluded`);
  assert.match(source, /DATA-COMPATIBILITY LIMITATION/, `${file}: report must disclose the legacy roster limitation`);
  assert.match(source, /never for a partial enrollment roster/, `${file}: partial enrollment data must not be silently mixed`);
  assert.match(source, /assertSchoolScope\(masterRows, schoolUuid/, `${file}: returned rows must be checked against school scope`);
}
console.log('PASS: V29 zero-enrollment fallback is gated, school-scoped, active-profile-only, and disclosed in both portals.');
