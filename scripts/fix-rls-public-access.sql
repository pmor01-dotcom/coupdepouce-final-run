-- ================================================================
-- FIX RLS POLICIES FOR PUBLIC DEMAND ACCESS
-- ================================================================
-- This script updates the RLS policies to properly allow public
-- access to OPEN demands for the carousel and artisan dashboard.
-- ================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Artisans can view open demands" ON demands;

-- Drop the existing service role policy (will be recreated)
DROP POLICY IF EXISTS "Service role full access on demands" ON demands;

-- Create a new policy that allows public read access to OPEN demands
-- This is needed for the carousel and artisan dashboard to work
CREATE POLICY "Public can view open demands"
ON demands FOR SELECT
USING (
  status = 'OPEN'
);

-- Recreate the service role full access policy
CREATE POLICY "Service role full access on demands"
ON demands FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'demands'
ORDER BY policyname;
