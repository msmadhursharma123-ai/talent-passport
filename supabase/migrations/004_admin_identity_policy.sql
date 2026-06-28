-- ============================================================================
-- Talent Passport OS
-- Migration: 004
-- Admin Identity Policy
--
-- Table:
--   platform_admins
--
-- Purpose:
--   Admins can access their own identity record.
-- ============================================================================

BEGIN;

-- ============================================================================
-- Remove existing policy if it exists
-- ============================================================================

DROP POLICY IF EXISTS
"admins_read_own_identity"
ON platform_admins;

-- ============================================================================
-- Admin Read Policy
-- ============================================================================

CREATE POLICY
"admins_read_own_identity"

ON platform_admins

FOR SELECT

TO authenticated

USING (

    auth.uid() = auth_user_id

);

COMMIT;