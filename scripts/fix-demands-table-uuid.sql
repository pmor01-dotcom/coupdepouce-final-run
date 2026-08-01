-- Fix demands table to use UUID for client_id instead of INTEGER
-- This script updates the demands table to match Supabase's UUID-based user IDs

-- First, drop the foreign key constraint
ALTER TABLE "demands" DROP CONSTRAINT IF EXISTS "demands_client_id_fkey";

-- Change client_id from INTEGER to UUID
ALTER TABLE "demands" ALTER COLUMN "client_id" TYPE UUID USING "client_id"::TEXT::UUID;

-- Re-add the foreign key constraint with UUID type
ALTER TABLE "demands" 
ADD CONSTRAINT "demands_client_id_fkey" 
FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Also fix proposals table
ALTER TABLE "proposals" DROP CONSTRAINT IF EXISTS "proposals_artisan_id_fkey";
ALTER TABLE "proposals" ALTER COLUMN "artisan_id" TYPE UUID USING "artisan_id"::TEXT::UUID;
ALTER TABLE "proposals" 
ADD CONSTRAINT "proposals_artisan_id_fkey" 
FOREIGN KEY ("artisan_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Also fix messages table
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_fkey";
ALTER TABLE "messages" ALTER COLUMN "sender_id" TYPE UUID USING "sender_id"::TEXT::UUID;
ALTER TABLE "messages" 
ADD CONSTRAINT "messages_sender_id_fkey" 
FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_receiver_id_fkey";
ALTER TABLE "messages" ALTER COLUMN "receiver_id" TYPE UUID USING "receiver_id"::TEXT::UUID;
ALTER TABLE "messages" 
ADD CONSTRAINT "messages_receiver_id_fkey" 
FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Also fix subscriptions table
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_fkey";
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::TEXT::UUID;
ALTER TABLE "subscriptions" 
ADD CONSTRAINT "subscriptions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
