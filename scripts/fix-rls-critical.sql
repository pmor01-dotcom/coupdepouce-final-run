-- ================================================================
-- CRITICAL SECURITY FIX: ENABLE RLS ON ALL TABLES
-- ================================================================
-- Run this script immediately in Supabase SQL Editor to fix the
-- critical security vulnerability where tables are publicly accessible.
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'demands', 'proposals', 'messages', 'subscriptions', 'artisan_profiles')
ORDER BY tablename;
