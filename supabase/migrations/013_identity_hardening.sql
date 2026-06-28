-- ============================================================================
-- Migration 013
-- Identity Hardening
-- Talent Passport OS
--
-- Purpose
-- -------
-- Harden the new canonical identity layer.
--
-- This migration intentionally does NOT:
--   • create foreign keys
--   • enforce NOT NULL
--   • modify business logic
--
-- Historical records with NULL student_uuid remain valid.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1
-- Create indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_submissions_student_uuid
ON submissions(student_uuid);

CREATE INDEX IF NOT EXISTS idx_student_timeline_student_uuid
ON student_timeline_achievements(student_uuid);

CREATE INDEX IF NOT EXISTS idx_talent_passport_scores_student_uuid
ON talent_passport_scores(student_uuid);

CREATE INDEX IF NOT EXISTS idx_talent_passports_v2_student_uuid
ON talent_passports_v2(student_uuid);

-- ============================================================================
-- STEP 2
-- Documentation comments
-- ============================================================================

COMMENT ON COLUMN submissions.student_uuid IS
'Canonical student identity. NULL allowed for preserved historical records.';

COMMENT ON COLUMN student_timeline_achievements.student_uuid IS
'Canonical student identity. Historical achievements may remain NULL.';

COMMENT ON COLUMN talent_passport_scores.student_uuid IS
'Canonical identity replacing legacy student_id.';

COMMENT ON COLUMN talent_passports_v2.student_uuid IS
'Canonical identity replacing legacy student_id.';

COMMIT;

-- ============================================================================
-- VALIDATION
-- ============================================================================

SELECT
    'submissions' AS table_name,
    COUNT(*) total_rows,
    COUNT(student_uuid) populated_uuid,
    COUNT(*) - COUNT(student_uuid) historical_rows
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