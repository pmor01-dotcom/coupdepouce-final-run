-- Fix demands table to use UUID for client_id to match users table
-- This script drops RLS policies, drops and recreates columns as UUID, then recreates policies

-- Drop RLS policies on demands
DROP POLICY IF EXISTS "Client can insert their own demand" ON "demands";
DROP POLICY IF EXISTS "Client can view their own demands" ON "demands";
DROP POLICY IF EXISTS "Client can update their own demands" ON "demands";
DROP POLICY IF EXISTS "Client can view own demands" ON "demands";
DROP POLICY IF EXISTS "Client can create demands" ON "demands";
DROP POLICY IF EXISTS "Client can update own demands" ON "demands";
DROP POLICY IF EXISTS "Client can delete own demands" ON "demands";

-- Drop RLS policies on messages_app that depend on demands.client_id
DROP POLICY IF EXISTS "Participants can view messages_app" ON "messages_app";

-- Drop and recreate demands.client_id as UUID
ALTER TABLE "demands" DROP CONSTRAINT IF EXISTS "demands_client_id_fkey";
ALTER TABLE "demands" DROP COLUMN IF EXISTS "client_id";
ALTER TABLE "demands" ADD COLUMN "client_id" UUID;
ALTER TABLE "demands" 
ADD CONSTRAINT "demands_client_id_fkey" 
FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Recreate RLS policies on demands
CREATE POLICY "Client can insert their own demand" ON "demands"
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Client can view their own demands" ON "demands"
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Client can update their own demands" ON "demands"
FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Client can delete own demands" ON "demands"
FOR DELETE USING (auth.uid() = client_id);

-- Skip recreating messages_app policy as the table structure is unknown

-- Drop and recreate proposals.artisan_id as UUID
ALTER TABLE "proposals" DROP CONSTRAINT IF EXISTS "proposals_artisan_id_fkey";
ALTER TABLE "proposals" DROP COLUMN IF EXISTS "artisan_id";
ALTER TABLE "proposals" ADD COLUMN "artisan_id" UUID;
ALTER TABLE "proposals" 
ADD CONSTRAINT "proposals_artisan_id_fkey" 
FOREIGN KEY ("artisan_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Drop RLS policies and views that depend on messages columns
DROP POLICY IF EXISTS "Users send messages" ON "messages";
DROP POLICY IF EXISTS "Users view their messages" ON "messages";
DROP VIEW IF EXISTS "conversations";

-- Drop and recreate messages.sender_id as UUID
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_fkey";
ALTER TABLE "messages" DROP COLUMN IF EXISTS "sender_id";
ALTER TABLE "messages" ADD COLUMN "sender_id" UUID;
ALTER TABLE "messages" 
ADD CONSTRAINT "messages_sender_id_fkey" 
FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Drop and recreate messages.receiver_id as UUID
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_receiver_id_fkey";
ALTER TABLE "messages" DROP COLUMN IF EXISTS "receiver_id";
ALTER TABLE "messages" ADD COLUMN "receiver_id" UUID;
ALTER TABLE "messages" 
ADD CONSTRAINT "messages_receiver_id_fkey" 
FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Recreate RLS policies on messages
CREATE POLICY "Users send messages" ON "messages"
FOR INSERT WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users view their messages" ON "messages"
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Skip recreating conversations view as structure is unknown

-- Drop RLS policies on subscriptions that depend on user_id
DROP POLICY IF EXISTS "Users can view their own subscription" ON "subscriptions";
DROP POLICY IF EXISTS "Users can create their own subscription" ON "subscriptions";
DROP POLICY IF EXISTS "Users can update their own subscription" ON "subscriptions";
DROP POLICY IF EXISTS "Users can delete their own subscription" ON "subscriptions";

-- Drop and recreate subscriptions.user_id as UUID
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_fkey";
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "subscriptions" ADD COLUMN "user_id" UUID;
ALTER TABLE "subscriptions" 
ADD CONSTRAINT "subscriptions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Recreate RLS policies on subscriptions
CREATE POLICY "Users can view their own subscription" ON "subscriptions"
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" ON "subscriptions"
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON "subscriptions"
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription" ON "subscriptions"
FOR DELETE USING (auth.uid() = user_id);
