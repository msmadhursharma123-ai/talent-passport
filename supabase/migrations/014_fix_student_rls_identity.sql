-- ============================================================================
-- Migration 014
-- Fix Student RLS Identity (Phase 1)
--
-- Purpose
-- ----------------------------------------------------------------------------
-- Correct student identity resolution for verified student-owned tables.
--
-- Root Cause
-- ----------------------------------------------------------------------------
-- Existing RLS compares:
--
--     student_id = students_master.id
--
-- But these tables actually store:
--
--     student_id = students.id
--
-- The canonical bridge is:
--
-- auth.uid()
--      ↓
-- students_master.auth_user_id
--      ↓
-- students_master.student_uuid
--      ↓
-- students.student_uuid
--      ↓
-- students.id
--
-- Golden Rules
-- ----------------------------------------------------------------------------
-- ✓ No business logic changes
-- ✓ No schema changes
-- ✓ No repository changes
-- ✓ No IdentityService changes
-- ✓ Forward-only migration
-- ============================================================================

BEGIN;

-- ============================================================================
-- STUDENT PROJECTS
-- ============================================================================

DROP POLICY IF EXISTS student_projects_read_own
ON student_projects;

CREATE POLICY student_projects_read_own
ON student_projects
FOR SELECT
TO authenticated
USING (
    student_id = (
        SELECT s.id
        FROM students s
        WHERE s.student_uuid = (
            SELECT sm.student_uuid
            FROM students_master sm
            WHERE sm.auth_user_id = auth.uid()
        )
    )
);

-- ============================================================================
-- STUDENT SKILLS
-- ============================================================================

DROP POLICY IF EXISTS student_skills_read_own
ON student_skills;

CREATE POLICY student_skills_read_own
ON student_skills
FOR SELECT
TO authenticated
USING (
    student_id = (
        SELECT s.id
        FROM students s
        WHERE s.student_uuid = (
            SELECT sm.student_uuid
            FROM students_master sm
            WHERE sm.auth_user_id = auth.uid()
        )
    )
);

-- ============================================================================
-- STUDENT ASSESSMENTS
-- ============================================================================

DROP POLICY IF EXISTS student_assessments_read_own
ON student_assessments;

CREATE POLICY student_assessments_read_own
ON student_assessments
FOR SELECT
TO authenticated
USING (
    student_id = (
        SELECT s.id
        FROM students s
        WHERE s.student_uuid = (
            SELECT sm.student_uuid
            FROM students_master sm
            WHERE sm.auth_user_id = auth.uid()
        )
    )
);

-- ============================================================================
-- STUDENT PERFORMANCES
-- ============================================================================

DROP POLICY IF EXISTS student_performances_read_own
ON student_performances;

CREATE POLICY student_performances_read_own
ON student_performances
FOR SELECT
TO authenticated
USING (
    student_id = (
        SELECT s.id
        FROM students s
        WHERE s.student_uuid = (
            SELECT sm.student_uuid
            FROM students_master sm
            WHERE sm.auth_user_id = auth.uid()
        )
    )
);

COMMIT;