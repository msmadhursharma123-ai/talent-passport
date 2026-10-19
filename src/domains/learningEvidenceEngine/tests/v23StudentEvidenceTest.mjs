import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const root=new URL('../',import.meta.url);
const helper=readFileSync(new URL('repository/StudentEvidenceDetails.ts',root),'utf8');
const schoolRepo=readFileSync(new URL('repository/LearningEvidenceRepository.ts',root),'utf8');
const teacherRepo=readFileSync(new URL('repository/TeacherLearningEvidenceRepository.ts',root),'utf8');
const panel=readFileSync(new URL('components/LearningEvidencePanel.tsx',root),'utf8');
assert.match(helper,/eligibleStudentUuidsByClassroom/); assert.match(helper,/concepts_not_understood/); assert.match(helper,/dailyLogId/);
for(const repo of [schoolRepo,teacherRepo]) { assert.match(repo,/from\("students_master"\)/); assert.match(repo,/assertSchoolScope\(students, schoolUuid, "student display names"\)/); assert.match(repo,/buildStudentEvidenceDetails/); assert.match(repo,/from\("student_academic_enrollments"\)/); }
assert.match(panel,/Student-level Loop 1 evidence/); assert.doesNotMatch(panel,/Student-level names are not exposed/);
console.log('PASS: V23 student-level evidence wiring static checks.');
