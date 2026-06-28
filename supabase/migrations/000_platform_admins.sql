-- ============================================================
-- Talent Passport OS
-- Migration 000
-- Platform Admin Identity Table
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS platform_admins (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    admin_id TEXT UNIQUE NOT NULL,

    full_name TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    phone TEXT,

    designation TEXT,

    department TEXT,

    auth_user_id UUID UNIQUE,

    account_status TEXT NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    last_login_at TIMESTAMPTZ

);

COMMIT;