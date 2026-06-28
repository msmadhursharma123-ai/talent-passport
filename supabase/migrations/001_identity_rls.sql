-- ============================================================================
-- Talent Passport OS
-- Migration: 001
-- Identity Layer Row Level Security
--
-- Scope:
--   • students_master
--   • partner_profiles
--   • platform_admins
--
-- This migration enables Row Level Security on the
-- Identity Layer only.
--
-- Author: Talent Passport OS
-- ============================================================================

BEGIN;

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================

ALTER TABLE students_master
ENABLE ROW LEVEL SECURITY;

ALTER TABLE partner_profiles
ENABLE ROW LEVEL SECURITY;

ALTER TABLE platform_admins
ENABLE ROW LEVEL SECURITY;

COMMIT;