-- ================================================================
-- CLEANUP LEGACY RLS POLICIES
-- ================================================================
-- This script removes conflicting legacy policies that use auth.uid()
-- and keeps only the new UUID-based policies for custom auth system
-- ================================================================

-- ================================================================
-- CLEANUP DEMANDS TABLE
-- ================================================================
DROP POLICY IF EXISTS "Client can delete own demands" ON demands;
DROP POLICY IF EXISTS "Client can insert their own demand" ON demands;
DROP POLICY IF EXISTS "Client can update their own demands" ON demands;
DROP POLICY IF EXISTS "Client can view their own demands" ON demands;
DROP POLICY IF EXISTS "public read" ON demands;

-- ================================================================
-- CLEANUP MESSAGES TABLE
-- ================================================================
DROP POLICY IF EXISTS "Users send messages" ON messages;
DROP POLICY IF EXISTS "Users view their messages" ON messages;

-- ================================================================
-- CLEANUP SUBSCRIPTIONS TABLE
-- ================================================================
DROP POLICY IF EXISTS "Users can create their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;

-- ================================================================
-- CLEANUP ARTISAN_PROFILES TABLE
-- ================================================================
DROP POLICY IF EXISTS "allow service role insert" ON artisan_profiles;
DROP POLICY IF EXISTS "allow service role select" ON artisan_profiles;

-- ================================================================
-- CLEANUP OTHER TABLES (legacy tables not in current schema)
-- ================================================================
-- These tables appear to be legacy - remove their policies
DROP POLICY IF EXISTS "Users can send messages" ON "attachement_url TEXT";
DROP POLICY IF EXISTS "Users can update messages they received" ON "attachement_url TEXT";
DROP POLICY IF EXISTS "Users can view messages they participate in" ON "attachement_url TEXT";

DROP POLICY IF EXISTS "Allow authenticated users to insert their own client row commit" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to select their own profile" ON clients;
DROP POLICY IF EXISTS "Allow clients to insert their own profile" ON clients;
DROP POLICY IF EXISTS "Allow clients to update their own profile" ON clients;
DROP POLICY IF EXISTS "client_insert_own" ON clients;
DROP POLICY IF EXISTS "client_select_own" ON clients;
DROP POLICY IF EXISTS "client_update_own" ON clients;
DROP POLICY IF EXISTS "updateAllow user to update own profile" ON clients;

DROP POLICY IF EXISTS "Client can delete own profile" ON "id";
DROP POLICY IF EXISTS "Client can insert own profile" ON "id";
DROP POLICY IF EXISTS "Client can update own profile" ON "id";
DROP POLICY IF EXISTS "Client can view own profile" ON "id";
DROP POLICY IF EXISTS "clients insert on public.clients" ON "id";

DROP POLICY IF EXISTS "Artisans insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Artisans update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Artisans view their own jobs" ON jobs;

DROP POLICY IF EXISTS "Users can delete their own messages_app" ON messages_app;
DROP POLICY IF EXISTS "Users can send messages_app" ON messages_app;
DROP POLICY IF EXISTS "Users can update their own messages_app" ON messages_app;

DROP POLICY IF EXISTS "Clients insert their own requests" ON requests;
DROP POLICY IF EXISTS "Clients update their own requests" ON requests;
DROP POLICY IF EXISTS "Clients view their own requests" ON requests;

-- ================================================================
-- VERIFICATION
-- ================================================================
-- List remaining RLS policies (should only show our new policies)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
