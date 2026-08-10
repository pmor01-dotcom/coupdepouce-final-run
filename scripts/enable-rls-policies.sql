-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR CUSTOM AUTH SYSTEM
-- ================================================================
-- This script enables RLS on all tables and creates policies that:
-- 1. Allow full access for service role (used by API routes)
-- 2. Restrict user access based on custom authentication context
-- ================================================================

-- ================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 2: CREATE FUNCTION TO CHECK SERVICE ROLE ACCESS
-- ================================================================

-- This function checks if the current request is from the service role
-- Service role bypasses all RLS restrictions (used by API routes)
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT current_setting('request.jwt.claim.role', true) = 'service_role'
  OR current_setting('request.jwt.claim.role', true) = 'admin';
$$;

-- ================================================================
-- STEP 3: USERS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on users"
ON users FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
)
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
);

-- ================================================================
-- STEP 4: DEMANDS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on demands" ON demands;
DROP POLICY IF EXISTS "Clients view own demands" ON demands;
DROP POLICY IF EXISTS "Clients can create demands" ON demands;
DROP POLICY IF EXISTS "Clients update own demands" ON demands;
DROP POLICY IF EXISTS "Artisans can view open demands" ON demands;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on demands"
ON demands FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Clients can view their own demands
CREATE POLICY "Clients view own demands"
ON demands FOR SELECT
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = client_id
);

-- Clients can create demands
CREATE POLICY "Clients can create demands"
ON demands FOR INSERT
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = client_id
);

-- Clients can update their own demands
CREATE POLICY "Clients update own demands"
ON demands FOR UPDATE
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = client_id
)
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = client_id
);

-- Artisans can view open demands (public access for business logic)
CREATE POLICY "Artisans can view open demands"
ON demands FOR SELECT
USING (
  is_service_role() OR
  status = 'OPEN' OR
  current_setting('request.jwt.claim.user_id', true)::uuid = client_id
);

-- ================================================================
-- STEP 5: PROPOSALS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on proposals" ON proposals;
DROP POLICY IF EXISTS "Artisans view own proposals" ON proposals;
DROP POLICY IF EXISTS "Artisans can create proposals" ON proposals;
DROP POLICY IF EXISTS "Artisans update own proposals" ON proposals;
DROP POLICY IF EXISTS "Clients view proposals for their demands" ON proposals;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on proposals"
ON proposals FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Artisans can view their own proposals
CREATE POLICY "Artisans view own proposals"
ON proposals FOR SELECT
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = artisan_id
);

-- Artisans can create proposals
CREATE POLICY "Artisans can create proposals"
ON proposals FOR INSERT
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = artisan_id
);

-- Artisans can update their own proposals
CREATE POLICY "Artisans update own proposals"
ON proposals FOR UPDATE
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = artisan_id
)
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = artisan_id
);

-- Clients can view proposals for their demands
CREATE POLICY "Clients view proposals for their demands"
ON proposals FOR SELECT
USING (
  is_service_role() OR
  demand_id IN (
    SELECT id FROM demands 
    WHERE client_id = current_setting('request.jwt.claim.user_id', true)::uuid
  )
);

-- ================================================================
-- STEP 6: MESSAGES TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on messages" ON messages;
DROP POLICY IF EXISTS "Users view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on messages"
ON messages FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Users can only view messages they sent or received
CREATE POLICY "Users view own messages"
ON messages FOR SELECT
USING (
  is_service_role() OR
  sender_id = current_setting('request.jwt.claim.user_id', true)::uuid OR
  receiver_id = current_setting('request.jwt.claim.user_id', true)::uuid
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  is_service_role() OR
  sender_id = current_setting('request.jwt.claim.user_id', true)::uuid
);

-- ================================================================
-- STEP 7: SUBSCRIPTIONS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users view own subscriptions" ON subscriptions;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on subscriptions"
ON subscriptions FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Users can only view their own subscriptions
CREATE POLICY "Users view own subscriptions"
ON subscriptions FOR SELECT
USING (
  is_service_role() OR
  user_id = current_setting('request.jwt.claim.user_id', true)::uuid
);

-- ================================================================
-- STEP 8: ARTISAN_PROFILES TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on artisan_profiles" ON artisan_profiles;
DROP POLICY IF EXISTS "Artisans view own profile" ON artisan_profiles;
DROP POLICY IF EXISTS "Artisans update own profile" ON artisan_profiles;
DROP POLICY IF EXISTS "Public can view artisan profiles" ON artisan_profiles;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on artisan_profiles"
ON artisan_profiles FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Artisans can view their own profile
CREATE POLICY "Artisans view own profile"
ON artisan_profiles FOR SELECT
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
);

-- Artisans can update their own profile
CREATE POLICY "Artisans update own profile"
ON artisan_profiles FOR UPDATE
USING (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
)
WITH CHECK (
  is_service_role() OR
  current_setting('request.jwt.claim.user_id', true)::uuid = id
);

-- Public can view artisan profiles (for search/directory)
CREATE POLICY "Public can view artisan profiles"
ON artisan_profiles FOR SELECT
USING (true);

-- ================================================================
-- STEP 9: VERIFICATION QUERIES
-- ================================================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'demands', 'proposals', 'messages', 'subscriptions', 'artisan_profiles')
ORDER BY tablename;

-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- IMPORTANT NOTES
-- ================================================================
-- 
-- 1. These policies assume your API routes use the service role key
--    which bypasses RLS. This is intentional for server-side operations.
--
-- 2. For client-side queries to work with these policies, you need to:
--    - Pass the user_id as a UUID JWT claim: request.jwt.claim.user_id
--    - Or use Supabase Auth which automatically sets auth.uid()
--
-- 3. If you switch to Supabase Auth, replace:
--    current_setting('request.jwt.claim.user_id', true)::uuid
--    with:
--    auth.uid()
--
-- 4. The service role bypass is necessary because your current API routes
--    use the service role key. Without this, all API routes would fail.
--
-- 5. To apply these policies, run this script in your Supabase SQL editor.
-- ================================================================
