-- ================================================================
-- FIX RLS POLICIES FOR MESSAGES TABLE
-- ================================================================
-- This script updates the RLS policies for messages to properly allow
-- users to view and send messages using the client-side Supabase client.
-- ================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role full access on messages" ON messages;
DROP POLICY IF EXISTS "Users view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Service role: Full access (for API routes)
CREATE POLICY "Service role full access on messages"
ON messages FOR ALL
USING (is_service_role())
WITH CHECK (is_service_role());

-- Users can view messages they sent or received
-- This policy works with both service role and client-side auth
CREATE POLICY "Users view own messages"
ON messages FOR SELECT
USING (
  is_service_role() OR
  auth.uid() IS NOT NULL AND (
    sender_id = auth.uid() OR
    receiver_id = auth.uid()
  )
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  is_service_role() OR
  auth.uid() IS NOT NULL AND
  sender_id = auth.uid()
);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY policyname;
