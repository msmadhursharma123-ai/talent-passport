-- =====================================================
-- ADMINS
-- =====================================================

CREATE POLICY admins_read_own
ON admins
FOR SELECT
TO authenticated
USING (
    auth.uid() = auth_user_id
);

-- =====================================================
-- PLATFORM ADMINS
-- =====================================================

CREATE POLICY platform_admins_read_own
ON platform_admins
FOR SELECT
TO authenticated
USING (
    auth.uid() = auth_user_id
);

-- =====================================================
-- PARTNER ADMINS
-- =====================================================

CREATE POLICY partner_admins_read_own
ON partner_admins
FOR SELECT
TO authenticated
USING (
    auth.uid() = auth_user_id
);