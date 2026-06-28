-- ============================================================================
-- Talent Passport OS
-- Migration: 006
-- Student Domain RLS
--
-- Purpose
-- ---------------------------------------------------------------------------
-- Secure every student-owned table.
--
-- Every authenticated student may ONLY read
-- records that belong to them.
--
-- Identity Source
--
-- auth.uid()
--        ↓
-- students_master.auth_user_id
--        ↓
-- students_master.id
--        ↓
-- student_id
--
-- Business Logic
-- ---------------------------------------------------------------------------
-- None
--
-- Repository Changes
-- ---------------------------------------------------------------------------
-- None
--
-- UI Changes
-- ---------------------------------------------------------------------------
-- None
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE student_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marketplace_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marketplace_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE LEGACY POLICY
-- ============================================================================

DROP POLICY IF EXISTS "allow all"
ON student_achievements;

-- ============================================================================
-- STUDENT EVENTS
-- ============================================================================

DROP POLICY IF EXISTS student_events_read_own
ON student_events;

CREATE POLICY student_events_read_own

ON student_events

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

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

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

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

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

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

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

-- ============================================================================
-- STUDENT CREDIT LEDGER
-- ============================================================================

DROP POLICY IF EXISTS student_credit_ledger_read_own
ON student_credit_ledger;

CREATE POLICY student_credit_ledger_read_own

ON student_credit_ledger

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

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

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

-- ============================================================================
-- STUDENT ACHIEVEMENTS
-- ============================================================================

DROP POLICY IF EXISTS student_achievements_read_own
ON student_achievements;

CREATE POLICY student_achievements_read_own

ON student_achievements

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

-- ============================================================================
-- STUDENT DNA
-- ============================================================================

DROP POLICY IF EXISTS student_dna_profiles_read_own
ON student_dna_profiles;

CREATE POLICY student_dna_profiles_read_own

ON student_dna_profiles

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

-- ============================================================================
-- MARKETPLACE ACTIVITY
-- ============================================================================

DROP POLICY IF EXISTS student_marketplace_activity_read_own
ON student_marketplace_activity;

CREATE POLICY student_marketplace_activity_read_own

ON student_marketplace_activity

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

-- ============================================================================
-- MARKETPLACE REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS student_marketplace_requests_read_own
ON student_marketplace_requests;

CREATE POLICY student_marketplace_requests_read_own

ON student_marketplace_requests

FOR SELECT

TO authenticated

USING (

student_id = (

SELECT id

FROM students_master

WHERE auth_user_id = auth.uid()

)

);

COMMIT;