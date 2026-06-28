-- ============================================================================
-- Talent Passport OS
-- Migration: 005
-- Student Identity Normalization
--
-- Purpose
-- --------------------------------------------------------------------------
-- Normalize legacy student tables so every student table references
-- students_master(id) using UUID.
--
-- Tables
-- --------------------------------------------------------------------------
-- student_achievements
-- student_dna_profiles
-- student_marketplace_activity
-- student_marketplace_requests
--
-- Safe because:
-- ✔ All four tables are empty.
-- ✔ No production data exists.
-- ✔ No data migration required.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STUDENT ACHIEVEMENTS
-- ============================================================================

ALTER TABLE student_achievements
ALTER COLUMN student_id
TYPE UUID
USING student_id::uuid;

ALTER TABLE student_achievements
DROP CONSTRAINT IF EXISTS student_achievements_student_id_fkey;

ALTER TABLE student_achievements
ADD CONSTRAINT student_achievements_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES students_master(id)
ON DELETE CASCADE;

-- ============================================================================
-- STUDENT DNA PROFILES
-- ============================================================================

ALTER TABLE student_dna_profiles
ALTER COLUMN student_id
TYPE UUID
USING student_id::uuid;

ALTER TABLE student_dna_profiles
DROP CONSTRAINT IF EXISTS student_dna_profiles_student_id_fkey;

ALTER TABLE student_dna_profiles
ADD CONSTRAINT student_dna_profiles_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES students_master(id)
ON DELETE CASCADE;

-- ============================================================================
-- STUDENT MARKETPLACE ACTIVITY
-- ============================================================================

ALTER TABLE student_marketplace_activity
ALTER COLUMN student_id
TYPE UUID
USING student_id::uuid;

ALTER TABLE student_marketplace_activity
DROP CONSTRAINT IF EXISTS student_marketplace_activity_student_id_fkey;

ALTER TABLE student_marketplace_activity
ADD CONSTRAINT student_marketplace_activity_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES students_master(id)
ON DELETE CASCADE;

-- ============================================================================
-- STUDENT MARKETPLACE REQUESTS
-- ============================================================================

ALTER TABLE student_marketplace_requests
ALTER COLUMN student_id
TYPE UUID
USING student_id::uuid;

ALTER TABLE student_marketplace_requests
DROP CONSTRAINT IF EXISTS student_marketplace_requests_student_id_fkey;

ALTER TABLE student_marketplace_requests
ADD CONSTRAINT student_marketplace_requests_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES students_master(id)
ON DELETE CASCADE;

COMMIT;