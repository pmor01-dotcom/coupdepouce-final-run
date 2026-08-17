-- Add read column to messages table for read receipt functionality
-- This replaces the previous read_at DateTime field with a boolean read field

-- First, drop the read_at column if it exists
ALTER TABLE "messages" DROP COLUMN IF EXISTS "read_at";

-- Add the new read boolean column
ALTER TABLE "messages" ADD COLUMN "read" BOOLEAN DEFAULT FALSE;
