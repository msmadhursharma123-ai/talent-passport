-- =====================================================
-- PARTNER DOMAIN RLS
-- Phase 10D
-- =====================================================

--------------------------------------------------------
-- partner_profiles
--------------------------------------------------------

CREATE POLICY partner_profiles_read_own
ON partner_profiles
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_scholarship_offers
--------------------------------------------------------

CREATE POLICY partner_scholarship_offers_read_own
ON partner_scholarship_offers
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_workshop_offers
--------------------------------------------------------

CREATE POLICY partner_workshop_offers_read_own
ON partner_workshop_offers
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_school_offers
--------------------------------------------------------

CREATE POLICY partner_school_offers_read_own
ON partner_school_offers
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_contact_requests
--------------------------------------------------------

CREATE POLICY partner_contact_requests_read_own
ON partner_contact_requests
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_consultation_requests
--------------------------------------------------------

CREATE POLICY partner_consultation_requests_read_own
ON partner_consultation_requests
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_incoming_requests
--------------------------------------------------------

CREATE POLICY partner_incoming_requests_read_own
ON partner_incoming_requests
FOR SELECT
USING (
    auth.uid() = partner_uuid
);

--------------------------------------------------------
-- partner_student_leads
--------------------------------------------------------

CREATE POLICY partner_student_leads_read_own
ON partner_student_leads
FOR SELECT
USING (
    auth.uid() = partner_uuid
);