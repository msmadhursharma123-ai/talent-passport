ALTER TABLE partner_profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

COMMENT ON COLUMN partner_profiles.auth_user_id IS
'References auth.users.id for authentication.';

UPDATE partner_profiles p
SET auth_user_id = u.id
FROM auth.users u
WHERE LOWER(TRIM(p.email)) = LOWER(TRIM(u.email))
  AND p.auth_user_id IS NULL;