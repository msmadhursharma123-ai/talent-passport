import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';

const sha256 = (p) => createHash('sha256').update(readFileSync(new URL(p, import.meta.url))).digest('hex');
const protectedFiles = [
  { path: "src/pages/teacher/TeacherHome.tsx", hash: "55d0e6e24722c51f3b73e204f93d2c97fc691cde25c5a2995672c0f760d9151a" },
  { path: "src/domains/schoolIntelligence/components/weeklyMeetingInsights/SchoolWeeklyMeetingInsightsRepository.ts", hash: "dfe96667ca294fd793ecf8fd77edd1c88b0ae28a27a152833bebc0d936e829e8" },
  { path: "src/domains/schoolIntelligence/repository/SchoolMorningBriefRepository.ts", hash: "ac0e617675eff4fc46583e54326186fbe688ca1fb998f9eecc73064e4ef1a6bf" },
  { path: "src/domains/teacherIntelligence/repository/TeacherPendingDoubtRepository.ts", hash: "dced4c788031ccd8a88667416838ec011a7d5e5989b422cfb3b1389a9e548372" },
];
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const testDir = new URL('.', import.meta.url);
const root = resolve(fileURLToPath(testDir), '../../../..');
for (const file of protectedFiles) {
  const actual = createHash('sha256').update(readFileSync(resolve(root, file.path))).digest('hex');
  assert.equal(actual, file.hash, `Protected popup/home source changed: ${file.path}`);
}

// Schema regression guard: only evidenced feedback columns may be queried/read.
const feedbackRepositories = [
  resolve(root, 'src/domains/learningEvidenceEngine/repository/LearningEvidenceRepository.ts'),
  resolve(root, 'src/domains/learningEvidenceEngine/repository/TeacherLearningEvidenceRepository.ts'),
];
for (const file of feedbackRepositories) {
  const source = readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /\bdoubt_text\b|\bdoubtText\b/, `Unsupported doubt_text field must not be queried: ${file}`);
}
const studentEvidenceHelper = readFileSync(resolve(root, 'src/domains/learningEvidenceEngine/repository/StudentEvidenceDetails.ts'), 'utf8');
assert.doesNotMatch(studentEvidenceHelper, /\bdoubt_text\b|\bdoubtText\b/, 'Student detail helper must not depend on unsupported doubt_text');
const feedbackTypes = readFileSync(resolve(root, 'src/domains/learningEvidenceEngine/types/LearningEvidenceTypes.ts'), 'utf8');
assert.doesNotMatch(feedbackTypes, /\bdoubt_text\b|\bdoubtText\b/, 'Feedback types must not declare unsupported doubt_text');
const behaviorTest = readFileSync(resolve(root, 'src/domains/learningEvidenceEngine/tests/v24StudentEvidenceBehaviorTest.mjs'), 'utf8');
assert.doesNotMatch(behaviorTest, /\bdoubt_text\b|\bdoubtText\b/, 'Behavior test must not require unsupported doubt_text');
const css = readFileSync(resolve(root, 'src/domains/learningEvidenceEngine/components/learningEvidencePanel.css'), 'utf8');
assert.match(css, /@media\s*\(max-width:\s*760px\)/, 'Tablet/mobile responsive breakpoint is missing');
assert.match(css, /@media\s*\(max-width:\s*420px\)/, 'Narrow mobile breakpoint is missing');
assert.match(css, /\.tp-le-table-wrap\s*\{[^}]*overflow:\s*auto/s, 'Evidence table must remain scrollable on narrow screens');
assert.match(css, /\.tp-le-drawer\s*\{[^}]*width:\s*min\(520px,100%\)/s, 'Evidence drawer must fit narrow screens');

const dashboard = readFileSync(resolve(root, 'src/domains/school/pages/SchoolDashboard.tsx'), 'utf8');
assert.match(dashboard, /tab\s*===\s*["']learning-evidence["']\s*&&\s*<LearningEvidencePanel mode=["']school["']\s*\/>/);
const teacherLayout = readFileSync(resolve(root, 'src/pages/teacher/TeacherLayout.tsx'), 'utf8');
assert.match(teacherLayout, /activePage\s*===\s*["']learning-evidence["']\s*&&\s*<LearningEvidencePanel mode=["']teacher["']\s*\/>/);
console.log('PASS: V28 source guard — protected popup/home hashes, portal panel wiring, and responsive CSS invariants.');
