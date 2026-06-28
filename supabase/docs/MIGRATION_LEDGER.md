# Talent Passport OS Migration Ledger

## Identity Layer

✅ 000_platform_admins.sql

Creates platform_admins table.

Frozen: June 2026

---

✅ 001_identity_rls.sql

Enables RLS on identity tables.

Frozen: June 2026

---

✅ 002_students_identity_policy.sql

Students can read their own identity.

Verified.

Frozen.

---

✅ 003_partner_identity_policy.sql

Partners can read their own identity.

Verified.

Frozen.

---

✅ 004_admin_identity_policy.sql

Admins can read their own identity.

Verified.

Frozen.

---

⏳ 005_student_identity_normalization.sql

In Progress