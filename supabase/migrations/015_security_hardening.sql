-- 015_security_hardening.sql — Phase 1 security fixes (2026-10-11)
-- Run in Supabase SQL editor (production). Idempotent.

-- 1. Stop exposing scholars' contact emails to the public REST API.
--    The anonymous public policy from 010_rls.sql is replaced by NO policy,
--    so anon users can no longer SELECT permission_requests at all.
--    (The /admin/permissions page must read via the service-role key; see app fix.)
DROP POLICY IF EXISTS "Public read permission_requests" ON permission_requests;

-- 2. Create notify_signups properly (if it was created by the script's fallback
--    SQL without RLS, this both fixes that and documents the intended schema).
CREATE TABLE IF NOT EXISTS notify_signups (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notify_signups ENABLE ROW LEVEL SECURITY;

-- No public policies on purpose: the /api/notify-signup route uses the
-- service-role key, which bypasses RLS. Anon users must not read the list.
DROP POLICY IF EXISTS "Public read notify_signups" ON notify_signups;

-- 3. Safety: make sure no accidental public policy exists on either table.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('permission_requests', 'notify_signups')
      AND roles::text LIKE '%anon%'
  LOOP
    RAISE NOTICE 'UNEXPECTED public policy still present: %', r.policyname;
  END LOOP;
END $$;

-- 4. Verify: after running, this should return ZERO rows.
-- SELECT policyname, tablename, roles FROM pg_policies
-- WHERE schemaname='public' AND tablename IN ('permission_requests','notify_signups')
--   AND roles::text LIKE '%anon%';
