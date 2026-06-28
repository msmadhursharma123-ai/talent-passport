-- ============================================================================
-- Talent Passport OS
-- Migration: 003
-- Partner Identity Policy
--
-- Table:
--   partner_profiles
--
-- Purpose:
--   Partners can only access their own identity record.
-- ============================================================================

BEGIN;

-- ============================================================================
-- Remove existing policy if it exists
-- ============================================================================

DROP POLICY IF EXISTS
"partners_read_own_identity"
ON partner_profiles;

-- ============================================================================
-- Partner Read Policy
-- ============================================================================

CREATE POLICY
"partners_read_own_identity"

ON partner_profiles

FOR SELECT

TO authenticated

USING (

    auth.uid() = auth_user_id

);

COMMIT;