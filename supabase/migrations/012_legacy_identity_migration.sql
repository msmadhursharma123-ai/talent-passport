-- ============================================================================
-- Migration 012
-- Legacy Identity Migration
-- Talent Passport OS
--
-- Purpose
-- -------
-- Introduce canonical student_uuid into legacy competition tables while
-- preserving legacy student_id for backward compatibility.
--
-- Business Rules
-- --------------
-- • Never modify student_id
-- • Never invent identities
-- • Only populate student_uuid when a verified mapping exists
-- • Leave unmatched rows as NULL
--
-- Golden Rules
-- ------------
-- ✓ No business logic changes
-- ✓ Backward compatible
-- ✓ Safe to rerun
-- ✓ Compile-safe migration
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1
-- Add student_uuid columns
-- ============================================================================

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS student_uuid UUID;

ALTER TABLE student_timeline_achievements
ADD COLUMN IF NOT EXISTS student_uuid UUID;

ALTER TABLE talent_passport_scores
ADD COLUMN IF NOT EXISTS student_uuid UUID;

ALTER TABLE talent_passports_v2
ADD COLUMN IF NOT EXISTS student_uuid UUID;

-- ============================================================================
-- STEP 2
-- Backfill from students_master using legacy student_id
-- ============================================================================

UPDATE submissions s
SET student_uuid = sm.student_uuid
FROM students_master sm
WHERE
    s.student_uuid IS NULL
    AND s.student_id = sm.student_id;

UPDATE student_timeline_achievements t
SET student_uuid = sm.student_uuid
FROM students_master sm
WHERE
    t.student_uuid IS NULL
    AND t.student_id = sm.student_id;

UPDATE talent_passport_scores t
SET student_uuid = sm.student_uuid
FROM students_master sm
WHERE
    t.student_uuid IS NULL
    AND t.student_id = sm.student_id;

UPDATE talent_passports_v2 t
SET student_uuid = sm.student_uuid
FROM students_master sm
WHERE
    t.student_uuid IS NULL
    AND t.student_id = sm.student_id;

COMMIT;

-- ============================================================================
-- VALIDATION
-- ============================================================================

SELECT
    'submissions' AS table_name,
    COUNT(*) total_rows,
    COUNT(student_uuid) populated_student_uuid,
    COUNT(*) - COUNT(student_uuid) missing_student_uuid
FROM submissions

UNION ALL

SELECT
    'student_timeline_achievements',
    COUNT(*),
    COUNT(student_uuid),
    COUNT(*) - COUNT(student_uuid)
FROM student_timeline_achievements

UNION ALL

SELECT
    'talent_passport_scores',
    COUNT(*),
    COUNT(student_uuid),
    COUNT(*) - COUNT(student_uuid)
FROM talent_passport_scores

UNION ALL

SELECT
    'talent_passports_v2',
    COUNT(*),
    COUNT(student_uuid),
    COUNT(*) - COUNT(student_uuid)
FROM talent_passports_v2;

-- ============================================================================
-- UNMAPPED RECORDS
-- ============================================================================

SELECT
    'submissions' AS table_name,
    student_id
FROM submissions
WHERE student_uuid IS NULL

UNION ALL

SELECT
    'student_timeline_achievements',
    student_id
FROM student_timeline_achievements
WHERE student_uuid IS NULL

UNION ALL

SELECT
    'talent_passport_scores',
    student_id
FROM talent_passport_scores
WHERE student_uuid IS NULL

UNION ALL

SELECT
    'talent_passports_v2',
    student_id
FROM talent_passports_v2
WHERE student_uuid IS NULL;