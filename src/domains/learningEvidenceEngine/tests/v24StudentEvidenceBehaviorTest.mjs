import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../../package.json', import.meta.url));
const ts = require('typescript');

const helperPath = new URL('../repository/StudentEvidenceDetails.ts', import.meta.url);
const source = readFileSync(helperPath, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { buildStudentEvidenceDetails } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const finding = (key, sectionName, concept = 'Balanced forces') => ({ key, className: '8', sectionName, subjectName: 'Science', topicName: 'Force', concept });
const report = { findings: [finding('f1', 'A'), finding('f2', 'B')] };
const assignments = [
  { id: 'a1', teacher_uuid: 't1', teacher_name: 'Teacher 1', class_name: '8', section_name: 'A', subject_name: 'Science' },
  { id: 'a2', teacher_uuid: 't2', teacher_name: 'Teacher 2', class_name: '8', section_name: 'B', subject_name: 'Science' },
];
const logs = [
  { id: 'l1', teacher_assignment_uuid: 'a1', topic_name: 'Force', log_date: '2026-10-10' },
  { id: 'l2', teacher_assignment_uuid: 'a2', topic_name: 'Force', log_date: '2026-10-11' },
];
const row = (id, log, student, teacher, section, extra = {}) => ({ id, daily_log_uuid: log, student_uuid: student, teacher_uuid: teacher, class_name: '8', section_name: section, subject_name: 'Science', concepts_not_understood: ['Balanced forces'], understanding_level: 'Not understood', ...extra });
const feedback = [
  row('r1', 'l1', 's1', 't1', 'A', { understanding_level: 'Partly understood', has_doubt: true, additional_note: 'Please explain again.' }),
  row('r2', 'l2', 's2', 't2', 'B'),
  row('r3', 'l1', 'outside-roster', 't1', 'A'),
  row('r4', 'l1', 's1', 't-other', 'A'),
  row('r5', 'l1', 's1', 't1', 'A', { concepts_not_understood: ['Different concept'] }),
  row('r6', 'l1', 's1', 't1', 'A', { understanding_level: 'I was absent.' }),
  row('r7', 'not-linked', 's1', 't1', 'A'),
  row('r8', 'l1', 's1', 't1', 'A'), // duplicate student response but distinct feedback record: retain both source records
];
const eligible = new Map([['8|a', new Set(['s1'])], ['8|b', new Set(['s2'])]]);
const names = new Map([['s1', 'Student One'], ['s2', 'Student Two']]);
const actual = buildStudentEvidenceDetails({ report, assignments, logs, feedback, eligibleStudentUuidsByClassroom: eligible, studentNamesByUuid: names });
assert.equal(actual.f1.length, 2, 'only matching enrolled, present, linked responses should be shown; separate source feedback rows are retained');
assert.equal(actual.f1[0].studentName, 'Student One');
assert.equal(actual.f1[0].additionalNote, 'Please explain again.');
assert.equal(actual.f1[0].date, '2026-10-10');
assert.equal(actual.f1[1].feedbackId, 'r8');
assert.equal(actual.f2.length, 1, 'class/section evidence must remain separated');
assert.equal(actual.f2[0].studentUuid, 's2');
const noRoster = buildStudentEvidenceDetails({ report: { findings: [finding('f3', 'C')] }, assignments, logs, feedback, eligibleStudentUuidsByClassroom: eligible, studentNamesByUuid: names });
assert.deepEqual(noRoster.f3, [], 'missing classroom roster must not expose student-level rows');
console.log('PASS: V24 behavioral tests for roster eligibility, class/section isolation, linked logs, subject/topic/concept matching, teacher consistency, absence exclusion, student labels, notes, dates, source-row retention and fail-closed missing roster.');
