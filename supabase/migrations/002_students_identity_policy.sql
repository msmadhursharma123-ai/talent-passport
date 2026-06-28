-- ============================================================================
-- Talent Passport OS
-- Migration: 002
-- Students Identity Policy
--
-- Table:
--   students_master
--
-- Purpose:
--   Students can only access their own identity record.
-- ============================================================================

BEGIN;

-- ============================================================================
-- Remove existing policy if it exists
-- ============================================================================

DROP POLICY IF EXISTS
"students_read_own_identity"
ON students_master;

-- ============================================================================
-- Student Read Policy
-- ============================================================================

CREATE POLICY
"students_read_own_identity"
ON students_master

FOR SELECT

TO authenticated

USING (

    auth.uid() = auth_user_id

);

COMMIT;