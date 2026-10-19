# Learning Evidence Engine — Stage 1 (V21, read-only)

## Scope

This isolated module summarizes explicitly named concepts in student daily feedback, grouped by classroom/subject/topic. It reports distinct students, lectures, feedback rows, class/section/subject participation coverage from the verified year-linked enrollment denominator, and transparent limitations. It is evidence of student-reported difficulty, not proof of mastery, a diagnosis, a student trust score, or a disciplinary recommendation.

## Data contracts

- Current year: exactly one school-scoped `school_academic_years` row with `is_current=true`, `status='ACTIVE'`, an ID, and an academic-year code.
- Assignments: candidate rows are selected by school regardless of current active status, then the exact trigger-equivalent `lower(trim(code))` comparison is applied in code. This avoids PostgREST `ilike` false negatives for surrounding whitespace and wildcard interpretation of `%`/`_`. A matching non-null `academic_year_id` is accepted; a legacy NULL ID is accepted only when the school and normalized code match the unique ACTIVE current year; any conflicting non-null ID stops the report. No matching current-year assignments causes an explicit error, not a misleading empty findings report.
- Enrollment roster: `student_academic_enrollments` filtered by school, exact `school_academic_year_id`, and `status='ACTIVE'`. The supplied onboarding function confirms the relevant fields. No fallback to mutable `students_master` class/section values is allowed.
- Logs: linked to selected assignment IDs. Non-null conflicting `academic_year_id` values are excluded; legacy NULL IDs are accepted only through the exact parent assignment relationship described by the audited trigger.
- Feedback: linked to selected daily-log IDs and school. Non-null conflicting `academic_year_id` values are excluded; legacy NULL IDs are accepted only through the exact parent log relationship. Feedback from students not actively enrolled in the assignment's classroom is excluded.
- The report stops if enrollment data is empty or inconsistent, or an assigned classroom has no active roster.

## Read-only and isolation

No SQL, migration, policy, trigger, database function, write, delete, upsert, or mutating RPC is included. The module is not wired into a portal route. It does not overwrite existing source paths and does not alter existing runtime behavior merely by being copied. Client-side checks are defense in depth, not a replacement for Supabase RLS.

## Files

- `types/LearningEvidenceTypes.ts` — isolated input/output contracts.
- `engine/buildLearningEvidenceReport.ts` — pure deterministic analysis.
- `repository/LearningEvidenceRepository.ts` — read-only school/year-scoped data retrieval.
- `repository/EnrollmentRoster.ts` — strict active academic-year enrollment roster validation.
- `repository/CurrentAcademicYearGuard.ts`, `ScopeGuard.ts`, `BoundedRead.ts` — safety guards.
- `tests/` — deterministic engine, pagination, scope, academic-year, enrollment, and schema-contract tests.

## Workload bounds

Default is the most recent 30 inclusive calendar days in India local date. Custom windows cannot exceed 30 inclusive days. Queries page at 500 rows, use ID batches of 100, cap each query at 10,000 rows, and share a 25,000-row total report budget. A cap fails closed rather than returning a silently partial report.

## Release status

V21 is a non-production candidate. Targeted tests are not a substitute for the complete app build, live Supabase RLS checks, or integration tests with separate school identities. Do not connect it to a portal route until those checks pass.


V14 reporting terminology correction: the repository selects rows from `teacher_daily_logs`, but the audited schema evidence available to this pack does not establish a publication-state column or predicate. Counts and evidence descriptions therefore say “daily logs,” not “published logs/lectures.” This is a terminology correction only; it does not claim that draft or unpublished records are excluded.


V17 correction: current-year assignments are not filtered by `is_active`. The audited monthly-review SQL selects by school, exact academic-year ID, linked log year, and date window without requiring active assignment status. This preserves historical daily-log evidence if an assignment is deactivated later.
