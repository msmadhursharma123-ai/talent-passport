BEGIN;

------------------------------------------------------------
-- 1. partner_profiles
------------------------------------------------------------

ALTER TABLE partner_profiles
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_profiles p
SET partner_uuid = auth_user_id
WHERE partner_uuid IS NULL
  AND auth_user_id IS NOT NULL;

------------------------------------------------------------
-- Ensure partner_uuid is unique before creating FKs
------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'partner_profiles_partner_uuid_key'
    ) THEN
        ALTER TABLE partner_profiles
        ADD CONSTRAINT partner_profiles_partner_uuid_key
        UNIQUE (partner_uuid);
    END IF;
END $$;


------------------------------------------------------------
-- partner_gallery
--
-- Already uses UUID and already has a foreign key to
-- marketplace_partners(id).
--
-- No normalization required.
------------------------------------------------------------

------------------------------------------------------------
-- 2. partner_scholarship_offers
------------------------------------------------------------

------------------------------------------------------------
-- 2. partner_scholarship_offers
------------------------------------------------------------

ALTER TABLE partner_scholarship_offers
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_scholarship_offers s
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE s.partner_uuid IS NULL
  AND s.partner_id = p.partner_id;

------------------------------------------------------------
-- 3. partner_workshop_offers
------------------------------------------------------------

ALTER TABLE partner_workshop_offers
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_workshop_offers w
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE w.partner_uuid IS NULL
  AND w.partner_id = p.partner_id;

------------------------------------------------------------
-- 4. partner_school_offers
------------------------------------------------------------

ALTER TABLE partner_school_offers
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_school_offers s
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE s.partner_uuid IS NULL
  AND s.partner_id = p.partner_id;

------------------------------------------------------------
-- 5. partner_contact_requests
------------------------------------------------------------

ALTER TABLE partner_contact_requests
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_contact_requests c
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE c.partner_uuid IS NULL
  AND c.partner_id = p.partner_id;

------------------------------------------------------------
-- 6. partner_consultation_requests
------------------------------------------------------------

ALTER TABLE partner_consultation_requests
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_consultation_requests c
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE c.partner_uuid IS NULL
  AND c.partner_id = p.partner_id;

------------------------------------------------------------
-- 7. partner_incoming_requests
------------------------------------------------------------

ALTER TABLE partner_incoming_requests
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_incoming_requests i
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE i.partner_uuid IS NULL
  AND i.partner_id = p.partner_id;

------------------------------------------------------------
-- 8. partner_student_leads
------------------------------------------------------------

ALTER TABLE partner_student_leads
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partner_student_leads l
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE l.partner_uuid IS NULL
  AND l.partner_id = p.partner_id;

------------------------------------------------------------
-- 9. partners_master
------------------------------------------------------------

ALTER TABLE partners_master
ADD COLUMN IF NOT EXISTS partner_uuid UUID;

UPDATE partners_master m
SET partner_uuid = p.partner_uuid
FROM partner_profiles p
WHERE m.partner_uuid IS NULL
  AND m.partner_id = p.partner_id;

------------------------------------------------------------
-- Validation
------------------------------------------------------------

DO $$
BEGIN

IF EXISTS (
    SELECT 1
    FROM partner_profiles
    WHERE auth_user_id IS NOT NULL
  AND partner_uuid IS NULL
) THEN
    RAISE EXCEPTION
    'partner_profiles contains NULL partner_uuid values.';
END IF;

END $$;

------------------------------------------------------------
-- Foreign Keys
------------------------------------------------------------

DO $$
BEGIN

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_scholarship_offers_partner_uuid_fkey'
) THEN

ALTER TABLE partner_scholarship_offers
ADD CONSTRAINT partner_scholarship_offers_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_workshop_offers_partner_uuid_fkey'
) THEN

ALTER TABLE partner_workshop_offers
ADD CONSTRAINT partner_workshop_offers_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_school_offers_partner_uuid_fkey'
) THEN

ALTER TABLE partner_school_offers
ADD CONSTRAINT partner_school_offers_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_contact_requests_partner_uuid_fkey'
) THEN

ALTER TABLE partner_contact_requests
ADD CONSTRAINT partner_contact_requests_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_consultation_requests_partner_uuid_fkey'
) THEN

ALTER TABLE partner_consultation_requests
ADD CONSTRAINT partner_consultation_requests_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_incoming_requests_partner_uuid_fkey'
) THEN

ALTER TABLE partner_incoming_requests
ADD CONSTRAINT partner_incoming_requests_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partner_student_leads_partner_uuid_fkey'
) THEN

ALTER TABLE partner_student_leads
ADD CONSTRAINT partner_student_leads_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'partners_master_partner_uuid_fkey'
) THEN

ALTER TABLE partners_master
ADD CONSTRAINT partners_master_partner_uuid_fkey
FOREIGN KEY (partner_uuid)
REFERENCES partner_profiles(partner_uuid);

END IF;

END $$;

COMMIT;

------------------------------------------------------------
-- Verification
------------------------------------------------------------

SELECT
'partner_profiles' AS table_name,
COUNT(*) FILTER (WHERE partner_uuid IS NULL) AS null_partner_uuid
FROM partner_profiles

UNION ALL

SELECT
'partner_scholarship_offers',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_scholarship_offers

UNION ALL

SELECT
'partner_workshop_offers',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_workshop_offers

UNION ALL

SELECT
'partner_school_offers',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_school_offers

UNION ALL

SELECT
'partner_contact_requests',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_contact_requests

UNION ALL

SELECT
'partner_consultation_requests',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_consultation_requests

UNION ALL

SELECT
'partner_incoming_requests',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_incoming_requests

UNION ALL

SELECT
'partner_student_leads',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partner_student_leads

UNION ALL

SELECT
'partners_master',
COUNT(*) FILTER (WHERE partner_id IS NOT NULL AND partner_uuid IS NULL)
FROM partners_master;